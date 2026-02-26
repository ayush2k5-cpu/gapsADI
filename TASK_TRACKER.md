# SCRIPTORIA — Task Tracker
**Owner:** S | **Updated by:** S every 20 min | **Format:** Trello-style
**Status icons:** 🟢 Done | 🟡 In Progress | 🔴 Blocked | ⬜ Not Started | ⚠️ Partial

> **S: Update the checkbox next to each task as you check in with the team.**
> **If a task flips to 🔴 Blocked → interrupt A immediately. Do not wait.**

---

## CURRENT BUILD STATUS (Snapshot — update as you go)

| Person | Branch | Last known status |
|--------|--------|-------------------|
| A | `feature/ui` | Backend skeleton done. Full UI done. Polish phase pending. |
| P | `feature/backend` | mock_data partial, db partial. RAG + real endpoints not started. |
| G | `feature/modules` | Nothing started. All 3 tasks pending. |
| S | — | Reading this file. Begin tracker now. |

---

## HOUR CHECKPOINTS (S monitors these)

| Checkpoint | Target | Status |
|------------|--------|--------|
| Hour 1:00 | A hands off backend. `/api/generate` returns valid JSON. | ⬜ |
| Hour 2:00 | RAG integrated (P). Moodboard done (G). | ⬜ |
| Hour 3:30 | AD Intelligence endpoint working. Export done. | ⬜ |
| Hour 4:00 | A merges all branches → `dev`. Full pipeline test. | ⬜ |
| Hour 5:30 | **CODE FREEZE.** Bugfixes only. | ⬜ |
| Hour 6:00 | **DEMO.** | ⬜ |

---

## COLUMN 1 — ✅ DONE (Confirmed working)

These exist in the repo and have been verified. Do not re-assign.

### A — Backend Skeleton
- 🟢 `backend/main.py` — FastAPI app with all 5 endpoint stubs (returning mock data)
- 🟢 `backend/ai_client.py` — Gemini 2.0 Flash wrapper with 429 handling
- 🟢 `backend/ad_intelligence.py` — AD Intelligence prompt template (`build_analysis_prompt`)
- 🟢 `backend/requirements.txt` — All packages listed

### A — Frontend
- 🟢 Design system tokens — All color pairs, fonts in `frontend/app/globals.css` (`@theme inline`)
- 🟢 Screen 1 `app/page.tsx` — Landing page: story input, genre pills, language dropdown, tone slider, ROLL CAMERA button
- 🟢 Screen 2 `app/loading/page.tsx` — Film reel animation, step dots, status text cycling, full pipeline call sequence
- 🟢 Screen 3 `app/output/page.tsx` — Full layout: top bar, 38/62 split, tab navigation with fade transitions
- 🟢 `components/ScreenplayViewer.tsx` — Courier Prime parser, scene hover event dispatch (`scene_hover`)
- 🟢 `components/ADDashboard.tsx` — Health ring (animated), tension chart (Recharts AreaChart), character heatmap, pacing blocks, flag warning card. Linked hover listening from screenplay.
- 🟢 `components/CharactersTab.tsx` — 2-column Chroma-Grid-style card grid, hover animation
- 🟢 `components/MoodboardTab.tsx` — Stack animation with fan-out on hover, Pollinations images, captions
- 🟢 `components/MultilingualTab.tsx` — ORIGINAL/TRANSLATED toggle, Sarvam call on demand, caches result
- 🟢 `frontend/lib/api.ts` — All 5 fetch functions: `generateScreenplay`, `analyzeScreenplay`, `getMoodboard`, `translateScreenplay`, `exportScreenplay`
- 🟢 `frontend/lib/types.ts` — TypeScript interfaces for all API shapes

---

## COLUMN 2 — ⚠️ PARTIAL (Started but incomplete — needs finishing)

S: Ask the responsible person for ETA. Update status after each check-in.

