from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from ...database import get_db
from ...config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", summary="System health check")
def check_health(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        # Verify database connection executes properly
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if "unhealthy" not in db_status else "degraded",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
