import { lazy, Suspense, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { sfx } from "@/lib/sound";

// Lazy: pulls in the shared three.js models chunk (already loaded by the
// hero scene) — mounted only once the desktop gate below passes.
const RollBallScene = lazy(() => import("@/components/three/RollBallScene"));

/** Hide the ball after this long without scrolling (it shouldn't sit
 *  parked over the content); the next scroll brings it back. */
const IDLE_HIDE_MS = 3200;

/**
 * BallJourney — the site-long flight of the hero's 3D pickleball.
 *
 * A fixed screen-space layer (mounted OUTSIDE the ScrollSmoother content,
 * where position:fixed still sticks) carrying the same 3D ball the hero
 * renders. Three scrubbed legs, each anchored to real sections so the
 * pinned stages keep feeding it scroll:
 *
 *  1. travel — thrown out of the hero (HeroScene), it enters bottom-left
 *     and zigzags between the screen edges down the League, crest-reveal
 *     and identity stages, finally sailing up off the top of the screen.
 *  2. bounce — it drops back in from the top over the moments wall and
 *     bounces with decaying height, like a ball running out of energy.
 *  3. rest — it rolls on into the community section, where it shrinks
 *     and fades away for good.
 *
 * Stopping the scroll for a few seconds fades the ball out (it must never
 * sit parked over content); the next scroll brings it straight back.
 */
export function BallJourney() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  // Scrubbed roll angle, shared with the 3D scene (tweened as an object
  // so GSAP can drive it like any other target).
  const rollRef = useRef({ z: 0 });
  // Catch-and-carry: the visitor can grab the ball and put it anywhere.
  // The offset lives on dragRef — BETWEEN the scrubbed flight (ballRef)
  // and the idle-hide fader (fadeRef) — so neither behavior is disturbed
  // and the drop position persists on top of the flight path.
  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    x: 0,
    y: 0,
    lastX: 0,
  });
  const draggingRef = useRef(false);
  // The canvas only mounts once the desktop gate passes — never on
  // touch/mobile/reduced-motion, where the effect doesn't run at all.
  const [active, setActive] = useState(false);

  const onGrab = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = dragState.current;
    s.active = true;
    draggingRef.current = true;
    s.startX = e.clientX;
    s.startY = e.clientY;
    s.lastX = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (dragRef.current) {
      // grabbing mid-return: stop the glide and pick up from where the
      // ball actually is right now
      gsap.killTweensOf(dragRef.current, "x,y");
      s.baseX = Number(gsap.getProperty(dragRef.current, "x")) || 0;
      s.baseY = Number(gsap.getProperty(dragRef.current, "y")) || 0;
      gsap.to(dragRef.current, { scale: 1.07, duration: 0.25, ease: "back.out(2)" });
    } else {
      s.baseX = s.x;
      s.baseY = s.y;
    }
    // grabbing an idle-faded ball wakes it up in hand
    if (fadeRef.current) {
      gsap.to(fadeRef.current, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
    }
    sfx.pop();
  };

  const onDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s.active) return;
    s.x = s.baseX + e.clientX - s.startX;
    s.y = s.baseY + e.clientY - s.startY;
    if (dragRef.current) gsap.set(dragRef.current, { x: s.x, y: s.y });
    // the ball rolls in hand as it's pulled sideways
    rollRef.current.z -= (e.clientX - s.lastX) * 0.006;
    s.lastX = e.clientX;
  };

  const onRelease = () => {
    const s = dragState.current;
    if (!s.active) return;
    s.active = false;
    draggingRef.current = false;
    // it sets exactly where it was dropped — just a settle squash
    if (dragRef.current) {
      gsap
        .timeline()
        .to(dragRef.current, { scale: 0.94, duration: 0.09, ease: "power2.in" })
        .to(dragRef.current, { scale: 1, duration: 0.45, ease: "elastic.out(1.1, 0.5)" });
    }
    sfx.bounce(0.6);
  };

  useGSAP(
    () => {
      // Desktop + fine pointer only — mirrors HeroScene's layout gate
      // (touch layouts center the ball high and lift it away instead,
      // so there is nothing falling out of the hero to continue).
      if (
        prefersReducedMotion() ||
        !window.matchMedia("(min-width: 768px)").matches ||
        window.matchMedia("(pointer: coarse)").matches
      )
        return;
      const ball = ballRef.current;
      const fade = fadeRef.current;
      if (!ball || !fade) return;

      // Resolve the anchor sections from the document explicitly — the
      // useGSAP scope is this fixed overlay, so selector STRINGS in the
      // trigger configs would be looked up inside it and never match.
      const league = document.querySelector("#tnppl");
      const moments = document.querySelector("#moments");
      const community = document.querySelector("#community");
      if (!league || !moments || !community) return;

      setActive(true);

      // Screen-space targets for the ball's CENTER, as viewport fractions
      // (the wrapper is anchored at the viewport origin, so translate by
      // center − half the ball). Function-based → remeasured on refresh.
      const cx = (f: number) => () => f * window.innerWidth - ball.offsetWidth / 2;
      const cy = (f: number) => () => f * window.innerHeight - ball.offsetHeight / 2;
      const roll = rollRef.current;
      const scrub = { scrub: 1, invalidateOnRefresh: true } as const;

      /* ---- leg 1: travel — League → crest reveal → identity ---- */
      // Opens once the hero is half scrolled away (right after HeroScene
      // threw the ball out bottom-left) and runs to the moments wall.
      const travel = gsap.timeline({
        scrollTrigger: {
          trigger: league,
          start: "top 55%",
          endTrigger: moments,
          end: "top 90%",
          ...scrub,
        },
      });
      travel
        // fades in below the fold…
        .fromTo(ball, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03, ease: "none" }, 0)
        // …rises from the bottom, hovers mid-screen through the pinned
        //   stages, then sails up off the top to set up the bounce…
        .fromTo(ball, { y: cy(1.18) }, { y: cy(0.66), duration: 0.24, ease: "sine.out" }, 0)
        .to(ball, { y: cy(0.52), duration: 0.28, ease: "sine.inOut" }, 0.24)
        .to(ball, { y: cy(0.44), duration: 0.23, ease: "sine.inOut" }, 0.52)
        .to(ball, { y: cy(-0.35), duration: 0.25, ease: "power1.in" }, 0.75)
        // …zigzagging between the screen edges the whole way…
        .fromTo(ball, { x: cx(0.17) }, { x: cx(0.8), duration: 0.2, ease: "sine.inOut" }, 0.02)
        .to(ball, { x: cx(0.2), duration: 0.21, ease: "sine.inOut" }, 0.24)
        .to(ball, { x: cx(0.74), duration: 0.21, ease: "sine.inOut" }, 0.47)
        .to(ball, { x: cx(0.28), duration: 0.18, ease: "sine.inOut" }, 0.7)
        .to(ball, { x: cx(0.55), duration: 0.12, ease: "sine.inOut" }, 0.88)
        // …the 3D roll flipping direction at every turn (negative z =
        //   clockwise = rolling rightward).
        .fromTo(roll, { z: 0 }, { z: -4.2, duration: 0.2, ease: "sine.inOut" }, 0.02)
        .to(roll, { z: -0.8, duration: 0.21, ease: "sine.inOut" }, 0.24)
        .to(roll, { z: -4.6, duration: 0.21, ease: "sine.inOut" }, 0.47)
        .to(roll, { z: -1.2, duration: 0.18, ease: "sine.inOut" }, 0.7)
        .to(roll, { z: -3.0, duration: 0.12, ease: "sine.inOut" }, 0.88);

      /* ---- leg 2: bounce — drops in from the top over the moments
              wall, each bounce lower than the last ---- */
      const bounce = gsap.timeline({
        scrollTrigger: {
          trigger: moments,
          start: "top 90%",
          endTrigger: community,
          end: "top 85%",
          ...scrub,
        },
      });
      bounce
        .fromTo(
          ball,
          { y: cy(-0.35) },
          { y: cy(0.8), duration: 0.28, ease: "power2.in", immediateRender: false },
          0
        )
        .to(ball, { y: cy(0.46), duration: 0.17, ease: "power2.out" }, 0.28)
        .to(ball, { y: cy(0.8), duration: 0.17, ease: "power2.in" }, 0.45)
        .to(ball, { y: cy(0.62), duration: 0.12, ease: "power2.out" }, 0.62)
        .to(ball, { y: cy(0.8), duration: 0.12, ease: "power2.in" }, 0.74)
        .to(ball, { y: cy(0.73), duration: 0.07, ease: "power2.out" }, 0.86)
        .to(ball, { y: cy(0.8), duration: 0.07, ease: "power2.in" }, 0.93)
        .fromTo(
          ball,
          { x: cx(0.55) },
          { x: cx(0.3), duration: 0.5, ease: "sine.out", immediateRender: false },
          0
        )
        .to(ball, { x: cx(0.44), duration: 0.5, ease: "sine.inOut" }, 0.5)
        .fromTo(
          roll,
          { z: -3.0 },
          { z: -6.5, duration: 1, ease: "none", immediateRender: false },
          0
        );

      /* ---- leg 3: rest — rolls into the community section and
              fades away for good ---- */
      const rest = gsap.timeline({
        scrollTrigger: {
          trigger: community,
          start: "top 85%",
          end: "top 30%",
          ...scrub,
        },
      });
      rest
        .fromTo(
          ball,
          { y: cy(0.8), x: cx(0.44) },
          { y: cy(0.86), x: cx(0.6), duration: 0.7, ease: "sine.inOut", immediateRender: false },
          0
        )
        .fromTo(
          roll,
          { z: -6.5 },
          { z: -7.6, duration: 0.7, ease: "sine.inOut", immediateRender: false },
          0
        )
        .to(ball, { autoAlpha: 0, scale: 0.6, duration: 0.3, ease: "power1.in" }, 0.7);

      // Idle-hide: fade the ball out when scrolling pauses, back in on
      // the next scroll. Runs on a separate inner element so it never
      // fights the legs' own enter/exit alpha tweens.
      let idleTimer: number | undefined;
      let hidden = false;
      const armIdle = () => {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
          // never fade the ball out of the visitor's hand mid-drag
          if (draggingRef.current) {
            armIdle();
            return;
          }
          hidden = true;
          gsap.to(fade, { autoAlpha: 0, duration: 0.6, overwrite: "auto" });
        }, IDLE_HIDE_MS);
      };
      const onScroll = () => {
        if (hidden) {
          hidden = false;
          gsap.to(fade, { autoAlpha: 1, duration: 0.3, overwrite: "auto" });
        }
        armIdle();
        // scrolling sends a hand-placed ball gliding back onto its
        // choreographed flight path (never while it's still held)
        const s = dragState.current;
        const drag = dragRef.current;
        if (drag && !s.active && (s.x !== 0 || s.y !== 0)) {
          s.x = 0;
          s.y = 0;
          gsap.to(drag, { x: 0, y: 0, duration: 0.7, ease: "power3.out", overwrite: "auto" });
        }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", onScroll);
        window.clearTimeout(idleTimer);
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 hidden md:block"
    >
      <div
        ref={ballRef}
        className="absolute left-0 top-0 aspect-square w-[clamp(230px,23vw,390px)] opacity-0 will-change-transform"
      >
        <div ref={dragRef} className="h-full w-full will-change-transform">
          <div ref={fadeRef} className="h-full w-full">
            {active && (
              <Suspense fallback={null}>
                <RollBallScene roll={rollRef} />
              </Suspense>
            )}
          </div>
          {/* grab zone — catch the ball, drag it anywhere, and it stays
              where you drop it (round, so clicks beside the ball pass
              through to the page) */}
          {active && (
            <div
              onPointerDown={onGrab}
              onPointerMove={onDrag}
              onPointerUp={onRelease}
              onPointerCancel={onRelease}
              className="pointer-events-auto absolute inset-[12%] cursor-grab touch-none rounded-full active:cursor-grabbing"
            />
          )}
        </div>
      </div>
    </div>
  );
}
