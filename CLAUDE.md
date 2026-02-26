# SCRIPTORIA — AI Agent Context File
**Paste this as your FIRST message in every Claude / antigravity session.**
**Do not start any task without loading this context first.**

---

## What Is Scriptoria

Scriptoria is a Generative AI–powered film pre-production system built for a hackathon
(GENAI Forge @ ICFAI Bangalore, Nasscom & FutureSkills Prime).

It takes a raw story idea and produces a full pre-production package:
formatted screenplay → character profiles → AD Intelligence analysis →
visual moodboards → multilingual dialogue → export-ready documents.

Target users: Independent filmmakers, OTT content creators, film school students.
Market focus: Indian cinema (Bollywood + regional) with global scale capability.

**My branch:** [FILL IN YOUR BRANCH NAME BEFORE STARTING]
- A → `feature/ui`
- P → `feature/backend`
- G → `feature/modules`

---

## Tech Stack (Exact — Do Not Substitute)

### Backend
- Python 3.11+
- FastAPI (not Flask — use FastAPI)
- `google-generativeai` — Gemini 2.0 Flash for generation + AD analysis
- `langchain` + `langchain-community` — orchestration only, not LangGraph
- `chromadb` — local vector database, no cloud setup
- `sentence-transformers` (model: `all-MiniLM-L6-v2`) — embeddings for RAG
- `sarvam-client` or Sarvam AI REST API — multilingual dialogue generation
- `reportlab` — PDF export
- `python-docx` — DOCX export
- `sqlite3` (stdlib) — project metadata persistence

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion — animations only (typewriter, score count-up, tension draw, tab fade)
- Recharts or Chart.js — for tension curve + character heatmap charts
- Lucide React — icons only, line style, 16px standard
- ReactBits components: Chroma Grid (Characters tab), Stack (Moodboard tab), Infinite Menu (tab bar)

### External APIs (All Free Tier)
- Gemini 2.0 Flash — `GEMINI_API_KEY` in .env — 15 RPM, 1M tokens/day
- Sarvam AI — `SARVAM_API_KEY` in .env — check dashboard for limits
- Pollinations.ai — NO API key needed — unlimited free image generation
  URL format: `https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=576&nologo=true`

---

## Repository Structure

```
scriptoria/
├── backend/
│   ├── main.py               ← FastAPI app, all route definitions
│   ├── ai_client.py          ← Gemini wrapper with 429 handling
│   ├── ad_intelligence.py    ← AD Intelligence prompt template (A writes this)
│   ├── mock_data.py          ← Hardcoded mock responses (P writes this — P-1)
│   ├── rag/
│   │   ├── chroma_setup.py   ← ChromaDB initialization
│   │   ├── load_scripts.py   ← Loads screenplay .txt files into ChromaDB
│   │   └── retriever.py      ← retrieve_context() function
│   ├── scripts/              ← Folder of screenplay .txt files for RAG corpus
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx          ← Screen 1 (Input/Landing)
│   │   ├── loading/page.tsx  ← Screen 2 (Generation/Loading)
│   │   └── output/page.tsx   ← Screen 3 (Director's Table)
│   ├── components/
│   │   ├── ScreenplayViewer.tsx
│   │   ├── ADDashboard.tsx
│   │   ├── CharactersTab.tsx
│   │   ├── MoodboardTab.tsx
│   │   └── MultilingualTab.tsx
│   ├── lib/
│   │   └── api.ts            ← All fetch calls to backend
│   └── package.json
├── CLAUDE.md                 ← This file
├── API_CONTRACTS.md
├── APP_FLOW.md
└── .env.example
```

---

## Non-Negotiable Rules

### API Contracts
`API_CONTRACTS.md` is the source of truth for ALL endpoint request/response shapes.
**Never change an endpoint's shape without A's approval.**
If the contract and your code disagree, fix your code, not the contract.

### Design System
`SCRIPTORIA_Design_Document.md` (in the repo root) is the source of truth for ALL UI.
Key rules an agent must know:
- Backgrounds: `#0A0908` (page), `#121110` (surface), `#1C1A18` (elevated)
- UI chrome (logo, buttons, nav): Black & White only — `#F5F5F5` and `#0A0A0A`
- Content sections each own one color pair — see Design Doc for pair assignments
- Screenplay panel: neutral warm B&W only, never add color
- Typography: Bebas Neue (display/headers), Inter (UI), Courier Prime (screenplay only)
- Border radius: 4px max, screenplay viewer 0px
- Animations: fade only for tabs (150ms), no slides

### Coding Conventions
- Type hints on ALL function signatures — no bare `def foo(x):`
- Use Python `logging` module — never `print()` in production code
- No hardcoded API keys — always `os.getenv("KEY_NAME")`
- No inline CSS in JSX — always Tailwind classes
- Commit message format: `[branch-initial]: brief description` e.g. `[P]: add RAG retriever`

---

## Rate Limit Handling

| API | Limit | Strategy |
|-----|-------|----------|
| Gemini 2.0 Flash | 15 RPM (free) | All calls go through `ai_client.py` wrapper. On 429: return structured error, never retry in a loop. |
| Sarvam AI | Check dashboard | Wrap in try/except. On failure: return original English screenplay with error flag. |
| Pollinations.ai | Unlimited | Direct HTTP GET. On timeout: return placeholder URL, don't block the response. |

---

## What NOT To Do (Hard Rules)

### Backend
- Never call Gemini API directly from a route handler — always use `ai_client.py`
- Never return a 500 error to the frontend — always catch exceptions and return structured error JSON
- Never change endpoint URL paths or response shapes without updating API_CONTRACTS.md first
- Never `print()` — use `logging.info()`, `logging.error()`
- Never hardcode API keys

### Frontend
- Never use `#E8A000` amber — it was replaced by the B&W + 6 color pairs system
- Never use `#FFFFFF` pure white — use `#F5F5F5`
- Never use `#000000` pure black — use `#0A0908` warm near-black
- Never use border-radius > 4px
- Never use slide animations for tabs — fade only (opacity transition, 150ms)
- Never add color to the screenplay panel
- Never add glow effects to navigation or logo — glow only on Moodboard hover

---

## Current Build Phase

**Phase:** Hackathon MVP (6-hour build)
**Status:** Pre-build documentation phase
**Priority order if time runs short:**
1. Core pipeline must work: Input → Generate → Analyze → Export
2. UI must be functional and match design doc
3. Multilingual (Sarvam) is cut first if time pressure hits
4. Moodboard is cut second
5. Never cut: Screenplay viewer, AD Intelligence Dashboard, Export

**Post-hackathon (before evaluation):** MCP server using FastMCP, exposing
generate_screenplay, analyze_script, generate_moodboard as MCP tools.

---

*Last updated: Pre-hackathon | Maintained by: A (Lead)*
