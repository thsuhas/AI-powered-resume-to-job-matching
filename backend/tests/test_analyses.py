import io
import pytest
from starlette.datastructures import UploadFile

from backend.app.api.routers import analyses

def test_full_resume_analysis_endpoint(client, create_sample_pdf_bytes):
    resume_content = """
    Jane Smith - Senior Software Engineer
    Core technical skills: Python, FastAPI, Docker, and PostgreSQL.
    Developed scalable microservices handling 10,000 requests per minute.
    """
    pdf_bytes = create_sample_pdf_bytes(resume_content)

    jd_text = """
    Job Opening: Senior Backend Developer.
    Requirements:
    - Proven expertise in Python and FastAPI.
    - Containerization experience with Docker and Kubernetes.
    - Relational database experience with PostgreSQL.
    """

    files = {
        "resume_file": ("jane_smith_resume.pdf", pdf_bytes, "application/pdf")
    }
    data = {
        "job_description": jd_text,
        "job_title": "Senior Backend Developer",
        "company_name": "Tech Corp"
    }

    # 1. Post Analysis
    resp = client.post("/api/analyses", files=files, data=data)
    assert resp.status_code == 201
    result = resp.json()

    assert result["id"] is not None
    assert result["resume_filename"] == "jane_smith_resume.pdf"
    assert result["similarity_score"] > 0
    assert result["skill_coverage_score"] is not None
    assert "Python" in result["matched_skills"]
    assert "Kubernetes" in result["missing_skills"]
    assert len(result["evidence"]) > 0

    analysis_id = result["id"]

    # 2. Get Analysis by ID
    get_resp = client.get(f"/api/analyses/{analysis_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == analysis_id

    # 3. List Analyses
    list_resp = client.get("/api/analyses")
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] >= 1

    # 4. Delete Analysis
    del_resp = client.delete(f"/api/analyses/{analysis_id}")
    assert del_resp.status_code == 204

def test_analysis_invalid_file_extension(client):
    files = {
        "resume_file": ("resume.txt", b"plain text content", "text/plain")
    }
    data = {
        "job_description": "We need a software engineer with Python knowledge."
    }
    resp = client.post("/api/analyses", files=files, data=data)
    assert resp.status_code == 400
    assert "only accepts PDF documents" in resp.json()["detail"]

def test_analysis_empty_job_description(client, create_sample_pdf_bytes):
    pdf_bytes = create_sample_pdf_bytes("Valid resume text for testing purposes.")
    files = {
        "resume_file": ("resume.pdf", pdf_bytes, "application/pdf")
    }
    data = {
        "job_description": "Short"  # Less than 10 characters
    }
    resp = client.post("/api/analyses", files=files, data=data)
    assert resp.status_code == 400
    assert "at least 10 characters" in resp.json()["detail"]


def test_analysis_bounds_upload_read_before_rejecting_oversized_file(
    client, create_sample_pdf_bytes, monkeypatch
):
    max_size = 64
    monkeypatch.setattr(analyses.settings, "MAX_UPLOAD_SIZE_BYTES", max_size)
    read_sizes = []
    original_read = UploadFile.read

    async def record_read(upload, size=-1):
        read_sizes.append(size)
        return await original_read(upload, size)

    monkeypatch.setattr(UploadFile, "read", record_read)
    pdf_bytes = create_sample_pdf_bytes("This is a valid digital PDF resume with enough readable text.")
    response = client.post(
        "/api/analyses",
        files={"resume_file": ("resume.pdf", pdf_bytes, "application/pdf")},
        data={"job_description": "Software engineering role with Python skills"},
    )

    assert response.status_code == 413
    assert read_sizes == [max_size + 1]

def test_analysis_not_found(client):
    resp = client.get("/api/analyses/99999")
    assert resp.status_code == 404
    del_resp = client.delete("/api/analyses/99999")
    assert del_resp.status_code == 404
