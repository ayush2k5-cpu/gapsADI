# frontend

## Overview

Next.js (App Router) + React frontend for gapsADI/Scriptoria. Covers the landing page, the generation flow, and a tabbed output view (screenplay, AD analysis, CBFC rating, characters, moodboard, translation). Talks to the FastAPI backend exclusively through `lib/api.ts`.

## Key files

| File | Owns |
|---|---|
| `lib/api.ts` | Every backend call. Exactly one function per backend endpoint — never call `fetch` to the backend from a component directly, add a function here instead. |
| `lib/types.ts` | Request/response types, mirrors the backend's Pydantic models exactly |
| `app/page.tsx` | Landing page (composes `components/landing/*`) |
| `app/generate/page.tsx` | Story idea → genre/language/tone input form |
| `app/output/page.tsx` | Tabbed output shell, hosts `CBFCTab`, `CharactersTab`, `MoodboardTab`, `MultilingualTab`, `ScreenplayViewer` |
| `app/output/{ad,characters,moodboard,multilingual,screenplay}/page.tsx` | Deep-link routes into specific output tabs |
| `components/ADDashboard.tsx` | Renders the AD Intelligence analysis (animated health-score ring, tension curve, character heatmap) |
| `components/reactbits/*` | WebGL/3D decorative components (`InfiniteMenu`, `Antigravity`, `ChromaGrid`, `TargetCursor`, `DecryptedText`, `Stack`) — landing page only, not core app logic |
| `components/ui/*` | shadcn/ui primitives (`badge`, `card`, `progress`, `separator`) |

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Conventions

- `NEXT_PUBLIC_API_URL` env var overrides the backend URL; defaults to `http://localhost:8000` if unset (see `lib/api.ts`).
- Component library is shadcn/ui (`components.json` present) on Tailwind CSS 4 — use existing `components/ui/*` primitives before adding a new UI dependency.
- TypeScript `strict: true` is on (`tsconfig.json`) — keep it that way, don't loosen it to work around a type error.
- The 3D/WebGL components (`reactbits/`) are landing-page-only decoration; don't couple core app logic (generate/output flow) to them.

## Agent skills

- [vercel-react-best-practices](.claude/skills/vercel-react-best-practices/): `vercel-labs/agent-skills`, React/Next.js performance patterns (components, data fetching, bundle size)
- [r3f-fundamentals](.claude/skills/r3f-fundamentals/): `enzed/r3f-skills`, Canvas/scene setup, typed JSX, hooks, resource ownership — start here for any `reactbits/` WebGL work
- [r3f-animation](.claude/skills/r3f-animation/): `enzed/r3f-skills`, useFrame, damping, GLTF clip animation
- [r3f-geometry](.claude/skills/r3f-geometry/): `enzed/r3f-skills`, custom buffers, instanced meshes, points/lines
- [r3f-interaction](.claude/skills/r3f-interaction/): `enzed/r3f-skills`, pointer events, picking, dragging, camera controls — relevant to `InfiniteMenu.tsx`'s drag/arcball behavior
- [r3f-lighting](.claude/skills/r3f-lighting/): `enzed/r3f-skills`, lights, environment maps, shadows
- [r3f-loaders](.claude/skills/r3f-loaders/): `enzed/r3f-skills`, useGLTF/useLoader, Suspense, caching
- [r3f-materials](.claude/skills/r3f-materials/): `enzed/r3f-skills`, PBR, transparency, transmission
- [r3f-physics](.claude/skills/r3f-physics/): `enzed/r3f-skills`, Rapier rigid bodies, colliders, joints
- [r3f-postprocessing](.claude/skills/r3f-postprocessing/): `enzed/r3f-skills`, bloom, selection effects, depth of field
- [r3f-shaders](.claude/skills/r3f-shaders/): `enzed/r3f-skills`, custom GLSL/TSL materials
- [r3f-textures](.claude/skills/r3f-textures/): `enzed/r3f-skills`, color spaces, UV channels, video/render targets

## Gotchas

- No test runner is configured (no Jest/Vitest in `package.json`, no test files anywhere in the repo).
- `frontend/node_modules/` is not installed in a fresh checkout — run `npm install` before anything else.
- ~~`app/loading/page.tsx`'s `useEffect` double-fires in dev mode~~ **Resolved 2026-09-27** (`/debug`): added a `useRef` guard (`hasStarted`) so the effect's `process()` only runs once per real mount, immune to React Strict Mode's dev-only double-invoke. Verified: one story submission now produces exactly one `POST /api/generate`.
- A backend response's `note`/status field can silently go unused in the UI if a component hardcodes footer text instead of binding to it — happened in `MultilingualTab.tsx` (fixed 2026-09-27, footer previously always read "Not Translated" even after a successful Sarvam translation). Worth double-checking other tabs bind their status text to the actual API response rather than a static string.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
