# SCRIPTORIA — A's Task Playbook
**Branch:** `feature/ui` (after Hour 1, backend work goes directly to `dev`)
**You are:** Lead, Architect, UI Owner, Integration Manager

---

## Your Hour-by-Hour Breakdown

---

### Hour 0:00 – 0:30 | Setup & Unblock Everyone

This 30 minutes determines whether the entire team runs smoothly or spends the first hour confused.
Do not skip or rush anything here.

- [ ] Create GitHub repo, set visibility to private, add P and G as collaborators
- [ ] Push the docs folder (all 9 files) to repo root
- [ ] Create branches: `feature/ui`, `feature/backend`, `feature/modules`, `dev`
- [ ] Commit the initial folder structure:
  ```
  backend/
    scripts/        ← contains the screenplay .txt corpus files
    rag/            ← empty, P fills this
    requirements.txt
    .env.example
  frontend/         ← empty Next.js scaffold or just the folder
  ```
- [ ] Send the filled `.env` file to P and G privately (WhatsApp/Telegram — NOT committed to repo)
- [ ] Confirm P and G have cloned the repo and `verify_setup.py` shows green
- [ ] Tell S: "Repo is live. Start reading PROJECT_BRIEF.md."

**Checkpoint: By 0:30 — everyone has the repo, everyone is on their branch, you're ready to code.**

---

### Hour 0:30 – 1:00 | Backend Core (Your Only Backend Window)

You own this window. After 1:00 you do not touch the backend unless something is critically broken.

**Priority 1 — FastAPI skeleton (`backend/main.py`):**

Create the app with all 5 endpoint skeletons. Each skeleton should:
- Accept the correct request body (per API_CONTRACTS.md)
- Return the mock data from `mock_data.py` as a temporary response
- Be wired to the correct route path

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mock_data, db, logging

