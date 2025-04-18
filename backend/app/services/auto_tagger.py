"""
Auto Tagging and Categorization Service for Decision Journal Entries.

- Domain tagging (rules-based)
- Sentiment analysis (TextBlob)
- Keyword extraction (RAKE)

Dependencies: textblob, rake-nltk
"""
from typing import List, Optional, Dict
from textblob import TextBlob
from rake_nltk import Rake

# Simple keyword-to-domain mapping (can be expanded)
DOMAIN_KEYWORDS = {
    "career": [
        "job",
        "work",
        "promotion",
        "boss",
        "colleague",
        "career",
        "raise",
        "employer",
        "employee",
        "office",
    ],
    "health": [
        "health",
        "doctor",
        "illness",
        "exercise",
        "diet",
        "wellness",
        "nutrition",
        "fitness",
        "weight",
        "gym",
        "medication",
        "treatment",
    ],
    "relationships": [
        "family",
        "friend",
        "partner",
        "relationship",
        "love",
        "marriage",
        "spouse",
        "parent",
        "child",
        "children",
        "dating",
    ],
    "finance": [
        "money",
        "finance",
        "debt",
        "salary",
        "investment",
        "budget",
        "stock",
        "market",
        "invest",
        "save",
        "savings",
        "bank",
        "fund",
        "income",
        "expense",
        "spending",
        "profit",
        "loss",
    ],
    "personal_growth": [
        "growth",
        "learning",
        "course",
        "skill",
        "habit",
        "self",
        "improve",
        "improvement",
        "goal",
        "achievement",
        "progress",
        "development",
    ],
}


class AutoTagger:
    """
    Service for auto-tagging decision journal entries with domains, sentiment, and keywords.
    """

    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        r = Rake()
        r.extract_keywords_from_text(text or "")
        return r.get_ranked_phrases()[:5]  # Top 5 keywords

    @staticmethod
    def detect_domain(text: str) -> List[str]:
        # Reason: Try to match as many relevant domains as possible
        if not text:
            return []
        domains = set()
        text_lower = text.lower()
        for domain, keywords in DOMAIN_KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    domains.add(domain)
        return list(domains) if domains else []  # Always return a list, never None

    @staticmethod
    def analyze_sentiment(text: str) -> str:
        # Reason: Use a wider neutral range for more realistic results
        if not text:
            return "neutral"
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        if polarity > 0.2:
            return "positive"
        elif polarity < -0.2:
            return "negative"
        return "neutral"

    @classmethod
    def tag_entry(
        cls, title: Optional[str], context: Optional[str]
    ) -> Dict[str, object]:
        """
        Given title/context, return dict with domain_tags, sentiment_tag, keywords.
        """
        full_text = f"{title or ''} {context or ''}"
        domains = cls.detect_domain(full_text)
        sentiment = cls.analyze_sentiment(full_text)
        keywords = cls.extract_keywords(full_text)
        return {
            "domain_tags": domains,
            "sentiment_tag": sentiment,
            "keywords": keywords,
        }
