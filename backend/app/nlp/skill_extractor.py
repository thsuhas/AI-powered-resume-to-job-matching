import json
import os
import re
from typing import Dict, List, Set, Tuple, Optional
from pathlib import Path
from .normalizer import normalize_text, extract_evidence_snippet

class SkillDefinition:
    def __init__(self, name: str, category: str, aliases: List[str]):
        self.name = name
        self.category = category
        self.aliases = aliases
        # Pre-compile regex patterns for phrase-aware matching
        self.patterns = []
        for alias in aliases:
            escaped = re.escape(alias.lower())
            if not alias[0].isalnum() or not alias[-1].isalnum() or '/' in alias:
                pat = re.compile(rf'(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])', re.IGNORECASE)
            else:
                pat = re.compile(rf'\b{escaped}\b', re.IGNORECASE)
            self.patterns.append((alias, pat))


class SkillExtractor:
    def __init__(self, skills_file_path: Optional[str] = None):
        if skills_file_path is None:
            skills_file_path = str(Path(__file__).resolve().parent / "skills_db.json")
        self.skills_file_path = skills_file_path
        self.skills: List[SkillDefinition] = []
        self._load_skills()

    def _load_skills(self):
        if not os.path.exists(self.skills_file_path):
            raise FileNotFoundError(f"Skills database not found at {self.skills_file_path}")
        with open(self.skills_file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            raw_skills = data.get("skills", [])
            self.skills = [
                SkillDefinition(
                    name=s["name"],
                    category=s.get("category", "General"),
                    aliases=s.get("aliases", [s["name"].lower()])
                )
                for s in raw_skills
            ]

    def extract_skills(self, text: str) -> Dict[str, Dict]:
        """
        Extracts skills from text using phrase-aware matching.
        Returns a dict mapping canonical skill name to details:
        {
            "Python": {
                "name": "Python",
                "category": "Languages",
                "matched_alias": "python3",
                "evidence": "...sentence context..."
            }
        }
        """
        normalized = normalize_text(text)
        results: Dict[str, Dict] = {}

        for skill in self.skills:
            for alias, pattern in skill.patterns:
                match = pattern.search(normalized)
                if match:
                    evidence = extract_evidence_snippet(normalized, skill.name, skill.aliases)
                    results[skill.name] = {
                        "name": skill.name,
                        "category": skill.category,
                        "matched_alias": alias,
                        "evidence": evidence
                    }
                    break  # Once matched for this canonical skill, proceed to next skill

        return results

    def extract_skills_baseline(self, text: str) -> Set[str]:
        """
        Baseline naive extraction (simple whitespace/punctuation splitting without phrase awareness).
        Used for benchmarking against the proposed phrase-aware NLP engine.
        """
        tokens = set(re.findall(r'\b[a-zA-Z0-9_+#.-]+\b', text.lower()))
        matched = set()
        for skill in self.skills:
            # Naive match checks exact token match with the canonical name or aliases
            for alias in skill.aliases:
                if alias.lower() in tokens:
                    matched.add(skill.name)
                    break
        return matched

# Global singleton extractor instance
default_extractor = SkillExtractor()