app = FastAPI(title="Scriptoria API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup(): db.init_db()

@app.post("/api/generate")   # returns mock_data.MOCK_GENERATE for now
@app.post("/api/analyze")    # returns mock_data.MOCK_ANALYZE for now
@app.post("/api/moodboard")  # returns mock_data.MOCK_MOODBOARD for now
@app.post("/api/translate")  # returns mock_data.MOCK_TRANSLATE for now
@app.post("/api/export")     # returns a placeholder for now
```

This gives P and G real endpoints to build into immediately, even before logic is wired.

**Priority 2 — `backend/ai_client.py`:**

The Gemini wrapper. P uses this for all LLM calls — never calls Gemini directly.

```python
import google.generativeai as genai
import os, logging
from google.api_core.exceptions import ResourceExhausted

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

def generate(prompt: str, json_mode: bool = False) -> str:
    """Call Gemini 2.0 Flash. Returns text. Raises RuntimeError on rate limit."""
    config = {"response_mime_type": "application/json"} if json_mode else {}
    try:
        response = model.generate_content(prompt, generation_config=config)
        return response.text
    except ResourceExhausted:
        logging.error("Gemini rate limit hit")
        raise RuntimeError("GEMINI_RATE_LIMIT")
    except Exception as e:
        logging.error(f"Gemini error: {e}")
        raise RuntimeError(f"GEMINI_ERROR: {str(e)}")
```

**Priority 3 — `backend/ad_intelligence.py`:**

The AD Intelligence prompt template. P's Task P-6 depends entirely on this existing.
Write the Gemini prompt that produces the exact JSON shape from API_CONTRACTS.md `/api/analyze`.

```python
def build_analysis_prompt(screenplay: str, characters: list) -> str:
    character_names = [c["name"] for c in characters]
    scene_count = screenplay.count("INT.") + screenplay.count("EXT.")

    return f"""
You are an expert Assistant Director analyzing a screenplay for a film production.

Analyze the following screenplay and return ONLY valid JSON matching this exact schema:
{{
  "pacing_score": <integer 0-100>,
  "balance_score": <integer 0-100>,
  "tension_score": <integer 0-100>,
  "tension_curve": [{{"scene": <int>, "score": <int 0-100>}} for each of {scene_count} scenes],
  "character_heatmap": {{
    "<character_name>": {{"act1": <int 0-100>, "act2": <int 0-100>, "act3": <int 0-100>}}
    for each of these characters: {character_names}
  }},
  "pacing_blocks": [{{"scene": <int>, "speed": "fast|medium|slow"}} for each of {scene_count} scenes],
  "flags": [{{"scene_range": "<X-Y>", "issue": "<description>", "suggestion": "<fix>"}}]
            (empty array [] if no issues found)
}}

Scoring guidelines:
- pacing_score: 100 = perfect rhythm throughout, 0 = severe pacing issues
- balance_score: 100 = all major characters well distributed, 0 = protagonist dominates every scene
- tension_score: 100 = perfect dramatic arc, natural peak-valley-resolution, 0 = flat tension throughout
- tension_curve: each scene gets a score — reflect natural rise/fall of dramatic tension
- character_heatmap: intensity of presence in each act (100 = central to every scene in that act)
- pacing_blocks: fast = action/revelation scenes, medium = dialogue, slow = setup/exposition
- flags: only flag real problems (5+ consecutive slow scenes, character absent from entire act, etc.)

Return ONLY the JSON object. No explanation, no markdown, no code blocks.

SCREENPLAY:
{screenplay}
"""
```

**Acceptance test before switching to UI:**
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{{"story_idea": "A detective who cannot forget anything", "genre": "Thriller", "language": "English", "tone": 70}}'
```
Must return JSON with `project_id`, `screenplay`, `scene_count`, `characters`. If yes — hand off backend to P and switch to UI.

**Tell P:** "Skeleton is live. `ad_intelligence.py` is committed. Start P-1 now."
**Tell G:** "Skeleton is live. Start G-1 now."
**Tell S:** "Backend handed off. I'm on UI."

---

### Hour 1:00 – 4:30 | Full UI Build

Work in this order. Do not jump ahead — each screen needs to be complete before moving on.

**First: Design system in Tailwind (`frontend/tailwind.config.js`)**
Add all color tokens from SCRIPTORIA_Design_Document.md as Tailwind custom colors.
This takes 15 minutes and saves you from hardcoding hex values in every component.

```js
colors: {
  'bg-base': '#0A0908',
  'bg-surface': '#121110',
  'bg-elevated': '#1C1A18',
  'border-default': '#2D2B28',
  'brand-white': '#F5F5F5',
  'brand-black': '#0A0A0A',
  'text-primary': '#EDE8DF',
  'text-muted': '#6B6560',
  // Pair 1 — AD / Warnings
  'pair1-dark': '#5b0e14', 'pair1-accent': '#f1e194',
  // Pair 2 — Moodboard
  'pair2-accent': '#ffd2c2', 'pair2-secondary': '#789a99',
  // Pair 3 — Multilingual
  'pair3-accent': '#fefacd', 'pair3-bg': '#5f4a8b',
  // Pair 4 — AD Intelligence
  'pair4-accent': '#fd802e', 'pair4-dark': '#233d4c',
  // Pair 5 — Scores
  'pair5-accent': '#cbdde9', 'pair5-primary': '#2872a1',
  // Pair 6 — Characters
  'pair6-accent': '#acc8a2', 'pair6-dark': '#1a2517',
}
```

**Build order:**
1. [ ] Screen 1 — Input/Landing (complete, all interactions working)
2. [ ] Screen 2 — Loading (step dots + status text cycling)
3. [ ] Screen 3 — Shell (top bar + left panel + right panel layout, no content yet)
4. [ ] Screenplay Viewer component (Courier Prime, scene types, hover state)
5. [ ] AD Intelligence tab (health ring, tension chart, character heatmap, pacing blocks, flag card)
6. [ ] Characters tab (Chroma Grid cards)
7. [ ] Moodboard tab (Stack component)
8. [ ] Multilingual tab (toggle + screenplay viewer variant)
9. [ ] Export buttons (PDF/DOCX/TXT — wire to real API)

**Build against mock data (`frontend/lib/api.ts`):**
During Hours 1–3, `api.ts` returns mock data from `mock_data.py` (via the skeleton endpoints).
This lets you build the full UI without waiting for P to finish real logic.

**Linked hover interaction (non-negotiable for Best UI/UX):**
When building the Screenplay Viewer + Tension Chart together in step 4+5:
- Each scene block in ScreenplayViewer emits a `scene_hover` event with scene number
- TensionChart listens and pulses the corresponding dot (scale 1 → 1.4 → 1, 300ms)
- This is the interaction that wins the design award — implement it cleanly

---

### Hour 4:00 – 4:30 | Integration Merge

This is the most critical 30 minutes. Everyone stops new work.

```bash
# On your machine
git checkout dev
git merge feature/backend   # P's work
git merge feature/modules   # G's work

# Switch api.ts from mock to real endpoints
# Run full pipeline test:
# Input → Generate → Analyze → Moodboard → Translate → Export PDF
```

If something breaks during merge:
- Identify which endpoint is broken (P owns it)
- P fixes on `feature/backend`, pushes, you re-merge
- Do not debug P's code yourself — route it back

Once full pipeline works end-to-end → tell S: "Integration complete."

---

### Hour 4:30 – 5:30 | Polish + Animations

Only after integration is confirmed working:

- [ ] Typewriter effect on screenplay text (Framer Motion, ~40 chars/sec)
- [ ] Health score count-up animation (0 → final score, 1.5s ease-out)
- [ ] Tension curve draw-on (left to right, 1s ease-in-out)
- [ ] Clapperboard clap animation on ROLL CAMERA click
- [ ] Tab fade transitions (150ms, opacity only — no slides)
- [ ] Final color/spacing pass against Design Doc

If integration broke something during this window — animations are cut, fix the breakage first.

---

### Hour 5:30 | Call Code Freeze

Say it out loud to the team: "Code freeze. Nothing new goes in."
Then:
- [ ] Final end-to-end run with the demo story
- [ ] Export a PDF — open it, confirm it looks correct
- [ ] Take DEMO_FALLBACK screenshots (S needs these)
- [ ] Merge `dev → main`

---

## Key Files You Own

| File | What it is |
|------|-----------|
| `backend/main.py` | FastAPI app + all endpoint skeletons |
| `backend/ai_client.py` | Gemini wrapper — P builds on this |
| `backend/ad_intelligence.py` | AD prompt template — P builds on this |
| `frontend/lib/api.ts` | All fetch calls — you define the types |
| `frontend/lib/types.ts` | TypeScript interfaces for all API shapes |
| `frontend/tailwind.config.js` | Design system tokens |
| All `frontend/components/` | You own every component |

---

## Rules For Yourself

- **Do not explain your code to P or G mid-session.** The docs handle that. Route questions to S.
- **Do not debug P's backend after Hour 1.** That's P's job. Your job is UI.
- **Do not add features after Hour 5:30.** Ship what works, win on quality not quantity.
- **Do not skip the linked hover interaction.** That's the Best UI/UX moment.

---

*TASKS_A.md v1.0 | You built the plan. Now execute it.*
