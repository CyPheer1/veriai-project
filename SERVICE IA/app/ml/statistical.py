import logging
import math
import re

import numpy as np
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

logger = logging.getLogger(__name__)
_WORD_RE = re.compile(r"[A-Za-z']+")


def _sigmoid(x: float) -> float:
    if x >= 0:
        z = math.exp(-x)
        return 1.0 / (1.0 + z)
    z = math.exp(x)
    return z / (1.0 + z)


class StatisticalDetector:
    def __init__(self, model_name: str) -> None:
        self.model_name = model_name
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = None
        self.model = None
        self._fallback_mode = False

    def load(self) -> None:
        if self.model is not None and self.tokenizer is not None:
            return

        try:
            logger.info("Loading statistical model: %s", self.model_name)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()
            if self.tokenizer.pad_token is None and self.tokenizer.eos_token is not None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            logger.info("Statistical model loaded on %s", self.device)
        except Exception as exc:
            self._fallback_mode = True
            logger.exception("Failed to load %s, enabling fallback statistical mode: %s", self.model_name, exc)

    def _fallback_score(self, text: str) -> tuple[float, dict[str, float]]:
        words = [w.lower() for w in _WORD_RE.findall(text)]
        if not words:
            return 0.5, {
                "perplexity": 100.0,
                "avg_token_entropy": 5.0,
                "mean_log_rank": 4.0,
                "probability_curvature": 1.0,
            }

        unique_ratio = len(set(words)) / len(words)
        repetition_score = 1.0 - unique_ratio
        punctuation_density = len(re.findall(r"[.,;:!?]", text)) / max(len(text), 1)

        ai_score = max(0.0, min(1.0, 0.6 * repetition_score + 0.4 * punctuation_density * 10.0))

        features = {
            "perplexity": float(80.0 - ai_score * 40.0),
            "avg_token_entropy": float(5.0 - ai_score * 1.8),
            "mean_log_rank": float(4.0 - ai_score * 1.5),
            "probability_curvature": float(0.9 - ai_score * 0.5),
        }

        return ai_score, features

    def score(self, text: str) -> tuple[float, dict[str, float]]:
        self.load()

        if self._fallback_mode or self.model is None or self.tokenizer is None:
            return self._fallback_score(text)

        encoded = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=1024,
        )

        input_ids = encoded["input_ids"].to(self.device)
        attention_mask = encoded["attention_mask"].to(self.device)

        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask, labels=input_ids)

        loss = torch.clamp(outputs.loss, min=0.0, max=20.0)
        perplexity = float(torch.exp(loss).item())

        logits = outputs.logits[:, :-1, :]
        target = input_ids[:, 1:]

        probs = torch.softmax(logits, dim=-1)
        target_probs = probs.gather(2, target.unsqueeze(-1)).squeeze(-1).clamp_min(1e-12)

        entropy = (-(probs * probs.clamp_min(1e-12).log()).sum(dim=-1)).mean().item()

        sorted_indices = torch.argsort(logits, dim=-1, descending=True)
        ranks = (sorted_indices == target.unsqueeze(-1)).float().argmax(dim=-1) + 1
        mean_log_rank = torch.log(ranks.float()).mean().item()

        log_probs = target_probs.log().squeeze(0)
        if log_probs.numel() >= 3:
            curvature = torch.mean(torch.abs(log_probs[2:] - 2 * log_probs[1:-1] + log_probs[:-2])).item()
        else:
            curvature = 0.0

        ppl_ai = _sigmoid((45.0 - perplexity) / 12.0)
        entropy_ai = _sigmoid((3.8 - entropy) / 0.6)
        rank_ai = _sigmoid((2.6 - mean_log_rank) / 0.6)
        curvature_ai = _sigmoid((0.7 - curvature) / 0.2)

        score = float(np.mean([ppl_ai, entropy_ai, rank_ai, curvature_ai]))
        score = max(0.0, min(1.0, score))

        features = {
            "perplexity": float(perplexity),
            "avg_token_entropy": float(entropy),
            "mean_log_rank": float(mean_log_rank),
            "probability_curvature": float(curvature),
        }

        return score, features
