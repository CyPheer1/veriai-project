import logging

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

logger = logging.getLogger(__name__)


class RobertaDetector:
    def __init__(self, model_name: str) -> None:
        self.model_name = model_name
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = None
        self.model = None

    def load(self) -> None:
        if self.model is not None and self.tokenizer is not None:
            return

        logger.info("Loading RoBERTa detector model: %s", self.model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
        self.model.to(self.device)
        self.model.eval()
        logger.info("RoBERTa detector loaded on %s", self.device)

    def score(self, text: str) -> float:
        self.load()
        assert self.model is not None
        assert self.tokenizer is not None

        encoded = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )
        encoded = {k: v.to(self.device) for k, v in encoded.items()}

        with torch.no_grad():
            logits = self.model(**encoded).logits
            probabilities = torch.softmax(logits, dim=-1)[0]

        if probabilities.numel() < 2:
            ai_probability = float(probabilities[0].item())
        else:
            # Model labels: 0 = ai, 1 = human
            ai_probability = float(probabilities[0].item())

        return max(0.0, min(1.0, ai_probability))

    @property
    def device_name(self) -> str:
        return str(self.device)
