from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from .config import settings
from .database import init_db
from .api.routers import (
    health_router,
    applications_router,
    analyses_router,
    dashboard_router,
    evaluation_router,
)

logger = logging.getLogger("careerlens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist
    try:
        init_db()
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable resume-to-job matching, skill extraction, and application intelligence platform.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please verify your request parameters or try again later.",
            "path": request.url.path
        }
    )

# Include Routers under /api
api_prefix = settings.API_V1_STR
app.include_router(health_router, prefix=api_prefix)
app.include_router(applications_router, prefix=api_prefix)
app.include_router(analyses_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(evaluation_router, prefix=api_prefix)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
