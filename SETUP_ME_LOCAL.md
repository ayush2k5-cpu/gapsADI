# SETUP_ME_LOCAL.md — gapsADI (Scriptoria) Local Setup Guide
**Windows — PowerShell — No WSL — No Docker required**
**GitHub Repo:** https://github.com/ayush2k5-cpu/gapsADI.git

---

## ⚠️ APPROACH CHOSEN: Option B — Clone into a new clean folder

Your existing folder `gaps ADI\gapsADI` is preserved as a backup (it has local unpushed commits).
All commands below work on a **fresh PowerShell window** pointed at the new clean clone.

---

## PART 1 — Required Tools

Install these before running any commands:

| Tool | Minimum Version | Check Command | Download |
|------|----------------|---------------|----------|
| **Git** | Any recent | `git --version` | https://git-scm.com/download/win |
| **Python** | 3.11+ | `python --version` | https://www.python.org/downloads/ |
| **Node.js** | 18+ | `node --version` | https://nodejs.org/en/download |
| **npm** | 9+ (ships with Node) | `npm --version` | (included with Node.js) |

> **Python install tip:** During Python installation, check ✅ "Add Python to PATH" on the first screen.

---

## PART 2 — One-Time Setup (Run These Once)

### Step 0 — Verify Tools Are Installed

Open PowerShell and run:

```powershell
git --version
python --version
node --version
npm --version
```

All four must return version numbers. If any fail, install the missing tool above first.

---

### Step 1 — Back Up Your Existing Folder (Safety First)

```powershell
# Rename your old folder to _BACKUP so nothing is lost
Rename-Item "C:\Users\LENOVO\OneDrive\Desktop\gaps ADI\gapsADI" `
            "C:\Users\LENOVO\OneDrive\Desktop\gaps ADI\gapsADI_BACKUP"
```

Your old work is now safely stored in `gapsADI_BACKUP`. It will not be touched.

---

### Step 2 — Clone the Repo (Fresh Copy from GitHub)

```powershell
# Navigate to the parent folder
cd "C:\Users\LENOVO\OneDrive\Desktop\gaps ADI"

# Clone — this creates a new clean gapsADI folder
git clone https://github.com/ayush2k5-cpu/gapsADI.git

# Enter the new folder
cd gapsADI
```

---

### Step 3 — Confirm You're on the Right Branch

The default branch is `dev`. Check with:

```powershell
git branch -a
git status
```

To see the most complete merged code (recommended):

```powershell
git checkout dev
git pull origin dev
```

> If your teammates' work is on `feature/modules`, `feature/backend`, or `feature/ui`, you can check those out too. The `dev` branch is the integration branch where all work is merged.

---

### Step 4 — Backend Setup

Open **Terminal Window 1** (keep this open):

```powershell
# From inside the gapsADI folder
cd "C:\Users\LENOVO\OneDrive\Desktop\gaps ADI\gapsADI\backend"

# Create a Python virtual environment
python -m venv venv

# Activate it (you must see (venv) in your prompt after this)
.\venv\Scripts\Activate.ps1

# If you get an execution policy error, run this ONCE then retry:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install all Python dependencies
pip install -r requirements.txt
```

---

### Step 5 — Configure Environment Variables

```powershell
# Still in backend\ with venv active
# Copy the example env file
copy .env.example .env
```

Now open `.env` in Notepad and fill in your real API keys:

```
GEMINI_API_KEY=your_actual_gemini_key_here
SARVAM_API_KEY=your_actual_sarvam_key_here
GROQ_API_KEY=your_actual_groq_key_here
DATABASE_URL=./scriptoria.db
```

> 📌 Get API keys from the team lead (A) via WhatsApp/Telegram before running.  
> ❌ Never commit `.env` — it's already in `.gitignore`.

---

### Step 6 — Verify Backend Setup

```powershell
# Still in backend\ with venv active
python scripts\verify_setup.py
```

Expected output (all green):
```
✅ Python version: 3.11.x — OK
✅ All packages importable — OK
✅ GEMINI_API_KEY found — OK
✅ SARVAM_API_KEY found — OK
✅ ChromaDB initializes — OK

ALL SYSTEMS GO
```

Fix any ❌ items before continuing.

---

### Step 7 — Load the RAG Corpus (Run Once)

This populates ChromaDB with the screenplay knowledge base. Takes ~2 minutes:

```powershell
# Still in backend\ with venv active
python scripts\load_scripts.py
```

Expected output:
```
Loading screenplay corpus...
Processed 28 scripts, 340 chunks
ChromaDB collection created: screenplays
✅ RAG corpus ready
```

---

### Step 8 — Frontend Setup

Open **Terminal Window 2** (keep Terminal 1 running):

```powershell
cd "C:\Users\LENOVO\OneDrive\Desktop\gaps ADI\gapsADI\frontend"

