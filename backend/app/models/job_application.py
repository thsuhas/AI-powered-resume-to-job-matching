import enum
from datetime import datetime, date
from typing import Optional
from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, func
from sqlalchemy.orm import relationship
from ..database import Base

class ApplicationStatus(str, enum.Enum):
    INTERESTED = "Interested"
    TO_APPLY = "To Apply"
    APPLIED = "Applied"
    ASSESSMENT = "Assessment"
    INTERVIEW = "Interview"
    OFFER = "Offer"
    REJECTED = "Rejected"
    WITHDRAWN = "Withdrawn"

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(255), nullable=False, index=True)
    job_title = Column(String(255), nullable=False, index=True)
    job_description = Column(Text, nullable=False)
    job_url = Column(String(1024), nullable=True)
    location = Column(String(255), nullable=True)
    employment_type = Column(String(100), nullable=True)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    application_date = Column(Date, nullable=True, default=date.today)
    status = Column(String(50), nullable=False, default=ApplicationStatus.APPLIED.value, index=True)
    follow_up_date = Column(Date, nullable=True, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    analyses = relationship("ResumeAnalysis", back_populates="job_application", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<JobApplication(id={self.id}, company='{self.company_name}', title='{self.job_title}', status='{self.status}')>"
