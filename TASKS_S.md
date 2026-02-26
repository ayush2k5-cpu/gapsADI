# SCRIPTORIA — S's Task Playbook
**Role:** Pitch Master, Auditor, Time Keeper, Judge Q&A Owner
**Reports to:** A (final authority)

> You write no code. You touch no terminal.
> Your job is to make sure this team wins — and that means being everywhere A isn't.

---

## Your Hour-by-Hour Playbook

---

### Hour 0:00 – 0:30 | Absorb & Orient

**While A sets up the repo and P+G set up their environments:**

- [ ] Read `PROJECT_BRIEF.md` — fully, not skimmed
- [ ] Read `APP_FLOW.md` — understand the 3 screens and what fires when
- [ ] Read `API_CONTRACTS.md` — just the endpoint summaries (what each does, not the JSON details)
- [ ] Open `TASK_TRACKER.md` — this is now yours to maintain for the rest of the day
- [ ] Set up your workspace: laptop open, pitch tool ready (Canva / PowerPoint / Google Slides)

**By 0:30 you must be able to answer:**
- What does Scriptoria do in one sentence?
- What are the 5 things we're building today?
- What are the 3 awards we're targeting?
- What does A need from P before switching to UI?

---

### Hour 0:30 – 2:00 | Deep Product Understanding + Tracker Active

**Your tracker is live now. Update it every 20 minutes.**

