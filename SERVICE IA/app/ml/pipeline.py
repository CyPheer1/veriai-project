from __future__ import annotations

import logging
from dataclasses import dataclass
from functools import lru_cache
from statistics import mean

from app.core.config import get_settings
from app.ml.attribution import estimate_model_attribution
from app.ml.chunking import count_words, semantic_chunk_text
from app.ml.roberta_detector import RobertaDetector
from app.ml.statistical import StatisticalDetector
from app.ml.stylistic import StylisticDetector

logger = logging.getLogger(__name__)


@dataclass
class ChunkInference:
    chunk_index: int
    chunk_text: str
    word_count: int
    label: str
    confidence: float
    layer1_score: float
    layer2_score: float | None
    layer3_score: float | None
    stylistic_features: dict[str, float]
    statistical_features: dict[str, float]


class AnalysisPipeline:
    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings
        self.roberta = RobertaDetector(settings.huggingface_model_name)
        self.stylistic = StylisticDetector()
        self.statistical = StatisticalDetector(settings.gpt2_model_name)
        self._loaded = False

    def load_models(self) -> None:
        if self._loaded:
            return

        self.roberta.load()
        self.stylistic.load()
        self.statistical.load()
        self._loaded = True
        logger.info("Analysis pipeline models loaded")

    @property
    def loaded(self) -> bool:
        return self._loaded

    @property
    def device_name(self) -> str:
        return self.roberta.device_name

    def _normalized_full_mode_weights(self) -> tuple[float, float, float]:
        w1 = max(float(self.settings.full_mode_layer1_weight), 0.0)
        w2 = max(float(self.settings.full_mode_layer2_weight), 0.0)
        w3 = max(float(self.settings.full_mode_layer3_weight), 0.0)
        total = w1 + w2 + w3
        if total <= 0:
            return 0.6, 0.2, 0.2
        return w1 / total, w2 / total, w3 / total

    def _label_threshold(self) -> float:
        return max(0.0, min(1.0, float(self.settings.ai_label_threshold)))

    def _default_confidence(self) -> float:
        return max(0.0, min(1.0, float(self.settings.default_confidence)))

    def analyze_document(self, text: str, mode: str) -> dict:
        self.load_models()

        normalized_mode = mode.upper().strip()
        if normalized_mode not in {"QUICK", "FULL"}:
            normalized_mode = "QUICK"

        chunks = semantic_chunk_text(
            text,
            min_words=self.settings.chunk_min_words,
            max_words=self.settings.chunk_max_words,
            min_process_words=self.settings.chunk_min_process_words,
        )

        if not chunks:
            chunks = [text.strip()]

        full_weight_l1, full_weight_l2, full_weight_l3 = self._normalized_full_mode_weights()
        threshold = self._label_threshold()

        chunk_inferences: list[ChunkInference] = []

        for idx, chunk_text in enumerate(chunks):
            words = count_words(chunk_text)
            if words <= 0:
                continue

            layer1 = self.roberta.score(chunk_text)
            if normalized_mode == "FULL":
                layer2, stylistic_features = self.stylistic.score(chunk_text)
                layer3, statistical_features = self.statistical.score(chunk_text)
                confidence = (
                    full_weight_l1 * layer1
                    + full_weight_l2 * layer2
                    + full_weight_l3 * layer3
                )
            else:
                layer2 = None
                layer3 = None
                stylistic_features = {}
                statistical_features = {}
                confidence = layer1

            confidence = max(0.0, min(1.0, confidence))
            label = "ai" if confidence >= threshold else "human"

            chunk_inferences.append(
                ChunkInference(
                    chunk_index=idx,
                    chunk_text=chunk_text,
                    word_count=words,
                    label=label,
                    confidence=confidence,
                    layer1_score=layer1,
                    layer2_score=layer2,
                    layer3_score=layer3,
                    stylistic_features=stylistic_features,
                    statistical_features=statistical_features,
                )
            )

        if not chunk_inferences:
            fallback_confidence = self._default_confidence()
            chunk_inferences.append(
                ChunkInference(
                    chunk_index=0,
                    chunk_text=text.strip(),
                    word_count=count_words(text),
                    label="ai" if fallback_confidence >= threshold else "human",
                    confidence=fallback_confidence,
                    layer1_score=fallback_confidence,
                    layer2_score=None,
                    layer3_score=None,
                    stylistic_features={},
                    statistical_features={},
                )
            )

        confidences = [item.confidence for item in chunk_inferences]
        global_confidence = float(mean(confidences))
        global_label = "ai" if global_confidence >= threshold else "human"

        layer1_scores = [item.layer1_score for item in chunk_inferences]
        layer2_scores = [item.layer2_score for item in chunk_inferences if item.layer2_score is not None]
        layer3_scores = [item.layer3_score for item in chunk_inferences if item.layer3_score is not None]

        layer1_avg = float(mean(layer1_scores))
        layer2_avg = float(mean(layer2_scores)) if layer2_scores else None
        layer3_avg = float(mean(layer3_scores)) if layer3_scores else None

        stylistic_aggregate = self._aggregate_features([item.stylistic_features for item in chunk_inferences])
        statistical_aggregate = self._aggregate_features([item.statistical_features for item in chunk_inferences])

        model_attribution = estimate_model_attribution(
            global_score=global_confidence,
            layer1_score=layer1_avg,
            layer2_score=layer2_avg,
            layer3_score=layer3_avg,
            stylistic_features=stylistic_aggregate,
            statistical_features=statistical_aggregate,
        )

        return {
            "global_label": global_label,
            "global_confidence": round(global_confidence, 6),
            "layer1_score": round(layer1_avg, 6),
            "layer2_score": round(layer2_avg, 6) if layer2_avg is not None else None,
            "layer3_score": round(layer3_avg, 6) if layer3_avg is not None else None,
            "model_attribution": model_attribution,
            "stylistic_features": stylistic_aggregate,
            "statistical_features": statistical_aggregate,
            "is_reliable": count_words(text) > int(self.settings.reliability_min_words),
            "chunks": [
                {
                    "chunk_index": item.chunk_index,
                    "chunk_text": item.chunk_text,
                    "word_count": item.word_count,
                    "label": item.label,
                    "confidence": round(item.confidence, 6),
                    "layer1_score": round(item.layer1_score, 6),
                    "layer2_score": round(item.layer2_score, 6) if item.layer2_score is not None else None,
                    "layer3_score": round(item.layer3_score, 6) if item.layer3_score is not None else None,
                    "stylistic_features": item.stylistic_features,
                    "statistical_features": item.statistical_features,
                }
                for item in chunk_inferences
            ],
        }

    @staticmethod
    def _aggregate_features(feature_maps: list[dict[str, float]]) -> dict[str, float]:
        accumulator: dict[str, list[float]] = {}
        for feature_map in feature_maps:
            for key, value in feature_map.items():
                if isinstance(value, (int, float)):
                    accumulator.setdefault(key, []).append(float(value))

        return {
            key: round(float(mean(values)), 6)
            for key, values in accumulator.items()
            if values
        }


@lru_cache(maxsize=1)
def get_analysis_pipeline() -> AnalysisPipeline:
    return AnalysisPipeline()
