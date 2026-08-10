/**
 * IdentitySection — "Every mark has a meaning".
 *
 * Desktop: a pinned, scroll-scrubbed stage. The left glass frame hosts the
 * lazy-loaded 3D crest scene; the right column swaps through the four crest
 * stories as the visitor scrolls, with a lime progress rail underneath.
 * Mobile / reduced-motion: a fully readable stack of glass cards with
 * hand-drawn SVG marks instead of the canvas.
 */
import { Suspense, lazy, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { identity, type IdentityItem } from "@/data/siteData";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassCard } from "@/components/shared/GlassCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { useInViewport } from "@/hooks/useInViewport";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const IdentityScene = lazy(() => import("@/components/three/IdentityScene"));

const ITEM_COUNT = identity.items.length;
const TOTAL_LABEL = String(ITEM_COUNT).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* Minimal SVG marks for the mobile / reduced-motion cards             */
/* ------------------------------------------------------------------ */

function IdentityGlyph({ id }: { id: IdentityItem["key"] }) {
  const common = {
    viewBox: "0 0 64 64",
    fill: "none",
    "aria-hidden": true as const,
    className: "h-14 w-14 shrink-0",
  };

  if (id === "paddles") {
    return (
      <svg {...common}>
        <g className="stroke-royal-bright" strokeWidth="2.5" strokeLinecap="round">
          <g transform="rotate(-24 32 30)">
            <rect x="24" y="7" width="16" height="27" rx="8" />
            <path d="M32 34v13" />
          </g>
        </g>
        <g className="stroke-lime" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
          <g transform="rotate(24 32 30)">
            <rect x="24" y="7" width="16" height="27" rx="8" />
            <path d="M32 34v13" />
          </g>
        </g>
      </svg>
    );
  }

  if (id === "ball") {
    return (
      <svg {...common}>
        <circle cx="34" cy="32" r="19" className="stroke-royal-bright" strokeWidth="2.5" />
        <g className="fill-royal-bright" opacity="0.85">
          <circle cx="29" cy="24" r="2.2" />
          <circle cx="41" cy="26" r="2.2" />
          <circle cx="34" cy="34" r="2.2" />
          <circle cx="26" cy="38" r="2.2" />
          <circle cx="42" cy="39" r="2.2" />
        </g>
        <g className="stroke-lime" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
          <path d="M4 26h7" />
          <path d="M6 34h5" />
        </g>
      </svg>
    );
  }

  if (id === "mountain") {
    return (
      <svg {...common}>
        <polyline
          points="4,46 15,27 23,36 33,15 42,29 50,22 60,46"
          className="stroke-royal-bright"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M4 52h56"
          className="stroke-lime"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1 7"
          opacity="0.9"
        />
      </svg>
    );
  }

  // storm
  return (
    <svg {...common}>
      <g className="fill-lime" fontFamily="Arial, sans-serif" fontWeight="900">
        <text x="12" y="22" fontSize="17" transform="rotate(-14 12 22)">S</text>
        <text x="38" y="18" fontSize="12" opacity="0.7" transform="rotate(10 38 18)">S</text>
        <text x="26" y="42" fontSize="21" transform="rotate(-6 26 42)">S</text>
        <text x="46" y="40" fontSize="13" opacity="0.6" transform="rotate(16 46 40)">S</text>
        <text x="10" y="56" fontSize="12" opacity="0.55" transform="rotate(-18 10 56)">S</text>
      </g>
      <text
        x="44"
        y="58"
        fontSize="15"
        className="fill-royal-bright"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        opacity="0.8"
        transform="rotate(8 44 58)"
      >
        S
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function IdentitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Scene communication channel — no React re-renders on scrub.
  const activeIndexRef = useRef(0);
  const progressRef = useRef(0);
  // Mirrors activeIndexRef, updated only when the quarter changes (labels/aria).
  const [activeIndex, setActiveIndex] = useState(0);

  const reduced = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // `reduced` gates whether the frame div renders at all — pass it as a
  // dep so the observer attaches when the stage mounts mid-session.
  const frameInView = useInViewport(frameRef, "200px", [reduced]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const stage = stageRef.current;
        if (!stage) return;

        const panels = gsap.utils.toArray<HTMLElement>("[data-identity-panel]", stage);
        const nums = gsap.utils.toArray<HTMLElement>("[data-identity-num]", stage);
        const fills = gsap.utils.toArray<HTMLElement>("[data-identity-fill]", stage);
        const fillSetters = fills.map((el) => gsap.quickSetter(el, "scaleX"));
        const clamp01 = gsap.utils.clamp(0, 1);

        // Initial stack state: only the first story is visible.
        gsap.set(panels, { autoAlpha: 0, y: 28 });
        gsap.set(nums, { autoAlpha: 0, y: 24 });
        gsap.set([panels[0], nums[0]], { autoAlpha: 1, y: 0 });

        // Entrance for the frame + right column.
        gsap.fromTo(
          stage.querySelectorAll("[data-reveal]"),
          { autoAlpha: 0, y: 56 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.12,
            ease: "expo.out",
            scrollTrigger: { trigger: stage, start: "top 80%", once: true },
          }
        );

        // Short non-scrubbed swap between stories. Targets ALL non-active
        // panels (not just the previous one): killing a mid-flight swap on
        // fast scrolls used to strand an old panel at partial opacity,
        // leaving two stories overlapped on screen.
        let swapTl: gsap.core.Timeline | null = null;
        const swapTo = (next: number) => {
          swapTl?.kill();
          const others = [
            ...panels.filter((_, i) => i !== next),
            ...nums.filter((_, i) => i !== next),
          ];
          swapTl = gsap
            .timeline()
            .to(
              others,
              { autoAlpha: 0, y: -28, duration: 0.3, ease: "power2.in", overwrite: "auto" },
              0
            )
            .fromTo(
              [panels[next], nums[next]],
              { autoAlpha: 0, y: 28 },
              { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out", overwrite: "auto" },
              0.16
            );
        };

        // Pinned master timeline: 4 equal quarters over +=320%.
        const proxy = { p: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) => {
              const idx = Math.min(ITEM_COUNT - 1, Math.floor(self.progress * ITEM_COUNT));
              if (idx !== activeIndexRef.current) {
                activeIndexRef.current = idx;
                setActiveIndex(idx);
                swapTo(idx);
              }
            },
          },
        });

        tl.to(proxy, {
          p: 1,
          ease: "none",
          duration: 1,
          onUpdate: () => {
            progressRef.current = proxy.p;
            for (let i = 0; i < fillSetters.length; i++) {
              fillSetters[i](clamp01(proxy.p * ITEM_COUNT - i));
            }
          },
        });

        return () => {
          swapTl?.kill();
          activeIndexRef.current = 0;
          progressRef.current = 0;
        };
      });
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <section id="identity" ref={sectionRef} className="relative bg-night/50">
      {/* Atmosphere: a single royal glow behind the stage, near-black elsewhere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="glow-spot left-1/2 top-[46%] h-[560px] w-[560px] -translate-x-1/2 bg-royal/20" />
      </div>

      <div className="section-shell !pb-0">
        <SectionHeading kicker={identity.kicker} title={identity.title} lead={identity.lead} />
      </div>

      {/* ---------------- Desktop: pinned scroll stage ---------------- */}
      {!reduced && (
        <div ref={stageRef} className="relative hidden h-screen md:block">
          <div className="mx-auto grid h-full w-full max-w-[1240px] grid-cols-[1.15fr_1fr] items-center gap-8 px-6">
            {/* LEFT — glass frame with the 3D crest scene */}
            <div
              ref={frameRef}
              data-reveal
              className="relative h-[74vh] max-h-[780px] min-h-[440px] overflow-hidden rounded-lg border border-line bg-gradient-to-b from-night-800 to-night shadow-card-deep"
            >
              <div className="court-backdrop" aria-hidden="true" />

              {isDesktop && (
                <div className="absolute inset-0" aria-hidden="true">
                  <Suspense fallback={null}>
                    <IdentityScene
                      activeIndexRef={activeIndexRef}
                      progressRef={progressRef}
                      frameloop={frameInView ? "always" : "never"}
                    />
                  </Suspense>
                </div>
              )}

              {/* bottom scrim for number legibility */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-night to-transparent"
                aria-hidden="true"
              />

              {/* corner meta: frame label */}
              <div
                className="pointer-events-none absolute left-6 top-5 flex items-center gap-2.5"
                aria-hidden="true"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-dot" />
                <span className="font-condensed text-xs uppercase tracking-[0.32em] text-ink-dim">
                  SSS Crest System
                </span>
              </div>

              {/* corner meta: huge outlined number, swapped with the story */}
              <div
                className="pointer-events-none absolute bottom-5 left-6 h-20 w-40"
                aria-hidden="true"
              >
                {identity.items.map((item) => (
                  <span
                    key={item.key}
                    data-identity-num
                    className="absolute bottom-0 left-0 font-display text-7xl leading-none text-stroke-ink"
                  >
                    {item.no}
                  </span>
                ))}
              </div>

              <span
                className="pointer-events-none absolute bottom-6 right-6 font-condensed text-xs uppercase tracking-[0.32em] text-ink-dim"
                aria-hidden="true"
              >
                Scroll to decode
              </span>
            </div>

            {/* RIGHT — story stack + progress rail */}
            <div data-reveal className="relative">
              {/* Full text for screen readers; visual panels are GSAP-toggled */}
              <ul className="sr-only">
                {identity.items.map((item) => (
                  <li key={item.key}>
                    {item.no} — {item.title}. {item.body}
                  </li>
                ))}
              </ul>

              <div className="relative min-h-[380px]" aria-hidden="true">
                {identity.items.map((item) => (
                  <div key={item.key} data-identity-panel className="absolute inset-x-0 top-0">
                    <p className="kicker">
                      {item.no} <span className="text-ink-dim">/ {TOTAL_LABEL}</span>
                    </p>
                    <h3 className="display-title mt-4 text-display-md">{item.title}</h3>
                    <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress rail: 4 segments, lime fill scrubbed per quarter */}
              <div className="mt-10 flex items-end gap-3" aria-hidden="true">
                {identity.items.map((item, i) => (
                  <div key={item.key} className="flex-1">
                    <span
                      className={cn(
                        "font-condensed text-sm tracking-[0.24em] transition-colors duration-300",
                        i === activeIndex ? "text-lime" : "text-ink-dim"
                      )}
                    >
                      {item.no}
                    </span>
                    <div className="relative mt-2 h-px w-full bg-line">
                      <span
                        data-identity-fill
                        className="absolute inset-0 origin-left scale-x-0 bg-lime"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------- Mobile (and reduced-motion) fallback: card stack -------- */}
      <div className={cn("section-shell !pt-0", !reduced && "md:hidden")}>
        <div className="grid gap-5 sm:grid-cols-2">
          {identity.items.map((item, i) => (
            <ScrollReveal key={item.key} delay={i * 0.06}>
              <GlassCard className="relative h-full overflow-hidden p-7">
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-royal/10 blur-2xl"
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="font-display text-6xl leading-none text-stroke-ink"
                    aria-hidden="true"
                  >
                    {item.no}
                  </span>
                  <IdentityGlyph id={item.key} />
                </div>
                <h3 className="display-title mt-6 text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
