# SCRIPTORIA — G's Task Playbook
**Branch:** `feature/modules`
**Reports to:** A (for blockers only — go through S first)

---

## Before Every Task — Non-Negotiable

Open a new Claude or antigravity conversation.
Paste the full contents of `CLAUDE.md` as your first message.
Say: "I have loaded the project context. I am ready for my task."
Then paste the task prompt below.

**Do not start any task without doing this.**

---

## Task Overview

| # | Task | Time | Depends On |
|---|------|------|-----------|
| G-1 | `verify_setup.py` — setup verification script | 20 min | Nothing — do this immediately |
| G-2 | `/api/moodboard` — Pollinations.ai integration | 25 min | A's endpoint skeleton committed |
| G-3 | `/api/export` — PDF + DOCX + TXT export | 35 min | A's endpoint skeleton committed |
| G-4 | End-to-end testing — 6 scenarios | 30 min (ongoing) | P-4 done, G-2 done, G-3 done |

**Total: ~1 hr 50 min.** G-1 starts the moment setup is done. G-2 and G-3 start once A commits skeletons (Hour 1).

---

## TASK G-1 — verify_setup.py

**Time budget:** 20 minutes
**File to create:** `backend/scripts/verify_setup.py`
**Depends on:** Nothing. Do this first thing after completing SETUP.md steps.
**Why this matters:** P and G both run this. It must catch setup problems before they waste time on broken environments.

### Agent Prompt:
```
[Paste CLAUDE.md first]

Create backend/scripts/verify_setup.py — a setup verification script.

It must check these 5 things IN ORDER and print ✅ or ❌ for each:

Check 1 — Python version:
  import sys
  version = sys.version_info
  Pass if version.major == 3 and version.minor >= 11
  Print: "✅ Python version: {major}.{minor}.{micro} — OK"
  or:    "❌ Python version: {major}.{minor}.{micro} — needs 3.11+"

Check 2 — All required packages importable:
  Try importing: fastapi, uvicorn, google.generativeai, chromadb,
                 sentence_transformers, langchain, reportlab, docx, ollama
  If all pass: "✅ All packages importable — OK"
  If any fail: "❌ Missing packages: {list of failed imports} — run pip install -r requirements.txt"

Check 3 — GEMINI_API_KEY:
  import os; from dotenv import load_dotenv; load_dotenv()
  Pass if os.getenv("GEMINI_API_KEY") is not None and len(os.getenv("GEMINI_API_KEY")) > 10
  Print: "✅ GEMINI_API_KEY found — OK"
  or:    "❌ GEMINI_API_KEY missing — check .env file location and contents"

Check 4 — SARVAM_API_KEY:
  Same pattern as Check 3 but for SARVAM_API_KEY

Check 5 — ChromaDB initializes:
  Try: import chromadb; client = chromadb.PersistentClient(path="./chroma_db_test"); client.list_collections()
  Pass: "✅ ChromaDB initializes — OK"
  Fail: "❌ ChromaDB error: {error message}"
  Clean up: delete chroma_db_test folder after test

Final output:
  If all 5 pass: print "\nALL SYSTEMS GO 🟢"
  If any fail:   print "\nSETUP INCOMPLETE — fix the ❌ items above before proceeding"

Script must complete in under 10 seconds. No network calls. Pure local checks only.
Run with: python scripts/verify_setup.py (from backend/ folder with venv active)
```

### Acceptance Criteria:
- [ ] Script runs without crashing regardless of what's installed or not
- [ ] Each check prints ✅ or ❌ with a clear message
- [ ] Runs in under 10 seconds
- [ ] Prints "ALL SYSTEMS GO" when everything is correct
- [ ] Prints specific fix instruction when something fails (not just "error occurred")

**Commit:** `git commit -m "[G]: add verify_setup.py"`

---

## TASK G-2 — /api/moodboard (Pollinations.ai)

**Time budget:** 25 minutes
**Files to create:** `backend/moodboard.py` + modify `backend/main.py`
**Depends on:** A has committed the `/api/moodboard` endpoint skeleton in main.py

