"""
load_scripts.py — Loads screenplay .txt files from backend/scripts/ into ChromaDB.

Run once at startup or manually. Idempotent: skips loading if the collection
already contains documents. Scene chunks are split on INT./EXT. headings.
"""

import logging
import os
from pathlib import Path

from rag.chroma_setup import get_collection

logger = logging.getLogger(__name__)

_SCRIPTS_DIR: str = os.path.join(os.path.dirname(__file__), "..", "scripts")


def _split_into_scenes(text: str) -> list[str]:
    """Split screenplay text into scene chunks on INT./EXT. headings.

    Args:
        text: Raw screenplay text content.

    Returns:
        List of scene chunk strings (each starting with a scene heading).
    """
    lines = text.splitlines()
    chunks: list[str] = []
    current_chunk: list[str] = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("INT.") or stripped.startswith("EXT."):
            if current_chunk:
                chunks.append("\n".join(current_chunk))
            current_chunk = [line]
        else:
            current_chunk.append(line)

    if current_chunk:
        chunks.append("\n".join(current_chunk))

    return chunks


def load_all_scripts() -> None:
    """Load all .txt screenplay files from the scripts/ directory into ChromaDB.

    Reads each .txt file, splits into scene chunks on INT./EXT. headings,
    and upserts chunks into the ChromaDB 'screenplays' collection.
    Skips loading entirely if the collection already contains documents
    (idempotent behaviour).

    Uses logging throughout — never print().
    """
    collection = get_collection()

    # Idempotency check: skip if collection already has documents
    existing_count = collection.count()
    if existing_count > 0:
        logging.info(
            "load_all_scripts: collection already has %d documents, skipping load",
            existing_count,
        )
        return

    scripts_path = Path(_SCRIPTS_DIR).resolve()
    if not scripts_path.exists():
        logging.warning(
            "load_all_scripts: scripts directory not found at '%s'", scripts_path
        )
        return

    txt_files = list(scripts_path.glob("*.txt"))
    if not txt_files:
        logging.warning(
            "load_all_scripts: no .txt files found in '%s'", scripts_path
        )
        return

    total_chunks = 0
    for txt_file in txt_files:
        filename = txt_file.name
        title = txt_file.stem
        logging.info("load_all_scripts: processing '%s'", filename)

        try:
            text = txt_file.read_text(encoding="utf-8")
        except OSError as e:
            logging.error("load_all_scripts: could not read '%s': %s", filename, e)
            continue

        chunks = _split_into_scenes(text)

        documents: list[str] = []
        metadatas: list[dict] = []
        ids: list[str] = []

        for i, chunk in enumerate(chunks):
            if len(chunk.strip()) < 50:
                logging.info(
                    "load_all_scripts: skipping short chunk %d in '%s' (len=%d)",
                    i, filename, len(chunk.strip()),
                )
                continue
            documents.append(chunk)
            metadatas.append({
                "title": title,
                "genre": "Unknown",
                "chunk_index": i,
            })
            ids.append(f"{filename}_{i}")

        if documents:
            collection.add(documents=documents, metadatas=metadatas, ids=ids)
            logging.info(
                "load_all_scripts: added %d chunks from '%s'",
                len(documents), filename,
            )
            total_chunks += len(documents)

    logging.info("load_all_scripts: finished — %d total chunks loaded", total_chunks)
