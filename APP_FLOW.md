# SCRIPTORIA — Application Flow
**Version:** 1.0
**Primary reader:** P (backend must support this exact sequence)
**Secondary reader:** A (frontend state machine)

> This document defines what happens at every step of the user journey.
> Every API call, every state transition, every error case is specified here.
> P: if an endpoint you're building doesn't match what's described here, flag it to A immediately.

---

## Overview: Three Screens, One Pipeline

```
SCREEN 1: INPUT          SCREEN 2: LOADING          SCREEN 3: OUTPUT
(User fills form)   →   (APIs fire in parallel)  →  (Director's Table)
[No API calls]          [4 parallel API calls]       [On-demand calls]
```

---

## SCREEN 1 — Input / Landing

### What the user does
- Types a story idea (free text)
- Selects a genre (one of: Action / Drama / Thriller / Romance / Comedy / Horror)
- Selects a language (one of: English / Hindi / Tamil / Telugu / Bengali)
- Adjusts tone slider (0 = Masala, 100 = Nolan)
- Clicks ROLL CAMERA

### What happens on ROLL CAMERA click
1. Frontend validates: story_idea must be 10+ characters, genre and language must be selected
2. If validation fails: show inline error, do NOT navigate
3. If validation passes:
   - Play clapperboard animation (frontend only, ~300ms)
   - Store form values in session state
   - Navigate to Screen 2

### API calls: None on Screen 1

### Session state after Screen 1:
```json
{
  "input": {
    "story_idea": "user's text",
    "genre": "Thriller",
    "language": "English",
    "tone": 65
  },
  "project_id": null,
  "screenplay": null,
  "characters": [],
  "analysis": null,
  "moodboards": [null, null, null],
  "translated_screenplay": null
}
```

---

## SCREEN 2 — Generation / Loading

### What triggers Screen 2
Navigation from Screen 1 after ROLL CAMERA. Screen 2 fires API calls immediately on mount.

### API calls (4 total, firing sequence matters)

**Phase 1 — Fire immediately on Screen 2 mount:**
```
POST /api/generate    ← fires first, alone
```

**Phase 2 — Fire simultaneously AFTER /api/generate succeeds:**
```
POST /api/analyze     ←┐
POST /api/moodboard (act=1) ←┤ all three fire in parallel
POST /api/moodboard (act=2) ←┤ using Promise.all()
POST /api/moodboard (act=3) ←┘
```

**Why this sequence:**
`/api/analyze` needs the `project_id` from `/api/generate`.
Moodboard calls need the `project_id` too. None of them can fire before generate completes.
But analyze and all 3 moodboard calls are independent of each other, so they run in parallel.

### Step dot progression (Screen 2 UI)

```
Dot 1 fills: POST /api/generate — request sent
Dot 2 fills: POST /api/generate — response received, project_id stored
Dot 3 fills: POST /api/analyze — response received
Dot 4 fills: POST /api/moodboard (act 1 + act 2) — both received
Dot 5 fills: POST /api/moodboard (act 3) — received
```

When dot 5 fills → wait 300ms → navigate to Screen 3.

### Frontend code pattern for Screen 2 (A implements):
```typescript
useEffect(() => {
  const runPipeline = async () => {
    // Phase 1
    setDot(1);
    const genResult = await generateScreenplay(inputFromState);
    setDot(2);
    storeInSession({ project_id: genResult.project_id, screenplay: genResult.screenplay, characters: genResult.characters });

    // Phase 2 — parallel
    const [analysis, mood1, mood2, mood3] = await Promise.all([
      analyzeScreenplay({ project_id: genResult.project_id }),
      getMoodboard({ project_id: genResult.project_id, act: 1 }),
      getMoodboard({ project_id: genResult.project_id, act: 2 }),
      getMoodboard({ project_id: genResult.project_id, act: 3 }),
    ]);
    setDot(3); // analysis done
    setDot(4); // moods 1+2 done
    setDot(5); // mood 3 done

    storeInSession({ analysis, moodboards: [mood1, mood2, mood3] });
    setTimeout(() => router.push('/output'), 300);
  };

  runPipeline();
}, []);
```

### Error handling on Screen 2

| Scenario | What happens |
|----------|-------------|
| `/api/generate` fails | Show error banner: "Generation failed — [error message]. Go back and try again." Do NOT navigate to Screen 3. |
| `/api/analyze` fails | Navigate to Screen 3 anyway. AD Intelligence tab shows safe default values (all 50s). Show small warning badge on tab. |
| One moodboard call fails | Navigate to Screen 3 anyway. That act's moodboard card shows placeholder image + caption. |
| All moodboard calls fail | Navigate to Screen 3. Moodboard tab shows 3 placeholder cards. |
| `/api/generate` rate limited (429) | Show: "AI is busy — please wait 10 seconds and try again." Stay on Screen 2. Add retry button. |

