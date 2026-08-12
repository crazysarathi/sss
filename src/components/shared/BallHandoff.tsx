import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { sfx } from "@/lib/sound";

/**
 * Scroll-scrubbed handoff between the Identity stage and the Schedule of
 * Events: as the visitor scrolls past the last crest story, a pickleball
 * is "served" out of the paddle area — arcing down and across, spinning,
 * bouncing once — and vanishes into the events timeline below. Rendered
 * as a zero-height layer between the two sections (both clip overflow,
 * so the ball must live outside them to cross the boundary).
 */
export function BallHandoff() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Desktop-only flourish — the mobile identity section has no paddle
      // frame to throw from.
      if (prefersReducedMotion() || !window.matchMedia("(min-width: 768px)").matches)
        return;
      const root = rootRef.current;
      const ball = ballRef.current;
      if (!root || !ball) return;

      // Launch point: the paddle in the (pinned, so unmeasurable) identity
      // frame — viewport-relative puts it on the paddle across breakpoints.
      const startX = () => -0.22 * window.innerWidth;
      const startY = () => -0.5 * window.innerHeight;
      // Landing point: the timeline rail's tip, measured for real. Both the
      // root and the rail sit below the identity pin spacer, so their
      // document-space offset is stable no matter the pin state.
      const rail = document.querySelector("[data-timeline-rail]");
      const endX = () => {
        if (!rail) return 0;
        const r = rail.getBoundingClientRect();
        return r.left + r.width / 2 - window.innerWidth / 2;
      };
      const endY = () => {
        if (!rail || !rootRef.current) return 320;
        return (
          rail.getBoundingClientRect().top -
          rootRef.current.getBoundingClientRect().top -
          22
        );
      };

      // The flight must FINISH before the rail's own scrub begins
      // (list "top 70%" in TimelineSection) so only one ball is ever on
      // screen: land + fade by the time the rail marker fades in.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 95%",
          end: "top 45%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      tl
        // pops out of the paddle…
        .fromTo(
          ball,
          { autoAlpha: 0, scale: 0.3 },
          { autoAlpha: 1, scale: 1, duration: 0.08, ease: "none" },
          0
        )
        // …sails toward the rail…
        .fromTo(ball, { x: startX }, { x: endX, ease: "none", duration: 1 }, 0)
        // …on a thrown arc: a short rise off the paddle, then the drop…
        .fromTo(
          ball,
          { y: startY },
          { y: () => startY() - 0.12 * window.innerHeight, duration: 0.25, ease: "power2.out" },
          0
        )
        .to(ball, { y: endY, duration: 0.75, ease: "power1.in" }, 0.25)
        // …spinning the whole way…
        .fromTo(ball, { rotation: 0 }, { rotation: 720, ease: "none", duration: 1 }, 0)
        // …and is absorbed at the rail's tip, where the timeline takes over.
        .to(ball, { autoAlpha: 0, scale: 0.55, duration: 0.1, ease: "power1.in" }, 0.9);

      // Soft landing thock as the ball reaches the rail. The timeline is
      // scrub-driven, so detect forward playhead crossings ourselves and
      // throttle re-fires.
      let lastLand = 0;
      let prevProgress = 0;
      tl.eventCallback("onUpdate", () => {
        const p = tl.progress();
        if (prevProgress < 0.88 && p >= 0.88) {
          const now = performance.now();
          if (now - lastLand >= 1500) {
            lastLand = now;
            sfx.bounce(0.5);
          }
        }
        prevProgress = p;
      });
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none relative z-10 hidden h-0 md:block"
    >
      <div ref={ballRef} className="absolute left-1/2 top-0 -ml-[22px] opacity-0 will-change-transform">
        <svg viewBox="0 0 28 28" width="44" height="44" className="drop-shadow-[0_0_18px_rgba(203,230,110,0.35)]">
          <circle cx="14" cy="14" r="13" fill="#efeee6" />
          <circle cx="14" cy="14" r="13" fill="none" stroke="rgba(5,13,31,0.25)" strokeWidth="1" />
          <circle cx="14" cy="7.6" r="2" fill="#0d2a55" />
          <circle cx="7.9" cy="12.1" r="2" fill="#0d2a55" />
          <circle cx="20.1" cy="12.1" r="2" fill="#0d2a55" />
          <circle cx="10.2" cy="19.4" r="2" fill="#0d2a55" />
          <circle cx="17.8" cy="19.4" r="2" fill="#0d2a55" />
        </svg>
      </div>
    </div>
  );
}
