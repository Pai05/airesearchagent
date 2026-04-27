import requests
import xmltodict
from backend.config import RESULTS_PER_SOURCE

def fetch_pubmed(topic: str) -> list[dict]:
    """Fetch papers from PubMed using E-utilities."""
    search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    # Use title/abstract field qualifiers for better relevance
    refined_query = f"{topic}[Title/Abstract]"
    search_params = {
        "db": "pubmed",
        "term": refined_query,
        "retmax": RESULTS_PER_SOURCE,
        "sort": "relevance",
        "retmode": "json"
    }
    
    try:
        r = requests.get(search_url, params=search_params, timeout=15)
        r.raise_for_status()
        id_list = r.json().get("esearchresult", {}).get("idlist", [])
    except Exception as e:
        print(f"PubMed search error: {topic} -> {e}")
        return []

    if not id_list:
        return []

    fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    fetch_params = {
        "db": "pubmed",
        "id": ",".join(id_list),
        "retmode": "xml"
    }
    
    try:
        r = requests.get(fetch_url, params=fetch_params, timeout=20)
        r.raise_for_status()
        parsed = xmltodict.parse(r.text)
    except Exception as e:
        print(f"PubMed fetch error for IDs {id_list[:3]}... -> {e}")
        return []

    # XML structure: PubmedArticleSet -> PubmedArticle (list or dict)
    articles_set = parsed.get("PubmedArticleSet", {})
    if not articles_set:
        return []
        
    articles = articles_set.get("PubmedArticle", [])
    if isinstance(articles, dict):
        articles = [articles]

    papers = []
    for art in articles:
        try:
            medline = art.get("MedlineCitation", {})
            article = medline.get("Article", {})
            
            # Title
            title = article.get("ArticleTitle", "")
            if isinstance(title, dict):
                title = title.get("#text", "")
            
            # Abstract
            abstract_text = ""
            abstract_node = article.get("Abstract", {}).get("AbstractText", "")
            if isinstance(abstract_node, list):
                abstract_parts = []
                for part in abstract_node:
                    if isinstance(part, dict):
                        abstract_parts.append(part.get("#text", ""))
                    else:
                        abstract_parts.append(str(part))
                abstract_text = " ".join(filter(None, abstract_parts))
            elif isinstance(abstract_node, dict):
                abstract_text = abstract_node.get("#text", "")
            else:
                abstract_text = str(abstract_node)

            # Authors
            author_list_node = article.get("AuthorList", {}).get("Author", [])
            if isinstance(author_list_node, dict):
                author_list_node = [author_list_node]
            authors = []
            for auth in author_list_node:
                last = auth.get("LastName", "")
                fore = auth.get("ForeName", "")
                authors.append(f"{fore} {last}".strip())

            # Date
            journal_issue = article.get("Journal", {}).get("JournalIssue", {})
            pub_date = journal_issue.get("PubDate", {})
            year = pub_date.get("Year") or pub_date.get("MedlineDate", "2000")[:4]
            month = pub_date.get("Month", "01")
            day = pub_date.get("Day", "01")
            
            # Try to get more precise date if available
            history = art.get("PubmedData", {}).get("History", {}).get("PubMedPubDate", [])
            if isinstance(history, dict):
                history = [history]
            for h in history:
                if h.get("@PubStatus") == "pubmed":
                    year = h.get("Year", year)
                    month = h.get("Month", month)
                    day = h.get("Day", day)
                    break

            # DOI
            doi = None
            article_id_list = art.get("PubmedData", {}).get("ArticleIdList", {}).get("ArticleId", [])
            if isinstance(article_id_list, dict):
                article_id_list = [article_id_list]
            for aid in article_id_list:
                if aid.get("@IdType") == "doi":
                    doi = aid.get("#text")

            pmid = medline.get("PMID", {}).get("#text", "")
            landing_url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

            # Open Access Check (simplified)
            is_oa = False
            for aid in article_id_list:
                if aid.get("@IdType") == "pmc":
                    is_oa = True
                    break

            papers.append({
                "title": title.strip(),
                "authors": authors,
                "year": int(year) if str(year).isdigit() else 2000,
                "published_date": f"{year}-{month.zfill(2)}-{day.zfill(2)}",
                "doi": doi,
                "source": "pubmed",
                "abstract": abstract_text.strip(),
                "pdf_url": None,
                "landing_url": landing_url,
                "is_open_access": is_oa,
                "citation_count": 0,
                "findings": [],
                "gaps": [],
                "field_tags": []
            })
        except Exception as e:
            print(f"Error parsing PubMed article: {e}")
            continue

    return papers
