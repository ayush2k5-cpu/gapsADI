# gapsADI — Orientation Report
*Generated: 2026-09-27. Source graph built from commit `c408c0fb` — freshness not independently re-verified against current HEAD in this pass.*

---

## 1. Codebase Graph Analysis

**Scale:** 504 nodes, 773 edges, 50 communities (25 substantial, 25 thin/omitted). Graph was cluster-only (no full file-stats pass). Extraction was 100% EXTRACTED / 0% INFERRED for the bulk of edges (only 2 edges INFERRED, avg confidence 0.68) — i.e. high-confidence structural graph, not a speculative one.

**Top 5 communities by node count:**
1. **Scriptoria MCP Server** (42 nodes, cohesion 0.06) — an MCP server (`mcp_server.py`, FastMCP-based) exposing tools: `analyze_script()`, `generate_moodboard()`, `generate_screenplay()`, `get_collection()`, and more. Very low cohesion score suggests this is a broad, loosely-coupled collection rather than a tight module.
2. **AD Intelligence Frontend Pages** (36 nodes, cohesion 0.07) — frontend page-level code: `GENRES`, `LANGUAGES`, `CHAR_COLORS`, `ACT_COLORS`, `MultilingualPage()`, `OutputScreen()`, etc. Also low cohesion — likely a large "everything page-related" bucket rather than a clean module.
3. **AI Client Wrapper** (27 nodes, cohesion 0.09) — backend AI-provider glue: `_extract_characters_regex()`, `_extract_dialogue_lines()`, `generate_character_portrait()`, `generate_characters()`, `_get_groq_keys()`, `_get_sarvam_keys()`, `_groq_request()`. Indicates multiple AI providers wired in (Groq, Sarvam, and elsewhere Gemini is referenced).
4. **CBFC Rating UI** (31 nodes, cohesion 0.10) — frontend for a "CBFC rating" feature (Indian film certification simulation): `CBFCTab()`, `RATING_CONFIG`, `CATEGORY_LABELS`, `CONFIDENCE_COLOR`.
5. **WebGL Infinite Menu** (21 nodes, cohesion 0.06) — a 3D/WebGL UI component (`InfiniteGridMenu`, `ArcballControl`, `Camera`, `DiscGeometry`, raw shader/program helpers). Very low cohesion, and structurally almost decorative relative to the rest — looks like a landing-page visual flourish, not core product logic.

**God nodes (highest connectivity — the real backbone):**
1. `react` — 30 edges (expected; frontend is React-based)
2. `framer-motion` — 16 edges (animation-heavy frontend)
3. `compilerOptions` (TypeScript config) — 16 edges
4. `Geometry` — 15 edges (WebGL menu internals)
5. `InfiniteGridMenu` — 15 edges
6. `cn()` — 15 edges (shadcn/ui classname utility — confirms shadcn/ui is the component system)
7. `next` — 13 edges (Next.js framework)
8. `analyze_pipeline()` — 10 edges (backend — this is the one real "core product logic" god node)
9. `lucide-react` — 10 edges (icon library)
10. `generate_pipeline()` — 9 edges (backend — the other real core-logic god node)

