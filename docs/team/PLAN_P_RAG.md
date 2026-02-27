# PLAN_P — RAG Fix & Corpus Seeding
**Branch:** `feature/backend` | **Owner:** P | **Merges into:** `dev`
**Estimated time:** 2–3 hrs (corpus is the heavy work — quality over speed)

---

## Context (Read Before Starting)

### What Already Exists — Do NOT Recreate

| File | Status | Your job |
|------|--------|----------|
| `backend/rag/chroma_setup.py` | ✅ Complete | Do not touch |
| `backend/rag/load_scripts.py` | ✅ Complete | Do not touch |
| `backend/rag/retriever.py` | ✅ Complete | Do not touch |
| `backend/rag/__init__.py` | ✅ Exists | Do not touch |
| `backend/main.py` | ✅ Complete | **One-line add only** (see below) |
| `backend/scripts/sample_thriller.txt` | ✅ 182 lines, already present | Keep it, do not delete |
| `backend/chroma_db/chroma.sqlite3` | ⚠️ Exists but empty collection | Will be auto-populated at startup |

### Why RAG Is Currently Inactive

`load_scripts.py` has a `load_all_scripts()` function that seeds ChromaDB. It is **idempotent** (skips if collection already has documents). The problem: **nobody calls it at startup**. The `startup()` handler in `main.py` only calls `db.init_db()`. ChromaDB collection has 0 documents → every `retrieve_context()` call returns `""` → RAG context is silently skipped in the Gemini prompt.

### How the RAG Pipeline Works (End-to-End)

```
scripts/*.txt ──► load_all_scripts() ──► chunks by INT./EXT. boundaries
                                      ──► upserted into ChromaDB collection "screenplays"
                                      ──► uses SentenceTransformer all-MiniLM-L6-v2 for embeddings

/api/generate called ──► retrieve_context(story_idea, genre) ──► ChromaDB vector query
                      ──► returns top 3 matching scene chunks as formatted string
                      ──► injected into Gemini prompt as structural reference
                      ──► "Do not copy — use for structure and pacing"
```

---

## Your Tasks

### TASK P-A: Activate RAG at Startup (5 min)

**File:** `backend/main.py`
**Location:** The `startup()` function, lines 42–48. Currently:

```python
@app.on_event("startup")
async def startup() -> None:
    """Initialise the database on application startup."""
    try:
        db.init_db()
    except Exception as exc:
        logger.error("Failed to init DB: %s", exc)
```

**Change to:**

```python
@app.on_event("startup")
async def startup() -> None:
    """Initialise the database and seed ChromaDB RAG corpus on startup."""
    try:
        db.init_db()
    except Exception as exc:
        logger.error("Failed to init DB: %s", exc)

    try:
        from rag.load_scripts import load_all_scripts
        load_all_scripts()
        logger.info("startup: RAG corpus loaded")
    except Exception as rag_exc:
        logger.warning("startup: RAG seeding failed (non-fatal) — %s", rag_exc)
```

**Rules:**
- The RAG load is **non-fatal** — if it fails (missing deps, bad file), the server still starts
- `load_all_scripts()` is already idempotent — it skips if documents already exist
- The import is inside the try block intentionally — mirrors the pattern already used in `generate_pipeline()`
- Do **not** change anything else in `main.py`

---

### TASK P-B: Build the Cinematic History Archive Corpus (2–3 hrs)

This is the **most important and highest-impact task** in the entire RAG pipeline. The richer and more diverse the corpus, the better ChromaDB's vector embeddings, which means:
- Retrieval surfaces structurally precise, genre-authentic scene patterns
- Gemini's prompt gets real cinematic DNA as grounding → less creative hallucination
- Two different story ideas will retrieve genuinely different structural guidance

**Location:** `backend/scripts/`

---

#### The Corpus Philosophy

Think of this as building a **100-year film history archive** — a curated collection of screenplay scene excerpts that represent how cinema has told stories across eras, regions, and genres.

Each file = one **era × genre × region** intersection. The ChromaDB retriever will match a user's story idea to the most semantically relevant chunks from this archive and inject them into the Gemini prompt as structural patterns.

---

#### ⬇️ How to Get the Scripts — DO NOT Write From Scratch

Use real publicly available screenplays. This saves hours and produces better embeddings.

**Hollywood / International — direct text downloads:**

