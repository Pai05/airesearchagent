import requests
import json

def test_search(topic):
    url = "http://localhost:8000/api/search"
    params = {"topic": topic, "limit": 10}
    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        print(f"Topic: {topic}")
        print(f"Total found: {data['total']}")
        sources = {}
        for p in data['papers']:
            src = p['source']
            sources[src] = sources.get(src, 0) + 1
        print(f"Sources: {sources}")
        if data['papers']:
            print(f"First paper: {data['papers'][0]['title']} ({data['papers'][0]['source']})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search("Alzheimer's disease biomarkers")