To update the tracker:
- Check in with P and G verbally every 20 min ("what's your status?")
- Update TASK_TRACKER.md accordingly
- If something is marked 🔴 Blocked → immediately tell A (don't wait)

**While tracking, start absorbing the product deeply:**

- [ ] Re-read the demo story: *"A corrupt police officer in 1990s Hyderabad discovers his daughter leads the resistance."* Understand WHY this story was chosen (see PROJECT_BRIEF.md demo section).
- [ ] Understand the AD Intelligence Dashboard — what does health_score mean? What does a pacing dip look like? What does the tension curve show? You will explain this to judges.
- [ ] Understand the RAG angle — what does it mean that we "retrieve screenplay patterns"? Practice explaining it in plain English (not tech jargon).
- [ ] Understand the Sarvam angle — "Culturally Generated — Not Translated." Practice saying that phrase with conviction.

---

### Hour 2:00 – 4:00 | Pitch Deck

**Build the pitch deck. 7 slides. No more.**

Use Canva or PowerPoint. Apply Scriptoria's color scheme (dark backgrounds, white text — reference Design Doc if needed).

---

**SLIDE 1 — THE PROBLEM (30 seconds)**

Headline: `THE PRE-PRODUCTION WALL`

Body (3 bullet points):
- 6–8 weeks and ₹8–15 lakhs spent on script development before a single frame is shot
- Independent and regional filmmakers locked out by cost and access
- Existing AI tools are writing assistants — they stop at content generation

Visual: Split image — a filmmaker at a cluttered desk (left) vs empty timeline (right)

---

**SLIDE 2 — THE SOLUTION (30 seconds)**

Headline: `SCRIPTORIA`

Subheadline: *AI-Powered Film Pre-Production System*

Body: One idea in → complete pre-production package out.
Screenplay → Characters → AD Analysis → Moodboards → Multilingual → Export. 90 seconds.

Visual: Simple flow diagram of the pipeline (A can share a screenshot)

---

**SLIDE 3 — HOW IT WORKS — PART 1 (40 seconds)**

Headline: `NOT JUST GENERATION. ANALYSIS.`

Focus: The AD Intelligence Dashboard — this is our #1 differentiator.

Body:
- After generating the screenplay, the system analyzes it like a human AD would
- Pacing score. Character distribution. Tension arc. Scene-by-scene speed.
- Flags Act II dips before they become production problems
- Bidirectional: hover any scene → tension curve responds in real time

Visual: Screenshot of the AD Intelligence tab (A provides this — ask by Hour 3)

---

**SLIDE 4 — HOW IT WORKS — PART 2 (40 seconds)**

Headline: `RAG + CULTURAL DNA`

Two sub-points:

Left side — RAG:
"We retrieve structural patterns from a corpus of real screenplays.
Drishyam. Andhadhun. Chinatown. The output has real craft DNA — not generic AI text."

Right side — Sarvam AI:
"For regional languages, we don't translate.
Sarvam regenerates dialogue natively — how a Tamil or Telugu speaker actually talks.
Culturally Generated. Not Translated."

Visual: Split visual — screenplay snippet on one side, Hindi dialogue on other

---

**SLIDE 5 — TECH STACK (20 seconds)**

Headline: `BUILT ON THE RIGHT STACK`

Simple table or icons:
- Gemini 2.0 Flash — screenplay generation & analysis
- Ollama / Groq — character development
- ChromaDB + LangChain — RAG retrieval
- Sarvam AI — cultural dialogue generation
- Pollinations.ai — visual moodboards (free, unlimited)
- FastAPI + Next.js 14 — production-ready architecture

Bottom note: "Total infrastructure cost: ₹0"

---

**SLIDE 6 — IMPACT (30 seconds)**

Headline: `WHO THIS IS FOR`

Three columns:
- Independent Filmmakers: cuts pre-production from weeks to minutes
- OTT Content Creators: faster iteration, multilingual reach
- Film Schools: professional tooling at zero cost

Social impact callout: "Democratizing access to pre-production — from Mumbai to Madurai."

Bottom: "Designed for Rajinikanth's world. Capable of Nolan's craft. Built in India."

---

**SLIDE 7 — DEMO CTA (5 seconds)**

Just: `LET US SHOW YOU.`

No body text. Full screen dark background. That's it.

---

**After building the deck:**
- [ ] Time yourself reading all 7 slides aloud — target: 3 minutes flat
- [ ] Share the deck with A for a 5-minute review (send the link/file)

---

### Hour 4:00 – 5:00 | Demo Script + Team Brief

**Step 1: Write the demo script.**

Use this as the exact demo sequence (A drives the laptop, you narrate):

```
OPENING (you speak, A has Screen 1 open):
"Every great film starts with an idea. But between that idea and the first day of
shooting, there's a wall — weeks of formatting, planning, and costs that kill
independent films before they're made. We built something that removes that wall."

[Transition to demo]

STEP 1 — Input screen is visible:
Say: "One filmmaker. One idea. A corrupt police officer in 1990s Hyderabad —
      his daughter is the resistance leader working against him."
A: Types the story. Selects Thriller. English. Tone at 65.

STEP 2 — A clicks ROLL CAMERA:
Say: "Before we even call the AI, we retrieve structural patterns from a corpus of
      real screenplays — Drishyam, Andhadhun, Chinatown. The output has real craft DNA."
[Clapperboard animation plays]

STEP 3 — Loading screen:
Say: "Three systems fire in parallel. Screenplay generation. AD Intelligence analysis.
      Visual moodboard creation. All at once."
[Step dots fill]

STEP 4 — Screen 3 loads, screenplay visible on left:
Say: "Screenplay on the left. Courier Prime. Industry-standard formatting.
      This is ready to submit to a production house."
A: Scroll slowly through a few scenes.

STEP 5 — A hovers over scene 14:
Say: "Watch what happens when I hover over a scene."
[Tension curve point pulses]
Say: "The system links the screenplay to the analysis. Click any scene, jump to it
      in the chart. Bidirectional navigation."

STEP 6 — Point at the flag card:
Say: "And it caught something. A pacing dip in Act II — scenes 14 through 18.
      That's exactly what an Assistant Director does in a real production.
      Scriptoria does it in seconds."

STEP 7 — A clicks Moodboard tab:
Say: "Visual direction, per act. The tone was set toward Nolan-style —
      notice the desaturated palette."
[Show moodboard stack]

STEP 8 — A clicks Multilingual tab, clicks TRANSLATED toggle:
Say: "Sarvam AI. Not translation — dialogue regenerated natively in the target language.
      How a Telugu speaker actually talks. Cultural authenticity."
[Translated screenplay visible, highlight one dialogue line]

STEP 9 — A clicks PDF export button:
Say: "Production-ready output."
[File downloads]
A opens the PDF.
Say: "Courier Prime. Proper margins. Submit this to any production house today."

STEP 10 — You close:
Say: "Independent filmmaker. One idea. 90 seconds.
      A professional pre-production package — screenplay, analysis, visuals, multilingual.
      That is Scriptoria."
```

- [ ] Practice this script 2 full times before Hour 5
- [ ] Time it — target: 2 minutes for the demo section, 3 minutes for the pitch = 5 total
- [ ] Share with A for approval

---

**Step 2: Brief the team (by Hour 5)**

Tell P:
- "Judges may ask how the RAG works. Tell them: we embed screenplay scenes into ChromaDB,
  retrieve the top 3 matching patterns by genre and story similarity, inject them into the
  Gemini prompt before generation. Keep it to 3 sentences."

Tell G:
- "Judges may ask about the export quality. Tell them: we use ReportLab for PDF with proper
  screenplay margins, Courier font, and scene structure. It matches Final Draft output conventions."

Tell A:
- "Your job during demo is to click exactly what the script says. Do not improvise.
  If something breaks, stay calm and move to the next step. I'll cover verbally."

---

### Hour 5:00 – 5:30 | Final Checks + Rehearsal

- [ ] Run one full pitch + demo rehearsal with A driving the laptop
- [ ] Time the full 5 minutes — cut if over, slow down if under 4
- [ ] Take screenshots of every screen as demo fallback (in case backend fails):
  - Screen 1 (input filled in with demo story)
  - Screen 2 (loading with dots filled)
  - Screen 3 with AD Intelligence tab open
  - Screen 3 with Moodboard tab open
  - Screen 3 with Multilingual tab showing Hindi
  - PDF open on screen
  Save all screenshots in a folder named `DEMO_FALLBACK`
- [ ] Confirm pitch deck is on YOUR laptop AND on A's laptop (two copies minimum)
- [ ] Confirm the demo story is typed into the input field and ready to go

---

### Hour 5:30 – 6:00 | Standby

Code freeze has been called. You manage the room.

- [ ] Nobody touches code
- [ ] Keep everyone calm
- [ ] Do a final verbal check: "Everyone knows their role for the presentation?"
- [ ] Make sure the demo laptop has the browser open, server running, application loaded

---

## Judge Q&A — Prepared Answers

**"What makes this different from ChatGPT or other AI writing tools?"**
"Most AI tools stop at content generation — they're writing assistants. Scriptoria is a pre-production partner. It doesn't just write a script, it analyzes the script for pacing, character balance, and narrative tension the way an Assistant Director would. And it retrieves structural patterns from real screenplays through RAG — so the output has genuine craft DNA, not just AI-generated text."

**"How does the RAG system work?"**
Point to P. P answers in 3 sentences max.
[P's answer: "We embedded scene chunks from 28 real screenplays into a ChromaDB vector database using sentence embeddings. When a user submits a story idea, we retrieve the top 3 structurally similar scene patterns. These are injected into the Gemini prompt, giving the AI structural context from real films before it generates anything."]

**"What's the business model?"**
"SaaS. ₹999 per month for independent filmmakers. Film schools as anchor enterprise clients. The infrastructure cost is near zero — we use free API tiers — so the unit economics are strong from day one."

**"What about the Sarvam AI integration — why not just Google Translate?"**
"Translation loses the voice. A character from Madurai doesn't speak translated English — she speaks in a specific regional register, with specific idioms and rhythm. Sarvam was trained on Indian language data. We give it the scene's emotional intent and let it regenerate dialogue natively. The badge in the UI reads 'Culturally Generated — Not Translated.' That's the difference."

**"What's next for Scriptoria?"**
"MCP integration — Model Context Protocol. We're exposing Scriptoria as an MCP server so any AI tool that supports the protocol can call our pre-production pipeline as a tool. A filmmaker using Claude Desktop could say 'generate a thriller screenplay' and our system fires. That work starts tonight."

**If a judge asks something not on this list:**
"Great question. Let me have [P/G/A] speak to that specific detail." Don't guess. Route to the right person.

---

## Fallback Protocol (If Backend Fails at Demo Time)

If the backend is down or broken when we go up to present:

1. Stay calm. Don't announce it's broken.
2. Say: "Let me show you what Scriptoria produces." Open the DEMO_FALLBACK folder.
3. Walk through screenshots in order, narrating exactly as the demo script says.
4. When you reach export: show the PDF file (pre-export it during Hour 5:30).
5. At the end, say: "The live system is running — we'll be happy to show a full live demo during the evaluation window."

Judges care about the product vision and the quality of what you show. A screenshot walkthrough, done confidently, is better than a broken live demo done nervously.

---

*TASKS_S.md v1.0 | The team wins because you keep it on track.*
