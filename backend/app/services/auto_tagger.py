"""
OpenAI-based Auto Tagging and Categorization Service for Decision Journal Entries.

- Calls OpenAI LLM with function calling to extract domain_tags, sentiment_tag, keywords.
- No local NLP dependencies.
"""

import os
from typing import List, Optional, Dict
import openai
from fastapi import HTTPException

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-nano")

AUTO_TAG_FUNCTION = {
    "name": "auto_tag_journal_entry",
    "description": "Auto-tag a decision journal entry with domains, sentiment, and keywords.",
    "parameters": {
        "type": "object",
        "properties": {
            "domain_tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Relevant domains (e.g., career, health, relationships, finance, personal_growth)",
            },
            "sentiment_tag": {
                "type": "string",
                "enum": ["positive", "neutral", "negative"],
                "description": "Overall sentiment of the entry",
            },
            "keywords": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Key topics or concepts from the entry",
            },
        },
        "required": ["domain_tags", "sentiment_tag", "keywords"],
    },
}


class OpenAITagger:
    """
    Service for auto-tagging decision journal entries using OpenAI LLM with function calling.
    """

    @classmethod
    def tag_entry(
        cls, title: Optional[str], context: Optional[str]
    ) -> Dict[str, object]:
        """
        Calls OpenAI to auto-tag a decision journal entry.

        Args:
            title (Optional[str]): Entry title.
            context (Optional[str]): Entry context.
        Returns:
            Dict[str, object]: {"domain_tags": [...], "sentiment_tag": str, "keywords": [...]}
        Raises:
            HTTPException(503): If OpenAI API key is not set or call fails.
        """
        if not OPENAI_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Auto-tagging unavailable: OpenAI API key not configured.",
            )
        prompt = (
            "Given the following decision journal entry, extract the most relevant domains (career, health, relationships, finance, personal growth), "
            "sentiment (positive/neutral/negative), and 3-7 keywords. Respond strictly in the specified function call format."
        )
        messages = [
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": f"Title: {title or ''}\nContext: {context or ''}",
            },
        ]
        try:
            response = openai.ChatCompletion.create(
                model=OPENAI_MODEL,
                messages=messages,
                functions=[AUTO_TAG_FUNCTION],
                function_call={"name": "auto_tag_journal_entry"},
                api_key=OPENAI_API_KEY,
            )
            args = response["choices"][0]["message"]["function_call"]["arguments"]
            import json

            tags = json.loads(args)
            # Validate output
            for k in ("domain_tags", "sentiment_tag", "keywords"):
                if k not in tags:
                    raise HTTPException(
                        status_code=503, detail=f"OpenAI tagging missing field: {k}"
                    )
            return tags
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Auto-tagging failed: {e}")


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
