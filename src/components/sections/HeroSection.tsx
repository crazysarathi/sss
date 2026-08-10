/**
 * HeroSection — the site's opening statement.
 *
 * Full-viewport cinematic hero: court-grid backdrop, layered royal glows,
 * a lazy 3D pickleball scene, marquee ticker, and the signature boot
 * entrance — SplitText chars rising out of masked lines into the huge
 * Anton title, then tagline, chips, CTAs and the scroll hint.
 *
 * Scrolling away drifts the whole composition upward and dims it while
 * feeding progress into the 3D scene through a shared ref.
 */
import { lazy, Suspense, useRef } from "react";
import { ArrowDown, Instagram } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";
import { hero, site } from "@/data/siteData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Ticker } from "@/components/shared/Ticker";

const HeroScene = lazy(() => import("@/components/three/HeroScene"));

interface HeroSectionProps {
  booted: boolean;
}

export function HeroSection({ booted }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);

  // "Now entering the arena of <TNPPL Season 2>, Tamil Nadu's premier…"
  // — emphasize the league name without hardcoding any copy.
  const contParts = hero.taglineCont.split(site.league);
  const contBefore = contParts[0] ?? hero.taglineCont;
  const contAfter = contParts.slice(1).join(site.league);
  const hasLeague = contParts.length > 1;

  /* ------------------------------------------------------------ */
  /* Scroll behavior: progress feed (all viewports) + drift/dim    */
  /* (desktop only). Runs once on mount.                           */
  /* ------------------------------------------------------------ */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const section = sectionRef.current;
      const drift = driftRef.current;
      if (!section || !drift) return;

      // Raw progress for the 3D scene — the scene applies its own damping.
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        },
      });

      // Scrubbed storytelling drift is desktop-only per the contract.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        tl.to(drift, { yPercent: -12, ease: "none", duration: 1 }, 0).to(
          drift,
          { opacity: 0.25, ease: "power1.in", duration: 0.75 },
          0.25
        );
      });
    },
    { scope: sectionRef }
  );

  /* ------------------------------------------------------------ */
  /* Boot entrance — the site's signature moment (≤ 2.4s).         */
  /* ------------------------------------------------------------ */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const content = contentRef.current;
      if (!content) return;

      if (!booted) {
        // Held dark behind the loading screen.
        gsap.set(content, { autoAlpha: 0 });
        return;
      }

      const line1 = content.querySelector<HTMLElement>('[data-hero-line="0"]');
      const line2 = content.querySelector<HTMLElement>('[data-hero-line="1"]');
      if (!line1 || !line2) return;

      const split1 = new SplitText(line1, { type: "chars,words" });
      // Gradient is re-applied per char: bg-clip-text does not survive
      // transformed child elements, so each char paints its own gradient.
      const split2 = new SplitText(line2, {
        type: "chars,words",
        charsClass: "text-gradient-lime",
      });
      const chars = [...split1.chars, ...split2.chars];

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.set(content, { autoAlpha: 1 }, 0)
        // 1 — eyebrow
        .fromTo(
          "[data-hero-eyebrow]",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          0.05
        )
        // 2 — title chars rise out of their masked lines
        .set("[data-hero-title]", { autoAlpha: 1 }, 0.18)
        .fromTo(
          chars,
          { y: 120, rotateX: -38, transformOrigin: "50% 100%", transformPerspective: 640 },
          { y: 0, rotateX: 0, duration: 1.05, stagger: 0.03 },
          0.18
        )
        // 3 — tagline
        .fromTo(
          "[data-hero-tagline]",
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          0.9
        )
        // 4 — chips
        .set("[data-hero-chips]", { autoAlpha: 1 }, 1.05)
        .fromTo(
          "[data-hero-chips] > *",
          { autoAlpha: 0, y: 14, scale: 0.82 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.06 },
          1.05
        )
        // 5 — CTAs
        .set("[data-hero-ctas]", { autoAlpha: 1 }, 1.25)
        .fromTo(
          "[data-hero-ctas] > *",
          { autoAlpha: 0, y: 22, scale: 0.92 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08 },
          1.25
        )
        // 6 — ticker + scroll hint
        .fromTo(
          ["[data-hero-ticker]", "[data-hero-scrollhint]"],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8 },
          1.5
        );

      // Looping scroll-hint bar — starts once the entrance settles.
      gsap.fromTo(
        "[data-hero-scrollbar]",
        { yPercent: -120 },
        {
          yPercent: 320,
          duration: 1.9,
          ease: "power2.inOut",
          repeat: -1,
          repeatDelay: 0.45,
          delay: 2.3,
        }
      );

      return () => {
        split1.revert();
        split2.revert();
      };
    },
    { scope: sectionRef, dependencies: [booted] }
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* -------- atmosphere layers -------- */}
      <div aria-hidden="true" className="court-backdrop" />
      <div
        aria-hidden="true"
        className="glow-spot right-[-12%] top-[-16%] h-[58vw] w-[58vw] max-h-[760px] max-w-[760px] bg-royal/25"
      />
      <div
        aria-hidden="true"
        className="glow-spot bottom-[-22%] left-[-14%] h-[48vw] w-[48vw] max-h-[620px] max-w-[620px] bg-royal-deep/20"
      />
      <div
        aria-hidden="true"
        className="glow-spot right-[6%] top-[34%] h-64 w-64 bg-lime/10"
      />

      {/* -------- 3D scene, absolutely filling the section -------- */}
      <div aria-hidden="true" className="absolute inset-0 z-[1]">
        <Suspense fallback={null}>
          <HeroScene scrollProgress={scrollProgress} />
        </Suspense>
      </div>

      {/* -------- everything that drifts on scroll -------- */}
      <div
        ref={driftRef}
        className="relative z-10 flex w-full flex-col items-center justify-center self-stretch"
      >
        {/* marquee ticker, just below the floating navbar */}
        <div data-reveal data-hero-ticker className="absolute inset-x-0 top-20">
          <Ticker text={hero.ticker} className="mask-fade-x" />
        </div>

        <div
          ref={contentRef}
          className="section-shell flex flex-col items-center text-center"
        >
          {/* eyebrow */}
          <div
            data-reveal
            data-hero-eyebrow
            className="flex items-center justify-center gap-4"
          >
            <span
              aria-hidden="true"
              className="h-px w-8 bg-gradient-to-r from-transparent to-lime/60 sm:w-12"
            />
            <p className="kicker">{hero.eyebrow}</p>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-gradient-to-l from-transparent to-lime/60 sm:w-12"
            />
          </div>

          {/* the massive two-line title */}
          <h1
            data-reveal
            data-hero-title
            className="display-title mt-7 text-display-xl"
          >
            <span className="block overflow-hidden">
              <span data-hero-line="0" className="block text-ink">
                {hero.titleLines[0]}
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-line="1" className="text-gradient-lime block">
                {hero.titleLines[1]}
              </span>
            </span>
          </h1>

          {/* tagline */}
          <p
            data-reveal
            data-hero-tagline
            className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-relaxed text-ink-soft md:text-lg"
          >
            {hero.tagline}
            <span className="mt-2 block">
              {hasLeague ? (
                <>
                  {contBefore}
                  <strong className="font-semibold text-ink">{site.league}</strong>
                  {contAfter}
                </>
              ) : (
                hero.taglineCont
              )}
            </span>
          </p>

          {/* chips */}
          <div
            data-reveal
            data-hero-chips
            className="mt-9 flex flex-wrap items-center justify-center gap-2.5"
          >
            {hero.chips.map((chip, i) => (
              <Badge
                key={chip}
                variant={i === hero.chips.length - 1 ? "lime" : "outline"}
              >
                {chip}
              </Badge>
            ))}
          </div>

          {/* CTAs */}
          <div
            data-reveal
            data-hero-ctas
            className="mt-10 flex w-full max-w-md flex-col items-stretch justify-center gap-4 sm:w-auto sm:max-w-none sm:flex-row sm:items-center"
          >
            <MagneticButton className="w-full sm:w-auto">
              <Button variant="insta" size="lg" asChild className="w-full sm:w-auto">
                <a href={hero.primaryCta.href} target="_blank" rel="noopener">
                  <Instagram aria-hidden="true" />
                  {hero.primaryCta.label}
                </a>
              </Button>
            </MagneticButton>
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => scrollToSection(hero.secondaryCta.href)}
            >
              {hero.secondaryCta.label}
              <ArrowDown aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* scroll indicator */}
        <div
          data-reveal
          data-hero-scrollhint
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center gap-3"
        >
          <span className="font-condensed text-xs uppercase tracking-[0.4em] text-ink-dim">
            Scroll
          </span>
          <span className="block h-12 w-0.5 overflow-hidden rounded-full bg-white/10">
            <span
              data-hero-scrollbar
              className="block h-4 w-full rounded-full bg-lime/80"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