### Agent Prompt:
```
[Paste CLAUDE.md first]

Implement the POST /api/moodboard endpoint for Scriptoria.

Step 1: Create backend/moodboard.py with this function:

def build_moodboard_url(scene_description: str, tone: int, act: int) -> str:
    """Constructs a Pollinations.ai URL for cinematic image generation."""
    import urllib.parse

    act_moods = {
        1: "establish opening introduce golden hour",
        2: "escalate tension conflict dramatic",
        3: "resolve climax conclusion powerful"
    }

    if tone <= 30:
        style = "vibrant Bollywood colors, high contrast, golden hour, dramatic Indian cinema, rich saturation"
    elif tone <= 70:
        style = "cinematic warm tones, dramatic lighting, atmospheric Indian film, professional cinematography"
    else:
        style = "desaturated IMAX minimal, cold blue tones, Nolan style psychological, shallow depth of field"

    prompt = f"{scene_description}, {act_moods.get(act, 'cinematic')}, {style}, film still, 4K, high quality"
    encoded = urllib.parse.quote(prompt)
    return f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=576&nologo=true"

def build_caption(act: int) -> str:
    captions = {1: "ACT I — ESTABLISH / OPENING", 2: "ACT II — ESCALATE / CONFLICT", 3: "ACT III — RESOLVE / CLIMAX"}
    return captions.get(act, f"ACT {act}")

Step 2: In backend/main.py, implement the POST /api/moodboard endpoint:
- Receive: { "project_id": string, "act": "1" | "2" | "3" }
- Fetch the project from DB using db.get_project(project_id)
- If not found: return standard error {"error": true, "code": "VALIDATION_ERROR", ...}
- Extract scene_description from the story_idea field (use first 100 chars)
- Extract tone from the project record
- Call build_moodboard_url(scene_description, tone, int(act))
- Return: { "image_url": the_url, "caption": build_caption(int(act)) }

Failure handling:
- If ANY exception occurs: return fallback response (never raise):
  {
    "image_url": "https://image.pollinations.ai/prompt/cinematic+dark+film+still+dramatic?width=1024&height=576&nologo=true",
    "caption": f"ACT {act} — VISUAL DIRECTION"
  }

IMPORTANT: Do NOT make an HTTP request to Pollinations in the backend.
Just construct and return the URL. The frontend <img> tag fetches it directly.
This keeps the endpoint fast (< 50ms response time).
```

### Acceptance Criteria:
- [ ] `POST /api/moodboard` with `{"project_id": "...", "act": "1"}` returns `image_url` and `caption`
- [ ] The `image_url` is a properly encoded Pollinations URL (no spaces, no special chars unencoded)
- [ ] Paste the returned `image_url` into a browser — it should load a cinematic image
- [ ] Tone 20 URL contains "Bollywood" or "golden hour" in the prompt portion
- [ ] Tone 80 URL contains "Nolan" or "desaturated" in the prompt portion
- [ ] On any failure: returns fallback, not a 500

**Commit:** `git commit -m "[G]: implement Pollinations moodboard endpoint"`

---

## TASK G-3 — /api/export (PDF + DOCX + TXT)

**Time budget:** 35 minutes
**Files to create:** `backend/exporter.py` + modify `backend/main.py`
**Depends on:** A has committed the `/api/export` endpoint skeleton in main.py

### Agent Prompt:
```
[Paste CLAUDE.md first]

Implement the POST /api/export endpoint for Scriptoria supporting PDF, DOCX, and TXT.

Step 1: Create backend/exporter.py

PDF export function using ReportLab:
def export_pdf(screenplay: str, project_id: str) -> bytes:
    """Generates a properly formatted screenplay PDF in memory."""
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER

    Formatting rules from API_CONTRACTS.md:
    - Font: Courier, 12pt
    - Page: US Letter, margins: top 1", bottom 1", left 1.5", right 1"
    - Scene headings (lines starting with INT. or EXT.): TA_LEFT, all caps, bold
    - Character names (centered ALL CAPS names between blank lines with dialogue below): TA_CENTER
    - Dialogue lines (indented lines below character names): TA_LEFT, left_indent=1.5*inch
    - Action lines (everything else): TA_LEFT
    - Page numbers from page 2 onward

    Return the PDF as bytes (BytesIO buffer).

DOCX export function using python-docx:
def export_docx(screenplay: str, project_id: str) -> bytes:
    """Generates a properly formatted screenplay DOCX in memory."""
    from io import BytesIO
    from docx import Document
    from docx.shared import Inches, Pt
    from docx.enum.text import WD_ALIGN_PARAGRAPH

    Apply the same formatting rules as PDF but using python-docx styles.
    Font: Courier New, 12pt throughout.
    Return as bytes.

TXT export:
def export_txt(screenplay: str) -> bytes:
    """Returns screenplay as UTF-8 encoded bytes."""
    return screenplay.encode("utf-8")

Step 2: In backend/main.py, implement POST /api/export:
- Receive form data: project_id (str), format (str: "pdf" | "docx" | "txt")
- Fetch screenplay: db.get_screenplay(project_id)
- If not found: return JSON error {"error": true, "code": "VALIDATION_ERROR", "message": "Project not found"}
- Call the appropriate exporter function
- Filename: f"Scriptoria_{project_id[:8]}.{format}"
- Return FastAPI StreamingResponse or FileResponse:
  - PDF:  media_type="application/pdf"
  - DOCX: media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  - TXT:  media_type="text/plain; charset=utf-8"
- Set header: Content-Disposition: attachment; filename="{filename}"
- On any export error: return JSON {"error": true, "code": "EXPORT_FAILURE", "message": "Failed to generate {format}"}
```

