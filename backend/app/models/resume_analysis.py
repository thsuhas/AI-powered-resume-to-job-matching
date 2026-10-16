from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from ..database import Base

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_application_id = Column(Integer, ForeignKey("job_applications.id", ondelete="CASCADE"), nullable=True, index=True)

    resume_filename = Column(String(255), nullable=False)
    resume_text = Column(Text, nullable=False)
    job_description = Column(Text, nullable=False)
    job_title = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)

    # NLP & Matching Scores
    similarity_score = Column(Float, nullable=False)  # Textual cosine similarity (0 - 100)
    skill_coverage_score = Column(Float, nullable=True)  # Matched / Required skills % (None if no requirements detected)

    # Structured lists stored as JSON
    matched_skills = Column(JSON, nullable=False, default=list)
    missing_skills = Column(JSON, nullable=False, default=list)
    additional_skills = Column(JSON, nullable=False, default=list)
    extraction_warnings = Column(JSON, nullable=False, default=list)
    suggested_improvements = Column(JSON, nullable=False, default=list)

    analysis_version = Column(String(50), nullable=False, default="1.0.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    job_application = relationship("JobApplication", back_populates="analyses")
    evidence = relationship("AnalysisEvidence", back_populates="analysis", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ResumeAnalysis(id={self.id}, resume='{self.resume_filename}', similarity={self.similarity_score}%)>"


class AnalysisEvidence(Base):
    __tablename__ = "analysis_evidence"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    skill = Column(String(100), nullable=False, index=True)
    match_status = Column(String(50), nullable=False)  # 'matched', 'missing', 'additional', 'ambiguous'
    resume_evidence = Column(Text, nullable=True)
    job_requirement_evidence = Column(Text, nullable=True)

    analysis = relationship("ResumeAnalysis", back_populates="evidence")

    def __repr__(self):
        return f"<AnalysisEvidence(id={self.id}, skill='{self.skill}', status='{self.match_status}')>"
