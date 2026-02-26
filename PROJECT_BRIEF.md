# SCRIPTORIA — Project Brief
**Hackathon:** GENAI Forge @ ICFAI Bangalore | Powered by Nasscom & FutureSkills Prime
**Version:** 1.0 — Read this first. No debates after.

---

## What We're Building

Scriptoria is a Generative AI–powered film pre-production system that takes a raw story idea
and produces a complete pre-production package: a professionally formatted screenplay,
character profiles, AD Intelligence analysis, visual moodboards, and multilingual dialogue —
in one pipeline, in under 2 minutes.

**The pitch in one line:**
*"What takes an independent filmmaker 6 weeks and ₹10 lakhs, Scriptoria does in 90 seconds."*

---

## The Problem

Film pre-production is broken for independent creators:

- **Time:** Script formatting, character breakdowns, and production planning take weeks
- **Cost:** Script consultants, pre-production planners, and formatting tools cost lakhs
- **Access:** Regional and independent filmmakers have no affordable, culturally relevant tools
- **The gap:** Existing AI writing tools stop at text generation — they are writing assistants, not pre-production partners

---

## Why Ours Is Different (The Real Differentiators)

**1. AD Intelligence Layer** — Not just generation, but analysis.
After generating the screenplay, the system analyzes it like a human Assistant Director would:
pacing score, character distribution balance, tension arc curve, scene-by-scene speed assessment.
It flags problems and suggests specific fixes. No competitor does this in one pipeline.

**2. RAG-Powered Generation** — Not just prompting an LLM.
We retrieve structural patterns from a corpus of real screenplays (Drishyam, Andhadhun,
Nayakan, Chinatown, Heat, etc.) and inject that craft knowledge into generation.
The output reads like a real film, not a writing exercise.

**3. Cultural DNA, Not Translation** — Sarvam AI generates dialogue natively.
When a user selects Tamil or Hindi, Sarvam doesn't translate English dialogue —
it regenerates dialogue from the scene's intent in that language, capturing native
speech patterns, idioms, and cultural register. Badge reads: "Culturally Generated — Not Translated."

**4. India to Global** — One tone slider covers both worlds.
Tone 0 = full Masala (Rajinikanth energy, dramatic BGM, larger-than-life dialogue).
Tone 100 = Nolan architecture (psychological complexity, restrained dialogue, structural depth).
The system generates for both ends of the spectrum with the same pipeline.

---

## Judging Criteria → Our Answer

| Criterion | What We Have |
|-----------|--------------|
| **Uniqueness & creative approach** | AD Intelligence Dashboard + RAG corpus + Cultural DNA generation + bidirectional screenplay↔chart linking |
| **Code quality & tech usage** | Typed FastAPI, modular architecture, two-model routing (Gemini + Ollama/Groq), LangChain RAG, SQLite persistence |
| **Real-world applicability** | Indian filmmakers, OTT content creators, film schools — real workflow, real file outputs |
| **Demo clarity** | Scripted 5-minute demo, every click planned, every word timed, fallback screenshots ready |
| **Fully functional prototype** | Complete pipeline: input → generate → analyze → moodboard → translate → export |

---

## Awards Strategy

| Award | Why We Win It | What Judges See |
|-------|--------------|-----------------|
| **Grand Winner** | Most complete, most technically deep submission | Full working pipeline, real AI models, real exports |
| **Best UI/UX Design** | Bidirectional screenplay↔chart linking, cinematic dark theme, Courier Prime screenplay view, linked animations | The linked hover interaction between screenplay panel and tension curve — judges haven't seen this |
| **Best Innovation** | RAG-powered generation + AD Intelligence + Cultural generation trifecta | Judges who understand AI will recognize the RAG + analysis combination as genuinely novel |

---

## Scope

### IN SCOPE — Must work at demo time
- [ ] Story input → screenplay generation (Gemini 2.0 Flash + RAG)
- [ ] Character profiles (Ollama/Groq)
- [ ] AD Intelligence Dashboard (health score, tension curve, character heatmap, pacing blocks)
- [ ] Visual moodboards (Pollinations.ai, per act)
- [ ] Multilingual dialogue (Sarvam AI, on-demand)
- [ ] Export: PDF + DOCX + TXT
- [ ] SQLite project persistence

