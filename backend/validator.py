def validate_paper(paper: dict) -> dict:
    """Validate and clean paper object."""
    # Ensure required fields exist
    required_fields = {
        "title": "",
        "authors": [],
        "year": 0,
        "published_date": "2000-01-01",
        "doi": None,
        "source": "unknown",
        "abstract": "",
        "pdf_url": None,
        "landing_url": "",
        "is_open_access": False,
        "citation_count": 0,
        "findings": [],
        "gaps": [],
        "field_tags": []
    }
    
    validated = {}
    for key, default in required_fields.items():
        value = paper.get(key, default)
        
        # Type coercion
        if key == "authors" and not isinstance(value, list):
            value = []
        elif key == "year" and not isinstance(value, int):
            try:
                value = int(value)
            except:
                value = 0
        elif key == "citation_count" and not isinstance(value, int):
            try:
                value = int(value)
            except:
                value = 0
        elif key in ["findings", "gaps", "field_tags"] and not isinstance(value, list):
            value = []
        elif key in ["is_open_access"] and not isinstance(value, bool):
            value = bool(value)
        elif key in ["title", "abstract", "source", "landing_url"] and not isinstance(value, str):
            value = str(value)
        
        validated[key] = value
    
    # Validate landing_url is always present
    if not validated["landing_url"]:
        validated["landing_url"] = f"https://unknown.org/{validated['title'][:20]}"
    
    return validated
