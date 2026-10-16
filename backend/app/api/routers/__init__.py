from .health import router as health_router
from .applications import router as applications_router
from .analyses import router as analyses_router
from .dashboard import router as dashboard_router
from .evaluation import router as evaluation_router

__all__ = [
    "health_router",
    "applications_router",
    "analyses_router",
    "dashboard_router",
    "evaluation_router",
]
