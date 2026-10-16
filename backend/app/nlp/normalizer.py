import re
from typing import List

def normalize_text(text: str) -> str:
    """
    Normalizes input text for NLP processing:
    - Normalizes newlines and multiple spaces
    - Standardizes bullet characters
    - Preserves language symbols like C++, C#, .NET
    """
    if not text:
        return ""

    # Replace weird unicode bullets and hyphens with standard space or dash
    cleaned = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\u00B7]', ' ', text)
    cleaned = re.sub(r'[\u2010\u2011\u2012\u2013\u2014\u2015]', '-', cleaned)
    cleaned = re.sub(r'[\u2018\u2019]', "'", cleaned)
    cleaned = re.sub(r'[\u201C\u201D]', '"', cleaned)

    # Collapse duplicate whitespace while preserving single newlines
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)
    cleaned = re.sub(r'\n\s*\n+', '\n\n', cleaned)

    return cleaned.strip()

def split_into_sentences(text: str) -> List[str]:
    """
    Splits text into meaningful sentences/bullet points for context evidence extraction.
    """
    if not text:
        return []

    # Split by newlines or punctuation followed by space
    raw_lines = re.split(r'[\n\r]+', text)
    sentences: List[str] = []

    for line in raw_lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        # Sub-split by standard sentence delimiters (period, semicolon) if long
        parts = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9])', line_clean)
        for part in parts:
            p = part.strip()
            if len(p) > 5:
                sentences.append(p)

    return sentences

def extract_evidence_snippet(text: str, skill_name: str, alias_patterns: List[str], max_len: int = 180) -> str:
    """
    Finds the most relevant context sentence or snippet in the text mentioning the skill.
    """
    sentences = split_into_sentences(text)

    # Check each sentence for matches
    for s in sentences:
        s_lower = s.lower()
        for alias in alias_patterns:
            # Safe boundary check
            escaped = re.escape(alias.lower())
            if not alias[0].isalnum() or not alias[-1].isalnum() or '/' in alias:
                pattern = rf'(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])'
            else:
                pattern = rf'\b{escaped}\b'

            if re.search(pattern, s_lower):
                if len(s) <= max_len:
                    return s
                else:
                    # Truncate around match
                    m = re.search(pattern, s_lower)
                    if m:
                        start = max(0, m.start() - 40)
                        end = min(len(s), m.end() + 100)
                        snippet = s[start:end].strip()
                        if start > 0:
                            snippet = "..." + snippet
                        if end < len(s):
                            snippet = snippet + "..."
                        return snippet

    # Fallback: search anywhere in full text
    text_lower = text.lower()
    for alias in alias_patterns:
        escaped = re.escape(alias.lower())
        pattern = rf'(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])' if (not alias[0].isalnum() or not alias[-1].isalnum() or '/' in alias) else rf'\b{escaped}\b'
        m = re.search(pattern, text_lower)
        if m:
            start = max(0, m.start() - 50)
            end = min(len(text), m.end() + 100)
            snippet = text[start:end].replace('\n', ' ').strip()
            return f"...{snippet}..."

    return f"Mentioned: {skill_name}"
