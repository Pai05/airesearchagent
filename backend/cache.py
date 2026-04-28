import sqlite3, json, hashlib, os
from datetime import datetime

# Use absolute path to ensure cache works regardless of working directory
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(PROJECT_ROOT, "cache.db")

def init_db():
    """Initialize the database and create the paper_cache table if it doesn't exist."""
    try:
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
    except Exception as e:
        print(f"Error initializing database at {DB_PATH}: {e}")
        raise

def get_cached(paper_id: str):
    """Retrieve cached paper data by ID."""
    con = sqlite3.connect(DB_PATH)
    try:
        row = con.execute(
            "SELECT data FROM paper_cache WHERE id = ?", (paper_id,)
        ).fetchone()
        return json.loads(row[0]) if row else None
    finally:
        con.close()

def save_to_cache(paper_id: str, topic: str, data: dict):
    """Save paper data to cache."""
    con = sqlite3.connect(DB_PATH)
    try:
        con.execute(
            "INSERT OR REPLACE INTO paper_cache VALUES (?,?,?,?)",
            (paper_id, topic, json.dumps(data), datetime.utcnow())
        )
        con.commit()
    finally:
        con.close()

# Automatically initialize database when imported
init_db()
