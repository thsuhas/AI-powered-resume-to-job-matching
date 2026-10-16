import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings, BASE_DIR

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///") and not db_url.startswith("sqlite:////") and db_url != "sqlite:///:memory:":
    path_part = db_url[len("sqlite:///"):]
    if path_part.startswith("./"):
        path_part = path_part[2:]
    if not os.path.isabs(path_part):
        db_url = f"sqlite:///{(BASE_DIR / path_part).as_posix()}"

# If SQLite is used, connect_args={"check_same_thread": False} is required
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from .models import job_application, resume_analysis
    Base.metadata.create_all(bind=engine)