**What the shape suggests about architecture:**
- This is a **Next.js + React frontend** (TypeScript, shadcn/ui, Tailwind, framer-motion, a custom WebGL hero/menu) talking to a **FastAPI Python backend** (`main.py`, 5 endpoints per the graph: `/api/generate` and 4 others) backed by **SQLite** (`db.py`, stdlib `sqlite3` only — no ORM) and a **ChromaDB RAG corpus** (seeded on startup per `App Startup & DB Init` community).
- Of the top 10 god nodes, 7 are frontend framework/library plumbing (react, framer-motion, tsconfig, cn(), next, lucide-react) and only 2 (`analyze_pipeline()`, `generate_pipeline()`) are backend business logic. That's a strong signal the **frontend surface area is large relative to backend logic density** — a lot of UI (3D hero, infinite menu, CBFC rating UI, landing page sections) sitting on top of a comparatively small number of real generation/analysis pipelines.
- There's also a separate **Scriptoria MCP server** (`mcp_server.py`) that exposes the same-shaped tools (`analyze_script`, `generate_screenplay`, `generate_moodboard`) as an MCP interface — meaning the core pipelines are meant to be callable both via the FastAPI HTTP API and via MCP. Worth confirming in Step 2/3 whether these are two parallel front doors to the same pipeline code, or duplicated logic.
- The community list includes a long tail of **corpus/genre communities** (Arthouse Corpus, Classic Indian Drama Corpus, Film-Noir Thriller Corpus, Masala Action Corpus, Korean Thriller Corpus, etc. — 13 distinct genre corpora) plus a "RAG Corpus Seeding Plan" — this looks like a RAG-based screenplay generator that conditions on genre-specific reference corpora.
- Overall shape: **a genre-aware screenplay-generation product** (working name "Scriptoria" per the README/MCP server naming, "GAPS-ADI" per assets/branding) with AI Detection Intelligence (AD Intelligence) analysis, CBFC rating simulation, moodboard generation, and multi-language translation/export (PDF/DOCX) as feature pillars, wrapped in a visually elaborate Next.js frontend.

**Anomalies:**
- **146 isolated symbol-level nodes** (≤1 connection) out of 504 total — e.g. `CharactersTabProps`, `OutputNavProps`, `ChromaGridProps`, `SetterFn`, `CardRotateProps` (+141 more). When file/concept/rationale nodes are included, 270 of 504 nodes (~54%) have ≤1 connection. This is a very high isolated-node ratio — could mean genuinely loosely-coupled prop-type definitions (normal for React), or could mean the graph extraction is missing edges (e.g. type-only imports). Flagging as uncertain rather than concluding either way.
- **Two branding/naming threads**: "GAPS-ADI" (per asset filenames — clapperboard composite, wordmark logo) and "Scriptoria" (per README, MCP server docstring, exporter module header). Not clear from the graph alone whether these are the same product with an internal-vs-external name, or a rename mid-project. Needs confirmation in Step 2/3.
- **One AMBIGUOUS edge**: `Clapperboard Icon (SVG)` ↔ `GAPS-ADI Clapperboard Composite (PNG)`, confidence 0.60 — low-stakes (just two visually related asset files), not a structural concern.
- **No import cycles detected.**
- **25 "thin" communities (<3 nodes) omitted** from the report entirely — mostly the 13 genre corpus communities plus a few config/asset ones. Not necessarily a problem, just under-reported detail.
- **"Empty Research Notes"** appears as a named community-hub node — literally flagged as empty, suggesting an abandoned or never-started documentation effort.

---

## 2. Tech Stack & Structure

**Primary language(s) and framework(s):**
- **Frontend**: Next.js 16.1.6 (App Router, `frontend/app/`), React 19.2.3, TypeScript, Tailwind CSS 4, shadcn/ui (`components.json` present), framer-motion, GSAP, `@react-three/fiber` + `three` + `gl-matrix` (WebGL/3D), `recharts`, `lucide-react` icons.
- **Backend**: Python FastAPI (`backend/main.py`), Uvicorn. LangChain + `langchain-community` + ChromaDB + `sentence-transformers` for RAG. `reportlab` (PDF export) + `python-docx` (DOCX export). `sarvamai` SDK (Sarvam AI provider). Plain `sqlite3` (stdlib, no ORM) for persistence.

**Key config files:**
- `frontend/package.json` / `package-lock.json` — lockfile present and consistent with manifest (no phantom entries checked, but lockfile exists).
- `frontend/tsconfig.json`, `frontend/eslint.config.mjs`, `frontend/postcss.config.mjs`, `frontend/components.json` (shadcn/ui config) — all present.
- `backend/requirements.txt` — present. **No lockfile equivalent** (no `requirements.lock` / `pip freeze` snapshot / `poetry.lock`) — versions are unpinned in `requirements.txt` (e.g. `fastapi`, `langchain` with no version specifiers), which is a reproducibility risk but not unusual for a solo/prototype project.
- `backend/.env.example` — present, defines `GEMINI_API_KEY`, `SARVAM_API_KEY`, `GROQ_API_KEY`, `HUGGINGFACE_API_KEY`, `DATABASE_URL=./scriptoria.db`. No `.env` committed (correctly gitignored).
- **No Docker / docker-compose file anywhere in the repo** — despite the multi-service (frontend + backend) nature, there's no containerized setup; README instructs running both processes manually in separate terminals.

