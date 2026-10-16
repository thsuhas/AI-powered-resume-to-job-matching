from datetime import date
from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc

from ...database import get_db
from ...models.job_application import JobApplication, ApplicationStatus
from ...models.resume_analysis import ResumeAnalysis
from ...schemas.job_application import JobApplicationResponse
from ...schemas.resume_analysis import ResumeAnalysisListItem
from ...schemas.dashboard import (
    DashboardSummary,
    StatusDistributionItem,
    UpcomingFollowupItem
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary, summary="Dashboard overall statistics and recent items")
def get_dashboard_summary(db: Session = Depends(get_db)):
    today = date.today()

    total_applications = db.query(JobApplication).count()

    # Aggregate counts by status
    status_counts = (
        db.query(JobApplication.status, func.count(JobApplication.id))
        .group_by(JobApplication.status)
        .all()
    )
    status_dict: Dict[str, int] = {st.value: 0 for st in ApplicationStatus}
    for st, cnt in status_counts:
        status_dict[st] = cnt

    # Upcoming follow-ups (future or today)
    upcoming_followups_count = (
        db.query(JobApplication)
        .filter(JobApplication.follow_up_date != None, JobApplication.follow_up_date >= today)
        .count()
    )

    # Analyses stats
    total_analyses = db.query(ResumeAnalysis).count()

    avg_sim = db.query(func.avg(ResumeAnalysis.similarity_score)).scalar()
    avg_similarity_score = round(float(avg_sim), 1) if avg_sim is not None else None

    avg_cov = db.query(func.avg(ResumeAnalysis.skill_coverage_score)).filter(ResumeAnalysis.skill_coverage_score != None).scalar()
    avg_skill_coverage_score = round(float(avg_cov), 1) if avg_cov is not None else None

    # Recent 5 applications
    recent_apps_raw = (
        db.query(JobApplication)
        .order_by(desc(JobApplication.created_at))
        .limit(5)
        .all()
    )
    recent_applications = []
    for app in recent_apps_raw:
        resp = JobApplicationResponse.model_validate(app)
        resp.analyses_count = len(app.analyses) if app.analyses else 0
        recent_applications.append(resp)

    # Recent 5 analyses
    recent_analyses_raw = (
        db.query(ResumeAnalysis)
        .order_by(desc(ResumeAnalysis.created_at))
        .limit(5)
        .all()
    )
    recent_analyses = [
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
        for item in recent_analyses_raw
    ]

    return DashboardSummary(
        total_applications=total_applications,
        applications_by_status=status_dict,
        upcoming_followups_count=upcoming_followups_count,
        total_analyses=total_analyses,
        average_similarity_score=avg_similarity_score,
        average_skill_coverage_score=avg_skill_coverage_score,
        recent_applications=recent_applications,
        recent_analyses=recent_analyses
    )

@router.get("/status-distribution", response_model=List[StatusDistributionItem], summary="Application status distribution for charts")
def get_status_distribution(db: Session = Depends(get_db)):
    total = db.query(JobApplication).count()
    if total == 0:
        return []

    status_counts = (
        db.query(JobApplication.status, func.count(JobApplication.id))
        .group_by(JobApplication.status)
        .all()
    )

    distribution = []
    for st, count in status_counts:
        pct = round((count / total) * 100.0, 1)
        distribution.append(StatusDistributionItem(status=st, count=count, percentage=pct))

    return distribution

@router.get("/upcoming-followups", response_model=List[UpcomingFollowupItem], summary="List of pending follow-up applications")
def get_upcoming_followups(db: Session = Depends(get_db), limit: int = 10):
    today = date.today()
    apps = (
        db.query(JobApplication)
        .filter(JobApplication.follow_up_date != None, JobApplication.follow_up_date >= today)
        .order_by(asc(JobApplication.follow_up_date))
        .limit(limit)
        .all()
    )

    results = []
    for app in apps:
        days_until = (app.follow_up_date - today).days
        results.append(
            UpcomingFollowupItem(
                id=app.id,
                company_name=app.company_name,
                job_title=app.job_title,
                status=app.status,
                follow_up_date=app.follow_up_date,
                days_until=days_until,
                notes=app.notes
            )
        )

    return results
