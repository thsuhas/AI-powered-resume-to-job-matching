from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel

class MetricComparison(BaseModel):
    metric: str
    proposed_method: float
    baseline_method: float
    difference: float

class EvaluationSummary(BaseModel):
    status: str  # "completed" or "not_run"
    executed_at: Optional[datetime] = None
    dataset_name: str
    dataset_size: int
    precision: float
    recall: float
    f1_score: float
    ranking_precision_at_5: Optional[float] = None
    baseline_precision: float
    baseline_recall: float
    baseline_f1_score: float
    comparisons: List[MetricComparison] = []
    methodology: str
    limitations: List[str] = []
