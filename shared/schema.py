from dataclasses import dataclass
from typing import Optional

@dataclass
class Paper:
    id: str                      # SHA256 hash of DOI or normalized title
    title: str
    authors: list[str]
    year: int
    published_date: str          # "YYYY-MM-DD"
    doi: Optional[str]
    source: str                  # "semantic_scholar" | "arxiv"
    abstract: str
    pdf_url: Optional[str]       # None if paywalled or not found
    landing_url: str             # always present — DOI page or arXiv abs link
    is_open_access: bool
    citation_count: int
    findings: list[str]          # 3 items, filled by LLM
    gaps: list[str]              # 2 items, filled by LLM
    field_tags: list[str]