**Folder structure:**
```
gapsADI/
├── README.md, SETUP_ME_LOCAL.md   ← two separate setup guides (see below)
├── research.md                     ← 51 bytes, effectively empty ("Empty Research Notes" graph node)
├── docs/team/PLAN_P_RAG.md         ← single planning doc, RAG fix & corpus seeding plan
├── tasks/{pending,in-progress,done,failed}/  ← all four are empty (no task tickets currently tracked)
├── backend/
│   ├── main.py                     ← FastAPI app, 5 endpoints (per graph: /api/generate + 4 more)
│   ├── ai_client.py                ← multi-provider AI wrapper (Gemini/Groq/Sarvam/HuggingFace)
│   ├── ad_intelligence.py, cbfc_rating.py, moodboard.py, exporter.py  ← feature-pipeline modules
│   ├── db.py                       ← SQLite layer, stdlib only
│   ├── mcp_server.py               ← FastMCP server, parallel interface to the same pipelines
│   ├── mock_data.py                ← suggests a mock/demo data path exists
│   ├── rag/                        ← chroma_setup.py, load_scripts.py, retriever.py
│   ├── scripts/                    ← 14 genre corpus .txt files + verify_setup.py
│   └── requirements.txt, .env.example
└── frontend/
    ├── app/                        ← page.tsx (landing), generate/, loading/, output/ — 3 route pages total
    ├── components/                 ← ADDashboard.tsx, CBFCTab.tsx, CharactersTab.tsx, MoodboardTab.tsx, MultilingualTab.tsx, OutputNav.tsx, ScreenplayViewer.tsx, plus landing/, reactbits/, ui/ subfolders
    └── package.json, tsconfig.json, etc.
```
- `tasks/` folders (pending/in-progress/done/failed) exist but **all are empty** — no ticket history tracked inside this project's own task system, consistent with it not having been touched via the Ojas ticket workflow.

**Entry points:**
- Backend: `python main.py` (per README) → FastAPI app on `http://localhost:8000`, startup handler calls `init_db()` + RAG corpus seeding (`App Startup & DB Init` community in the graph).
- Frontend: `npm run dev` → Next.js on `http://localhost:3000`, landing page at `frontend/app/page.tsx`, with `generate/`, `loading/`, `output/` as the core user flow (3-step: generate → loading → output).
- Also a third entry point: `mcp_server.py` — a FastMCP server exposing `generate_screenplay`, `analyze_script`, `generate_moodboard` as MCP tools, independent of the FastAPI HTTP API.

