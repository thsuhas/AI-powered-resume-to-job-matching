from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ...database import get_db
from ...config import settings
from ...models.job_application import JobApplication
from ...models.resume_analysis import ResumeAnalysis, AnalysisEvidence
from ...schemas.resume_analysis import (
    ResumeAnalysisResponse,
    ResumeAnalysisListItem,
    PaginatedAnalysesResponse,
    AnalysisEvidenceItem
)
from ...nlp.pdf_extractor import extract_text_from_pdf_bytes, PDFExtractionError
from ...nlp.matcher import compare_resume_to_job

router = APIRouter(prefix="/analyses", tags=["Resume Analyses"])

@router.post("", response_model=ResumeAnalysisResponse, status_code=status.HTTP_201_CREATED, summary="Analyze uploaded resume against a job description")
async def analyze_resume(
    resume_file: UploadFile = File(..., description="Resume in PDF format"),
    job_description: str = Form(..., description="Job description text"),
    job_title: Optional[str] = Form(None, description="Job title"),
    company_name: Optional[str] = Form(None, description="Company name"),
    job_application_id: Optional[int] = Form(None, description="Optional associated job application ID"),
    db: Session = Depends(get_db)
):
    # 1. Validate Job Description
    clean_jd = job_description.strip() if job_description else ""
    if len(clean_jd) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description must contain at least 10 characters."
        )

    # 2. Validate PDF file
    if not resume_file.filename or not resume_file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{resume_file.filename}'. CareerLens only accepts PDF documents."
        )

    content = await resume_file.read(settings.MAX_UPLOAD_SIZE_BYTES + 1)
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024):.1f}MB."
        )

    # 3. Extract PDF text
    try:
        resume_text, pdf_warnings = extract_text_from_pdf_bytes(content, filename=resume_file.filename)
    except PDFExtractionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # 4. Validate job_application_id if provided
    if job_application_id is not None:
        app_exists = db.query(JobApplication).filter(JobApplication.id == job_application_id).first()
        if not app_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated job application ID {job_application_id} does not exist."
            )

    # 5. Run NLP Matching
    match_result = compare_resume_to_job(resume_text, clean_jd)

    combined_warnings = pdf_warnings + match_result.extraction_warnings

    # 6. Persist to Database
    db_analysis = ResumeAnalysis(
        job_application_id=job_application_id,
        resume_filename=resume_file.filename,
        resume_text=resume_text,
        job_description=clean_jd,
        job_title=job_title or (app_exists.job_title if job_application_id and app_exists else None),
        company_name=company_name or (app_exists.company_name if job_application_id and app_exists else None),
        similarity_score=match_result.similarity_score,
        skill_coverage_score=match_result.skill_coverage_score,
        matched_skills=match_result.matched_skills,
        missing_skills=match_result.missing_skills,
        additional_skills=match_result.additional_skills,
        extraction_warnings=combined_warnings,
        suggested_improvements=match_result.suggested_improvements,
        analysis_version="1.0.0"
    )
    db.add(db_analysis)
    db.flush()  # obtain db_analysis.id

    # 7. Persist Evidence Items
    for ev in match_result.evidence_items:
        db_ev = AnalysisEvidence(
            analysis_id=db_analysis.id,
            skill=ev["skill"],
            match_status=ev["match_status"],
            resume_evidence=ev.get("resume_evidence"),
            job_requirement_evidence=ev.get("job_requirement_evidence")
        )
        db.add(db_ev)

    db.commit()
    db.refresh(db_analysis)

    # Build response model
    return ResumeAnalysisResponse.model_validate(db_analysis)

@router.get("", response_model=PaginatedAnalysesResponse, summary="List past resume analyses")
def list_analyses(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    job_application_id: Optional[int] = Query(None, description="Filter by associated job application")
):
    query = db.query(ResumeAnalysis)
    if job_application_id is not None:
        query = query.filter(ResumeAnalysis.job_application_id == job_application_id)

    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    items = query.order_by(desc(ResumeAnalysis.created_at)).offset(offset).limit(page_size).all()

    response_items = []
    for item in items:
        response_items.append(
            ResumeAnalysisListItem(
                id=item.id,
                job_application_id=item.job_application_id,
                resume_filename=item.resume_filename,
                job_title=item.job_title,
                company_name=item.company_name,
                similarity_score=item.similarity_score,
                skill_coverage_score=item.skill_coverage_score,
                matched_skills_count=len(item.matched_skills) if item.matched_skills else 0,
                missing_skills_count=len(item.missing_skills) if item.missing_skills else 0,
                created_at=item.created_at
            )
        )

    return PaginatedAnalysesResponse(
        items=response_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{analysis_id}", response_model=ResumeAnalysisResponse, summary="Get full resume analysis details by ID")
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume analysis with ID {analysis_id} not found."
        )
    return ResumeAnalysisResponse.model_validate(analysis)

@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete resume analysis")
def delete_analysis(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume analysis with ID {analysis_id} not found."
        )
    db.delete(analysis)
    db.commit()
    return None
