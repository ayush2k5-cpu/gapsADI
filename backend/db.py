import sqlite3
import os
import logging

logger: logging.Logger = logging.getLogger(__name__)

DB_PATH: str = os.getenv("DATABASE_URL", "./scriptoria.db")


def init_db() -> None:
    """Initialises the SQLite database and creates required tables if absent."""
    conn: sqlite3.Connection = sqlite3.connect(DB_PATH)
    cursor: sqlite3.Cursor = conn.cursor()
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
    logger.debug("Database initialised at %s", DB_PATH)


def get_project(project_id: str) -> dict | None:
    """Fetches a project row as a dict, or None if not found.

    Args:
        project_id: The unique project identifier.

    Returns:
        A dict of column → value for the project row, or None.
    """
    try:
        conn: sqlite3.Connection = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor: sqlite3.Cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,))
        row: sqlite3.Row | None = cursor.fetchone()
        conn.close()
        return dict(row) if row is not None else None
    except Exception as exc:
        logger.error("get_project failed for id=%s: %s", project_id, exc)
        return None


def get_screenplay(project_id: str) -> str | None:
    """Fetches just the screenplay text for a project, or None if not found.

    Args:
        project_id: The unique project identifier.

    Returns:
        The screenplay text string, or None if the project doesn't exist or
        the screenplay column is empty.
    """
    try:
        conn: sqlite3.Connection = sqlite3.connect(DB_PATH)
        cursor: sqlite3.Cursor = conn.cursor()
        cursor.execute(
            "SELECT screenplay FROM projects WHERE project_id = ?", (project_id,)
        )
        row: tuple | None = cursor.fetchone()
        conn.close()
        if row is None:
            return None
        return row[0]  # may itself be None if screenplay not yet generated
    except Exception as exc:
        logger.error("get_screenplay failed for id=%s: %s", project_id, exc)
        return None
