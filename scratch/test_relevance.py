import requests
from collections import Counter

r = requests.get(
    'http://localhost:8000/api/search',
    params={'topic': 'Quantum Computing', 'limit': 15},
    timeout=60
)
data = r.json()
sources = Counter(p['source'] for p in data['papers'])
print('Total:', data['total'])
print('Sources:', dict(sources))
print()
for i, p in enumerate(data['papers'][:10]):
    src = p['source']
    title = p['title'][:70]
    print(f"{i+1}. [{src}] {title}")
