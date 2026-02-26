# SCRIPTORIA
### Design & Guidelines Document
AI-Powered Film Pre-Production System
Version 1.0 — Finalized

---

## 01. PROJECT OVERVIEW

Scriptoria is a cinematic AI tool that takes a raw story idea and produces a full
pre-production package: screenplay, character profiles, AD Intelligence analysis,
multilingual dialogue, and visual moodboards.

**Design goal:** Win Best UI/UX at a hackathon. Must feel like an actual product —
not a student project.

**Reference aesthetic:** DaVinci Resolve × Linear.app × a director's darkroom.

**Target viewport:** 1440px wide desktop.

---

## 02. DESIGN PHILOSOPHY

### Two-Layer Color System
The entire visual language is built on a strict two-layer separation:

| Layer | What it covers | Colors used |
|---|---|---|
| Layer 1 — Identity | Logo, CTAs, nav, top bar, scrollbars, step dots | Black & White only |
| Layer 2 — Content | Each tab/section inside the output screen | 6 designated color pairs |

**The rule is absolute:** UI chrome never gets color. Content sections never share
each other's color pair. The screenplay panel belongs to neither layer — it is a
permanent neutral zone.

### Core Principles (Non-Negotiable)

1. **Dark first.** Every background is dark. No white screens anywhere, ever.
2. **B&W for chrome.** Logo, buttons, nav — monochromatic. Restrained = premium.
3. **Color pairs for content.** Each section owns one pair. Never decorative, always semantic.
4. **Screenplay is the product.** Everything else serves it. No UI element competes with it.
5. **Functional animation only.** If an animation doesn't communicate something, cut it.
6. **Text hierarchy over decoration.** A well-set Bebas Neue headline beats any gradient.

---

## 03. DESIGN SYSTEM

### 3.1 Color Tokens

#### Backgrounds
```
--bg-base:       #0A0908   Page background (warm near-black, not cold)
--bg-surface:    #121110   Cards, panels, sidebars
--bg-elevated:   #1C1A18   Modals, dropdowns, tooltips
--border:        #2D2B28   Dividers, input borders, separators
```

#### Identity (UI Chrome — Layer 1)
```
--brand-white:   #F5F5F5   Logo, CTA fill, primary headings
--brand-black:   #0A0A0A   Text on white CTA buttons
--text-primary:  #EDE8DF   Body text, screenplay text (warm white)
--text-muted:    #6B6560   Labels, metadata, placeholders, secondary info
```

#### Section Color Pairs (Content — Layer 2)

Each pair is a dark bg tone + a light accent tone. Use the bg tone for surfaces/fills
inside that section. Use the accent tone for text, borders, highlights.

```
Pair 1 — Tension & Warnings
  Dark:    #5b0e14   (crimson — danger bg, chart fill, flag card bg)
  Accent:  #f1e194   (warm yellow — flag text, warning borders, MASALA label)

Pair 2 — Moodboard
  Accent:  #ffd2c2   (peach — hover glow, image overlay)
  Secondary: #789a99 (slate teal — act labels, captions)

Pair 3 — Multilingual
  Accent:  #fefacd   (cream — language header, dialogue tint, toggle active)
  Bg tint: #5f4a8b   (deep purple — section bg overlay, toggle fill)

Pair 4 — AD Intelligence (Primary)
  Accent:  #fd802e   (burnt orange — tension line, ring gradient end, refine CTA)
  Dark:    #233d4c   (dark navy — chart surface tint, section overlay)

Pair 5 — Analytics & Scores
  Accent:  #cbdde9   (light blue — health score number, NOLAN label)
  Primary: #2872a1   (cobalt — ring gradient start, heatmap intensity, chart lines)

Pair 6 — Characters
  Accent:  #acc8a2   (sage green — character name, role chip border)
  Dark:    #1a2517   (forest — character card bg tint)
```

---

### 3.2 Typography