# Install all Node dependencies
npm install
```

---

## PART 3 — Running the Project (Every Time)

You need **two PowerShell windows open simultaneously**.

### Terminal Window 1 — Backend

```powershell
cd "C:\Users\LENOVO\OneDrive\Desktop\gaps ADI\gapsADI\backend"

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend is running when you see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

- **API Base URL:** http://localhost:8000  
- **Interactive API Docs:** http://localhost:8000/docs  

---

### Terminal Window 2 — Frontend

```powershell
cd "C:\Users\LENOVO\OneDrive\Desktop\gaps ADI\gapsADI\frontend"

# Start the frontend dev server
npm run dev
```

✅ Frontend is running when you see:
```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

Open **http://localhost:3000** in your browser — the app should load.

---

## PART 4 — Quick Sanity Test

With both servers running, test the main API endpoint in a third terminal:

```powershell
# Windows PowerShell version of the API test
Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/generate" `
  -ContentType "application/json" `
  -Body '{"story_idea": "A detective who cannot forget investigates his own past", "genre": "Thriller", "language": "English", "tone": 70}'
```

If you get back a JSON object with `project_id`, `screenplay`, and `characters` → **everything is working**.

---

## PART 5 — Pulling Teammate Changes (Run Anytime)

When teammates push new code, sync your local copy:

```powershell
cd "C:\Users\LENOVO\OneDrive\Desktop\gaps ADI\gapsADI"

# Pull latest from GitHub
git pull origin dev
```

Then restart both servers (Ctrl+C each, then re-run the start commands above).

---

## PART 6 — Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `cannot be loaded because running scripts is disabled` | PowerShell execution policy | Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `ModuleNotFoundError` | venv not activated | Run `.\venv\Scripts\Activate.ps1` — you must see `(venv)` in prompt |
| `401 Unauthorized` from Gemini | API key wrong or missing | Check `.env` is in `backend\`, check key has no spaces |
| `ChromaDB` error on startup | `load_scripts.py` not run yet | Run `python scripts\load_scripts.py` |
| `Port 8000 already in use` | Another server running | Kill it: `netstat -ano \| findstr :8000` then `taskkill /PID <PID> /F` |
| `npm install` fails | Node too old | Run `node --version` — needs 18+. Reinstall from nodejs.org |
| `SARVAM_API_KEY not found` | `.env` wrong location | Confirm `.env` is inside `backend\` folder, not the root folder |
| `verify_setup.py` not found | Wrong directory | Make sure you're in `backend\`, not root `gapsADI\` |
| `git pull` fails with conflicts | Local edits conflict | Run `git stash` first, then `git pull`, then `git stash pop` |

---

## PART 7 — Project Structure Reference

```
gapsADI/
├── backend/                  ← Python FastAPI server
│   ├── main.py               ← Main API app (start here)
│   ├── requirements.txt      ← Python dependencies
│   ├── .env.example          ← Copy this to .env and fill keys
│   ├── db.py                 ← SQLite database layer
│   ├── ai_client.py          ← Gemini / Groq AI integration
│   ├── exporter.py           ← PDF / DOCX / TXT export
│   ├── moodboard.py          ← Moodboard module
│   ├── mock_data.py          ← Fallback mock data
│   ├── rag/                  ← RAG (screenplay corpus) logic
│   └── scripts/
│       ├── verify_setup.py   ← Run to check your setup
│       └── load_scripts.py   ← Run once to load RAG corpus
├── frontend/                 ← Next.js 16 frontend
│   ├── app/                  ← Next.js app router pages
│   ├── components/           ← React components
│   ├── lib/                  ← Utility functions
│   └── package.json          ← Node dependencies
├── SETUP.md                  ← Original team setup guide
├── SETUP_ME_LOCAL.md         ← This file (Windows-specific)
└── TASK_TRACKER.md           ← Project task status
```

---

## PART 8 — Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | FastAPI | latest |
| Backend Server | Uvicorn | latest |
| AI (Primary) | Google Gemini API | via `google-generativeai` |
| AI (Fallback) | Groq API | via `requests` |
| AI (Local, Optional) | Ollama + Llama3 | latest |
| Vector DB | ChromaDB | latest |
| Embeddings | sentence-transformers | latest |
| PDF Export | ReportLab | latest |
| DOCX Export | python-docx | latest |
| Database | SQLite (file-based) | built-in |
| Frontend Framework | Next.js | 16.x |
| Frontend Language | TypeScript | 5.x |
| UI Library | React | 19.x |
| Styling | TailwindCSS | 4.x |
| Animations | Framer Motion | 12.x |
| Charts | Recharts | 3.x |
| Icons | Lucide React | latest |

---

*SETUP_ME_LOCAL.md — Windows PowerShell Edition | Last updated: 2026-05-16*
