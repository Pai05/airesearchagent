import json
import re

import requests

from backend.cache import get_cached, save_to_cache
from backend.config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL
from pipeline.extractor_mock import extract_findings_mock


def _normalize_extraction(payload: dict) -> tuple[list[str], list[str], list[str]]:
    findings = payload.get("findings", []) if isinstance(payload, dict) else []
    gaps = payload.get("gaps", []) if isinstance(payload, dict) else []
    field_tags = payload.get("field_tags", []) if isinstance(payload, dict) else []

    if not isinstance(findings, list):
        findings = []
    if not isinstance(gaps, list):
        gaps = []
    if not isinstance(field_tags, list):
        field_tags = []

    findings = [str(item).strip() for item in findings if str(item).strip()]
    gaps = [str(item).strip() for item in gaps if str(item).strip()]
    field_tags = [str(item).strip() for item in field_tags if str(item).strip()]

    return findings[:3], gaps[:2], field_tags[:3]


def _parse_groq_response(content: str) -> tuple[list[str], list[str], list[str]]:
    try:
        return _normalize_extraction(json.loads(content))
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", content)
    if not match:
        return [], [], []

    try:
        return _normalize_extraction(json.loads(match.group(0)))
    except json.JSONDecodeError:
        return [], [], []


def _extract_findings_groq(abstract: str) -> tuple[list[str], list[str], list[str]]:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = (
        "Extract exactly 3 key findings, exactly 2 research gaps, and up to 3 short field tags (topics/categories) from the abstract. "
        "Return ONLY valid JSON with keys findings, gaps, and field_tags. "
        "Format: {\"findings\": [\"...\", \"...\", \"...\"], \"gaps\": [\"...\", \"...\"], \"field_tags\": [\"...\", \"...\", \"...\"]}.\n\n"
        f"Abstract:\n{abstract[:4000]}"
    )

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0,
        "max_tokens": 300,
        "messages": [
            {
                "role": "system",
                "content": "You are a precise research assistant that returns strict JSON only.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    }

    response = requests.post(
        f"{GROQ_BASE_URL}/chat/completions",
        headers=headers,
        json=payload,
        timeout=20,
    )
    response.raise_for_status()

    data = response.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    findings, gaps, field_tags = _parse_groq_response(content)

    if findings and gaps:
        return findings, gaps, field_tags

    raise ValueError("Groq response did not contain valid findings/gaps JSON")

def extract_findings(papers: list[dict], topic: str = "") -> list[dict]:
    """Extract findings and gaps using Groq when configured, else local mock extractor."""
    to_process = []
    cached_map = {}
    use_groq = bool(GROQ_API_KEY)

    for p in papers:
        if not p.get("id"):
            continue
        cached = get_cached(p["id"])
        if cached:
            cached_map[p["id"]] = cached
        elif p.get("abstract"):
            to_process.append(p)
        else:
            cached_map[p["id"]] = {"findings": [], "gaps": []}

    print(f"From cache: {len(cached_map)}")
    print(f"Needs extraction: {len(to_process)}")

    if to_process:
        if use_groq:
            print(f"Extracting findings from abstracts (Groq: {GROQ_MODEL})...")
        else:
            print("Extracting findings from abstracts (mock)...")

        for p in to_process:
            pid = p["id"]
            abstract = p.get("abstract", "")

            field_tags = []
            if use_groq:
                try:
                    findings, gaps, field_tags = _extract_findings_groq(abstract)
                except Exception as e:
                    print(f"Groq extraction failed for {pid}: {e}. Falling back to mock.")
                    findings, gaps = extract_findings_mock(abstract)
            else:
                findings, gaps = extract_findings_mock(abstract)

            extracted = {"findings": findings, "gaps": gaps, "field_tags": field_tags}

            save_to_cache(pid, topic, extracted)
            cached_map[pid] = extracted

        print(f"Extracted {len(to_process)} papers")

    for p in papers:
        pid = p.get("id", "")
        result = cached_map.get(pid, {"findings": [], "gaps": [], "field_tags": []})
        p["findings"] = result.get("findings", [])
        p["gaps"] = result.get("gaps", [])
        # Merge existing field tags with AI generated ones
        existing_tags = p.get("field_tags", [])
        new_tags = result.get("field_tags", [])
        p["field_tags"] = list(set(existing_tags + new_tags))

    return papers