| Role | Font | Size | Weight | Case | Usage |
|---|---|---|---|---|---|
| Display/Hero | Bebas Neue | 64px | Regular | ALL CAPS | Screen 1 hero |
| Section headers | Bebas Neue | 22–28px | Regular | ALL CAPS | Tab labels, headings |
| CTA text | Bebas Neue | 22px | Regular | ALL CAPS | ROLL CAMERA button |
| Score/number | Bebas Neue | 72px | Regular | — | Health score widget |
| Character names | Bebas Neue | 16px | Regular | ALL CAPS | Character cards |
| UI body | Inter | 13–15px | Regular/Medium | Sentence | Nav, body copy, labels |
| UI small | Inter | 10–11px | Regular | UPPERCASE | Metadata, chips, badges |
| Screenplay ALL | Courier Prime | 12px | Regular | Mixed | Scene headings, dialogue, action |

**Letter-spacing rule:** ALL CAPS labels in Inter should have `0.10–0.12em` tracking.
Bebas Neue display text needs no additional tracking.

---

### 3.3 Spacing

Base unit: `8px`

| Token | Value | Usage |
|---|---|---|
| space-1 | 8px | Tight internal padding, icon gaps |
| space-2 | 16px | Chip padding, small component gaps |
| space-3 | 24px | Card internal padding |
| space-4 | 32px | Section gaps |
| space-6 | 48px | Large vertical rhythm |
| space-8 | 64px | Between major layout sections |

---

### 3.4 Border Radius

| Context | Radius |
|---|---|
| Cards, inputs, panels | 4px |
| Chips, badges, pills | 2px |
| Screenplay viewer | 0px |
| Buttons | 4px |
| Tooltips | 4px |

---

### 3.5 Iconography