### P — P-1: mock_data.py
**Status:** ⚠️ Partial
**Owner:** P | **File:** `backend/mock_data.py`
**What exists:** File created. MOCK_GENERATE, MOCK_ANALYZE, MOCK_MOODBOARD, MOCK_TRANSLATE all present.
**What's wrong / missing:**
- [ ] MOCK_GENERATE screenplay is only ~2 scenes (~100 words) — spec requires 20 scenes, 800+ words, demo story set in 1990s Hyderabad
- [ ] MOCK_GENERATE has only 2 characters (ARYAN, RAO) — spec requires 4 (VIKRAM, PRIYA, RAJAN, MEERA)
- [ ] MOCK_ANALYZE.tension_curve has only 2 entries — spec requires exactly 20 entries with realistic arc
- [ ] MOCK_ANALYZE.character_heatmap has ARYAN/RAO — must match the 4 correct characters
- [ ] MOCK_ANALYZE.pacing_blocks has only 2 entries — spec requires 20, with 5 consecutive slow at positions 14–18
- [ ] MOCK_ANALYZE.flags scene_range should be "14-18" for the demo story
- [ ] MOCK_TRANSLATE.translated_screenplay is only ~100 words — needs to match full mock screenplay
**Acceptance test:** `python -c "import mock_data; print(len(mock_data.MOCK_GENERATE['characters']), mock_data.MOCK_GENERATE['scene_count'])"` → should print `4 20`
**Commit:** `[P]: fix mock_data.py — correct 20-scene thriller with 4 characters`

---

### P — P-2: db.py
**Status:** ⚠️ Partial
**Owner:** P | **File:** `backend/db.py`
**What exists:** `init_db()` function — creates the table correctly.
**What's missing:**
- [ ] `save_project(project_id, story_idea, genre, language, tone, screenplay, characters)` — stores project to SQLite
- [ ] `get_project(project_id)` → `dict | None` — returns full row as dict with JSON-parsed characters/analysis
- [ ] `update_analysis(project_id, analysis)` — stores analysis JSON string
- [ ] `get_screenplay(project_id)` → `str | None` — returns screenplay text only
- [ ] All functions need full type hints
- [ ] All sqlite3 errors must be caught and re-raised as `RuntimeError("DB_ERROR: ...")`
- [ ] All logging must use `logging.info()` / `logging.error()`, never `print()`
**Acceptance test:** `save_project(...)` then `get_project(project_id)` returns same data
**Commit:** `[P]: complete db.py with all 5 functions`

---

## COLUMN 3 — ⬜ NOT STARTED (Assigned, ready to begin)

S: Remind the owner of the task if it hasn't started by the expected time. Use the time budgets as reference.

### G — G-1: verify_setup.py
**Status:** ⬜ Not Started
**Owner:** G | **File:** `backend/scripts/verify_setup.py`
**Time budget:** 20 min | **Start:** Immediately after setup
**Depends on:** Nothing
**5 checks to implement:**
1. Python version ≥ 3.11
2. All packages importable (fastapi, uvicorn, google.generativeai, chromadb, sentence_transformers, langchain, reportlab, docx, ollama)
3. GEMINI_API_KEY in env
4. SARVAM_API_KEY in env
5. ChromaDB initializes (PersistentClient, then delete test folder)
**Final line:** "ALL SYSTEMS GO 🟢" or "SETUP INCOMPLETE — fix the ❌ items above"
**Acceptance:** Runs in < 10 seconds. Each check prints ✅ or ❌ with specific fix instruction.
**Commit:** `[G]: add verify_setup.py`

---

### P — P-3: ChromaDB RAG Module
**Status:** ⬜ Not Started
**Owner:** P | **Files:** `backend/rag/chroma_setup.py`, `backend/rag/load_scripts.py`, `backend/rag/retriever.py`
**Time budget:** 35 min | **Depends on:** P-2 done
**Three files to create:**
1. `chroma_setup.py` — `get_collection()` using SentenceTransformer `all-MiniLM-L6-v2`
2. `load_scripts.py` — chunk screenplay .txt files by INT./EXT. scene boundaries, add to ChromaDB, idempotent
3. `retriever.py` — `retrieve_context(story_idea, genre, n_results=3) -> str`, returns "" on failure (never raises)
**Acceptance:** `retrieve_context("police corruption family betrayal", "Thriller")` returns non-empty string
**Commit:** `[P]: add ChromaDB RAG module`

