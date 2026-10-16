from typing import Optional
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from ...database import get_db
from ...models.job_application import JobApplication
from ...schemas.job_application import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationResponse,
    PaginatedApplicationsResponse,
)

router = APIRouter(prefix="/applications", tags=["Job Applications"])

@router.post("", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED, summary="Create a new job application")
def create_application(app_in: JobApplicationCreate, db: Session = Depends(get_db)):
    db_obj = JobApplication(**app_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    response_data = JobApplicationResponse.model_validate(db_obj)
    response_data.analyses_count = len(db_obj.analyses) if db_obj.analyses else 0
    return response_data

@router.get("", response_model=PaginatedApplicationsResponse, summary="List job applications with filtering and pagination")
def list_applications(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search company or job title"),
    status: Optional[str] = Query(None, description="Filter by application status"),
    sort_by: str = Query("created_at", description="Field to sort by (created_at, application_date, company_name)"),
    sort_order: str = Query("desc", description="Sort order (asc, desc)")
):
    query = db.query(JobApplication)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                JobApplication.company_name.ilike(term),
                JobApplication.job_title.ilike(term),
                JobApplication.location.ilike(term)
            )
        )

    if status and status.strip():
        query = query.filter(JobApplication.status == status.strip())

    # Sorting
    sort_col = getattr(JobApplication, sort_by, JobApplication.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    response_items = []
    for item in items:
        resp = JobApplicationResponse.model_validate(item)
        resp.analyses_count = len(item.analyses) if item.analyses else 0
        response_items.append(resp)

    return PaginatedApplicationsResponse(
        items=response_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{app_id}", response_model=JobApplicationResponse, summary="Get job application by ID")
def get_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job application with ID {app_id} not found."
        )
    resp = JobApplicationResponse.model_validate(app)
    resp.analyses_count = len(app.analyses) if app.analyses else 0
    return resp

@router.patch("/{app_id}", response_model=JobApplicationResponse, summary="Update job application")
def update_application(app_id: int, app_in: JobApplicationUpdate, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job application with ID {app_id} not found."
        )

    update_data = app_in.model_dump(exclude_unset=True)
    salary_min = update_data.get("salary_min", app.salary_min)
    salary_max = update_data.get("salary_max", app.salary_max)
    if salary_min is not None and salary_max is not None and salary_max < salary_min:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="salary_max cannot be less than salary_min",
        )

    for field, value in update_data.items():
        setattr(app, field, value)

    db.commit()
    db.refresh(app)
    resp = JobApplicationResponse.model_validate(app)
    resp.analyses_count = len(app.analyses) if app.analyses else 0
    return resp

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete job application")
def delete_application(app_id: int, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job application with ID {app_id} not found."
        )
    db.delete(app)
    db.commit()
    return None