Library: **Lucide Icons** (preferred) or Phosphor Icons.
Style: Line/outline only. No filled icons unless indicating active state.
Size: 16px standard, 12px for inline/badge use.
Color: Always `--text-muted` (#6B6560) unless semantically colored.

---

## 04. SCREEN SPECIFICATIONS

---

### SCREEN 1 — INPUT / LANDING

**Canvas:** 1440 × 900px min, `#0A0908`
**Background detail:** Horizontal film strip lines at 3% opacity warm white —
subtle, full bleed, evenly spaced (~60px apart). Should be barely visible.

#### Layout (top → bottom, vertically centered)

**Logo — top left**
- "SCRIPTORIA" in Bebas Neue 18px, `#F5F5F5`
- Clapperboard icon (Lucide or custom SVG) 16px, `#F5F5F5`, 8px gap left of text
- Position: 32px from top, 32px from left

**Hero text — center**
- "WHAT'S YOUR STORY?" — Bebas Neue 64px, `#EDE8DF`
- Centered horizontally, positioned at ~38% from top

**Textarea — below hero, 32px gap**
- Width: 720px, centered
- Height: 120px minimum, auto-grow
- Background: transparent
- Border: none except 1px bottom border `#F5F5F5`
- Font: Courier Prime 14px, `#EDE8DF`
- Placeholder: "Describe your story idea..." in `#6B6560`
- No border radius

**Controls row — below textarea, 24px gap**
Width: 720px (matches textarea), split into three zones:

*Zone 1 — Genre Pills (left-aligned):*
- Pills: Action / Drama / Thriller / Romance / Comedy / Horror
- Unselected: bg `#121110`, border `1px #2D2B28`, text `#6B6560`, Inter 12px
- Selected (show "Thriller" as pre-selected): bg `#F5F5F5`, text `#0A0A0A`
- Padding: 6px 14px, radius: 2px, gap between pills: 8px

*Zone 2 — Language Dropdown (center):*
- Shows "English ∨" — Inter 13px, `#EDE8DF`
- bg `#121110`, border `1px #2D2B28`, radius 4px, padding 8px 12px
- Chevron: Lucide ChevronDown, `#F5F5F5`, 14px
- Dropdown options: English / Hindi / Tamil / Telugu / Bengali

*Zone 3 — Tone Slider (right-aligned):*
- Label left: "MASALA" — Inter 11px, `#f1e194`
- Label right: "NOLAN" — Inter 11px, `#cbdde9`
- Track: 120px wide, 4px height, gradient `#f1e194` → `#cbdde9`, radius 2px
- Thumb: white circle 16px, `#F5F5F5` fill, no border
- Default position: 60% toward NOLAN

**CTA Button — below controls, 32px gap**
- Label: "ROLL CAMERA"
- Width: 720px (matches textarea)
- Height: 56px
- Background: `#F5F5F5`
- Text: Bebas Neue 22px, `#0A0A0A`, letter-spacing 0.05em
- Border radius: 4px
- Hover: bg `#E0E0E0`, transition 150ms ease
- On click: triggers clapperboard animation → navigates to Screen 2

---

### SCREEN 2 — GENERATION / LOADING

**Canvas:** Full-screen, `#0A0908`
**Everything centered** both vertically and horizontally.

**Film Reel**
- SVG or Lottie, 96px diameter
- White (`#F5F5F5`) line-art style — outer ring, inner circle, spoke details
- Slow rotation: 360° over 3 seconds, linear, infinite loop

**Status text — 32px below reel**
- Bebas Neue 20px, `#EDE8DF`, letter-spacing 0.1em
- Cycles through these states with 300ms fade-out / fade-in between:
  1. "STRUCTURING YOUR NARRATIVE..."
  2. "WRITING YOUR SCREENPLAY..."
  3. "BUILDING YOUR CHARACTERS..."
  4. "RUNNING AD INTELLIGENCE..."
  5. "GENERATING VISUAL MOODBOARDS..."
- Each state holds for ~2 seconds

**Step Dots — 24px below status text**
- 5 circles, 8px each, 12px gap
- Unfilled: `#2D2B28` bg, `#2D2B28` border
- Filled (active and completed): `#F5F5F5` fill — solid white, no color
- Fill left-to-right as each generation phase completes

**Attribution — 32px from bottom of screen**
- "Powered by Gemini · Sarvam AI · Scriptoria RAG"
- Inter 11px, `#6B6560`, centered

---

### SCREEN 3 — OUTPUT / DIRECTOR'S TABLE

**Canvas:** 1440px wide, full-height

---

#### TOP BAR
Height: 56px | bg: `#121110` | bottom border: 1px `#2D2B28`

| Zone | Content | Style |
|---|---|---|
| Left (200px) | Clapperboard icon + "SCRIPTORIA" | Bebas Neue 16px, `#F5F5F5` |
| Center (flex) | "Untitled Project" + edit icon | Inter 15px, `#EDE8DF` + pencil icon `#6B6560` 16px |
| Right (200px) | PDF · DOCX · TXT buttons | Inter 12px, `#F5F5F5` text, `1px #F5F5F5` border, `#0A0908` bg, 4px radius, 10px 16px padding |

---

#### LEFT PANEL — SCREENPLAY VIEWER
Width: 38% | Height: full below top bar | bg: `#0A0908`
Right border: 1px `#2D2B28`

**Panel header (inside panel, top):**
- "SCREENPLAY" — Inter 10px, `#6B6560`, uppercase, letter-spacing 0.12em
- "24 SCENES" chip — bg `#1C1A18`, border `1px #2D2B28`, text `#6B6560`,
  Inter 10px, 2px radius, 6px 10px padding

**Screenplay content area — scrollable:**

Padding: 24px horizontal, 16px vertical

```
Scene Heading:
  Font: Courier Prime 12px
  Case: ALL CAPS
  Color: #F5F5F5
  Weight: normal (Courier Prime bold looks wrong in screenplay format)
  Example: "INT. ABANDONED WAREHOUSE - NIGHT"

Action Line:
  Font: Courier Prime 12px
  Color: #B0A898
  Weight: normal
  Full width of panel
  Example: "Rain hammers the corrugated roof. ARYAN crouches behind a
            rusted container, watching the shadows."

Character Name (above dialogue):
  Font: Courier Prime 12px
  Color: #F5F5F5
  Case: ALL CAPS
  Centered in the dialogue column
  Example: "                    ARYAN"

Dialogue:
  Font: Courier Prime 12px
  Color: #EDE8DF
  Indented: ~80px from left of content area
  Width: ~60% of panel width
  Example: "They were never going to let us leave."
```

**Hover state on any scene block:**
- 2px left border appears: `#F5F5F5`
- No background change — just the white left accent bar

**Scrollbar (custom):**
- Width: 4px
- Track: `#121110`
- Thumb: `#2D2B28`
- No border radius on scrollbar

---

#### RIGHT PANEL — TABBED CONTENT
Width: 62% | Height: full below top bar | bg: `#0A0908`

**Tab Navigation — Infinite Menu style**
Height: 48px | Bottom border: 1px `#2D2B28`

Design as a horizontal row with generous spacing and a subtle left/right fade-out
gradient on both edges (suggesting infinite scrollability):
- Left fade: `#0A0908` → transparent, 48px wide
- Right fade: transparent → `#0A0908`, 48px wide

Tab items: AD INTELLIGENCE / CHARACTERS / MOODBOARD / MULTILINGUAL

```
Active tab:
  Font: Bebas Neue 14px
  Color: #F5F5F5
  Letter-spacing: 0.08em
  Bottom border: 2px #F5F5F5, flush with row bottom border

Inactive tab:
  Font: Bebas Neue 14px
  Color: #6B6560
  Letter-spacing: 0.08em
  No bottom border

Hover on inactive:
  Color: #EDE8DF
  Transition: 150ms
```

---

##### TAB 1: AD INTELLIGENCE
*Color language: Pairs 4 + 5 for data, Pair 1 for warnings*

Background surface: `#233d4c` at 8–10% opacity overlay on `#0A0908`

**Health Score Widget**
Position: top-left of content area, or centered in a top row

```
Main number: "74"
  Font: Bebas Neue 72px
  Color: #cbdde9

Ring chart (donut):
  Outer diameter: 100px
  Ring width: 8px
  Filled arc: gradient #2872a1 → #fd802e, clockwise, 74% of circle
  Unfilled arc: #2D2B28
  The number "74" sits centered inside or below the ring

Sub-scores row (below ring):
  "PACING · 68" | "BALANCE · 81" | "TENSION · 72"
  Font: Inter 11px, #6B6560
  Separated by vertical dividers: 1px #2D2B28, height 12px
  Gap: 16px each side of divider
```

**Tension Arc Chart**
Label: "TENSION ARC" — Inter 10px, `#6B6560`, uppercase, letter-spacing 0.12em

Chart area:
```
  bg: #121110
  border: 1px #2D2B28
  border-radius: 4px
  height: 120px
  padding: 16px
  width: 100% of right panel content area

  X-axis: Scene numbers 1–24, Inter 9px, #6B6560
  Y-axis: 0–100, Inter 9px, #6B6560

  Line: #fd802e, 2px stroke, smooth bezier curve
  Line shows organic tension — rises, peaks around scene 9, dips scenes 12–18,
  recovers toward scene 24

  Danger zone fill (scenes 12–18, y < 40):
    Fill color: #5b0e14, 40% opacity
    Under the curve, not above

  Chart surface tint: #233d4c at 15% behind chart bg
```

**Character Distribution Heatmap**
Label: "CHARACTER DISTRIBUTION" — Inter 10px, `#6B6560`, uppercase

```
  3 rows × 3 columns grid
  Row labels (left): Character names in Courier Prime 11px, #EDE8DF
  Column headers (top): "ACT I" / "ACT II" / "ACT III" — Inter 9px, #6B6560

  Each cell: rectangle, 8px radius
  Low presence: #2872a1 at 25% opacity
  Medium presence: #2872a1 at 60% opacity
  High presence: #2872a1 at 100% opacity

  Row 1 (lead): High / High / High
  Row 2 (supporting): Medium / High / Medium
  Row 3 (minor): High / Low / Low
```

**Pacing Blocks Row**
Label: "PACING" — Inter 10px, `#6B6560`, uppercase

```
  ~20 square blocks in a row
  Each block: 12px × 12px, 2px radius, 2px gap

  Fast: #acc8a2 (sage)
  Medium: #f1e194 (warm yellow)
  Slow: #5b0e14 (crimson dark)

  Pattern example: fast fast medium fast slow slow slow slow medium fast ...
  Consecutive slow blocks at positions 14–18 (5 reds in a row = flagged)
```

**Flag Warning Card**
Only shown when pacing issues detected:
```
  bg: #5b0e14
  border: 1px #f1e194
  border-radius: 4px
  padding: 16px

  Icon: Lucide AlertTriangle 16px, #f1e194
  Text: "Act II pacing dip detected — scenes 14–18"
        Inter 13px, #f1e194

  Button "Refine Act II":
    bg: transparent
    border: 1px #f1e194
    text: #f1e194, Inter 12px
    padding: 6px 14px, 4px radius
    margin-top: 12px
    hover: bg #5b0e14 lightened slightly
```

---

##### TAB 2: CHARACTERS
*Color language: Pair 6 | ReactBits: Chroma Grid*

Background: No tint. Pure `#0A0908`.

Layout: **Chroma Grid component from ReactBits**
- 2-column grid of character cards
- On hover, each card subtly shifts through a chromatic color cycle
  (pulling from the 6 color pairs as hue stops)

**Character Card:**
```
  bg: #1a2517 (Pair 6 dark)
  border: 1px #2D2B28
  border-radius: 4px
  padding: 20px

  Character Name:
    Font: Bebas Neue 18px, #acc8a2
    ALL CAPS

  Role Chip (below name, 8px gap):
    Text: e.g. "PROTAGONIST" — Inter 10px, #6B6560
    bg: #1a2517, border: 1px #acc8a2, 2px radius, 4px 10px padding

  Bio (below chip, 12px gap):
    3 lines max, Inter 12px, #EDE8DF, line-height 1.6

  Arc Label (bottom of card):
    Text: e.g. "REDEMPTION ARC" — Bebas Neue 13px, #6B6560
    ALL CAPS, letter-spacing 0.1em
```

---

##### TAB 3: MOODBOARD
*Color language: Pair 2 | ReactBits: Stack*

**Section header:**
"VISUAL DIRECTION" — Bebas Neue 20px, `#EDE8DF`

Top right: "Generated via Pollinations.ai" — Inter 10px, `#6B6560`

**Stack Component (ReactBits)**
- Images stacked as layered cards, fanning out slightly
- Each card represents one act's moodboard visual
- Stack shows ~3 visible cards with perspective offset
- On hover/interaction: cards fan out to reveal all

**Individual moodboard card:**
```
  bg: #121110
  border: 1px #2D2B28
  border-radius: 4px
  overflow: hidden

  Image area: fills card, aspect-ratio ~16:9 or ~4:3
  Image overlay on hover: #ffd2c2 at 15% opacity blend

  Caption bar (bottom of card):
    bg: #121110
    padding: 8px 12px
    Text: "ACT I — ESTABLISH / GOLDEN HOUR"
    Font: Inter 11px, #789a99

  Hover glow: box-shadow 0 0 20px #ffd2c2 at 30% opacity
```

---

##### TAB 4: MULTILINGUAL
*Color language: Pair 3*

**Header:**
Language name (e.g., "HINDI") — Bebas Neue 20px, `#fefacd`

**Original / Translated toggle:**
```
  Two states: "ORIGINAL" | "TRANSLATED"
  Toggle pill style, 2px radius

  Inactive state:
    bg: transparent
    border: 1px #F5F5F5
    text: #6B6560, Inter 12px

  Active state:
    bg: #fefacd
    text: #5f4a8b, Inter 12px, medium weight

  Container: #1C1A18 bg, 1px #2D2B28 border, 4px radius
```

**Screenplay viewer (translated):**
Same format as left panel with one modification:
- Dialogue text color: `#fefacd` (Pair 3 cream) instead of `#EDE8DF`
- Section background: `#5f4a8b` at 6–8% opacity overlay (very subtle)

**Bottom badge:**
"Culturally Generated — Not Translated" + Sarvam AI wordmark
Inter 10px, `#6B6560`, bottom of panel

---

## 05. COMPONENT LIBRARY

### Complete Component List

| # | Component | Key states |
|---|---|---|
| 1 | Logo lockup | Default |
| 2 | Genre pill | Unselected, Selected |
| 3 | Language dropdown | Closed, Open |
| 4 | Tone slider (MASALA/NOLAN) | Default, Dragging |
| 5 | CTA — ROLL CAMERA | Default, Hover, Pressed |
| 6 | Export button (PDF/DOCX/TXT) | Default, Hover |
| 7 | Film reel loader | Spinning state |
| 8 | Step indicator dot | Unfilled, Filled |
| 9 | Infinite Menu tab | Active, Inactive, Hover |
| 10 | Health score ring widget | Low/Med/High score variants |
| 11 | Tension curve chart | With danger zone, Without |
| 12 | Character heatmap | Full data |
| 13 | Pacing blocks row | With flag, Without flag |
| 14 | Flag/warning card | Visible |
| 15 | Character card (Chroma Grid) | Default, Hover |
| 16 | Moodboard stack card | Stacked, Expanded |
| 17 | Screenplay — Scene heading | Default, Hovered |
| 18 | Screenplay — Action line | Default |
| 19 | Screenplay — Character name | Default |
| 20 | Screenplay — Dialogue | Default |
| 21 | Custom scrollbar | Default |
| 22 | Translated toggle | Original active, Translated active |

---

## 06. MOTION & INTERACTIONS

### Transition Defaults
```
Fade in/out:     150ms ease
Color change:    150ms ease
Scale hover:     150ms ease
Tab switch:      150ms ease-out (fade only, no slide)
```

### Micro-Interactions (Design these as prototype flows)

**1. Clapperboard clap (Screen 1 → Screen 2)**
- Trigger: ROLL CAMERA button click
- Animation: Clapperboard SVG snaps shut (top arm rotates down ~30° in 80ms,
  bounces back 5° in 40ms)
- After 200ms: full-screen white flash frame (1 frame, ~16ms)
- Screen 2 fades in over 300ms

**2. Typewriter text streaming (Screen 3 load)**
- Screenplay text appears character-by-character, left to right
- Speed: ~40 characters per second
- Cursor: blinking `#F5F5F5` underscore at insertion point
- Scene headings appear slightly faster than action/dialogue lines

**3. Health score count-up**
- Number counts from 0 → final score
- Duration: 1.5 seconds
- Easing: ease-out (fast initially, slows near final value)
- Ring arc fills simultaneously from 0% → score%
- Gradient fills in clockwise from #2872a1 → #fd802e

**4. Tension curve draw-on**
- Line draws itself left to right on tab load
- Duration: 1 second
- Easing: ease-in-out
- The danger zone fill fades in after the line passes through it

**5. Tab switching (right panel)**
- Current content: fade out 75ms
- New content: fade in 150ms
- No sliding, no position change — pure opacity transition

**6. Linked screenplay ↔ tension curve hover**
- Hovering any scene block in the left panel:
  - Corresponding dot on tension curve pulses: scale 1 → 1.4 → 1 over 300ms
  - Dot color: #fd802e
  - Scene block gets left border: 2px #F5F5F5

---

## 07. DO'S AND DON'TS

### DO
- Use `#0A0908` (warm) not `#000000` (cold) for backgrounds
- Keep Pair colors inside their assigned section only
- Use Inter for ALL UI text that isn't a display headline or screenplay
- Use Courier Prime for ALL screenplay content without exception
- Add 8% opacity section tints to distinguish tab content areas visually
- Keep icon weight consistent: Lucide Regular throughout
- Let the screenplay panel breathe — avoid crowding it with UI chrome

### DON'T
- Don't use amber (#E8A000) — it has been replaced by the B&W system + 6 pairs
- Don't add color to the screenplay panel — it must remain neutral warm B&W
- Don't use the Chroma Grid or Stack components outside their designated sections
- Don't add glow effects to navigation or logo — glow is reserved for Moodboard hover only
- Don't use slide animations for tab transitions — fade only
- Don't use pure `#FFFFFF` white — always use `#F5F5F5` to keep the warm feel
- Don't mix Pair colors in the same section (e.g., don't use Pair 5 blue in the Characters tab)
- Don't use border-radius > 4px anywhere in the app

