from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_PAPERS = [
    {
        "id": "abc123",
        "title": "Attention mechanisms in transformer models",
        "authors": ["Zhang, W.", "Kumar, A."],
        "year": 2024,
        "published_date": "2024-09-15",
        "doi": "10.1234/example.001",
        "source": "semantic_scholar",
        "abstract": "This paper explores...",
        "pdf_url": "https://arxiv.org/pdf/2409.00001",
        "landing_url": "https://arxiv.org/abs/2409.00001",
        "is_open_access": True,
        "citation_count": 42,
        "findings": [
            "Attention heads specialize by layer depth",
            "Sparse attention reduces compute by 40%",
            "Cross-attention outperforms self-attention on translation"
        ],
        "gaps": [
            "No study compares sparse attention across non-English corpora",
            "Long-context behavior beyond 8k tokens is underexplored"
        ],
        "field_tags": ["NLP", "Deep Learning"]
    },
    {
        "id": "def456",
        "title": "CRISPR off-target effects in somatic cells",
        "authors": ["Patel, R.", "Lee, S."],
        "year": 2024,
        "published_date": "2024-08-22",
        "doi": "10.1234/example.002",
        "source": "pubmed",
        "abstract": "We analyzed off-target...",
        "pdf_url": None,
        "landing_url": "https://doi.org/10.1234/example.002",
        "is_open_access": False,
        "citation_count": 17,
        "findings": [
            "Off-target edits occur in 3.2% of trials",
            "Guide RNA length is the strongest predictor",
            "Somatic cells show higher tolerance than germline"
        ],
        "gaps": [
            "Long-term off-target accumulation is not tracked beyond 6 months",
            "No standardized reporting metric exists across labs"
        ],
        "field_tags": ["Genomics", "CRISPR"]
    },
    {
        "id": "ghi789",
        "title": "Federated learning under non-IID data distributions",
        "authors": ["Morris, J.", "Chen, L."],
        "year": 2024,
        "published_date": "2024-07-10",
        "doi": None,
        "source": "arxiv",
        "abstract": "Federated learning struggles...",
        "pdf_url": "https://arxiv.org/pdf/2407.00123",
        "landing_url": "https://arxiv.org/abs/2407.00123",
        "is_open_access": True,
        "citation_count": 8,
        "findings": [
            "FedProx outperforms FedAvg by 12% under extreme skew",
            "Client drift is the primary cause of accuracy degradation",
            "Gradient compression worsens non-IID performance"
        ],
        "gaps": [
            "No benchmark dataset exists for extreme non-IID simulation",
            "Cross-silo vs cross-device differences are rarely controlled for"
        ],
        "field_tags": ["Federated Learning", "Privacy"]
    },
    {
        "id": "jkl012",
        "title": "Microplastic accumulation in freshwater ecosystems",
        "authors": ["Nguyen, T.", "Okafor, B."],
        "year": 2024,
        "published_date": "2024-06-05",
        "doi": "10.1234/example.004",
        "source": "semantic_scholar",
        "abstract": "Freshwater microplastic...",
        "pdf_url": "https://semanticscholar.org/pdf/example004.pdf",
        "landing_url": "https://doi.org/10.1234/example.004",
        "is_open_access": True,
        "citation_count": 31,
        "findings": [
            "Riverbed sediment contains 4x higher concentration than surface water",
            "Polymer type affects bioaccumulation rate",
            "Seasonal flow changes alter microplastic distribution significantly"
        ],
        "gaps": [
            "Tropical freshwater systems are almost entirely unstudied",
            "No long-term toxicity study exceeds 24 months"
        ],
        "field_tags": ["Environmental Science", "Ecology"]
    },
    {
        "id": "mno345",
        "title": "Mental health outcomes of remote work post-pandemic",
        "authors": ["Singh, P.", "Almeida, C."],
        "year": 2023,
        "published_date": "2023-12-18",
        "doi": "10.1234/example.005",
        "source": "pubmed",
        "abstract": "We surveyed 4,200 workers...",
        "pdf_url": None,
        "landing_url": "https://doi.org/10.1234/example.005",
        "is_open_access": False,
        "citation_count": 55,
        "findings": [
            "Remote workers report 23% higher anxiety scores than office workers",
            "Lack of social interaction is the top cited stressor",
            "Flexible hours partially offset anxiety increase"
        ],
        "gaps": [
            "No study distinguishes voluntary vs mandatory remote work",
            "Non-Western workforce data is absent from all reviewed studies"
        ],
        "field_tags": ["Public Health", "Organizational Psychology"]
    }
]

@app.get("/api/search")
def search(topic: str = "", limit: int = 50):
    return {
        "topic": topic,
        "total": len(MOCK_PAPERS),
        "papers": MOCK_PAPERS
    }
