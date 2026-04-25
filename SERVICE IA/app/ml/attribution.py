import math


def _softmax(values: dict[str, float]) -> dict[str, float]:
    if not values:
        return {}

    max_value = max(values.values())
    exp_values = {k: math.exp(v - max_value) for k, v in values.items()}
    denom = sum(exp_values.values())
    if denom <= 0:
        equal = 1.0 / len(values)
        return {k: equal for k in values}
    return {k: v / denom for k, v in exp_values.items()}


def estimate_model_attribution(
    global_score: float,
    layer1_score: float,
    layer2_score: float | None,
    layer3_score: float | None,
    stylistic_features: dict[str, float],
    statistical_features: dict[str, float],
) -> dict[str, float]:
    l2 = layer2_score if layer2_score is not None else layer1_score
    l3 = layer3_score if layer3_score is not None else layer1_score

    perplexity = float(statistical_features.get("perplexity", 60.0))
    burstiness = float(stylistic_features.get("burstiness_score", 2.0))
    connector_ratio = float(stylistic_features.get("logical_connector_ratio", 0.03))

    low_perplexity_signal = max(0.0, min(1.0, 1.0 - perplexity / 120.0))
    burstiness_signal = max(0.0, min(1.0, burstiness / 6.0))
    connector_signal = max(0.0, min(1.0, connector_ratio / 0.1))

    raw_scores = {
        "GPT-4 Turbo": 1.3 * global_score + 0.5 * l3 + 0.35 * low_perplexity_signal,
        "Claude 3 Opus": 1.0 * global_score + 0.45 * l2 + 0.25 * connector_signal,
        "Gemini 1.5 Pro": 1.1 * layer1_score + 0.35 * global_score + 0.15 * (1.0 - burstiness_signal),
        "Llama 3 70B": 0.9 * global_score + 0.25 * burstiness_signal + 0.2 * l3,
    }

    normalized = _softmax(raw_scores)

    # Keep deterministic, database-friendly precision.
    return {k: round(v, 6) for k, v in normalized.items()}