### Status text cycling (Screen 2 UI — cosmetic, not tied to actual API progress)
```
"STRUCTURING YOUR NARRATIVE..."   → shows while dot 1 is active
"WRITING YOUR SCREENPLAY..."      → shows while dot 2 is active
"RUNNING AD INTELLIGENCE..."      → shows while dot 3 is active
"GENERATING VISUAL MOODBOARDS..."  → shows while dots 4–5 are active
```

---

## SCREEN 3 — Output / Director's Table

### What's loaded on Screen 3 mount
Everything comes from session state — no new API calls on mount.

```
Left panel:  screenplay (from session)
Tab 1 (AD):  analysis data (from session)
Tab 2 (Characters): characters array (from session)
Tab 3 (Moodboard): moodboards[0,1,2] (from session)
Tab 4 (Multilingual): empty until user requests translation
```

### Tab: AD Intelligence (default active)
No API call. Renders from `session.analysis`.

If `session.analysis` is the safe default (all 50s due to analyze failure):
- Render normally — judges won't know the difference in a demo
- Show small badge: "Analysis used defaults" in muted color

Interactive elements:
- Hover any scene block in left screenplay panel → corresponding tension curve point pulses
- Click "Refine Act II" button in flag card → this is a stretch goal, only implement if P has time

### Tab: Characters
No API call. Renders `session.characters` array as Chroma Grid cards.

### Tab: Moodboard
No API call. Renders `session.moodboards[0,1,2]` as Stack component.
If any moodboard image_url fails to load in `<img>` → show caption-only card, no broken image icon.

### Tab: Multilingual
**On-demand — API call fires only when user interacts.**

Default state: Toggle shows "ORIGINAL" active. Screenplay panel shows English screenplay.

User clicks "TRANSLATED" toggle:
1. Check if `session.translated_screenplay` is already populated
2. If yes → swap display immediately (no API call)
3. If no → call `POST /api/translate` with `{ project_id, target_language: session.input.language }`
4. On response → store in `session.translated_screenplay` → swap display
5. On failure → show toast: "Translation unavailable — showing original" → stay on ORIGINAL

**Never call `/api/translate` twice for the same language.** Cache the result in session state.

Note: Translation language is the same language selected on Screen 1. If user selected English on Screen 1, the Multilingual tab is hidden or disabled (nothing to translate).

### Export buttons (top bar)
User clicks PDF / DOCX / TXT:
1. Call `POST /api/export` with `{ project_id: session.project_id, format }`
2. On response (Blob) → trigger browser download
3. On failure → show toast: "Export failed — try again"

```typescript
// Export pattern (A implements)
const handleExport = async (format: "pdf" | "docx" | "txt") => {
  const blob = await exportScreenplay({ project_id: session.project_id, format });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Scriptoria_${session.project_id.slice(0, 8)}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### Error banner pattern (applies across all screens)
```typescript
// Small, dismissible, non-blocking
// Position: top of right panel, below tab bar
// Style: bg #5b0e14, border 1px #f1e194, text #f1e194 (Pair 1 warning colors)
// Auto-dismiss after 5 seconds
```

---

## Complete Session State Shape

```typescript
interface SessionState {
  input: {
    story_idea: string;
    genre: string;
    language: string;
    tone: number;
  };
  project_id: string | null;
  screenplay: string | null;
  scene_count: number;
  characters: Character[];
  analysis: AnalyzeResponse | null;
  moodboards: [MoodboardResponse | null, MoodboardResponse | null, MoodboardResponse | null];
  translated_screenplay: string | null;
}
```

State management: Next.js `useState` + `sessionStorage` for persistence across page navigations.
On Screen 2 mount, restore state from `sessionStorage` if it exists (handles refresh edge case).

---

## Summary: Which API calls fire when

| Trigger | API Call | Parallel With |
|---------|----------|---------------|
| Screen 2 mounts | POST /api/generate | Nothing — fires alone first |
| /api/generate succeeds | POST /api/analyze | /api/moodboard × 3 |
| /api/generate succeeds | POST /api/moodboard (act 1) | /api/analyze, moodboard 2+3 |
| /api/generate succeeds | POST /api/moodboard (act 2) | /api/analyze, moodboard 1+3 |
| /api/generate succeeds | POST /api/moodboard (act 3) | /api/analyze, moodboard 1+2 |
| User clicks "TRANSLATED" toggle | POST /api/translate | Nothing |
| User clicks PDF/DOCX/TXT | POST /api/export | Nothing |

---

*APP_FLOW.md v1.0 | Owner: A | Last updated: Pre-hackathon*
