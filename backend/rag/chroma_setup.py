"""
chroma_setup.py — ChromaDB initialisation for Scriptoria RAG pipeline.

Creates a persistent local ChromaDB collection using SentenceTransformer
embeddings. Call get_collection() from load_scripts.py and retriever.py.
"""

import logging

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

logger = logging.getLogger(__name__)

_CHROMA_PATH: str = "./chroma_db"
_COLLECTION_NAME: str = "screenplays"
_EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

def get_collection() -> chromadb.Collection:
    """Return the persistent ChromaDB 'screenplays' collection.

    Initialises the PersistentClient and retrieves (or creates) the
    'screenplays' collection with SentenceTransformer embeddings.
    The embedding function is instantiated lazily on first call to avoid
    triggering model downloads at import time.

    Returns:
        chromadb.Collection: The 'screenplays' collection instance.
    """
    embedding_fn = SentenceTransformerEmbeddingFunction(model_name=_EMBEDDING_MODEL)
    client = chromadb.PersistentClient(path=_CHROMA_PATH)
    collection = client.get_or_create_collection(
        name=_COLLECTION_NAME,
        embedding_function=embedding_fn,
    )
    logging.info(
        "get_collection: connected to collection '%s' at '%s'",
        _COLLECTION_NAME,
        _CHROMA_PATH,
    )
    return collection
