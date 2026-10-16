from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class AnalysisEvidenceItem(BaseModel):
    id: Optional[int] = None
    skill: str
    match_status: str  # 'matched', 'missing', 'additional', 'ambiguous'
    resume_evidence: Optional[str] = None
    job_requirement_evidence: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ResumeAnalysisResponse(BaseModel):
    id: int
    job_application_id: Optional[int] = None
    resume_filename: str
    resume_text: str
    job_description: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    similarity_score: float = Field(..., description="Cosine similarity score (0.0 to 100.0)")
    skill_coverage_score: Optional[float] = Field(None, description="Skill coverage percentage (0.0 to 100.0) or null if no required skills detected")
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    additional_skills: List[str] = []
    extraction_warnings: List[str] = []
    suggested_improvements: List[str] = []
    evidence: List[AnalysisEvidenceItem] = []
    analysis_version: str = "1.0.0"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeAnalysisListItem(BaseModel):
    id: int
    job_application_id: Optional[int] = None
    resume_filename: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    similarity_score: float
    skill_coverage_score: Optional[float] = None
    matched_skills_count: int
    missing_skills_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedAnalysesResponse(BaseModel):
    items: List[ResumeAnalysisListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
