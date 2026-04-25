import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
SEMANTIC_SCHOLAR_BASE = "https://api.semanticscholar.org/graph/v1"
ARXIV_BASE = "http://export.arxiv.org/api/query"
RESULTS_PER_SOURCE = 30
MIN_PAPERS = 50
MAX_BATCH_LLM = 50

ALLOWED_PDF_DOMAINS = [
    "arxiv.org",
    "semanticscholar.org",
    "ncbi.nlm.nih.gov",
    "pubmedcentral.nih.gov",
    "biorxiv.org",
    "medrxiv.org"
]