### OUT OF SCOPE — Do not build, do not discuss mid-hackathon
- MCP server (post-hackathon, before evaluation — already planned)
- User accounts / authentication / login
- Voice input / speech-to-text
- Collaboration features (multi-user)
- Payment / pricing
- Mobile responsiveness (desktop only)
- Saving multiple projects (single session is fine)

---

## Non-Negotiables (Cannot Cut Under Any Pressure)

1. **Screenplay viewer in Courier Prime** — This is what tells judges we understand filmmaking
2. **AD Intelligence with real data** — This is our core differentiator. Defaults (all 50s) are acceptable as fallback, but the UI must be present and functional
3. **At least one working export format** — PDF is priority, DOCX second, TXT last resort
4. **The linked screenplay↔tension curve hover** — This is what wins Best UI/UX

---

## Cut Priority (If Time Runs Short)

Cut in this order. Stop cutting when you have enough time:

1. **Cut first:** Multilingual (Sarvam tab) — pitch it as "integrated, demoed on request"
2. **Cut second:** Moodboard (Pollinations) — show placeholder images with captions
3. **Never cut:** Screenplay viewer, AD Intelligence Dashboard, Export

---

## Team Roles

| Person | What They Do | What They Do NOT Do |
|--------|-------------|---------------------|
| **A (Lead)** | Hour 0–1: FastAPI skeleton + /api/generate + AD prompt template. Hour 1–6: All UI. Final integration + merges. | No backend after Hour 1 except critical breakage |
| **P (Backend)** | mock_data.py → RAG setup → /api/translate (Sarvam) → /api/analyze (AD Intelligence). Builds on A's skeleton. | No UI. No export module. No testing. |
| **G (Modules)** | verify_setup.py → /api/moodboard → /api/export → end-to-end testing. | No RAG. No LLM calls. No UI. |
| **S (Pitch)** | Product absorption → pitch deck → demo script → team brief → rehearsal. | No code whatsoever. |

**Overlap rule:** If you finish your tasks early, tell S. S will assign you something from the tracker.
**Conflict rule:** If two people need the same file, tell A. A decides.

---

## Hour Checkpoints

| Time | Milestone | Who Checks |
|------|-----------|-----------|
| Hour 1:00 | A hands off backend. `/api/generate` returns valid JSON. | A verifies, tells S. |
| Hour 2:00 | RAG integrated. P starts Sarvam. G has moodboard done. | S marks tracker. |
| Hour 3:30 | AD Intelligence endpoint working. Export module done. | G tests, S marks. |
| Hour 4:00 | A merges `feature/backend` + `feature/modules` → `dev`. Full pipeline test. | A runs test, all hands. |
| Hour 5:30 | **CODE FREEZE.** No new features. Bugfixes only. | A calls it. |
| Hour 6:00 | Demo. | S runs it. |

---

## If Something Breaks at Hour 5

Priority order for emergency fixes:
1. Fix the core pipeline first (generate → screenplay viewer on screen)
2. Fix export second (PDF must work)
3. Fix AD Dashboard third (even safe defaults are fine)
4. Let multilingual and moodboard break — S covers it in pitch as "shown on request"

**Do NOT spend Hour 5 adding new features. Ship what works.**

---

## The Demo Story (Everyone Must Know This)

The story we use for the live demo:
> *"A corrupt police officer in 1990s Hyderabad discovers his daughter is the anonymous leader of a resistance movement against him."*
> Genre: **Thriller** | Language: **English** | Tone: **65** (toward Nolan)

This story is chosen because it:
- Works great for a thriller AD Intelligence analysis (natural pacing dips to flag)
- Has a strong character relationship (natural heatmap contrast)
- Has cinematic visual potential (moodboard will look good)
- Is culturally grounded (Hyderabad setting, Indian names)

Stick to this story for the demo. Do not improvise a different one under pressure.

---

## Contact During Hackathon

All blockers → tell S first. S decides if A needs to be interrupted.
A should not be interrupted during UI build (Hour 1–4) unless it's a blocker that stops P or G completely.

---

*PROJECT_BRIEF.md v1.0 | Read once. Internalize. Refer back when confused.*
