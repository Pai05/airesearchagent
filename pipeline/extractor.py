import anthropic
import json
import time
from backend.cache import get_cached, save_to_cache
from backend.config import ANTHROPIC_API_KEY, MAX_BATCH_LLM

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

PROMPT_TEMPLATE = """You are a research analyst. Given this abstract extract:
1. Three key findings (specific results not general descriptions)
2. Two explicit or implied research gaps

Return ONLY valid JSON no explanation no markdown:
{{"findings": ["...", "...", "..."], "gaps": ["...", "..."]}}

Abstract: {abstract}"""

def extract_findings(papers: list[dict], topic: str = "") -> list[dict]:
    to_process = []
    cached_map = {}

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
    print(f"Needs LLM: {len(to_process)}")

    if to_process:
        batch_requests = [
            {
                "custom_id": p["id"],
                "params": {
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 300,
                    "messages": [{
                        "role": "user",
                        "content": PROMPT_TEMPLATE.format(
                            abstract=p["abstract"][:1500]
                        )
                    }]
                }
            }
            for p in to_process
        ]

        print("Sending batch to Claude Haiku...")
        batch = client.beta.messages.batches.create(
            requests=batch_requests
        )
        print(f"Batch ID: {batch.id}")

        while True:
            status = client.beta.messages.batches.retrieve(batch.id)
            print(f"Batch status: {status.processing_status}")
            if status.processing_status == "ended":
                break
            time.sleep(5)

        for result in client.beta.messages.batches.results(batch.id):
            pid = result.custom_id
            try:
                text = result.result.message.content[0].text
                clean = text.strip().replace("```json", "").replace("```", "")
                parsed = json.loads(clean)
                findings = parsed.get("findings", [])[:3]
                gaps = parsed.get("gaps", [])[:2]
                extracted = {"findings": findings, "gaps": gaps}
            except Exception as e:
                print(f"Parse error for {pid}: {e}")
                extracted = {"findings": [], "gaps": []}

            save_to_cache(pid, topic, extracted)
            cached_map[pid] = extracted

    for p in papers:
        pid = p.get("id", "")
        result = cached_map.get(pid, {"findings": [], "gaps": []})
        p["findings"] = result.get("findings", [])
        p["gaps"] = result.get("gaps", [])

    return papers
