import re
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .skill_extractor import default_extractor, SkillExtractor
from .normalizer import normalize_text

class MatchResult:
    def __init__(
        self,
        similarity_score: float,
        skill_coverage_score: Optional[float],
        matched_skills: List[str],
        missing_skills: List[str],
        additional_skills: List[str],
        extraction_warnings: List[str],
        suggested_improvements: List[str],
        evidence_items: List[Dict[str, Any]]
    ):
        self.similarity_score = similarity_score
        self.skill_coverage_score = skill_coverage_score
        self.matched_skills = matched_skills
        self.missing_skills = missing_skills
        self.additional_skills = additional_skills
        self.extraction_warnings = extraction_warnings
        self.suggested_improvements = suggested_improvements
        self.evidence_items = evidence_items

EXCLUDED_SECTION_PATTERNS = [
    r'selection\s+(process|stages|procedure|criteria|pattern|rounds|flow)',
    r'interview\s+(process|rounds|stages|schedule)',
    r'recruitment\s+(process|stages|drive|flow)',
    r'assessment\s+(pattern|rounds|stages|process)',
    r'test\s+(pattern|stages|rounds|format)',
    r'important\s+dates',
    r'registration\s*(dates|timeline|details|link|steps|process|schedule)?',
    r'how\s+to\s+apply',
    r'application\s+(deadline|process|timeline|details|procedure|link)',
    r'service\s+(agreement|bond|commitment)',
    r'bond\s*(details)?',
    r'terms\s*(&|and)\s*conditions',
    r'(ctc|salary|stipend|compensation|remuneration)\s*(details)?',
    r'about\s+(the\s+)?(company|us|organization)',
    r'company\s+overview',
    r'disclaimer',
    r'statutory\s+notice',
]

REQUIREMENT_SECTION_PATTERNS = [
    r'(technical\s+)?(requirements|skills|qualifications|competencies)',
    r'required\s+(skills|qualifications|experience|competencies)',
    r'skills?\s*(required|needed)?',
    r'key\s+skills',
    r'skillset',
    r'what\s+(we\s+are\s+looking\s+for|you\s*(will)?\s*(need|bring))',
    r'must\s+have',
    r'good\s+to\s+have',
    r'eligibility(\s+criteria)?',
    r'responsibilities',
    r'job\s+description',
    r'role\s+(overview|description|responsibilities)',
    r'tech\s+stack',
    r'desired\s+profile',
]

ADMIN_LINE_PATTERNS = [
    r'\b(last\s+date\s+(to|for)|registration\s+(closes|ends|starts|opens)|deadline\s+is)\b',
    r'^(round\s*\d+|stage\s*\d+|step\s*\d+)\s*[:\-]',
    r'\b(service\s*(agreement|bond)|bond\s+of\s+(rs|inr)|\b\d+\s*years?\s*bond)\b',
    r'^(ctc|stipend|salary|package)\s*[:\-]\s*(\d+|inr|rs)',
]

def extract_job_requirement_text(job_description: str) -> Tuple[str, List[str]]:
    """
    Parses a job description to isolate actual role requirements, qualifications,
    and responsibilities, filtering out administrative sections (selection process rounds,
    registration dates, bond/service agreements, CTC declarations).

    Returns:
        (filtered_requirement_text, list_of_excluded_section_names)
    """
    lines = job_description.splitlines()
    excluded_sections_found: List[str] = []
    current_section = "GENERAL"
    included_blocks: List[str] = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        is_header = False
        header_text = ""
        m_colon = re.match(r'^(?:[0-9]+\.|\*|-|#+)?\s*([A-Za-z0-9\s/&,–—\(\)]+)\s*:\s*$', stripped)
        m_md = re.match(r'^#{1,4}\s+([A-Za-z0-9\s/&,–—\(\)]+)\s*$', stripped)

        if m_colon:
            is_header = True
            header_text = m_colon.group(1).strip()
        elif m_md:
            is_header = True
            header_text = m_md.group(1).strip()
        elif len(stripped) < 50 and stripped.isupper() and len(stripped.split()) <= 5:
            is_header = True
            header_text = stripped

        if is_header:
            header_lower = header_text.lower()
            is_excluded = any(re.search(pat, header_lower) for pat in EXCLUDED_SECTION_PATTERNS)
            is_req = any(re.search(pat, header_lower) for pat in REQUIREMENT_SECTION_PATTERNS)

            if is_excluded and not is_req:
                current_section = "EXCLUDED"
                excluded_sections_found.append(header_text)
                continue
            elif is_req:
                current_section = "REQUIREMENT"
                continue
            else:
                current_section = "GENERAL"
                continue

        if current_section == "EXCLUDED":
            continue

        # Skip administrative lines within general text
        if any(re.search(pat, stripped, re.IGNORECASE) for pat in ADMIN_LINE_PATTERNS):
            continue

        included_blocks.append(stripped)

    filtered_text = "\n".join(included_blocks).strip()
    # Deduplicate section names preserving order
    deduped_sections = list(dict.fromkeys(excluded_sections_found))
    return filtered_text, deduped_sections