| Source | URL | What to grab |
|--------|-----|-------------|
| **IMSDB** | `https://imsdb.com` | Search any film → "Read Script" → Select All → paste to `.txt` |
| **The Daily Script** | `https://www.dailyscript.com` | Many have direct `.txt` links |
| **Simply Scripts** | `https://www.simplyscripts.com` | Large library, use the genre filters |

**Indian Cinema:**

| Source | URL | What to grab |
|--------|-----|-------------|
| **Scrite.io** | `https://scrite.io` | *Andhadhun*, *3 Idiots*, *PK*, *Dangal*, *Rang De Basanti* |
| **SCRIPTick.in** | `https://scriptick.in` | Bollywood scripts, some downloadable |
| **MoiFightClub** | `https://moifightclub.com` | *Dev D*, *Raman Raghav 2.0*, arthouse Indian |
| **FilmmakersFans** | `https://filmmakersfans.com` | *Kahaani*, *NH10*, *Badlapur* |

**Download workflow (5 steps per script):**
1. Open the script page → Select All text → Paste into a new `.txt` file
2. Scan the file — confirm it has lines starting with `INT.` or `EXT.` (most real screenplays do)
3. Light cleanup if needed: remove any HTML artifacts, page headers, watermarks
4. Rename using the convention `{era}_{genre}_{region}.txt`
5. Quick check: count INT./EXT. occurrences — should be ≥ 10 per file

> ⚠️ PDFs from Scrite/SCRIPTick: Open in browser → Ctrl+A → Ctrl+C → paste to `.txt`. Some PDFs lose indentation — spot check that CHARACTER names and dialogue look reasonably formatted. The chunker only hard-requires `INT.`/`EXT.` headings to work.

**Target per file: 150–400 lines, ≥ 10 scene headings.**

---

#### File Naming Convention

```
backend/scripts/{era}_{genre}_{region}.txt
```

Examples: `golden_age_thriller_indian.txt`, `newwave_drama_european.txt`, `modern_action_indian.txt`

---

#### CORPUS MATRIX — Files to Build

Minimum **15 files**. Aim for 20 if time allows. Each file: **200–400 lines**, minimum **10 INT./EXT. scene headings**.

---

##### ERA 1 — Classic / Golden Age (1920s–1960s)

**`classic_drama_indian.txt`**
- Source from: *Mother India*, *Pyaasa*, *Kaagaz Ke Phool*, *Do Bigha Zamin* — search IMSDB or Scrite
- Structural DNA: social realism, rural poverty, sacrifice as dramatic engine, fate vs. agency
- Scene vocabulary: village fields, zamindari courts, urban slums, railway platforms at dusk
- Dialogue style: poetic, slightly formal, characters speak in metaphor

**`classic_thriller_hollywood.txt`**
- Source from: *Double Indemnity*, *Rear Window*, *Touch of Evil*, *The Maltese Falcon* — IMSDB has all of these
- Structural DNA: femme fatale introduction, clue reveal through object (not exposition), moral compromise
- Scene vocabulary: rain-soaked streets, venetian blind shadows, diner booths, dockside
- Dialogue style: hard-boiled, subtext-heavy, every line advances plot or reveals character

**`classic_romance_indian.txt`**
- Source from: *Mughal-E-Azam*, *Awaara*, *Shree 420* — search Scrite or MoiFightClub
- Structural DNA: class divide as obstacle, forbidden love, sacrifice as proof of love
- Scene vocabulary: Mughal courts, rooftop terraces by moonlight, crowded bazaars
- Dialogue style: elevated, romantic, classical Urdu/Hindi register

---

##### ERA 2 — New Wave & Parallel Cinema (1960s–1980s)

**`newwave_drama_european.txt`**
- Source from: *Bicycle Thieves*, *The 400 Blows*, *Wild Strawberries* — IMSDB / Simply Scripts
- Structural DNA: open endings, character observed not judged, social system as antagonist
- Scene vocabulary: apartment stairwells, city streets at midday, employment offices
- Dialogue style: naturalistic, incomplete sentences, silence as punctuation

**`parallel_drama_indian.txt`**
- Source from: *Ankur*, *Ardh Satya*, *Manthan* — MoiFightClub / FilmmakersFans
- Structural DNA: systemic corruption as obstacle, protagonist's compromise arc, caste dynamics in subtext
- Scene vocabulary: cooperative societies, police stations, village panchayats
- Dialogue style: naturalistic Hindi/Marathi register, understatement