### Acceptance Criteria:
- [ ] `POST /api/export` with `format: "pdf"` triggers a file download
- [ ] Downloaded PDF opens in a PDF viewer with correct screenplay formatting
- [ ] Downloaded DOCX opens in Word/Docs with Courier New 12pt font
- [ ] Downloaded TXT is readable plain text
- [ ] Wrong format value (e.g. "xml") returns validation error JSON, not a crash
- [ ] Project not found returns error JSON, not a crash

**Commit:** `git commit -m "[G]: implement PDF, DOCX, TXT export endpoint"`

---

## TASK G-4 — End-to-End Testing

**Time budget:** 30 minutes (run in parallel while waiting for P to finish)
**When to start:** After G-2 and G-3 are done, and P-4 is done (core generate endpoint works)
**Output:** A test log shared with S for the tracker

### What to test

Run each test, note: ✅ Pass / ❌ Fail + the exact error message if it fails.
Share results with S when done.

**Test 1 — Full pipeline:**
```bash
# Step 1: Generate
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"story_idea": "A corrupt police officer in 1990s Hyderabad discovers his daughter leads the resistance", "genre": "Thriller", "language": "English", "tone": 65}'

# Save the project_id from the response
# Step 2: Analyze (use the project_id from above)
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"project_id": "PASTE_ID_HERE"}'

# Step 3: Moodboard for Act 1
curl -X POST http://localhost:8000/api/moodboard \
  -H "Content-Type: application/json" \
  -d '{"project_id": "PASTE_ID_HERE", "act": "1"}'

# Step 4: Export PDF
curl -X POST http://localhost:8000/api/export \
  -d "project_id=PASTE_ID_HERE&format=pdf" \
  --output test_export.pdf
```
Pass if: all 4 return correct JSON / file. `test_export.pdf` opens correctly.

**Test 2 — Hindi translation:**
```bash
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"project_id": "PASTE_ID_HERE", "target_language": "Hindi"}'
```
Pass if: response contains `"note": "Culturally Generated — Not Translated"` and dialogue lines contain Hindi text.

**Test 3 — Masala tone moodboard:**
Generate a new project with `tone: 10`. Call `/api/moodboard`.
Pass if: returned `image_url` contains "Bollywood" or "golden hour" (visible in the URL string).

**Test 4 — Nolan tone moodboard:**
Generate a new project with `tone: 90`. Call `/api/moodboard`.
Pass if: returned `image_url` contains "Nolan" or "desaturated" in the URL string.

**Test 5 — All export formats:**
```bash
curl -X POST http://localhost:8000/api/export -d "project_id=PASTE_ID&format=docx" --output test.docx
curl -X POST http://localhost:8000/api/export -d "project_id=PASTE_ID&format=txt" --output test.txt
```
Pass if: both files download and open without error.

**Test 6 — Error handling:**
```bash
# Empty story idea
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"story_idea": "", "genre": "Thriller", "language": "English", "tone": 50}'

# Non-existent project_id
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"project_id": "fake-id-that-does-not-exist"}'
```
Pass if: both return JSON error with `"error": true` and do NOT return a 500 or crash.

### After Testing
- Document all results in a message to S
- For any ❌ failure: include the exact error message and which endpoint failed
- S routes failures to the right person (P or A)

---

## After All Tasks Done

Tell S: "Modules complete, testing complete." Share test results.
If you have time before Hour 4 merge: help P debug any endpoint issues.
Do NOT push to `dev` or `main` — A handles all merges.

---

*TASKS_G.md v1.0 | Your branch: feature/modules | Questions → S first, then A*
