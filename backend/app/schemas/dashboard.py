from datetime import date, datetime
from typing import Dict, List, Optional
from pydantic import BaseModel
from .job_application import JobApplicationResponse
from .resume_analysis import ResumeAnalysisListItem

class DashboardSummary(BaseModel):
    total_applications: int
    applications_by_status: Dict[str, int]
    upcoming_followups_count: int
    total_analyses: int
    average_similarity_score: Optional[float] = None
    average_skill_coverage_score: Optional[float] = None
    recent_applications: List[JobApplicationResponse] = []
    recent_analyses: List[ResumeAnalysisListItem] = []

class StatusDistributionItem(BaseModel):
    status: str
    count: int
    percentage: float

class UpcomingFollowupItem(BaseModel):
    id: int
    company_name: str
    job_title: str
    status: str
    follow_up_date: date
    days_until: int
    notes: Optional[str] = None