**`newwave_thriller_korean.txt`**
- Source from: *Memories of Murder*, *Sympathy for Mr. Vengeance* — IMSDB / Simply Scripts
- Structural DNA: investigation that implicates the investigator, ambiguous moral resolution
- Scene vocabulary: rice fields, interrogation rooms, industrial outskirts, convenience stores 3am
- Dialogue style: sparse, long silences, sudden bursts, black humour in crisis

---

##### ERA 3 — Commercial Peak & Blockbuster Era (1980s–2000s)

**`masala_action_indian.txt`**
- Source from: *Sholay*, *Agneepath*, *Sarkar*, *Company* — Scrite / SCRIPTick
- Structural DNA: hero's origin wound, mentor lost at Act II midpoint, villain's philosophy scene
- Scene vocabulary: village attacked at dawn, underworld den, open-road showdown
- Dialogue style: punchy, quotable, dramatic pause before key lines

**`masala_romance_bollywood.txt`**
- Source from: *DDLJ*, *Kuch Kuch Hota Hai*, *Dil Chahta Hai* — Scrite / SCRIPTick
- Structural DNA: long Act I courtship, separation as Act II engine, emotional climax at transport hub
- Scene vocabulary: European locations, college campuses, wedding mandap, airport departures
- Dialogue style: emotionally direct, mix of Hindi and English

**`comedy_ensemble_indian.txt`**
- Source from: *Andaz Apna Apna*, *Hera Pheri*, *Delhi Belly* — MoiFightClub / Scrite
- Structural DNA: mismatched duo/trio, cascading misunderstandings, villain accidentally self-defeats
- Scene vocabulary: rundown offices, cramped apartments, police station cells
- Dialogue style: rapid-fire, overlapping in chaos scenes, malapropisms

**`horror_atmospheric_indian.txt`**
- Source from: *Tumbbad*, *Stree*, *Bhoot* — FilmmakersFans / MoiFightClub
- Structural DNA: folk legend in Act I, protagonist's greed as self-created danger, cost of transgression
- Scene vocabulary: crumbling havelis, fog-covered village 3am, underground chambers
- Dialogue style: flat when terrified — fear shown through behaviour not dialogue

---

##### ERA 4 — Contemporary & OTT (2010s–Present)

**`prestige_thriller_indian.txt`**
- Source from: *Andhadhun*, *Drishyam*, *Article 15*, *Talvar* — Scrite / SCRIPTick
- Structural DNA: unreliable narrator, Act II reveal recontextualises Act I, open ending
- Scene vocabulary: suburban apartment, police interview room, courtroom, small-town streets
- Dialogue style: controlled, irony in calm moments, truth revealed sideways

**`ott_drama_realist.txt`**
- Source from: *Delhi Crime*, *Scam 1992*, *Panchayat* — MoiFightClub / FilmmakersFans
- Structural DNA: slow-burn character study, institution as antagonist, arc visible only through action
- Scene vocabulary: government offices, rural infrastructure, financial trading floors
- Dialogue style: hyper-naturalistic, regional inflections, jargon-specific to institution

**`modern_action_masala.txt`**
- Source from: *RRR*, *KGF*, *Vikram*, *Pushpa* — Scrite / SCRIPTick
- Structural DNA: mythological hero framing, loyalty-betrayal-loyalty arc, spectacle every 15 pages
- Scene vocabulary: forest/tribal settings, colonial architecture, mining operations, mass crowds
- Dialogue style: declarative, mythological register, third-person self-reference in key moments

**`arthouse_minimal_global.txt`**
- Source from: *Parasite*, *Drive My Car*, *All Quiet on the Western Front* — IMSDB / Simply Scripts
- Structural DNA: symbol-heavy action lines, theme never stated, stillness as climax
- Scene vocabulary: architecturally precise interiors, nature as counterpoint to violence
- Dialogue style: oblique, long pauses bracketed by action lines

**`social_drama_contemporary.txt`**
- Source from: *Newton*, *Masaan*, *Thappad*, *Court* — Scrite / MoiFightClub
- Structural DNA: everyday injustice as tension, no villain — system is antagonist, understated climax
- Scene vocabulary: lower court waiting rooms, rural polling stations, middle-class apartments
- Dialogue style: natural speech, power dynamics in who speaks vs. who stays silent

