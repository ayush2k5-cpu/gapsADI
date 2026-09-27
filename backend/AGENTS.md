# backend

## Overview

FastAPI service that runs the screenplay generation and analysis pipelines. Exposes 7 HTTP endpoints (`main.py`) plus a parallel MCP server (`mcp_server.py`) offering the same core tools to AI agents. Backed by SQLite for persistence and ChromaDB for RAG.

## Key files

| File | Owns |
|---|---|
| `main.py` | FastAPI app, all 7 endpoints (`/api/generate`, `/api/analyze`, `/api/moodboard`, `/api/translate`, `/api/export`, `/api/cbfc`, `/api/character-portraits`), startup DB/RAG init |
| `ai_client.py` | All AI provider calls — Groq (generation/analysis/characters/translation fallback), Sarvam (translation), key-pool rotation, placeholder-key detection |
| `db.py` | SQLite layer, stdlib `sqlite3` only, no ORM |
| `ad_intelligence.py` | Builds the analysis prompt consumed by `/api/analyze` |
| `cbfc_rating.py` | Rule-based CBFC rating estimator, zero API calls |
| `moodboard.py` | Pollinations.ai URL builder for moodboard images |
| `exporter.py` | PDF (`reportlab`) / DOCX (`python-docx`) / TXT export |
| `mcp_server.py` | FastMCP server exposing `generate_screenplay`, `analyze_script`, `generate_moodboard` |
| `mock_data.py` | Dead code — imported in `main.py`, never called. Leftover from frontend-first dev. |
| `rag/chroma_setup.py`, `rag/load_scripts.py`, `rag/retriever.py` | ChromaDB RAG corpus loading and retrieval |
| `scripts/*.txt` | 14 genre-specific reference screenplay corpora (Bollywood masala, arthouse, noir, Korean thriller, etc.) seeded into ChromaDB at startup |

## Commands

```bash
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python main.py                 # http://localhost:8000 (or: uvicorn main:app --reload --port 8000)
```

## Conventions

- Every route handler catches its own exceptions and returns structured error JSON — never a raw 500. Follow the existing pattern (see `generate_pipeline` in `main.py`) for any new endpoint.
- All external AI calls go through `ai_client.py`, never directly from `main.py`.
- Provider fallback chains are deliberate, not accidental: translation tries Sarvam → Groq → original-English-as-fallback; analysis falls back to a computed safe-default (`_build_safe_default`) rather than failing.
- API keys are pooled: `GROQ_API_KEY`, `GROQ_API_KEY_2`..`_9`, same for `SARVAM_API_KEY`. Placeholder values are silently dropped by `_is_placeholder()`.
- `.env` (from `.env.example`) needs `GEMINI_API_KEY`, `SARVAM_API_KEY`, `GROQ_API_KEY`, `HUGGINGFACE_API_KEY`, `DATABASE_URL`. In practice only Groq and Sarvam keys are exercised by the current code paths — Gemini/HuggingFace wiring was not confirmed as live during the last audit.
- Moodboard and character-portrait images are fetched server-side from Pollinations.ai and returned as base64 data URLs, never proxied as raw image URLs to the frontend — avoids CORS/hotlinking issues.

## Agent skills

- [cli-anything-chromadb](.claude/skills/cli-anything-chromadb/): `hkuds/cli-anything`, stateless CLI for ChromaDB collection/document management and semantic search over the RAG HTTP API — useful when debugging `rag/chroma_setup.py`, `rag/load_scripts.py`, `rag/retriever.py`

MCP servers: `chroma-core/chroma-mcp` (connected)

## Gotchas

- ~~`python main.py` does not start a server.~~ **Resolved 2026-09-27** (`/debug`): added the missing `if __name__ == "__main__": uvicorn.run(...)` block. Verified: `python main.py` now starts Uvicorn on port 8000.
- **The hardcoded Groq model can go stale.** `_GROQ_MODEL` in `ai_client.py` was `llama-3.3-70b-versatile`, which Groq deprecated (confirmed via a live 404 `model_not_found` on 2026-09-27) — currently set to `qwen/qwen3.8-27b` (verified: plain chat behavior, no reasoning overhead eating the token budget, supports `response_format: json_object`). If generation/analysis/character-extraction start failing with a Groq 404, check `https://api.groq.com/openai/v1/models` against this key — Groq's free-tier lineup shifts. Avoid `openai/gpt-oss-*` models as a replacement without raising `max_tokens` first: they're reasoning models that burn the token budget on a hidden `reasoning` field before emitting real content.
- **RAG confirmed working end-to-end** (verified 2026-09-27): startup loads all 14 corpus files into ChromaDB (201 chunks), `retrieve_context()` returns real chunks during generation. The `PLAN_P_RAG.md` fix appears resolved — don't assume it's still broken.
- If `db.save_project()` fails inside `generate_pipeline()`, the failure is caught and swallowed — the generated screenplay is still returned to the user, but silently never persisted. Every subsequent call on that `project_id` (analyze, moodboard, translate, export, cbfc, character-portraits) will then fail with "Project not found." Not a bug per se (deliberate graceful degradation), but worth knowing before debugging a mysterious "project not found."
- ~~`/api/character-portraits` blocks the event loop.~~ **Resolved 2026-09-27** (`/debug`): both `character_portraits_pipeline` and its sibling `moodboard_pipeline` (same root cause: synchronous `requests.get()` for Pollinations inside `async def`) now run the blocking fetch via `asyncio.to_thread()`. Verified: a concurrent `/api/cbfc` request returned in 0.23s while a portrait fetch was in flight (previously stalled ~15-45s).
- `requirements.txt` has no pinned versions. `langchain`, `chromadb`, and `sentence-transformers` in particular can shift API surface between versions — pin before assuming a fresh install reproduces a working environment.
- `main.py`'s own module docstring says "5 endpoints" — it's actually 7 (`cbfc` and `character-portraits` were added later without updating the comment).

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