---

## 08. FIGMA FILE STRUCTURE (Recommended)

```
SCRIPTORIA
├── 🎨 Design System
│   ├── Color Styles (all tokens from Section 03)
│   ├── Text Styles (all type styles from Section 03)
│   └── Effect Styles (only: moodboard glow, flag border glow)
│
├── 🧩 Components
│   ├── Navigation
│   │   ├── Logo lockup
│   │   ├── Top bar
│   │   └── Tab nav (Infinite Menu)
│   ├── Input Elements
│   │   ├── Genre pill (2 states)
│   │   ├── Language dropdown
│   │   └── Tone slider
│   ├── CTA & Buttons
│   │   ├── ROLL CAMERA button (3 states)
│   │   └── Export button (3 states)
│   ├── Loading
│   │   ├── Film reel
│   │   └── Step dots
│   ├── AD Intelligence
│   │   ├── Health score ring
│   │   ├── Tension arc chart
│   │   ├── Character heatmap
│   │   ├── Pacing blocks row
│   │   └── Flag warning card
│   ├── Characters
│   │   └── Character card (Chroma Grid)
│   ├── Moodboard
│   │   └── Moodboard stack card
│   ├── Multilingual
│   │   └── Translated toggle
│   └── Screenplay
│       ├── Scene heading
│       ├── Action line
│       ├── Character name
│       └── Dialogue line
│
├── 📱 Screens
│   ├── 01 — Landing / Input
│   ├── 02 — Loading / Generation
│   └── 03 — Output / Director's Table
│
└── 🔗 Prototype
    └── Screen 1 → Screen 2 → Screen 3 flow
```

