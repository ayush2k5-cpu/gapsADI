# SCRIPTORIA — P's Task Playbook
**Branch:** `feature/backend`
**Reports to:** A (for blockers only — go through S first)

---

## Before Every Task — Non-Negotiable

Open a new Claude or antigravity conversation.
Paste the full contents of `CLAUDE.md` as your first message.
Say: "I have loaded the project context. I am ready for my task."
Then paste the task prompt below.

**Do not start any task without doing this. Agents without context produce wrong code.**

---

## Task Overview

| # | Task | Time | Depends On |
|---|------|------|-----------|
| P-1 | `mock_data.py` — hardcoded mock responses | 15 min | API_CONTRACTS.md (already exists) |
| P-2 | SQLite `db.py` — project persistence | 20 min | P-1 done |
| P-3 | ChromaDB RAG — setup + load + retrieve | 35 min | P-2 done |
| P-4 | Inject RAG into `/api/generate` | 20 min | P-3 done, A's skeleton committed |
| P-5 | `/api/translate` — Sarvam AI | 25 min | P-4 done |
| P-6 | `/api/analyze` — AD Intelligence | 30 min | P-4 done, A's `ad_intelligence.py` committed |

**Total: ~2 hrs 25 min.** Start immediately after setup. Do not wait for A to finish UI.

---

## TASK P-1 — mock_data.py

**Time budget:** 15 minutes
**File to create:** `backend/mock_data.py`
**Why this first:** A starts building the frontend UI immediately using these shapes. The sooner you commit this, the sooner A isn't blocked.

### Agent Prompt:
```
[Paste CLAUDE.md first]

Now create a file called mock_data.py in the backend/ directory.

It must contain 4 Python dicts with realistic hardcoded data that matches
the API_CONTRACTS.md response schemas EXACTLY. Use this story as the basis
for all mock content:
  Story: "A corrupt police officer in 1990s Hyderabad discovers his daughter
          is the anonymous leader of a resistance movement against him."
  Genre: Thriller | Language: English | Tone: 65 | Scene count: 20

Variables to create:
1. MOCK_GENERATE — matches POST /api/generate response schema
   - project_id: "550e8400-e29b-41d4-a716-446655440000"
   - screenplay: a realistic 20-scene thriller screenplay excerpt (minimum 800 words)
   - scene_count: 20
   - characters: 4 characters (VIKRAM the officer, PRIYA his daughter, RAJAN antagonist, MEERA supporting)

2. MOCK_ANALYZE — matches POST /api/analyze response schema
   - health_score: 74, pacing_score: 68, balance_score: 81, tension_score: 72
   - tension_curve: 20 entries, realistic arc (rises to peak at scene 9, dips scenes 14-18, recovers)
   - character_heatmap: for all 4 characters above, with act1/act2/act3 scores
   - pacing_blocks: 20 entries, mix of fast/medium/slow (5 consecutive slow at scenes 14-18)
   - flags: one flag for the pacing dip (scene_range: "14-18")

3. MOCK_MOODBOARD — matches POST /api/moodboard response schema
   - image_url: "https://image.pollinations.ai/prompt/cinematic+dark+thriller+Hyderabad+1990s?width=1024&height=576&nologo=true"
   - caption: "ACT I — ESTABLISH / GOLDEN HOUR"

4. MOCK_TRANSLATE — matches POST /api/translate response schema
   - translated_screenplay: same as MOCK_GENERATE screenplay but with dialogue lines in Hindi
   - language: "Hindi"
   - note: "Culturally Generated — Not Translated"

All field names, types, and nesting must match API_CONTRACTS.md exactly.
Add a comment at the top: # Mock data for frontend development — remove before production
```

### Acceptance Criteria:
- [ ] File exists at `backend/mock_data.py`
- [ ] `MOCK_GENERATE` has `project_id`, `screenplay` (800+ words), `scene_count: 20`, `characters` (4 items)
- [ ] `MOCK_ANALYZE` has `tension_curve` with exactly 20 entries, `character_heatmap` with all 4 character names
- [ ] `MOCK_TRANSLATE` note field is exactly: `"Culturally Generated — Not Translated"`
- [ ] No Python syntax errors (run `python -c "import mock_data"` to verify)

