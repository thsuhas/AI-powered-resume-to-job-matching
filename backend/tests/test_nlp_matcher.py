import pytest
from backend.app.nlp.pdf_extractor import extract_text_from_pdf_bytes, PDFExtractionError
from backend.app.nlp.skill_extractor import SkillExtractor
from backend.app.nlp.matcher import compare_resume_to_job, calculate_text_similarity

def test_pdf_extraction_valid(create_sample_pdf_bytes):
    sample_text = "John Doe\nSoftware Engineer proficient in Python, FastAPI, and Docker with 3 years experience."
    pdf_bytes = create_sample_pdf_bytes(sample_text)

    extracted, warnings = extract_text_from_pdf_bytes(pdf_bytes, "test_resume.pdf")
    assert "Python" in extracted
    assert "FastAPI" in extracted
    assert "Docker" in extracted
    assert isinstance(warnings, list)

def test_pdf_extraction_empty_or_scanned(create_sample_pdf_bytes):
    # Empty bytes
    with pytest.raises(PDFExtractionError) as exc_info:
        extract_text_from_pdf_bytes(b"", "empty.pdf")
    assert "empty" in str(exc_info.value).lower()

    # Fewer than 30 readable chars (e.g. scanned image with just blank text)
    blank_pdf = create_sample_pdf_bytes("Hi")
    with pytest.raises(PDFExtractionError) as exc_info2:
        extract_text_from_pdf_bytes(blank_pdf, "scanned.pdf")
    assert "scanned image" in str(exc_info2.value).lower() or "insufficient" in str(exc_info2.value).lower()

def test_skill_extraction_and_alias_resolution():
    extractor = SkillExtractor()

    text = """
    Experienced engineer who utilized Postgres for relational storage and sklearn for machine learning models.
    Developed single page applications using React.js and NextJS.
    Proficient in C++ and Python 3.
    """
    skills = extractor.extract_skills(text)

    # Check canonical names
    assert "PostgreSQL" in skills
    assert skills["PostgreSQL"]["matched_alias"] == "postgres"

    assert "scikit-learn" in skills
    assert "React" in skills
    assert "Next.js" in skills
    assert "C++" in skills
    assert "Python" in skills

    # Check evidence snippet
    assert len(skills["PostgreSQL"]["evidence"]) > 0

def test_no_false_positive_substring_matches():
    extractor = SkillExtractor()

    # "Google" contains "Go", "Good" contains "Go", "Icon" contains "C", "Rustle" contains "Rust"
    text = "We visited Google headquarters and had a Good conversation regarding company culture."
    skills = extractor.extract_skills(text)

    assert "Go" not in skills


def test_generic_database_language_does_not_imply_sql():
    result = compare_resume_to_job(
        "Experienced engineer managing databases and database systems.",
        "Seeking an engineer to manage databases and database systems.",
    )

    assert "SQL" not in result.matched_skills
    assert "SQL" not in result.missing_skills
    assert result.skill_coverage_score is None

def test_skill_coverage_and_similarity():
    resume_text = """
    Software Engineer with expertise in Python, SQL, and Docker.
    Built automated data pipelines.
    """
    job_description = """
    Looking for a Developer with skills in Python, SQL, Docker, and Kubernetes.
    """

    result = compare_resume_to_job(resume_text, job_description)

    # Required skills = Python, SQL, Docker, Kubernetes (4)
    # Matched skills = Python, SQL, Docker (3)
    # Missing = Kubernetes (1)
    # Coverage = (3 / 4) * 100 = 75.0%
    assert result.skill_coverage_score == 75.0
    assert "Kubernetes" in result.missing_skills
    assert "Python" in result.matched_skills
    assert 0.0 <= result.similarity_score <= 100.0
    assert len(result.suggested_improvements) > 0

def test_zero_required_skills_handled_gracefully():
    resume_text = "Experienced technical project manager leading global teams."
    job_description = "We are seeking a leadership-focused individual to guide cross-functional teams."

    result = compare_resume_to_job(resume_text, job_description)

    # No required technical skills detected
    assert result.skill_coverage_score is None
    assert len(result.extraction_warnings) > 0
    assert "No specific technical skills" in result.extraction_warnings[0]
