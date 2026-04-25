import math
import re
from collections import Counter

import nltk
import numpy as np
import spacy
from nltk.tokenize import sent_tokenize
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

_TOKEN_RE = re.compile(r"[A-Za-z']+")
_PUNCT_RE = re.compile(r"[.,;:!?]")
_CONNECTORS = {
    "however",
    "therefore",
    "moreover",
    "thus",
    "meanwhile",
    "consequently",
    "furthermore",
    "additionally",
    "hence",
    "nonetheless",
    "nevertheless",
    "overall",
    "ultimately",
    "similarly",
    "although",
    "because",
    "while",
}


class StylisticDetector:
    FEATURE_ORDER = [
        "type_token_ratio",
        "avg_sentence_length",
        "sentence_length_variance",
        "burstiness_score",
        "logical_connector_ratio",
        "punctuation_patterns",
        "information_variance",
    ]

    def __init__(self) -> None:
        self.scaler = StandardScaler()
        self.model = LogisticRegression(max_iter=500, random_state=42)
        self._trained = False

        self._nlp = spacy.blank("en")
        if "sentencizer" not in self._nlp.pipe_names:
            self._nlp.add_pipe("sentencizer")

        self._ensure_nltk()

    def _ensure_nltk(self) -> None:
        try:
            sent_tokenize("Quick test.")
        except LookupError:
            nltk.download("punkt", quiet=True)

    def load(self) -> None:
        if self._trained:
            return
        self._train_classifier()
        self._trained = True

    def _train_classifier(self) -> None:
        rng = np.random.default_rng(42)

        human_samples = rng.normal(
            loc=np.array([0.63, 22.0, 65.0, 2.9, 0.025, 0.055, 0.020]),
            scale=np.array([0.08, 4.0, 22.0, 0.9, 0.010, 0.010, 0.008]),
            size=(700, 7),
        )

        ai_samples = rng.normal(
            loc=np.array([0.45, 17.5, 28.0, 1.6, 0.043, 0.080, 0.010]),
            scale=np.array([0.08, 3.0, 15.0, 0.6, 0.010, 0.010, 0.006]),
            size=(700, 7),
        )

        x = np.vstack([human_samples, ai_samples])
        x = np.clip(x, a_min=0.0, a_max=None)
        y = np.array([0] * len(human_samples) + [1] * len(ai_samples))

        self.scaler.fit(x)
        self.model.fit(self.scaler.transform(x), y)

    def _split_sentences(self, text: str) -> list[str]:
        doc = self._nlp(text)
        sentences = [s.text.strip() for s in doc.sents if s.text.strip()]
        if sentences:
            return sentences
        return [s.strip() for s in sent_tokenize(text) if s.strip()]

    def extract_features(self, text: str) -> dict[str, float]:
        words = [w.lower() for w in _TOKEN_RE.findall(text)]
        total_words = max(len(words), 1)

        sentence_lengths = [
            len(_TOKEN_RE.findall(sentence))
            for sentence in self._split_sentences(text)
            if sentence.strip()
        ]
        if not sentence_lengths:
            sentence_lengths = [total_words]

        avg_sentence_length = float(np.mean(sentence_lengths))
        sentence_length_variance = float(np.var(sentence_lengths))
        burstiness_score = sentence_length_variance / (avg_sentence_length + 1e-6)

        type_token_ratio = len(set(words)) / total_words
        connector_count = sum(1 for w in words if w in _CONNECTORS)
        logical_connector_ratio = connector_count / total_words

        punctuation_patterns = len(_PUNCT_RE.findall(text)) / max(len(text), 1)

        frequencies = Counter(words)
        freq_values = np.array(list(frequencies.values()), dtype=float)
        norm_freq = freq_values / max(freq_values.sum(), 1.0)
        information_variance = float(np.var(norm_freq))

        return {
            "type_token_ratio": float(type_token_ratio),
            "avg_sentence_length": float(avg_sentence_length),
            "sentence_length_variance": float(sentence_length_variance),
            "burstiness_score": float(burstiness_score),
            "logical_connector_ratio": float(logical_connector_ratio),
            "punctuation_patterns": float(punctuation_patterns),
            "information_variance": float(information_variance),
        }

    def score(self, text: str) -> tuple[float, dict[str, float]]:
        self.load()

        features = self.extract_features(text)
        vector = np.array([features[name] for name in self.FEATURE_ORDER], dtype=float).reshape(1, -1)
        transformed = self.scaler.transform(vector)
        probability = float(self.model.predict_proba(transformed)[0, 1])

        return max(0.0, min(1.0, probability)), features
