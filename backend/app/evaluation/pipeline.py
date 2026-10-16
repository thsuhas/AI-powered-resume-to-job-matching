import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List

from .synthetic_dataset import SYNTHETIC_EVALUATION_DATASET
from .metrics import compute_set_metrics, calculate_precision_recall_f1, calculate_precision_at_k
from ..nlp.skill_extractor import default_extractor
from ..nlp.matcher import calculate_text_similarity

RESULTS_JSON_PATH = Path(__file__).resolve().parent / "evaluation_results.json"
REPORT_MD_PATH = Path(__file__).resolve().parent / "EVALUATION_REPORT.md"

def run_evaluation_pipeline() -> Dict[str, Any]:
    """
    Executes the reproducible evaluation pipeline on the synthetic benchmark dataset.
    Evaluates both proposed phrase-aware skill extractor and naive baseline.
    Generates JSON and Markdown outputs.
    """
    dataset = SYNTHETIC_EVALUATION_DATASET
    dataset_size = len(dataset)

    # Proposed Method Accumulators
    prop_tp = 0
    prop_fp = 0
    prop_fn = 0

    # Baseline Method Accumulators
    base_tp = 0
    base_fp = 0
    base_fn = 0

    # Ranking evaluation items
    ranking_samples = []

    for item in dataset:
        resume_text = item["resume_text"]
        jd_text = item["job_description"]
        expected_resume = set(item["expected_resume_skills"])
        expected_jd = set(item["expected_jd_skills"])
        ground_truth_all = expected_resume.union(expected_jd)

        # 1. Proposed Method Predictions
        pred_resume_dict = default_extractor.extract_skills(resume_text)
        pred_jd_dict = default_extractor.extract_skills(jd_text)
        pred_prop_all = set(pred_resume_dict.keys()).union(set(pred_jd_dict.keys()))

        tp, fp, fn = compute_set_metrics(pred_prop_all, ground_truth_all)
        prop_tp += tp
        prop_fp += fp
        prop_fn += fn

        # 2. Baseline Method Predictions
        base_resume_set = default_extractor.extract_skills_baseline(resume_text)
        base_jd_set = default_extractor.extract_skills_baseline(jd_text)
        pred_base_all = base_resume_set.union(base_jd_set)

        btp, bfp, bfn = compute_set_metrics(pred_base_all, ground_truth_all)
        base_tp += btp
        base_fp += bfp
        base_fn += bfn

        # 3. Text Similarity & Ranking
        sim_score = calculate_text_similarity(resume_text, jd_text)
        ranking_samples.append({
            "id": item["id"],
            "role": item["role"],
            "similarity_score": sim_score,
            "relevance_label": item["relevance_label"]
        })

    # Sort ranking samples by similarity score descending
    ranking_samples.sort(key=lambda x: x["similarity_score"], reverse=True)
    precision_at_5 = calculate_precision_at_k(ranking_samples, k=5, relevance_threshold=2)

    # Calculate final scores
    prop_scores = calculate_precision_recall_f1(prop_tp, prop_fp, prop_fn)
    base_scores = calculate_precision_recall_f1(base_tp, base_fp, base_fn)

    comparisons = [
        {
            "metric": "Skill Precision",
            "proposed_method": prop_scores["precision"],
            "baseline_method": base_scores["precision"],
            "difference": round(prop_scores["precision"] - base_scores["precision"], 2)
        },
        {
            "metric": "Skill Recall",
            "proposed_method": prop_scores["recall"],
            "baseline_method": base_scores["recall"],
            "difference": round(prop_scores["recall"] - base_scores["recall"], 2)
        },
        {
            "metric": "Skill F1-Score",
            "proposed_method": prop_scores["f1_score"],
            "baseline_method": base_scores["f1_score"],
            "difference": round(prop_scores["f1_score"] - base_scores["f1_score"], 2)
        }
    ]

    methodology = (
        "Ground truth skill annotations were curated across 10 synthetic resume-job description pairs covering diverse "
        "engineering domains (Backend, Frontend, ML, DevOps, Systems, QA, DBA). Extraction performance was evaluated "
        "by measuring True Positives, False Positives, and False Negatives against exact canonical skill mappings. "
        "The proposed phrase-aware NLP engine (using regex boundary tokens, multi-word n-grams, and alias normalisation) "
        "was systematically compared against a naive token-overlap baseline."
    )

    limitations = [
        "Synthetic Data Scope: Benchmarks utilize synthetic profiles; real-world resumes contain irregular tables, multi-column formatting, and varying phrasing.",
        "Dictionary Coverage: Skills not present in skills_db.json cannot be extracted without adding dictionary entries.",
        "Absence of Semantic Negation: Simple pattern matching does not discern context negation (e.g., 'not looking for Python' vs 'must know Python').",
        "Scanned Documents: PDFs saved purely as images cannot be extracted without an external OCR service."
    ]

    now_iso = datetime.now(timezone.utc).isoformat()

    results_data = {
        "status": "completed",
        "executed_at": now_iso,
        "dataset_name": "CareerLens Synthetic Benchmark v1.0",
        "dataset_size": dataset_size,
        "precision": prop_scores["precision"],
        "recall": prop_scores["recall"],
        "f1_score": prop_scores["f1_score"],
        "ranking_precision_at_5": precision_at_5,
        "baseline_precision": base_scores["precision"],
        "baseline_recall": base_scores["recall"],
        "baseline_f1_score": base_scores["f1_score"],
        "comparisons": comparisons,
        "methodology": methodology,
        "limitations": limitations
    }

    # Save to JSON
    with open(RESULTS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(results_data, f, indent=2)

    # Save Markdown report
    report_md = f"""# CareerLens Matching Engine — Evaluation Report

**Generated At:** {now_iso}<br>
**Dataset:** CareerLens Synthetic Benchmark v1.0 ({dataset_size} pairs)

---

## 1. Executive Summary

The evaluation pipeline validates the phrase-aware skill extraction engine against a naive token-overlap baseline using a curated synthetic dataset of 10 engineering resume-job description pairs.

| Metric | Proposed Method (Phrase-Aware) | Baseline Method (Naive Overlap) | Difference |
| :--- | :---: | :---: | :---: |
| **Precision** | **{prop_scores['precision']}%** | {base_scores['precision']}% | {round(prop_scores['precision'] - base_scores['precision'], 2):+}% |
| **Recall** | **{prop_scores['recall']}%** | {base_scores['recall']}% | {round(prop_scores['recall'] - base_scores['recall'], 2):+}% |
| **F1-Score** | **{prop_scores['f1_score']}%** | {base_scores['f1_score']}% | {round(prop_scores['f1_score'] - base_scores['f1_score'], 2):+}% |

- **Ranking Precision@5:** {precision_at_5}%

On this synthetic benchmark, the proposed method's precision is {round(base_scores['precision'] - prop_scores['precision'], 2)} percentage points below the baseline, while recall is {round(prop_scores['recall'] - base_scores['recall'], 2)} points higher and F1 is {round(prop_scores['f1_score'] - base_scores['f1_score'], 2)} points higher. This is a measured trade-off on {dataset_size} curated pairs, not an estimate of production performance.

---

## 2. Evaluation Methodology

{methodology}

---

## 3. Known Limitations & Technical Constraints

""" + "\n".join([f"- **{lim.split(':')[0]}:** {lim.split(':')[1] if ':' in lim else lim}" for lim in limitations]) + """

---
*Note: This report is automatically generated by the CareerLens evaluation pipeline (`python -m backend.app.evaluation.pipeline`).*
"""

    with open(REPORT_MD_PATH, "w", encoding="utf-8") as f:
        f.write(report_md)

    return results_data

def get_latest_evaluation_summary() -> Dict[str, Any]:
    """
    Returns latest saved evaluation summary, or runs the pipeline if not yet generated.
    """
    if os.path.exists(RESULTS_JSON_PATH):
        try:
            with open(RESULTS_JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return run_evaluation_pipeline()

if __name__ == "__main__":
    results = run_evaluation_pipeline()
    print("Evaluation completed successfully:")
    print(json.dumps(results, indent=2))