**Obvious missing pieces / gaps found:**
- **Dependencies are not installed**: no `frontend/node_modules/`, no `backend/venv/` on disk. This is a from-scratch setup, not a "was working, now broken" state.
- **No generated runtime artifacts either**: no `backend/scriptoria.db` (SQLite file), no `backend/chroma_db/` (vector store) — confirms the app has never been run in this checkout, or those files were cleaned/gitignored and never regenerated.
- **`research.md` at project root is effectively empty** (51 bytes) — matches the graph's "Empty Research Notes" node.
- **Two parallel setup docs**: `README.md` (says the project's name is "Scriptoria", generic open-source-style instructions) and `SETUP_ME_LOCAL.md` (10KB, Windows-specific — title suggests a more detailed/personal local setup guide). Not yet compared line-by-line for conflicts; flagging as something to reconcile in Step 4.
- **No `.env` present** (expected — gitignored), meaning **no API keys are currently configured** in this checkout. All 4 providers (Gemini, Sarvam, Groq, HuggingFace) would need keys before the backend could actually generate anything.
- **`mock_data.py` exists in `backend/`** — unclear yet whether this is a fallback path when API keys are missing, or leftover dev scaffolding. To be checked in Step 3.
- Recent git history (last commit `a00f36d`, just before that `c408c0f`) shows the most recent real commit was **"[fix]: moodboard images, character portraits, API key validation, missing deps"** — i.e. the project was mid-bugfix on exactly the kind of things (API key handling, missing deps) that matter for revival, then stopped.

---

## 3. Feature Inventory

**Fully implemented features** (real logic, not stubs, end-to-end wired frontend↔backend):
- **Screenplay generation** — [backend/main.py:123](backend/main.py) `generate_pipeline()` (`POST /api/generate`) → Groq (`llama-3.3-70b-versatile`) builds a 5-scene screenplay from a story idea, genre, language, and tone slider, with optional RAG context injection from [backend/rag/retriever.py](backend/rag/retriever.py). Wired end-to-end via [frontend/lib/api.ts:13](frontend/lib/api.ts) `generateScreenplay()`, called from [frontend/app/generate/page.tsx](frontend/app/generate/page.tsx).
- **Multi-provider AI client with real fallback logic** — [backend/ai_client.py](backend/ai_client.py) implements genuine key-pool rotation (`GROQ_API_KEY`, `GROQ_API_KEY_2..9`), placeholder-key detection (`_is_placeholder()`), 429/401 handling, and backoff retries. Not a stub — this is production-grade error handling for a solo project.
- **AD Intelligence analysis** — `analyze_pipeline()` ([backend/main.py:282](backend/main.py)) computes a weighted `health_score` from pacing/balance/tension via Groq JSON-mode, with a genuine `_build_safe_default()` fallback (never 500s). Rendered by [frontend/components/ADDashboard.tsx](frontend/components/ADDashboard.tsx) (animated ring chart tied to `health_score`, tension curve, character heatmap).
- **CBFC rating estimation** — `estimate_cbfc_rating()` in [backend/cbfc_rating.py](backend/cbfc_rating.py), rule-based keyword scoring across 6 categories (violence, sexual content, language, drugs, sensitive themes, horror), zero API cost. Wired to [frontend/components/CBFCTab.tsx](frontend/components/CBFCTab.tsx).
- **Translation** — `translate_pipeline()` with a real two-tier fallback chain: Sarvam `mayura:v1` SDK (dialogue-only, batch-translated with delimiter-joining, indentation-preserving reassembly) → Groq fallback → original-English last resort. This is one of the most carefully engineered pieces of the backend. Wired to [frontend/components/MultilingualTab.tsx](frontend/components/MultilingualTab.tsx).
- **Export (PDF/DOCX/TXT)** — `export_pipeline()` delegates to [backend/exporter.py](backend/exporter.py) (`reportlab` for PDF, `python-docx` for DOCX), returns a `StreamingResponse` with correct media types and filenames.
- **Moodboard generation** — `moodboard_pipeline()` builds a tone-aware Pollinations.ai prompt per act, fetches server-side, returns base64 data URLs (avoids CORS/hotlinking issues client-side). Wired to [frontend/components/MoodboardTab.tsx](frontend/components/MoodboardTab.tsx).
- **Character portrait generation** — same Pollinations.ai pattern, per-character, seeded by name hash for consistency, tone-aware style descriptor (Bollywood/cinematic/arthouse). Wired to [frontend/components/CharactersTab.tsx](frontend/components/CharactersTab.tsx) via `getCharacterPortraits()`.
- **SQLite persistence** — [backend/db.py](backend/db.py), stdlib `sqlite3` only, `save_project()` / `get_project()` / `update_analysis()` / `get_screenplay()`. Simple but appears complete for the app's needs.
- **Frontend↔backend API contract is fully consistent**: [frontend/lib/api.ts](frontend/lib/api.ts) implements exactly the 7 endpoints that exist in `main.py` (`generate`, `analyze`, `moodboard`, `translate`, `export`, `cbfc`, `character-portraits`) with matching request/response shapes in [frontend/lib/types.ts](frontend/lib/types.ts). This is a genuinely well-wired full stack, not a facade — a stronger state than the graph's low community-cohesion scores would suggest on their own.
- **Landing page** — [frontend/app/page.tsx](frontend/app/page.tsx) with dedicated sections (`HeroSection`, `AboutSection`, `BuiltOnSection`, `ScopeMCPSection`, `MarqueeDivider`) plus decorative WebGL components (`InfiniteMenu`, `Antigravity`, `ChromaGrid`, `TargetCursor`, `DecryptedText`, `Stack`) — this is a fully built, visually elaborate marketing/landing surface, separate from the app functionality.
- **Route structure** — `output/` is a tabbed shell ([frontend/app/output/page.tsx](frontend/app/output/page.tsx)) hosting `CBFCTab`, `CharactersTab`, `MoodboardTab`, `MultilingualTab`, `ScreenplayViewer`, with matching deep-link subroutes (`output/ad`, `output/characters`, `output/moodboard`, `output/multilingual`, `output/screenplay`) — a complete, coherent navigation structure.
- **Scriptoria MCP server** — [backend/mcp_server.py](backend/mcp_server.py), FastMCP-based, exposes `generate_screenplay`, `analyze_script`, `generate_moodboard` as MCP tools. This appears to be a genuine second interface to (most of) the same pipeline logic, not a duplicate implementation — worth confirming whether it imports from the same `ai_client`/pipeline modules or reimplements them (not fully verified line-by-line in this pass).

**Partially implemented / incomplete:**
- **RAG corpus** — 14 genre-specific `.txt` corpus files exist in [backend/scripts/](backend/scripts/) (Arthouse, Classic Indian Drama/Romance, Masala Action/Romance, Korean Thriller, etc.), and `backend/rag/{chroma_setup.py, load_scripts.py, retriever.py}` exist to seed/query them into ChromaDB. This is invoked at startup (`load_all_scripts()`) and consumed in `generate_pipeline()`, but **there's a dedicated planning doc, [docs/team/PLAN_P_RAG.md](docs/team/PLAN_P_RAG.md), titled "RAG Fix & Corpus Seeding Plan"** — the existence of a "fix" plan document suggests the RAG layer was known to be broken or incomplete as of the last work session. Contents of that plan not read in this pass; worth reading before touching RAG code.
- **`generate_pipeline()` silently swallows a DB save failure** ([backend/main.py:256](backend/main.py)) — "Still return the result — user can use it even if persistence failed" — meaning a project can be generated and shown to the user but never actually persisted, silently. This is a deliberate design choice (graceful degradation) but means analyze/moodboard/translate/export on that project_id will all subsequently fail with "Project not found" since none of them can find it in the DB. Worth flagging as a real edge case, not just theoretical.

**Scaffolded only / present but unused:**
- **`backend/mock_data.py`** — contains full mock responses for generate/analyze/moodboard/translate (including a complete sample screenplay and mock analysis scores). `main.py` does `import mock_data` at the top but **the module is never actually referenced anywhere else in `main.py` or elsewhere in the backend** (confirmed via grep — zero usages of `mock_data.`). This is dead code / an unused import, left over from earlier frontend-first development (the file's own header comment says "remove before production").

**Broken or inconsistent (found without running the app):**
- **`main.py`'s own docstring is stale**: it says *"All 5 endpoints: /api/generate, /api/analyze, /api/moodboard, /api/translate, /api/export"* but the file actually defines **7** endpoints — `/api/cbfc` and `/api/character-portraits` were added later without updating the module docstring. Minor, but indicates documentation drift.
- **Naming inconsistency**: the product is called "Scriptoria" in `README.md`, `main.py`'s FastAPI title (`"Scriptoria API"`), `mcp_server.py`, and export filenames (`Scriptoria_{id}.pdf`), but the project folder and repo are named "gapsADI" and asset files use "GAPS-ADI" branding (wordmark logo, clapperboard composite). Not a functional bug, but a genuine open question about which name is current/intended — flagged for Step 5/6, not resolved here.
- No broken imports or obviously missing files were found by static reading of the modules above — but this was not an exhaustive line-by-line audit of every file (e.g. `db.py`, `exporter.py`, `ad_intelligence.py`, `moodboard.py`, and most frontend `.tsx` files were not individually read in full). Flagging honestly rather than claiming full coverage.

---

## 4. Health Check

**Dependencies — installed and consistent?**
- **Not installed in this checkout.** No `frontend/node_modules/`, no `backend/venv/`. This is a clean/never-run checkout, not a "broken install."
- `frontend/package-lock.json` **exists** and is consistent with `package.json` at a glance (not diffed line-by-line).
- `backend/requirements.txt` has **no lockfile equivalent** — no pinned versions at all (e.g. `fastapi`, `langchain`, `chromadb`, `sentence-transformers` are all unpinned). This is a real reproducibility risk: `langchain`/`chromadb`/`sentence-transformers` are libraries that change API surface between versions relatively often, so `pip install -r requirements.txt` today could pull different (and possibly incompatible) versions than whatever was originally used. Worth pinning before rebuilding the venv.

**Obvious code errors (broken imports, missing referenced files, syntax issues)?**
- None found by static reading of `main.py`, `ai_client.py`, `mock_data.py`, and the frontend `lib/api.ts` — these files are internally consistent and their cross-references (e.g. `main.py` importing `db`, `ai_client`, `moodboard`, `ad_intelligence`, `cbfc_rating`, `exporter` — all of which exist as files) check out.
- Two documentation-vs-code drift issues, not code bugs: the stale "5 endpoints" docstring in `main.py` (actually 7), and the unused `mock_data` import (dead code, not broken code).
- This is **not an exhaustive check** — static reading only, the app was not run (per session constraints), so runtime-only errors (e.g. a typo only hit on a specific code path, a missing frontend prop type mismatch) would not surface this way.

**README vs. codebase match?**
- `README.md` (root) is accurate for the two-service local-dev flow it describes (backend `python main.py` → port 8000, frontend `npm run dev` → port 3000, `.env.example` → `.env` copy step) — this matches what's actually in the repo.
- **Two setup docs coexist and describe different scenarios**: `README.md` is a generic/open-source-style guide; `SETUP_ME_LOCAL.md` is a personal, Windows-specific, machine-specific guide written for a *different machine* (`C:\Users\LENOVO\OneDrive\Desktop\gaps ADI\gapsADI`, a `gapsADI_BACKUP` folder rename step) with its own GitHub clone instructions pointing at `github.com/ayush2k5-cpu/gapsADI.git`, default branch `dev`. **This checkout's actual git remote and branch match `SETUP_ME_LOCAL.md` exactly** (`origin` → `ayush2k5-cpu/gapsADI.git`, current branch `dev`) — confirming this is the same project, just now living at `C:\Ojas\projects\active\gapsADI` instead of the LENOVO path the doc was written for. The doc is stale on *location* but correct on *repo identity*.

**Tests?**
- **No test files found anywhere in the repository** (searched for any file with "test" in its name, excluding `node_modules`/`.git` — zero results, aside from `backend/scripts/verify_setup.py` which is a setup-verification script, not a test suite, and `sample_thriller.txt` which is RAG corpus data, not a test fixture). There is no pytest, no Jest/Vitest, no test runner configured in either `package.json` or `requirements.txt`. **Untested codebase**, full stop.

**Security red flags?**
- **No hardcoded secrets found** — scanned for common API key patterns (Google/Gemini-style `AIza...`, OpenAI-style `sk-...`, Groq-style `gsk_...`, generic `api_key="..."` literals) across all `.py`/`.ts`/`.tsx`/`.json` files: zero matches.
- **`.env` is correctly gitignored** and confirmed **not present in git history** (`git ls-files` shows no `.env` or `.env.local` tracked).
- `backend/.env.example` correctly uses placeholder values (`your_key_here`) for all 4 provider keys.
- CORS in `main.py` is scoped to `http://localhost:3000` only (not a wildcard `*`) — reasonable for local dev, though this would need revisiting before any real deployment.
- No other red flags spotted in the files read (no `eval()`, no raw SQL string interpolation in `db.py`'s usage as seen in `main.py`, no obvious injection surface) — but again, not an exhaustive audit of every backend file.

---

## 5. Orientation Summary

**What is gapsADI?**
gapsADI (internally called "Scriptoria" throughout its own code, README, and exports) is an AI-powered screenplay generator built for Indian cinema. You give it a short story idea, a genre, a language, and a tone slider (mass-commercial ↔ arthouse), and it writes a 5-scene screenplay using Groq's Llama 3.3 model, optionally grounded by a RAG corpus of 14 genre-specific reference screenplays (Bollywood masala, arthouse, noir, Korean thriller, etc.). From there it offers a suite of analysis and output tools on top of that screenplay: an "AD Intelligence" pacing/tension/balance health score, a rule-based CBFC (Indian film certification) rating estimator, AI-generated character portraits and mood-board images per act, dialogue translation into Indian languages via Sarvam AI, and export to PDF/DOCX/TXT. It's a Next.js + React frontend (with an elaborate 3D/WebGL landing page) talking to a Python/FastAPI backend with SQLite storage, plus a second, parallel MCP-server interface exposing the same core generation/analysis tools for use by AI agents/tools directly.

**What state is it in, honestly?**
**Partially Built** (leaning toward the more-finished end of that label). This is not an early scaffold — the core loop (generate → analyze → rate → translate → export → moodboard → portraits) is genuinely implemented end-to-end on both backend and frontend, with real error handling, fallback chains, and a frontend API layer that matches the backend contract exactly. But it has never been run in this checkout (no dependencies installed, no database or vector store generated), has zero tests, has an unpinned Python dependency list, and has at least one explicitly-flagged known problem area (the RAG corpus/seeding, per its own "RAG Fix & Corpus Seeding Plan" doc) that wasn't verified as resolved. It's closer to "feature-complete code that has sat untouched" than to "broken and needs rebuilding."

**The 3 most important things to address to make it functional again:**
1. **Get it running at all** — install `backend` deps (ideally after pinning `requirements.txt` versions) and `frontend` deps, create `.env` with real API keys (Gemini/Groq/Sarvam/HuggingFace — at minimum Groq, since it's the backbone for generation/analysis/character-extraction/translation-fallback), and do a first `python main.py` + `npm run dev` run to see what actually breaks in practice versus what this static read could not catch.
2. **Read and resolve `docs/team/PLAN_P_RAG.md`** — the RAG layer is the one component with a documented "fix" plan that was never confirmed complete; understand whether it's actually broken before relying on RAG-grounded generation.
3. **Resolve the naming question** (Scriptoria vs. gapsADI/GAPS-ADI) and clean up the two divergent setup docs (`README.md` vs. the LENOVO-machine-specific `SETUP_ME_LOCAL.md`) — small effort, but this kind of drift compounds every time the project sits untouched for months.

**Recommended entry point for revival:** **`/audit`**, before anything else. The codebase has no `AGENTS.md`/context docs, no tests, and two conflicting setup guides — `/audit` is built exactly for bootstrapping that missing context on an existing codebase so that whatever comes next (likely `/debug` once it's actually run and real errors surface, or `/architect` if the RAG-fix plan turns out to need a real design decision) has solid footing. Running it first also naturally produces the "does the README match reality" and "what needs fixing" documentation this report could only approximate through static reading.

**Uncertainties / things this report could not resolve:**
- Whether the app actually runs end-to-end today — not started per session constraints.
- Whether `mcp_server.py` shares implementation with `main.py`'s pipelines or duplicates it — not diffed line-by-line.
- Whether `docs/team/PLAN_P_RAG.md`'s RAG fix was completed, partially completed, or never started — not read in this pass.
- Full correctness of `db.py`, `exporter.py`, `ad_intelligence.py`, `moodboard.py`, `cbfc_rating.py`, and most `.tsx` component internals — read by name/reference from the graph and `main.py`'s imports, not fully read line-by-line.
