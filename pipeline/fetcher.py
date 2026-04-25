import concurrent.futures
from pipeline.fetch_semantic_scholar import fetch_semantic_scholar
from pipeline.fetch_arxiv import fetch_arxiv
from backend.dedup import deduplicate
from backend.validator import validate_paper
from backend.config import MIN_PAPERS

def fetch_all(topic: str) -> list[dict]:
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future_ss = executor.submit(fetch_semantic_scholar, topic)
        future_ax = executor.submit(fetch_arxiv, topic)
        ss_papers = future_ss.result()
        ax_papers = future_ax.result()

    print(f"Semantic Scholar raw: {len(ss_papers)}")
    print(f"arXiv raw: {len(ax_papers)}")

    all_papers = ss_papers + ax_papers
    validated = [validate_paper(p) for p in all_papers]
    deduped = deduplicate(validated)
    sorted_papers = sorted(
        deduped,
        key=lambda p: p["published_date"],
        reverse=True
    )

    print(f"After dedup and validation: {len(sorted_papers)}")

    if len(sorted_papers) < MIN_PAPERS:
        print(f"WARNING: only {len(sorted_papers)} papers found, minimum is {MIN_PAPERS}")

    return sorted_papers
