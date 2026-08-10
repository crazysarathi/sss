# SSS — Design & Engineering Contract

This document is the binding contract for building sections of the Salem Super
Smashers website. Read it fully before writing any code. Deviating from it
breaks integration.

## Brand

Premium sports franchise: **powerful, fast, cinematic, bold, local pride**.
Think Nike campaign × Apple scroll page × stadium night match. Dark navy world,
royal-blue light, lime reserved for moments that matter (CTAs, key numbers,
active states). Generous whitespace, huge condensed type, glass surfaces,
subtle grain.

### Tokens (already configured in tailwind.config.ts)

- Backgrounds: `bg-night` (#050d1f page), `bg-night-800` (#06122b), `bg-night-700` (#0a1c3f panels)
- Blues: `royal` (#1b74e0), `royal-bright` (#4fa0ff), `royal-deep` (#0d3f8f), `royal-ink` (#0d2a55)
- Accent: `lime` (#cbe66e), `lime-bright` (#e2f59a) — use sparingly
- Neutrals: `ball` (#efeee6 cream), `ink` (#eef4ff), `ink-soft` (#9fb2d4), `ink-dim` (#5f7196)
- Border: `border-line` (rgba(146,190,255,.14))
- Fonts: `font-display` (Anton — huge uppercase titles), `font-condensed`
  (Bebas Neue — kickers/labels/numbers), `font-body` (Manrope — paragraphs)
- Sizes: `text-display-xl` / `text-display-lg` / `text-display-md` (clamped), `text-kicker`
- Shadows: `shadow-glow-lime`, `shadow-glow-blue`, `shadow-card-deep`
- Animations available: `animate-marquee`, `animate-pulse-dot`, `animate-spin-slow`

### CSS helper classes (src/index.css)

- `.glass-panel` — standard glass surface (rounded-lg border border-line bg-white/[0.045] backdrop-blur-md)
- `.kicker` — section kicker label
- `.display-title` — Anton uppercase
- `.section-shell` — max-w 1240px, px-6, py-24/36 — **use for every section's inner container**
- `.glow-spot` — absolute radial glow blob (position/size/color with utilities)
- `.court-backdrop` — faint court grid lines backdrop (absolute inset-0)
- `.text-gradient-lime`, `.text-gradient-blue`, `.text-stroke-ink`, `.mask-fade-x`

## Hard engineering rules

1. **Imports**: `@/` alias → `src/`. All content comes from `@/data/siteData` —
   never hardcode copy that exists there.
2. **Exports**: each section file exports a **named** component exactly as App.tsx
   imports it (e.g. `export function HeroSection(...)`).
3. **GSAP**: import ONLY from `@/lib/gsap` (`gsap`, `ScrollTrigger`,
   `ScrollSmoother`, `SplitText`, `useGSAP`). Never `import gsap from "gsap"`
   directly. Always create animations inside `useGSAP(() => {...}, { scope: ref })`
   for automatic cleanup.
4. **ScrollSmoother is active** (desktop, fine pointer). Consequences:
   - `position: fixed` DOES NOT WORK inside sections (they live in a
     transformed wrapper). For full-screen overlays use `createPortal` to
     `document.body`, or `absolute` inside a pinned 100vh container.
   - In-page anchor navigation must use `scrollToSection(hash)` from
     `@/lib/scroll`.
5. **Reduced motion**: check `prefersReducedMotion()` from `@/lib/utils` and
   skip/flatten animations. Content must be fully readable with animations off.
   Elements you intend to animate in should carry the `data-reveal` attribute
   AND be animated with `autoAlpha` (e.g.
   `gsap.fromTo('[data-reveal]', {autoAlpha:0,y:40}, {autoAlpha:1,y:0,...})`).
   CSS hides `[data-reveal]` pre-boot only when motion is allowed, so there is
   no flash of unstyled reveal and no hidden content in reduced-motion mode.
6. **Pinning**: pinned storytelling is desktop-only unless the section is
   explicitly designed for mobile pinning. Gate with
   `window.matchMedia("(min-width: 768px)").matches` or ScrollTrigger
   `matchMedia`. On mobile, fall back to simple vertical reveals.
7. **Three.js**: R3F scenes must be `React.lazy`-loaded inside their section and
   wrapped in `<Suspense fallback={null}>`. Canvas props:
   `dpr={[1, 1.75]}`, `gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}`.
   Pause when offscreen: use `useInViewport` from `@/hooks/useInViewport` and set
   `frameloop={inView ? "always" : "never"}`. Use ONLY the shared primitives in
   `@/components/three/models.tsx` (`Pickleball`, `Paddle`, `Mountain`, `SStorm`,
   `ParticleField`, `FloatGroup`, `BrandLights`, `BRAND`) plus basic three
   geometry. NO drei `Environment` presets, NO external textures/HDRs/models
   (network-fetch is forbidden). drei helpers that don't fetch (e.g.
   `PerspectiveCamera`) are fine.
   Reduce particle/instance counts ~50% when `useIsCoarsePointer()` is true.
8. **Shared components** (use them, don't reinvent):
   - `SectionHeading` (`kicker`, `title`, `lead?`, `align?`) — every section header
   - `StatCounter` (`value`, `prefix?`, `suffix?`, `label`)
   - `MagneticButton` (wrap primary CTAs), `GlassCard` (`tilt?`)
   - `AnimatedText` (SplitText reveals: `split="chars"|"lines"|"words"`)
   - `ScrollReveal` (simple in-view reveals, `staggerChildren` option)
   - `Ticker` (marquee strip)
   - shadcn/ui: `Button` (variants: default=lime, secondary=royal, ghost, insta, link),
     `Input`, `Label`, `Select…`, `Card…`, `Badge` (variants: default, secondary,
     outline, lime, blue), `Separator`, `Toaster`/`toast` from `sonner`
9. **Icons**: `lucide-react` only. **Images**: import from `@/assets/...`
   (returns URL string). Available: `logos/sss-logo.png` (1600²),
   `logos/sss-logo-800.png`, `logos/sss-logo-small.png` (480²),
   `logos/sss-logo-nav.png` (160²), `logos/tnppl-logo.png`,
   `images/karthi-reveal.jpg` (675×900 portrait poster).
10. **Accessibility**: semantic elements (`section`, `h2`, `ul`…), every image
    gets meaningful `alt`, interactive elements are real `<button>`/`<a>` with
    visible focus (global focus style exists), touch targets ≥44px, decorative
    layers get `aria-hidden="true"`.
11. **TypeScript strict** — no `any`, no unused vars (`noUnusedLocals` is on).
12. **File ownership**: write ONLY the files assigned to you. Never edit
    shared/foundation files, App.tsx, configs, or other sections.
13. External links (`Instagram`, botify.in): `target="_blank" rel="noopener"`.
14. z-index bands: content ≤40, nav 50–60, overlays 70–90 (grain sits at 80,
    modals/menus 90), loader 100.

## Section IDs (anchors — must match exactly)

`hero`, `tnppl`, `reveal`, `identity`, `events`, `community`, `insta`, `join`.

## Motion grammar

- Ease: `expo.out` for entrances (default), `power3.inOut` for camera/scroll
  moves, `elastic.out(1, 0.4)` only for micro settle.
- Durations: micro 0.3–0.5s, component 0.8–1.2s, cinematic 1.2–2.2s.
- Scrub timelines: `scrub: 1` (never true/0 — we want inertia).
- Stagger: 0.06–0.12 for cards, 0.02–0.035 for chars.
- Every ScrollTrigger reveal fires `once: true` unless it's a scrubbed
  storytelling timeline.
- Restraint: one hero moment per section; support animations stay subtle.