---

### G — G-2: /api/moodboard (Pollinations.ai)
**Status:** ⬜ Not Started
**Owner:** G | **Files:** `backend/moodboard.py` + modify `backend/main.py`
**Time budget:** 25 min | **Depends on:** A's skeleton (already committed)
**Key rule:** Do NOT make an HTTP request to Pollinations in the backend. Just construct and return the URL. Frontend `<img>` fetches it directly.
**build_moodboard_url logic:**
- tone ≤ 30 → Bollywood style prompt
- tone 31–70 → cinematic Indian film
- tone ≥ 71 → desaturated Nolan style
**On any exception:** return fallback URL + caption — never 500
**Acceptance:** Pasting the returned URL into a browser loads a cinematic image. Tone 20 URL contains "Bollywood" or "golden hour". Tone 80 URL contains "Nolan" or "desaturated".
**Commit:** `[G]: implement Pollinations moodboard endpoint`

---

### G — G-3: /api/export (PDF + DOCX + TXT)
**Status:** ⬜ Not Started
**Owner:** G | **Files:** `backend/exporter.py` + modify `backend/main.py`
**Time budget:** 35 min | **Depends on:** A's skeleton (already committed)
**Three export functions in exporter.py:**
- `export_pdf(screenplay, project_id)` → bytes — ReportLab, Courier 12pt, US Letter, proper margins
- `export_docx(screenplay, project_id)` → bytes — python-docx, Courier New 12pt
- `export_txt(screenplay)` → bytes — UTF-8 encode
**Endpoint receives:** form-encoded `project_id` + `format`
**On any error:** return JSON `{"error": true, "code": "EXPORT_FAILURE", ...}` not binary crash
**Acceptance:** Downloaded PDF opens in viewer with proper screenplay formatting. DOCX opens in Word with Courier New. TXT is readable.
**Commit:** `[G]: implement PDF, DOCX, TXT export endpoint`

---

### P — P-4: Inject RAG into /api/generate
**Status:** ⬜ Not Started
**Owner:** P | **File:** modify `backend/main.py`
**Time budget:** 20 min | **Depends on:** P-3 done + A's skeleton (already committed)
**Steps:**
1. Call `retrieve_context(story_idea, genre)` before Gemini
2. Inject RAG context into Gemini screenplay prompt
3. Call Ollama (or Groq fallback) for character JSON
4. Generate `project_id = str(uuid.uuid4())`
5. Call `db.save_project()` to persist
6. Return response matching API_CONTRACTS.md exactly (scene_count = actual INT./EXT. count)
**Do NOT change the endpoint URL or response shape.**
**Acceptance:** Two different story inputs return noticeably different screenplays. `db.get_project(project_id)` returns the row.
**Commit:** `[P]: integrate RAG into /api/generate, wire SQLite`

---

### P — P-5: /api/translate (Sarvam AI)
**Status:** ⬜ Not Started
**Owner:** P | **File:** modify `backend/main.py`
**Time budget:** 25 min | **Depends on:** P-4 done
**Rules:**
- Keep scene headings (INT./EXT.), action lines, character name lines in English
- Regenerate ONLY dialogue lines in target language — not word-for-word, culturally native
- `note` field MUST be exactly: `"Culturally Generated — Not Translated"`
- If Sarvam fails → return original English screenplay with `"fallback": true` — never 500
**Acceptance:** Hindi dialogue contains Hindi text. Scene headings unchanged. `note` field exact match.
**Commit:** `[P]: implement Sarvam translate endpoint`

---

### P — P-6: /api/analyze (AD Intelligence)
**Status:** ⬜ Not Started
**Owner:** P | **File:** modify `backend/main.py`
**Time budget:** 30 min | **Depends on:** P-4 done + A's `ad_intelligence.py` (already committed)
**Steps:**
1. Fetch screenplay + characters from DB
2. Call `build_analysis_prompt(screenplay, characters)` from `ad_intelligence.py`
3. Call Gemini via `ai_client.py` with `json_mode=True`
4. Parse JSON response
5. Compute health_score on backend: `round(pacing * 0.35 + balance * 0.35 + tension * 0.30)`
6. Store in DB via `db.update_analysis()`
**Error handling:** If Gemini returns malformed JSON → retry once → if fails → return safe default (all 50s). NEVER return 500.
**Validations:** tension_curve must have exactly `scene_count` entries. character_heatmap must contain all characters (no extras, no missing). health_score must be 0–100.
**Acceptance:** `health_score = round(pacing * 0.35 + balance * 0.35 + tension * 0.30)` verified manually.
**Commit:** `[P]: implement AD Intelligence analyze endpoint`

