from typing import Generator
from ..database import get_db

# Re-export get_db for convenient dependency injection
__all__ = ["get_db"]
