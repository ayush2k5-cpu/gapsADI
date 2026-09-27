# gapsADI (Scriptoria)

## Stack

- **Language / Runtime**: TypeScript (frontend), Python 3.11+ (backend)
- **Framework**: Next.js 16 (App Router) + React 19 on the frontend; FastAPI + Uvicorn on the backend
- **Key dependencies**: Groq (LLM inference, primary), Sarvam AI (Indian language translation), ChromaDB + LangChain (RAG), shadcn/ui + Tailwind CSS 4 + framer-motion (UI)
- **Package manager**: npm (frontend), pip (backend, no lockfile yet)

## Build approach

<TBD, set by /scope>

## Commands

```bash
# Install
cd frontend && npm install
cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt

# Dev server
cd backend && python main.py        # http://localhost:8000
cd frontend && npm run dev          # http://localhost:3000

# Build
cd frontend && npm run build

# Test
# No test suite exists yet in either frontend or backend.
```

## Specs

No `docs/specs/` yet. One planning doc exists at `docs/team/PLAN_P_RAG.md` (RAG fix and corpus seeding plan) — read it before touching the RAG layer.

## Rules

- Two separate services, two separate dependency trees: `frontend/` (npm) and `backend/` (pip). Run both to use the app.
- All AI provider calls go through `backend/ai_client.py`. Never call Groq/Sarvam APIs directly from a route handler in `main.py`.
- Groq is the workhorse (generation, analysis, character extraction, translation fallback); Sarvam is used only for primary translation; Gemini and HuggingFace keys are defined in `.env.example` but not clearly wired into the current provider split (verify before relying on them).
- API keys support rotation pools: `GROQ_API_KEY`, `GROQ_API_KEY_2`..`_9` (same pattern for `SARVAM_API_KEY`). Placeholder values (`your_key_here`, etc.) are auto-detected and ignored — `ai_client.py`'s `_is_placeholder()`.
- Backend route handlers should never return a raw 500 to the frontend; catch and return structured `{"error": true, "code": ..., "message": ...}` JSON (see every endpoint in `backend/main.py` for the pattern).
- `backend/requirements.txt` has no pinned versions — pin before rebuilding the venv if reproducibility matters.
- `backend/mock_data.py` is unused dead code (imported in `main.py` but never called) — safe to ignore or remove, not a real code path.
- No CI configured (`.github/workflows/` does not exist) and no tests exist anywhere in the repo.

## Agent skills

None project wide (frontend/backend are separate stacks). Installed skills are area specific — see [backend/AGENTS.md](backend/AGENTS.md) and [frontend/AGENTS.md](frontend/AGENTS.md).

MCP servers: `chroma-core/chroma-mcp` (connected)

## Context files

- [backend/AGENTS.md](backend/AGENTS.md): FastAPI backend — AI provider wiring, RAG, SQLite, export pipelines
- [frontend/AGENTS.md](frontend/AGENTS.md): Next.js frontend — routes, API client, component conventions

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
