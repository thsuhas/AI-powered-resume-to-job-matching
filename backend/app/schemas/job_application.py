from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict, HttpUrl
from ..models.job_application import ApplicationStatus

VALID_STATUSES = [status.value for status in ApplicationStatus]

class JobApplicationBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255, description="Name of hiring organization")
    job_title: str = Field(..., min_length=1, max_length=255, description="Position or title")
    job_description: str = Field(..., min_length=1, description="Full job posting or description text")
    job_url: Optional[str] = Field(None, max_length=1024, description="URL link to job posting")
    location: Optional[str] = Field(None, max_length=255, description="Job location (city, state, remote)")
    employment_type: Optional[str] = Field(None, max_length=100, description="Full-time, Internship, Contract, etc.")
    salary_min: Optional[float] = Field(None, ge=0, description="Minimum salary if specified")
    salary_max: Optional[float] = Field(None, ge=0, description="Maximum salary if specified")
    application_date: Optional[date] = Field(None, description="Date applied")
    status: str = Field(default=ApplicationStatus.APPLIED.value, description="Current application status")
    follow_up_date: Optional[date] = Field(None, description="Target follow-up date")
    notes: Optional[str] = Field(None, description="Personal application notes")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{v}'. Allowed values are: {', '.join(VALID_STATUSES)}")
        return v

    @field_validator("salary_max")
    @classmethod
    def validate_salary_range(cls, v: Optional[float], info) -> Optional[float]:
        salary_min = info.data.get("salary_min")
        if v is not None and salary_min is not None and v < salary_min:
            raise ValueError("salary_max cannot be less than salary_min")
        return v

    @field_validator("job_url")
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() != "":
            v = v.strip()
            if not (v.startswith("http://") or v.startswith("https://")):
                raise ValueError("Job URL must start with http:// or https://")
        return v or None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    job_title: Optional[str] = Field(None, min_length=1, max_length=255)
    job_description: Optional[str] = Field(None, min_length=1)
    job_url: Optional[str] = Field(None, max_length=1024)
    location: Optional[str] = Field(None, max_length=255)
    employment_type: Optional[str] = Field(None, max_length=100)
    salary_min: Optional[float] = Field(None, ge=0)
    salary_max: Optional[float] = Field(None, ge=0)
    application_date: Optional[date] = None
    status: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{v}'. Allowed values are: {', '.join(VALID_STATUSES)}")
        return v

    @field_validator("salary_max")
    @classmethod
    def validate_salary_range(cls, v: Optional[float], info) -> Optional[float]:
        salary_min = info.data.get("salary_min")
        if v is not None and salary_min is not None and v < salary_min:
            raise ValueError("salary_max cannot be less than salary_min")
        return v


class JobApplicationResponse(JobApplicationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    analyses_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class PaginatedApplicationsResponse(BaseModel):
    items: List[JobApplicationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