---

### A — Polish & Animations (Hour 4:30–5:30, after integration merge)
**Status:** ⬜ Not Started (starts after integration is confirmed)
**Owner:** A
**Only do these after integration is confirmed working:**
- [ ] Typewriter effect on screenplay text (~40 chars/sec, Framer Motion)
- [ ] Health score count-up animation (0 → final, 1.5s ease-out)
- [ ] Tension curve draw-on (left to right, 1s ease-in-out)
- [ ] Clapperboard snap animation on ROLL CAMERA click
- [ ] Tab fade transitions (150ms opacity only — already partially in output.tsx)
- [ ] Wire export buttons to real API (currently shows `alert()`)
- [ ] Final color/spacing pass against Design Doc

---

### G — G-4: End-to-End Testing
**Status:** ⬜ Not Started
**Owner:** G | **Time budget:** 30 min (run while waiting for P)
**Depends on:** P-4 done + G-2 + G-3 done
**6 test scenarios to run and document:**
1. Full pipeline: generate → analyze → moodboard → export PDF
2. Hindi translation: `note` field exact match + Hindi dialogue present
3. Masala tone moodboard (tone 10): URL contains "Bollywood" or "golden hour"
4. Nolan tone moodboard (tone 90): URL contains "Nolan" or "desaturated"
5. All export formats: docx + txt download without error
6. Error handling: empty story → error JSON. Fake project_id → error JSON. No 500s.
**Output:** Share test log with S when done. S routes any ❌ to the right person.

---

### S — Pitch Deck
**Status:** ⬜ Not Started
**Owner:** S | **Tool:** Canva / PowerPoint | **Target:** 7 slides, 3 minutes
**Slides to build:**
1. THE PRE-PRODUCTION WALL (problem)
2. SCRIPTORIA (solution + pipeline flow)
3. NOT JUST GENERATION. ANALYSIS. (AD Intelligence — ask A for screenshot by Hour 3)
4. RAG + CULTURAL DNA (split: RAG left / Sarvam right)
5. BUILT ON THE RIGHT STACK (tech table, "Total infrastructure cost: ₹0")
6. WHO THIS IS FOR (3 columns: filmmakers / OTT / film schools)
7. LET US SHOW YOU. (full screen, no body text)
**After building:** Time yourself → target 3 minutes flat. Share link with A for review.

---

### S — Demo Script
**Status:** ⬜ Not Started
**Owner:** S | **After:** Pitch deck done
**10-step demo script is in TASKS_S.md** — practice it 2 full times
**Key moments to nail:**
- Step 5: hover scene 14 → tension curve pulses (say "watch what happens when I hover")
- Step 6: point at flag card (say "it caught something")
- Step 8: click TRANSLATED toggle (say "Not translation — dialogue regenerated natively")
- Step 9: open PDF (say "Submit this to any production house today")
**Target time:** 2 minutes for demo section, 3 minutes for pitch = 5 minutes total

---

## COLUMN 4 — 🔴 BLOCKED (S reports to A immediately)

*Nothing blocked yet. Add items here as they come up during the build.*

| Task | Blocker | Who needs to act | Time reported |
|------|---------|-----------------|---------------|
| — | — | — | — |

---

## INTEGRATION MERGE CHECKLIST (Hour 4:00 — A runs this)

S: Confirm A has run each of these before marking Hour 4:00 checkpoint green.

