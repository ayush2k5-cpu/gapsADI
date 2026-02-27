"""
db.py — SQLite database layer for Scriptoria.
Uses Python stdlib sqlite3 only. No ORM dependencies.
"""

import json
import logging
import os
import sqlite3
from typing import Optional

logger = logging.getLogger(__name__)

DB_PATH: str = os.getenv("DATABASE_URL", "./scriptoria.db")


def init_db() -> None:
    """Create the projects table if it does not already exist.

    Called once at application startup (e.g. from main.py lifespan).
    Safe to call multiple times — CREATE TABLE IF NOT EXISTS is idempotent.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
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
            """
        )
        conn.commit()
        conn.close()
        logger.info("init_db: projects table ensured at %s", DB_PATH)
    except sqlite3.Error as e:
        logger.error("init_db failed: %s", e)
        raise RuntimeError(f"DB_ERROR: {e}") from e


def save_project(
    project_id: str,
    story_idea: str,
    genre: str,
    language: str,
    tone: int,
    screenplay: str,
    characters: list,
) -> None:
    """Insert a new project row into the projects table.

    Args:
        project_id: UUID v4 string identifying the project.
        story_idea: Raw story idea text supplied by the user.
        genre: Genre string (e.g. "Thriller").
        language: Target language string (e.g. "Hindi").
        tone: Integer 0–100 representing tone from Masala to arthouse.
        screenplay: Full formatted screenplay text.
        characters: List of character dicts; serialised as JSON string.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO projects
                (project_id, story_idea, genre, language, tone, screenplay, characters)
            VALUES
                (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                project_id,
                story_idea,
                genre,
                language,
                tone,
                screenplay,
                json.dumps(characters),
            ),
        )
        conn.commit()
        conn.close()
        logger.info("save_project: saved project %s", project_id)
    except sqlite3.Error as e:
        logger.error("save_project failed for %s: %s", project_id, e)
        raise RuntimeError(f"DB_ERROR: {e}") from e


def get_project(project_id: str) -> Optional[dict]:
    """Retrieve a full project row as a dict.

    Characters and analysis fields are deserialised from JSON strings.

    Args:
        project_id: UUID string of the project to fetch.

    Returns:
        A dict with all project fields, or None if not found.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM projects WHERE project_id = ?",
            (project_id,),
        )
        row = cursor.fetchone()
        conn.close()

        if row is None:
            logger.info("get_project: project %s not found", project_id)
            return None

        project = dict(row)

        # Deserialise JSON-encoded fields
        if project.get("characters"):
            project["characters"] = json.loads(project["characters"])
        if project.get("analysis"):
            project["analysis"] = json.loads(project["analysis"])

        logger.info("get_project: retrieved project %s", project_id)
        return project
    except sqlite3.Error as e:
        logger.error("get_project failed for %s: %s", project_id, e)
        raise RuntimeError(f"DB_ERROR: {e}") from e


def update_analysis(project_id: str, analysis: dict) -> None:
    """Persist AD Intelligence analysis results for a project.

    Args:
        project_id: UUID string of the project to update.
        analysis: Analysis dict matching the /api/analyze response schema.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE projects SET analysis = ? WHERE project_id = ?",
            (json.dumps(analysis), project_id),
        )
        conn.commit()
        conn.close()
        logger.info("update_analysis: updated analysis for project %s", project_id)
    except sqlite3.Error as e:
        logger.error("update_analysis failed for %s: %s", project_id, e)
        raise RuntimeError(f"DB_ERROR: {e}") from e


def get_screenplay(project_id: str) -> Optional[str]:
    """Fetch only the screenplay text for a project.

    Args:
        project_id: UUID string of the project.

    Returns:
        The screenplay string, or None if the project does not exist.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT screenplay FROM projects WHERE project_id = ?",
            (project_id,),
        )
        row = cursor.fetchone()
        conn.close()

        if row is None:
            logger.info("get_screenplay: project %s not found", project_id)
            return None

        logger.info("get_screenplay: retrieved screenplay for project %s", project_id)
        return row[0]
    except sqlite3.Error as e:
        logger.error("get_screenplay failed for %s: %s", project_id, e)
        raise RuntimeError(f"DB_ERROR: {e}") from e
