import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerLens — AI-Powered Job Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database config: defaults to SQLite for local development, easily overridden with PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{(BASE_DIR / 'careerlens.db').as_posix()}")

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
    ]

    # Upload limits
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf"]

    # NLP Config
    SKILLS_FILE_PATH: str = str(Path(__file__).resolve().parent / "nlp" / "skills_db.json")

    class Config:
        case_sensitive = True
        env_file = BASE_DIR.parent / ".env"
        extra = "ignore"

settings = Settings()