- [ ] `git checkout dev`
- [ ] `git merge feature/backend` (P's work)
- [ ] `git merge feature/modules` (G's work)
- [ ] Switch `api.ts` from mock to real endpoints
- [ ] Run full pipeline test: Input → Generate → Analyze → Moodboard → Translate → Export PDF
- [ ] All 5 steps returned valid data or graceful fallback
- [ ] Tell S: "Integration complete" — S marks tracker

---

## CODE FREEZE CHECKLIST (Hour 5:30 — A calls it)

S: Confirm all items before calling demo ready.

- [ ] Final end-to-end run with the demo story (the Hyderabad police officer story)
- [ ] Export PDF opened — confirm correct Courier Prime formatting, proper margins
- [ ] DEMO_FALLBACK screenshots taken (all 6 screens — see TASKS_S.md)
- [ ] Pitch deck on BOTH S's laptop AND A's laptop
- [ ] Demo story pre-typed in input field, browser open, server running
- [ ] `dev → main` merge complete

---

## NON-NEGOTIABLES CHECKLIST (Judge moment — never cut)

S: Verify each of these personally before demo time.

- [ ] Screenplay viewer renders in Courier Prime (check font in browser)
- [ ] AD Intelligence tab visible with real-looking data (even defaults are fine)
- [ ] Linked hover: hovering scene in screenplay panel pulses a dot in tension chart
- [ ] PDF export downloads and opens correctly
- [ ] Moodboard shows 3 images (or 3 placeholder captions if Pollinations slow)

---

## FALLBACK PROTOCOL (if something breaks at demo time)

**Do not announce it's broken.** Open `DEMO_FALLBACK` folder and narrate from screenshots.

| Priority | Fix this first |
|----------|---------------|
| 1 | Core pipeline: generate → screenplay viewer on screen |
| 2 | Export: PDF must download |
| 3 | AD Dashboard: even safe defaults (all 50s) are fine |
| 4 | Let multilingual and moodboard break — S covers verbally |

---

## JUDGE Q&A CHEAT SHEET (S memorizes — routes technical questions)

| Question | Who answers |
|----------|------------|
| "What makes this different from ChatGPT?" | S answers (memorize the answer in TASKS_S.md) |
| "How does the RAG work?" | Route to P — 3 sentences max |
| "What's the business model?" | S answers (SaaS, ₹999/month) |
| "Why not Google Translate for multilingual?" | S answers (Cultural DNA, not translation) |
| "What's next for Scriptoria?" | S answers (MCP server post-hackathon) |
| Any technical question not listed | "Let me have [P/G/A] speak to that." Do not guess. |

---

## CURRENT TASK ASSIGNMENTS AT A GLANCE

```
RIGHT NOW (Hour 0-1):
  A  → Finish backend handoff. Both ai_client + ad_intelligence committed.
  P  → Fix mock_data.py (P-1). Complete db.py (P-2).
  G  → Write verify_setup.py (G-1).
  S  → Read PROJECT_BRIEF. Set up tracker. Orient on pitch tool.

HOUR 1-2:
  A  → Full UI build (Screen 1 → 2 → 3 → components).
  P  → RAG module (P-3) → inject into generate (P-4).
  G  → Moodboard endpoint (G-2) → Export endpoint (G-3).
  S  → Deep product understanding. Start pitch deck.

HOUR 2-3.5:
  A  → AD Intelligence tab + Characters + Moodboard + Multilingual.
  P  → Sarvam translate (P-5) → AD Analyze (P-6).
  G  → Export endpoint (G-3). Start E2E testing (G-4).
  S  → Finish pitch deck. Write demo script.

HOUR 4:
  A  → INTEGRATION MERGE. Full pipeline test.
  P  → Available to fix any backend breakage during merge.
  G  → Continue E2E testing. Share test log with S.
  S  → Watch for blockers. Mark tracker.

HOUR 4.5-5.5:
  A  → Polish + animations. Wire real export buttons.
  P  → Help G debug if needed.
  G  → Complete testing. Confirm all 6 scenarios.
  S  → Rehearse demo. Brief team on judge Q&A.

HOUR 5.5:
  ALL → Code freeze. S manages the room.
```

---

*TASK_TRACKER.md | Owner: S | Update every 20 minutes during the build.*
*If something is 🔴 Blocked → interrupt A immediately. Do not wait.*