---

## 09. VERIFICATION CHECKLIST

Before marking the design complete, verify:

**Color System**
- [ ] All backgrounds are dark — no white or light screens
- [ ] Logo, CTA, top bar, step dots, scrollbar — B&W only, no Pair colors
- [ ] Each tab uses exactly one color pair in its content
- [ ] Screenplay panel has zero Pair color elements
- [ ] Tone slider labels use Pair 1 (#f1e194) and Pair 5 (#cbdde9)

**Typography**
- [ ] All screenplay content is Courier Prime 12px
- [ ] All display headlines are Bebas Neue ALL CAPS
- [ ] All UI text is Inter
- [ ] No font mixing within a single element

**Spacing & Geometry**
- [ ] 8px base grid used throughout
- [ ] No border-radius exceeds 4px
- [ ] Screenplay panel is 38% width, content panel is 62%
- [ ] Top bar is exactly 56px

**Components**
- [ ] All 22 components built with correct variant states
- [ ] Infinite Menu tab annotated as ReactBits
- [ ] Stack (Moodboard) annotated as ReactBits
- [ ] Chroma Grid (Characters) annotated as ReactBits

**Prototype**
- [ ] Screen 1 → Screen 2 → Screen 3 flow works
- [ ] Tab switching within Screen 3 works
- [ ] ROLL CAMERA button triggers transition

---

*SCRIPTORIA Design Document v1.0*
*Prepared for Hackathon Submission*
```