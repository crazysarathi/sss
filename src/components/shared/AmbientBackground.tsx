import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Global ambient backdrop — lives OUTSIDE the ScrollSmoother wrapper,
 * behind all content. Three soft light fields drift continuously and
 * travel/re-color as the page scrolls, so every section sits in slightly
 * different light instead of a flat navy void.
 */
export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Continuous idle drift (independent of scroll).
      gsap.to("[data-amb='a']", {
        y: 60,
        x: -40,
        duration: 14,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to("[data-amb='b']", {
        y: -50,
        x: 30,
        duration: 17,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to("[data-amb='c']", {
        y: 40,
        duration: 20,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Scroll journey: the light fields wander and re-color down the page.
      const journey = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          start: 0,
          end: () => ScrollTrigger.maxScroll(window),
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      journey
        // Transform/opacity only: animating background-color here would
        // repaint a ~60vmax blurred layer on every scrubbed frame, which
        // is the single most expensive thing a scroll handler can do.
        // royal field: top-right → mid-left → low-right
        .to(
          "[data-amb-track='a']",
          {
            keyframes: [
              { xPercent: -46, yPercent: 30 },
              { xPercent: -18, yPercent: 66 },
            ],
          },
          0
        )
        // deep field: bottom-left → upper-right
        .to(
          "[data-amb-track='b']",
          {
            keyframes: [
              { xPercent: 40, yPercent: -34 },
              { xPercent: 16, yPercent: -60 },
            ],
          },
          0
        )
        // lime ember: rises from below and brightens near the finale
        .to(
          "[data-amb-track='c']",
          {
            keyframes: [
              { yPercent: -30, opacity: 0.5 },
              { yPercent: -74, opacity: 0.9 },
            ],
          },
          0
        );
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      {/* royal light field */}
      <div data-amb-track="a" className="absolute right-[-14%] top-[-12%]">
        <div
          data-amb="a"
          className="h-[62vmax] w-[62vmax] rounded-full bg-[rgba(27,116,224,0.24)] blur-3xl"
        />
      </div>
      {/* deep blue counter-field */}
      <div data-amb-track="b" className="absolute bottom-[-18%] left-[-16%]">
        <div
          data-amb="b"
          className="h-[52vmax] w-[52vmax] rounded-full bg-[rgba(13,63,143,0.28)] blur-3xl"
        />
      </div>
      {/* lime ember — barely there until the page's final act */}
      <div
        data-amb-track="c"
        className="absolute bottom-[-42%] left-1/2 -translate-x-1/2 opacity-40"
      >
        <div
          data-amb="c"
          className="h-[46vmax] w-[70vmax] rounded-full bg-[rgba(203,230,110,0.07)] blur-3xl"
        />
      </div>
      {/* static vignette keeps edges cinematic */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 40%, transparent 55%, rgba(2,6,16,0.55) 100%)",
        }}
      />
    </div>
  );
}