---

#### Format Rules (CRITICAL — the loader splits on these)

Every file **must** follow standard screenplay format or `load_scripts.py` will not chunk correctly:

```
INT. LOCATION - TIME        ← Scene heading (triggers a new chunk)

Action line describing what we see. Characters move through space.
Atmosphere established in present tense.

                    CHARACTER NAME
          Dialogue indented like this.
          Continuation on next line.

Another action line. Things happen.

EXT. LOCATION - TIME        ← New scene heading = new chunk

...
```

**Hard rules:**
- Scene headings MUST start with `INT.` or `EXT.` — the chunker splits exactly on these
- Chunks shorter than 50 characters are filtered out — keep scenes substantial
- Dialogue indentation: character name ~20 spaces in, dialogue ~10 spaces in (match `sample_thriller.txt` exactly)
- No markdown, no headers, no `---` dividers — plain text only

---

### TASK P-C: Verify RAG Is Working (10 min)

After adding the corpus and making the startup change, restart the server and check:

**Step 1 — Check startup logs:**
```
uvicorn main:app --reload
```
Look for these lines in the console:
```
load_all_scripts: added N chunks from 'classic_drama_indian.txt'
load_all_scripts: added N chunks from 'masala_romance_bollywood.txt'
...
load_all_scripts: finished — N total chunks loaded
startup: RAG corpus loaded
```

**Step 2 — Verify retrieval works:**
Open a Python shell in the `backend/` directory with the venv activated:
```python
from rag.retriever import retrieve_context
result = retrieve_context("police corruption family betrayal", "Thriller")
print(len(result))   # Should be > 0
print(result[:300])  # Should show a chunk from the corpus

result2 = retrieve_context("star-crossed lovers class divide India", "Romance")
print(len(result2))  # Should also be > 0 and different content from result
```
If `len(result) == 0` → corpus wasn't loaded. Check logs.

**Step 3 — Verify /api/generate uses RAG:**
Call the generate endpoint and watch the server logs for:
```
generate_pipeline: RAG context retrieved (N chars)
```
If you see instead `generate_pipeline: RAG unavailable — proceeding without context` → check the retriever's error log output.

**Step 4 — Idempotency check:**
Restart the server a second time. Logs should show:
```
load_all_scripts: collection already has N documents, skipping load
```
Not re-loading every restart.

---

## Merge Protocol

### Branch Rules
- Work only on `feature/backend`
- Only files you should change: `backend/main.py` (startup function only) + add files to `backend/scripts/`
- Do **not** touch any other files — no frontend, no rag/*, no db.py, no ai_client.py

### Commit Structure
Make **three separate commits:**

```bash
git commit -m "[P]: activate RAG at startup — call load_all_scripts() in main.py startup handler"
git commit -m "[P]: add corpus era 1-2 — classic/golden age + new wave screenplay archives"
git commit -m "[P]: add corpus era 3-4 — commercial/blockbuster + contemporary OTT archives"
```

### Before Merge Check
Confirm these before handing off to A for merge:
- [ ] Server starts without errors
- [ ] `load_all_scripts: finished — N total chunks` appears in startup logs (**N > 500** for full corpus)
- [ ] `retrieve_context("police corruption family betrayal", "Thriller")` returns non-empty string
- [ ] `retrieve_context("star-crossed lovers class divide India", "Romance")` returns a different non-empty string
- [ ] Second restart shows "skipping load" (idempotent)
- [ ] `backend/scripts/` has **minimum 16 files** (1 existing + 15 new)
- [ ] Only `main.py` and `scripts/*.txt` are in the diff — no other file changes

---

## Sarvam API Key Note

The `backend/.env` should have `SARVAM_API_KEY` set. The translate endpoint (`/api/translate`) uses it. If the key is missing or invalid, the translate endpoint will **fail gracefully** and return the original English screenplay with `"fallback": true` — this is by design and won't break anything. Your work (RAG) is not affected by Sarvam key status.

To verify Sarvam key is present:
```python
import os
from dotenv import load_dotenv
load_dotenv()
print(os.getenv("SARVAM_API_KEY"))  # Should not be None or "your_key_here"
```
If it's missing, flag to A immediately.