**Commit after this task:** `git commit -m "[P]: add mock_data.py for frontend development"`

---

## TASK P-2 — SQLite db.py

**Time budget:** 20 minutes
**File to create:** `backend/db.py`
**Depends on:** P-1 done and committed

### Agent Prompt:
```
[Paste CLAUDE.md first]

Create backend/db.py — a SQLite database wrapper for the Scriptoria project.

Requirements:
1. Use Python's built-in sqlite3 module only (no SQLAlchemy, no external ORM)
2. Database file path comes from environment variable: os.getenv("DATABASE_URL", "./scriptoria.db")
3. Create this table on initialization (if not exists):

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
   );

4. Implement these functions with full type hints:
   - init_db() -> None                          — creates the table, called on app startup
   - save_project(project_id: str, story_idea: str, genre: str, language: str,
                  tone: int, screenplay: str, characters: list) -> None
   - get_project(project_id: str) -> dict | None — returns full row as dict, or None if not found
   - update_analysis(project_id: str, analysis: dict) -> None — stores analysis JSON
   - get_screenplay(project_id: str) -> str | None — returns screenplay text only

5. Use json.dumps() to store list/dict fields, json.loads() to retrieve them
6. Use logging.info() for all operations, never print()
7. Handle sqlite3.Error exceptions — log them and re-raise as a RuntimeError with message "DB_ERROR: {detail}"

In backend/main.py, call init_db() on app startup using FastAPI's @app.on_event("startup").
```

### Acceptance Criteria:
- [ ] `backend/db.py` exists with all 5 functions
- [ ] `init_db()` creates the table without error when called
- [ ] `save_project()` + `get_project()` round-trip works: save a project, retrieve it, all fields intact
- [ ] `characters` field stores/retrieves as Python list (json serialized in DB)
- [ ] No unhandled exceptions — all sqlite3 errors caught and re-raised as RuntimeError

**Commit:** `git commit -m "[P]: add SQLite db.py with project persistence"`

---

## TASK P-3 — ChromaDB RAG Setup

**Time budget:** 35 minutes
**Files to create:** `backend/rag/chroma_setup.py`, `backend/rag/load_scripts.py`, `backend/rag/retriever.py`
**Depends on:** P-2 done

### Agent Prompt:
```
[Paste CLAUDE.md first]

Create a RAG (Retrieval Augmented Generation) module for Scriptoria in backend/rag/.

File 1: backend/rag/chroma_setup.py
- Import chromadb and initialize a persistent client: chromadb.PersistentClient(path="./chroma_db")
- Create or get a collection named "screenplays"
- Use the embedding function: chromadb.utils.embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
- Export: get_collection() -> chromadb.Collection

File 2: backend/rag/load_scripts.py
- Reads all .txt files from backend/scripts/ folder
- Each file is one screenplay
- Chunks each screenplay by scene: split on lines starting with "INT." or "EXT."
- Each chunk = one scene (scene heading + action + dialogue until next heading)
- Minimum chunk length: 50 characters (skip very short chunks)
- For each chunk, add to ChromaDB collection with:
    document: the chunk text
    metadata: {"title": filename_without_extension, "genre": "Unknown", "chunk_index": i}
    id: f"{filename}_{i}"
- Skip adding if the collection already has documents (idempotent — safe to run twice)
- Log: "Loaded {n} scripts, {total_chunks} chunks into ChromaDB"

File 3: backend/rag/retriever.py
- Function: retrieve_context(story_idea: str, genre: str, n_results: int = 3) -> str
- Queries the ChromaDB collection with: f"{story_idea} {genre}"
- Returns the top n_results chunks joined as a formatted string:
    "--- Scene Pattern {i+1} ---\n{chunk}\n"
- If ChromaDB query fails for any reason: log the error, return "" (empty string)
  Never raise — the caller must be able to use the result even if RAG fails

All files: type hints on all functions, logging not print(), no hardcoded paths.
```

