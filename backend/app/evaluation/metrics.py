from typing import List, Set, Dict, Any, Tuple

def compute_set_metrics(predicted: Set[str], expected: Set[str]) -> Tuple[int, int, int]:
    """
    Computes True Positives, False Positives, and False Negatives between two sets of items.
    """
    tp = len(predicted.intersection(expected))
    fp = len(predicted - expected)
    fn = len(expected - predicted)
    return tp, fp, fn

def calculate_precision_recall_f1(total_tp: int, total_fp: int, total_fn: int) -> Dict[str, float]:
    """
    Calculates macro/micro aggregated precision, recall, and f1 score.
    """
    precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
    recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "precision": round(precision * 100.0, 2),
        "recall": round(recall * 100.0, 2),
        "f1_score": round(f1 * 100.0, 2)
    }

def calculate_precision_at_k(ranked_items: List[Dict[str, Any]], k: int = 5, relevance_threshold: int = 2) -> float:
    """
    Calculates Precision@K for a list of candidate items ranked by similarity score.
    An item is relevant if its relevance_label >= relevance_threshold.
    """
    if not ranked_items or k <= 0:
        return 0.0

    top_k = ranked_items[:k]
    relevant_count = sum(1 for item in top_k if item.get("relevance_label", 0) >= relevance_threshold)
    return round((relevant_count / len(top_k)) * 100.0, 2)
