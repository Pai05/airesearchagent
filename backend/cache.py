import sqlite3, json, hashlib
from datetime import datetime

DB_PATH = "cache.db"

def init_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE IF NOT EXISTS paper_cache (
            id TEXT PRIMARY KEY,
            topic TEXT,
            data JSON,
            fetched_at TIMESTAMP
        )
    """)
    con.commit()
    con.close()

def get_cached(paper_id: str):
    con = sqlite3.connect(DB_PATH)
    row = con.execute(
        "SELECT data FROM paper_cache WHERE id = ?", (paper_id,)
    ).fetchone()
    con.close()
    return json.loads(row[0]) if row else None

def save_to_cache(paper_id: str, topic: str, data: dict):
    con = sqlite3.connect(DB_PATH)
    con.execute(
        "INSERT OR REPLACE INTO paper_cache VALUES (?,?,?,?)",
        (paper_id, topic, json.dumps(data), datetime.utcnow())
    )
    con.commit()
    con.close()

if __name__ == "__main__":
    init_db()
    print("Cache DB ready.")