def calculate_text_similarity(resume_text: str, job_description: str) -> float:
    """
    Computes TF-IDF cosine similarity between resume and job description.
    Returns float score between 0.0 and 100.0.
    """
    clean_resume = normalize_text(resume_text)
    clean_jd = normalize_text(job_description)

    if not clean_resume or not clean_jd:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True
        )
        tfidf_matrix = vectorizer.fit_transform([clean_resume, clean_jd])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        # Guard against floating-point inaccuracies outside [0, 1]
        sim = max(0.0, min(1.0, float(sim)))
        return round(sim * 100.0, 1)
    except Exception:
        return 0.0

def compare_resume_to_job(
    resume_text: str,
    job_description: str,
    extractor: Optional[SkillExtractor] = None
) -> MatchResult:
    """
    Compares resume text to job description and produces an explainable match analysis.
    """
    if extractor is None:
        extractor = default_extractor

    warnings: List[str] = []
    suggestions: List[str] = []
    evidence_items: List[Dict[str, Any]] = []

    clean_resume = normalize_text(resume_text)
    clean_jd = normalize_text(job_description)

    # 1. Text Similarity Score (TF-IDF vector cosine similarity across full text)
    sim_score = calculate_text_similarity(clean_resume, clean_jd)

    # 2. Extract actual requirement text from job description, filtering out administrative sections
    req_jd_text, excluded_sections = extract_job_requirement_text(clean_jd)
    if not req_jd_text:
        # Fallback to normalized JD if filtering removed all text
        req_jd_text = clean_jd

    # 3. Skill Extraction
    resume_skills_dict = extractor.extract_skills(clean_resume)
    jd_skills_dict = extractor.extract_skills(req_jd_text)

    resume_skill_names = set(resume_skills_dict.keys())
    jd_skill_names = set(jd_skills_dict.keys())

    # 4. Matched, Missing, and Additional Skills
    matched_set = resume_skill_names.intersection(jd_skill_names)
    missing_set = jd_skill_names - resume_skill_names
    additional_set = resume_skill_names - jd_skill_names

    matched_skills = sorted(list(matched_set))
    missing_skills = sorted(list(missing_set))
    additional_skills = sorted(list(additional_set))

    # 5. Skill Coverage Score calculation
    # Formula: (matched required skills / detected required skills) * 100
    if len(jd_skill_names) > 0:
        coverage = (len(matched_set) / len(jd_skill_names)) * 100.0
        skill_coverage_score: Optional[float] = round(coverage, 1)
    else:
        skill_coverage_score = None
        warnings.append(
            "No specific technical skills from the configured dictionary were detected in the job description. "
            "Skill coverage score cannot be computed without detectable requirements."
        )
        if excluded_sections:
            warnings.append(
                f"Administrative recruitment sections ({', '.join(excluded_sections)}) were excluded from skill extraction."
            )

    # 6. Build Evidence Items
    for skill_name in matched_skills:
        res_info = resume_skills_dict[skill_name]
        jd_info = jd_skills_dict[skill_name]
        evidence_items.append({
            "skill": skill_name,
            "match_status": "matched",
            "resume_evidence": res_info["evidence"],
            "job_requirement_evidence": jd_info["evidence"]
        })

    for skill_name in missing_skills:
        jd_info = jd_skills_dict[skill_name]
        evidence_items.append({
            "skill": skill_name,
            "match_status": "missing",
            "resume_evidence": None,
            "job_requirement_evidence": jd_info["evidence"]
        })

    for skill_name in additional_skills:
        res_info = resume_skills_dict[skill_name]
        evidence_items.append({
            "skill": skill_name,
            "match_status": "additional",
            "resume_evidence": res_info["evidence"],
            "job_requirement_evidence": None
        })

    # 7. Generate Deterministic Suggestions grounded in detected text
    if skill_coverage_score is None:
        suggestions.append(
            "No explicit technical skill requirements (such as programming languages, databases, or frameworks) "
            "were detected in the job description. This frequently occurs with broad campus Graduate Engineer Trainee (GET) "
            "announcements or recruitment circulars that only outline eligibility degrees, percentages, registration dates, "
            "and selection rounds. To compute an accurate skill match percentage and identify missing competencies, "
            "paste a job description that includes specific technical qualifications or engineering duties."
        )

    if missing_skills:
        top_missing = missing_skills[:4]
        skills_str = ", ".join(top_missing)
        suggestions.append(
            f"The job specifies requirement for {skills_str}. If you have practical or academic experience with these technologies, consider explicitly including them in your Skills or Experience section."
        )

    if skill_coverage_score is not None and skill_coverage_score < 50.0:
        suggestions.append(
            f"Skill coverage is currently {skill_coverage_score}%. Review whether you have relevant projects, coursework, or internships that demonstrate the missing core requirements."
        )

    if sim_score < 35.0:
        suggestions.append(
            f"Overall textual similarity is {sim_score}%. Aligning terminology (e.g., using industry-standard terms for technical domains and responsibilities) can help make your resume easier to review."
        )
    elif sim_score >= 70.0:
        suggestions.append(
            "Strong textual alignment detected with the job description keywords and technical vocabulary."
        )

    if not suggestions:
        suggestions.append(
            "Your resume displays good alignment with detected job requirements. Ensure your impact and achievements under each skill are clearly quantified."
        )

    return MatchResult(
        similarity_score=sim_score,
        skill_coverage_score=skill_coverage_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        additional_skills=additional_skills,
        extraction_warnings=warnings,
        suggested_improvements=suggestions,
        evidence_items=evidence_items
    )
