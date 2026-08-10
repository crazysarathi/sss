# Salem Super Smashers — Official Website

Premium, cinematic rebuild of [sss.botify.in](https://sss.botify.in/) for the
**Salem Super Smashers** pickleball franchise, entering **TNPPL Season 2**
(Tamil Nadu Pickleball Premier League).

## Stack

- **React 18 + TypeScript + Vite 5**
- **Tailwind CSS 3** + shadcn/ui primitives (heavily customized to the SSS identity)
- **GSAP 3.13** — ScrollTrigger, ScrollSmoother, SplitText, ScrollTo
- **Three.js + React Three Fiber + drei** — procedural 3D brand scenes (no external models/textures)
- **lucide-react** icons, **sonner** toasts

## Commands

```bash
npm install       # install dependencies (Node 18+)
npm run dev       # start dev server
npm run build     # typecheck + production build (dist/)
npm run preview   # preview the production build
```

## Architecture

```
src/
  data/siteData.ts        # ALL site copy/content — single source of truth
  lib/                    # gsap registration, scroll helper, confetti, cn()
  hooks/                  # reduced-motion, media-query, in-viewport
  components/
    layout/               # Navbar, Footer, LoadingScreen
    sections/             # Hero, League, CrestReveal, Identity, Timeline,
                          # Community, Instagram, Registration
    three/                # models.tsx (procedural brand objects) + scenes
    shared/               # SectionHeading, StatCounter, MagneticButton,
                          # GlassCard, AnimatedText, ScrollReveal, Ticker …
    ui/                   # shadcn/ui primitives (button, input, select …)
  assets/                 # crest logos, TNPPL logo, reveal poster
docs/DESIGN.md            # design & engineering contract
```

## Key behaviors

- **ScrollSmoother** runs on desktop fine pointers only; touch devices scroll
  natively. `position: fixed` must not be used inside `#smooth-content` —
  overlays portal to `document.body`.
- **Reduced motion** is respected globally: heavy animation is skipped and all
  content remains visible.
- **3D scenes** are lazy-loaded, DPR-capped at 1.75, pause rendering when
  offscreen, and use procedurally generated geometry only (zero network cost).
- All copy lives in `src/data/siteData.ts` — edit content there, not in components.

## Brand

| Token | Value | Use |
| --- | --- | --- |
| night / night-800 / night-700 | `#050d1f` / `#06122b` / `#0a1c3f` | backgrounds |
| royal / royal-bright / royal-deep | `#1b74e0` / `#4fa0ff` / `#0d3f8f` | paddles, glows |
| lime / lime-bright | `#cbe66e` / `#e2f59a` | CTAs, key accents |
| ball | `#efeee6` | pickleball cream |

Fonts: **Anton** (display), **Bebas Neue** (labels/kickers), **Manrope** (body).
