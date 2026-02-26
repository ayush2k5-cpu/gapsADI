# SCRIPTORIA — Environment Setup Guide
**For:** P and G
**Rule:** Complete this fully before writing a single line of code.
**Rule:** If something fails, check the troubleshooting table at the bottom — do NOT ask A unless the table doesn't cover it.

---

## System Requirements

Before you start, verify you have these installed:

```
Python   3.11 or higher   →  python --version
Node.js  18 or higher     →  node --version
Git      any recent       →  git --version
Ollama   latest           →  ollama --version  (verify model is downloaded — see Step 6)
```

If any of these are missing, install them first.

---

## Step 1 — Clone the Repository

```bash
git clone [A WILL PASTE THE GITHUB URL HERE]
cd scriptoria
```

---

## Step 2 — Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# You should see (venv) in your terminal prompt now

# Install all dependencies
pip install -r requirements.txt
```

---

## Step 3 — Frontend Setup

Open a second terminal window. Keep the backend terminal running.

```bash
# From the root scriptoria/ folder
cd frontend

# Install dependencies
npm install
```

---

## Step 4 — Environment Variables

A will send you a filled `.env` file via WhatsApp/Telegram before the hackathon starts.

Place it in the `backend/` folder:
```
scriptoria/
└── backend/
    └── .env    ← put it here
```

The `.env` file contains:
```
GEMINI_API_KEY=your_key_here
SARVAM_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
DATABASE_URL=./scriptoria.db
```

Do NOT commit the `.env` file. It is in `.gitignore` already.

---

## Step 5 — Verify Setup

Run the verification script from inside `backend/` with your venv activated:

```bash
cd backend
python scripts/verify_setup.py
```

Expected output (all 5 green):
```
✅ Python version: 3.11.x — OK
✅ All packages importable — OK
✅ GEMINI_API_KEY found — OK
✅ SARVAM_API_KEY found — OK
✅ ChromaDB initializes — OK

ALL SYSTEMS GO
```

If you see ❌ on any line, fix that specific issue using the troubleshooting table below before continuing.

---

## Step 6 — Verify Ollama Model

Check that the Llama model is already downloaded:

```bash
ollama list
```

You should see something like:
```
NAME                    ID              SIZE    MODIFIED
llama3.2:latest         ...             2.0 GB  X days ago
```

If `llama3.2` or `llama3.1` appears in the list → you're good. Ollama will be used for character generation.

If the list is empty or the model is missing → **do NOT download it on venue WiFi.** Tell A immediately. The system will automatically fall back to Groq API for character generation — no code changes needed, it's handled in `ai_client.py`.

---

## Step 7 — Load RAG Corpus

This populates ChromaDB with the screenplay knowledge base.
Run once, takes about 2 minutes:

```bash
# From backend/ with venv activated
python scripts/load_scripts.py
```

Expected output:
```
Loading screenplay corpus...
Processed 28 scripts, 340 chunks
ChromaDB collection created: screenplays
✅ RAG corpus ready
```

If the scripts/ folder is empty → tell A. The screenplay files need to be committed to the repo.

---

## Step 8 — Checkout Your Branch

**P:**
```bash
git checkout feature/backend
```

**G:**
```bash
git checkout feature/modules
```

Never work on `main` or `dev` directly.

---

## Step 9 — Start the Servers

**Backend** (terminal 1, inside `backend/` with venv active):
```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Frontend** (terminal 2, inside `frontend/`):
```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

Open `http://localhost:3000` in browser — Screen 1 should load.

---

## Step 10 — Quick Sanity Test

With both servers running, test the core endpoint:

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"story_idea": "A detective who cannot forget anything investigates his own past", "genre": "Thriller", "language": "English", "tone": 70}'
```

If you get a JSON response with `project_id`, `screenplay`, and `characters` fields → setup is complete.

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `ModuleNotFoundError` | venv not activated | Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux) |
| `401 Unauthorized` from Gemini | API key wrong or missing | Check `.env` file is in `backend/` folder, check key has no extra spaces |
| `ChromaDB` collection error on startup | load_scripts.py not run yet | Run `python scripts/load_scripts.py` |
| `Port 8000 already in use` | Another process using it | Run: `lsof -ti:8000 \| xargs kill` (Mac/Linux) or find and kill in Task Manager (Windows) |
| `npm install` fails | Node version too old | Run `node --version` — needs 18+. Update Node. |
| `verify_setup.py` fails on packages | requirements.txt not fully installed | Run `pip install -r requirements.txt` again, check for error lines |
| Ollama not responding | Ollama service not running | Run `ollama serve` in a separate terminal |
| `SARVAM_API_KEY not found` | .env missing or wrong location | Confirm `.env` is in `backend/` not root folder |

---

## Git Workflow (Quick Reference)

```bash
# Save your work frequently
git add .
git commit -m "[P]: brief description of what you did"   # P uses [P]:
git commit -m "[G]: brief description of what you did"   # G uses [G]:
git push origin feature/backend   # P pushes here
git push origin feature/modules   # G pushes here
```

**Do NOT push to `main` or `dev` directly. A handles all merges.**

If you break something on your branch:
```bash
git stash          # save current work
git status         # check what changed
git stash pop      # restore if needed
```

When in doubt, call A before doing any git reset or force commands.

---

*SETUP.md v1.0 | If this doc fails you, tell A — the doc needs fixing, not you.*
