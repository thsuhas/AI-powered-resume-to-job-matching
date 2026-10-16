from fastapi import APIRouter
from ...schemas.evaluation import EvaluationSummary
from ...evaluation.pipeline import get_latest_evaluation_summary, run_evaluation_pipeline

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

@router.get("/summary", response_model=EvaluationSummary, summary="Retrieve latest NLP matching engine evaluation metrics")
def get_evaluation_summary():
    summary_data = get_latest_evaluation_summary()
    return EvaluationSummary.model_validate(summary_data)

@router.post("/run", response_model=EvaluationSummary, summary="Trigger a fresh evaluation run on the synthetic benchmark dataset")
def trigger_evaluation_run():
    new_results = run_evaluation_pipeline()
    return EvaluationSummary.model_validate(new_results)
