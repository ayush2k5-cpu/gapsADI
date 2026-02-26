import sqlite3
import os

DB_PATH = os.getenv("DATABASE_URL", "./scriptoria.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS projects (
        project_id   TEXT PRIMARY KEY,
        story_idea   TEXT NOT NULL,
        genre        TEXT NOT NULL,
        language     TEXT NOT NULL,
        tone         INTEGER NOT NULL,
        screenplay   TEXT,
        characters   TEXT,
        analysis     TEXT,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()
    conn.close()