### Acceptance Criteria:
- [ ] `get_collection()` returns a ChromaDB collection without error
- [ ] `python scripts/load_scripts.py` runs and prints chunk count
- [ ] `retrieve_context("police corruption family betrayal", "Thriller")` returns a non-empty string
- [ ] `retrieve_context()` returns `""` (not raises) if ChromaDB is unavailable

**Commit:** `git commit -m "[P]: add ChromaDB RAG module"`

---

## TASK P-4 — Inject RAG into /api/generate

**Time budget:** 20 minutes
**File to modify:** `backend/main.py` (A's skeleton)
**Depends on:** P-3 done, A has committed `/api/generate` skeleton

### Agent Prompt:
```
[Paste CLAUDE.md first]

Modify the existing POST /api/generate endpoint in backend/main.py to integrate RAG.

Current state: A has written the endpoint skeleton. It calls Gemini 2.0 Flash and returns
a hardcoded or basic response. Your job is to:

1. Before the Gemini call, call:
   from rag.retriever import retrieve_context
   rag_context = retrieve_context(request.story_idea, request.genre)

2. Build the Gemini screenplay prompt. Include this structure:
   - System instruction: "You are a professional screenplay writer. Write in standard
     industry screenplay format."
   - If rag_context is not empty, add:
     "Reference these real screenplay scene patterns for structural guidance. Do not copy
     them directly — use them as inspiration for structure and pacing:\n{rag_context}"
   - Then the main instruction: generate a Thriller screenplay with N scenes, following
     the screenplay text format in API_CONTRACTS.md

3. For character generation, use the Ollama/Groq client from ai_client.py (not Gemini).
   Pass the generated screenplay to it and ask for character profiles in JSON format
   matching API_CONTRACTS.md character schema.

4. Generate project_id = str(uuid.uuid4())
5. Call db.save_project() to persist everything
6. Return the combined response matching API_CONTRACTS.md exactly

Do NOT change the endpoint's URL, request schema, or response schema.
API_CONTRACTS.md is law — the response shape must match it exactly.
Handle all exceptions — never let a 500 reach the frontend.
```

### Acceptance Criteria:
- [ ] `POST /api/generate` returns valid JSON matching API_CONTRACTS.md
- [ ] Response `project_id` is a valid UUID string
- [ ] `characters` array has 2–8 items, each with name/role/bio/arc fields
- [ ] `scene_count` matches the actual number of INT./EXT. scenes in the screenplay
- [ ] Project is saved to SQLite: `db.get_project(project_id)` returns the row
- [ ] Two different story inputs return noticeably different screenplays

**Commit:** `git commit -m "[P]: integrate RAG into /api/generate, wire SQLite"`

---

## TASK P-5 — /api/translate (Sarvam AI)

**Time budget:** 25 minutes
**File to modify:** `backend/main.py`
**Depends on:** P-4 done

### Agent Prompt:
```
[Paste CLAUDE.md first]

Implement the POST /api/translate endpoint in backend/main.py.

Endpoint receives: { "project_id": string, "target_language": string }

Step 1: Fetch the screenplay from SQLite using db.get_screenplay(project_id)
Step 2: If project not found, return: {"error": true, "code": "VALIDATION_ERROR", "message": "Project not found"}

Step 3: Call Sarvam AI to regenerate dialogue in the target language.
Use the Sarvam AI Python client or REST API (whichever is in requirements.txt).

The Sarvam prompt must instruct it to:
- Keep ALL scene headings (lines starting with INT. or EXT.) unchanged in English
- Keep ALL action/description lines unchanged in English
- Keep ALL character name lines (centered ALL CAPS names above dialogue) unchanged
- Regenerate ONLY the dialogue lines — lines that appear indented below character names
- Do not translate word-for-word: write dialogue as a native {target_language} speaker
  would naturally say it, preserving emotional intent and character voice
- Return the complete screenplay with these replacements applied

Step 4: Return response matching API_CONTRACTS.md:
{
  "translated_screenplay": "...",
  "language": target_language,
  "note": "Culturally Generated — Not Translated"
}

Step 5: If Sarvam API fails for any reason:
- Log the error
- Fetch original English screenplay from DB
- Return it with fallback: true and error_message field (see API_CONTRACTS.md)
- Never raise a 500
```

### Acceptance Criteria:
- [ ] `POST /api/translate` with `target_language: "Hindi"` returns screenplay where dialogue lines are in Hindi
- [ ] Scene headings (INT./EXT.) are unchanged in English
- [ ] Action lines are unchanged in English
- [ ] `note` field is exactly: `"Culturally Generated — Not Translated"`
- [ ] If Sarvam is unavailable: returns original screenplay with `"fallback": true` (no crash)

**Commit:** `git commit -m "[P]: implement Sarvam translate endpoint"`

---

## TASK P-6 — /api/analyze (AD Intelligence)

**Time budget:** 30 minutes
**File to modify:** `backend/main.py` (using A's `backend/ad_intelligence.py` prompt template)
**Depends on:** P-4 done AND A has committed `backend/ad_intelligence.py`

### Agent Prompt:
```
[Paste CLAUDE.md first]

Implement the POST /api/analyze endpoint in backend/main.py.

A has already written the Gemini prompt template in backend/ad_intelligence.py.
It contains a function: build_analysis_prompt(screenplay: str, characters: list) -> str
That function returns the full prompt string to send to Gemini.

Your job:
1. Endpoint receives: { "project_id": string }
2. Fetch screenplay from DB: db.get_screenplay(project_id)
3. Fetch characters from DB: db.get_project(project_id)["characters"]
4. Build prompt: prompt = build_analysis_prompt(screenplay, characters)
5. Call Gemini 2.0 Flash via ai_client.py, ask for JSON output
   Use response_mime_type="application/json" in the generation config if supported
6. Parse the JSON response
7. Compute health_score on the backend (do NOT ask Gemini to compute it):
   health_score = round((pacing_score * 0.35) + (balance_score * 0.35) + (tension_score * 0.30))
8. Update SQLite: db.update_analysis(project_id, analysis_dict)
9. Return full analysis matching API_CONTRACTS.md

Error handling (critical):
- If Gemini returns malformed JSON: retry the call ONCE
- If retry also fails: return the SAFE DEFAULT object (all scores 50, tension_curve with 50 per scene,
  empty flags, character_heatmap with all characters at 50/50/50)
- NEVER return a 500 error for analysis failure — always return something valid

Validate before returning:
- health_score must be 0-100 (clamp if needed)
- tension_curve must have exactly one entry per scene (get scene_count from DB)
- character_heatmap must contain ALL characters from the project (no extras, no missing)
```

### Acceptance Criteria:
- [ ] `POST /api/analyze` returns valid JSON matching API_CONTRACTS.md schema
- [ ] `health_score = round(pacing * 0.35 + balance * 0.35 + tension * 0.30)` — verified manually
- [ ] `tension_curve` has exactly `scene_count` entries
- [ ] `character_heatmap` contains all character names from the project
- [ ] On Gemini failure: returns safe default (all 50s), NOT a 500 error
- [ ] Analysis stored in SQLite: `db.get_project(project_id)["analysis"]` is populated

**Commit:** `git commit -m "[P]: implement AD Intelligence analyze endpoint"`

---

## After All Tasks Done

1. Run G's end-to-end test on your machine: call all endpoints in sequence
2. Tell S: "Backend complete" — S marks tracker
3. If you have remaining time before Hour 4 merge: help G debug export if needed
4. Do NOT push to `dev` or `main` — A handles all merges

---

*TASKS_P.md v1.0 | Your branch: feature/backend | Questions → S first, then A*
