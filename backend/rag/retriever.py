"""
retriever.py — RAG context retrieval for Scriptoria screenplay generation.

Queries the ChromaDB 'screenplays' collection to surface relevant scene
patterns from the corpus, which are injected into the Gemini screenplay
generation prompt.
"""

import logging

from rag.chroma_setup import get_collection

logger = logging.getLogger(__name__)


def retrieve_context(story_idea: str, genre: str, n_results: int = 1) -> str:
    """Query ChromaDB for scene patterns relevant to the given story idea and genre.

    Combines story_idea and genre into a single query string and retrieves
    the top n_results scene chunks from the 'screenplays' collection.
    Returns them formatted as numbered scene pattern blocks for prompt injection.

    On any exception, logs the error and returns an empty string — never raises.

    Args:
        story_idea: The user's raw story idea text.
        genre: The selected genre (e.g. "Thriller", "Drama").
        n_results: Number of top matching chunks to retrieve (default: 3).

    Returns:
        A formatted string of scene patterns, or "" on failure.
    """
    try:
        collection = get_collection()
        query_text = f"{story_idea} {genre}"

        results = collection.query(
            query_texts=[query_text],
            n_results=n_results,
        )

        documents: list[list[str]] = results.get("documents", [[]])
        chunks: list[str] = documents[0] if documents else []

        if not chunks:
            logging.info(
                "retrieve_context: no results returned for query '%s'", query_text
            )
            return ""

        formatted_parts = [
            f"--- Scene Pattern {i + 1} ---\n{chunk}\n"
            for i, chunk in enumerate(chunks)
        ]
        context = "\n".join(formatted_parts)

        logging.info(
            "retrieve_context: retrieved %d chunks for query '%s'",
            len(chunks), query_text,
        )
        return context

    except Exception as e:  # noqa: BLE001 — intentional broad catch
        logging.error("retrieve_context: error during retrieval: %s", e)
        return ""
