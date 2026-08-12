import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, RotateCcw } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { crestReveal } from "@/data/siteData";
import { burstConfetti } from "@/lib/confetti";
import { requestLeagueInvite } from "@/lib/leagueInvite";
import { sfx } from "@/lib/sound";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import crestLogo from "@/assets/logos/sss-logo-800.png";
import karthiPoster from "@/assets/images/karthi-reveal.jpg";

const SILHOUETTE = "brightness(0) saturate(0) blur(2px)";
const UNVEILED = "brightness(1) saturate(1) blur(0px)";
const CREST_ALT =
  "Salem Super Smashers official crest — twin paddles, ball and the hills of Salem";

type Phase = "pre" | "revealed";

/**
 * The crest reveal ceremony — drag the pickleball along the serve track to
 * launch the smash that unveils the SSS crest with stadium beams, a light
 * flash, shockwaves and confetti. Replayable.
 */
export function CrestRevealSection() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(() =>
    prefersReducedMotion() ? "revealed" : "pre"
  );

  // If the user enables reduced motion mid-session, settle the ceremony
  // into its revealed state so nothing stays hidden behind animations.
  useEffect(() => {
    if (reduced) setPhase("revealed");
  }, [reduced]);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const karthiRef = useRef<HTMLDivElement>(null);
  const beamsWrapRef = useRef<HTMLDivElement>(null);
  const emblemBlockRef = useRef<HTMLDivElement>(null);
  const emblemWrapRef = useRef<HTMLDivElement>(null);
  const crestRef = useRef<HTMLImageElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preWrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const trackFillRef = useRef<HTMLDivElement>(null);
  const trackLabelRef = useRef<HTMLDivElement>(null);
  const slideBallRef = useRef<HTMLButtonElement>(null);
  const throwBallRef = useRef<HTMLDivElement>(null);
  const postTitleRef = useRef<HTMLHeadingElement>(null);
  const postSubRef = useRef<HTMLParagraphElement>(null);
  const replayWrapRef = useRef<HTMLDivElement>(null);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const slideRef = useRef({ active: false, x: 0, max: 1, grabDX: 0, lastTickX: 0 });
  const springTweenRef = useRef<gsap.core.Tween | null>(null);
  const splitRef = useRef<SplitText | null>(null);
  const sheenTweenRef = useRef<gsap.core.Tween | null>(null);
  const confettiCleanupRef = useRef<(() => void) | null>(null);
  const tiltOnRef = useRef(false);
  const startedRef = useRef(false);
  const rotXTo = useRef<gsap.QuickToFunc | null>(null);
  const rotYTo = useRef<gsap.QuickToFunc | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      if (reduced) return;

      const emblemWrap = emblemWrapRef.current;
      const crest = crestRef.current;
      const postTitle = postTitleRef.current;
      const postSub = postSubRef.current;
      const replayWrap = replayWrapRef.current;
      const karthi = karthiRef.current;
      const emblemBlock = emblemBlockRef.current;
      const preWrap = preWrapRef.current;
      const stage = stageRef.current;
      if (
        !emblemWrap ||
        !crest ||
        !postTitle ||
        !postSub ||
        !replayWrap ||
        !karthi ||
        !emblemBlock ||
        !preWrap ||
        !stage
      ) {
        return;
      }

      // ----- initial states (JS-off / reduced-motion users never hit these).
      // Skip the silhouette when the crest is already revealed — e.g. the
      // user disabled reduced motion mid-session after loading revealed.
      gsap.set(emblemWrap, { transformPerspective: 900 });
      if (phase !== "revealed") {
        gsap.set(crest, {
          filter: SILHOUETTE,
          scale: 0.92,
          autoAlpha: 0.85,
          transformOrigin: "50% 50%",
        });
        gsap.set([postTitle, postSub, replayWrap], { autoAlpha: 0 });
      }

      rotXTo.current = gsap.quickTo(emblemWrap, "rotationX", {
        duration: 0.6,
        ease: "power3.out",
      });
      rotYTo.current = gsap.quickTo(emblemWrap, "rotationY", {
        duration: 0.6,
        ease: "power3.out",
      });

      // ----- ambient atmosphere
      gsap.to("[data-beam]", {
        opacity: 0.45,
        duration: 3.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 1.4,
      });
      gsap.to("[data-pulse-ring]", {
        scale: 1.05,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to("[data-slide-chevron]", {
        opacity: 0.9,
        x: 5,
        duration: 0.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.14,
      });

      // ----- scroll entrances
      gsap.fromTo(
        karthi,
        { autoAlpha: 0, x: -60 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: karthi, start: "top 80%", once: true },
        }
      );
      gsap.fromTo(
        [emblemBlock, preWrap],
        { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.15,
          ease: "expo.out",
          scrollTrigger: { trigger: stage, start: "top 75%", once: true },
        }
      );
    },
    // Re-init when the OS motion preference flips; revert inline styles so
    // reduced-motion users always get fully visible, static content.
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true }
  );

  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    confettiCleanupRef.current?.();
    // full-viewport cannons — the celebration takes the whole page
    confettiCleanupRef.current = burstConfetti(canvas, 240);
  };

  /** Builds + plays the ceremony. "initial" collapses the tap button first;
   *  "replay" resets the crest to silhouette and re-runs from the dim step. */
  const playReveal = contextSafe((mode: "initial" | "replay") => {
    if (prefersReducedMotion()) return;

    const emblemWrap = emblemWrapRef.current;
    const crest = crestRef.current;
    const sheen = sheenRef.current;
    const flash = flashRef.current;
    const veil = veilRef.current;
    const preWrap = preWrapRef.current;
    const postTitle = postTitleRef.current;
    const postSub = postSubRef.current;
    const replayWrap = replayWrapRef.current;
    const beamsWrap = beamsWrapRef.current;
    const rays = sectionRef.current?.querySelector<HTMLElement>("[data-rays]");
    const pulseRing =
      sectionRef.current?.querySelector<HTMLElement>("[data-pulse-ring]");
    const rings =
      sectionRef.current?.querySelectorAll<HTMLElement>("[data-shockwave]");
    if (
      !emblemWrap ||
      !crest ||
      !sheen ||
      !flash ||
      !veil ||
      !preWrap ||
      !postTitle ||
      !postSub ||
      !replayWrap ||
      !beamsWrap ||
      !rays ||
      !pulseRing ||
      !rings
    ) {
      return;
    }

    // ----- teardown of any previous run (no tween leaks)
    tlRef.current?.kill();
    sheenTweenRef.current?.kill();
    splitRef.current?.revert();
    splitRef.current = null;
    tiltOnRef.current = false;

    // ----- hard reset to the pre-flash state
    gsap.set(emblemWrap, { x: 0, rotationX: 0, rotationY: 0 });
    gsap.set(crest, { filter: SILHOUETTE, scale: 0.92, autoAlpha: 0.85 });
    gsap.set(sheen, { x: 0, xPercent: -120 });
    gsap.set([veil, flash], { autoAlpha: 0 });
    gsap.set([postTitle, postSub, replayWrap], { autoAlpha: 0 });
    if (mode === "replay") gsap.set(preWrap, { autoAlpha: 0 });

    const split = new SplitText(postTitle, { type: "chars,words" });
    split.chars.forEach((char) => {
      if (char.closest("[data-gradient-line]")) {
        char.classList.add("text-gradient-lime");
      }
    });
    splitRef.current = split;

    sheenTweenRef.current = gsap.fromTo(
      sheen,
      { x: 0, xPercent: -120 },
      {
        xPercent: 120,
        duration: 1.2,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 5.6,
        paused: true,
      }
    );

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => {
        splitRef.current?.revert();
        splitRef.current = null;
        tiltOnRef.current = true;
        sheenTweenRef.current?.play(0);
        // A beat after the first ceremony: invite them into the league
        // (no-op if the invite was already shown this session).
        if (mode === "initial") {
          gsap.delayedCall(0.7, requestLeagueInvite);
        }
      },
    });
    tlRef.current = tl;

    // 1 — the tap button gives way
    if (mode === "initial") {
      tl.to(preWrap, { scale: 0.9, duration: 0.12, ease: "power2.in" }).to(
        preWrap,
        { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: "power3.in" }
      );
    }
    const t0 = mode === "initial" ? 0.25 : 0;

    // 1.5 — the serve: a pickleball is hurled across the stage and
    // smashes into the silhouetted crest exactly on the flash.
    const stage = stageRef.current;
    const ball = throwBallRef.current;
    if (stage && ball) {
      const stageRect = stage.getBoundingClientRect();
      const emblemRect = emblemWrap.getBoundingClientRect();
      const size = 44;
      const ex = emblemRect.left + emblemRect.width / 2 - stageRect.left - size / 2;
      const ey = emblemRect.top + emblemRect.height / 2 - stageRect.top - size / 2;
      const sx = -size - 40; // launches from outside the stage's left edge
      const sy = stageRect.height * 0.9;
      const peakY = Math.max(ey - 180, 10);
      const T = t0 + 0.18;
      const FLIGHT = 0.57; // impact lands on the flash at t0 + 0.75

      tl.set(ball, { x: sx, y: sy, autoAlpha: 1, rotation: 0, scale: 0.85 }, T)
        // strike + rising flight, timed to the launch
        .call(() => sfx.serve(), [], T)
        .to(ball, { x: ex, duration: FLIGHT, ease: "none" }, T)
        .to(ball, { y: peakY, duration: FLIGHT * 0.55, ease: "power2.out" }, T)
        .to(ball, { y: ey, duration: FLIGHT * 0.45, ease: "power2.in" }, T + FLIGHT * 0.55)
        .to(ball, { rotation: 940, scale: 1.2, duration: FLIGHT, ease: "power1.in" }, T)
        // impact: the ball vanishes into the crest
        .to(ball, { autoAlpha: 0, scale: 0.3, duration: 0.12, ease: "power1.in" }, T + FLIGHT);
    }

    // 2 — stage dims, stadium beams surge
    tl.fromTo(
      veil,
      { autoAlpha: 0 },
      { autoAlpha: 0.6, duration: 0.3, ease: "power2.out" },
      t0
    )
      .to(beamsWrap, { opacity: 1, duration: 0.6, ease: "power2.out" }, t0)
      // 3 — anticipation micro-shake
      .to(
        emblemWrap,
        {
          keyframes: { x: [0, -3, 3, -3, 3, -2, 0] },
          duration: 0.32,
          ease: "none",
        },
        t0 + 0.35
      )
      .to(veil, { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, t0 + 0.7)
      // the ball smashes home exactly on the flash
      .call(() => sfx.smash(), [], t0 + 0.74)
      // 4 — the flash
      .fromTo(
        flash,
        { autoAlpha: 0 },
        { autoAlpha: 0.9, duration: 0.18, ease: "power2.in" },
        t0 + 0.75
      )
      .to(flash, { autoAlpha: 0, duration: 0.32, ease: "power2.out" }, t0 + 0.93)
      // 5 — crest un-silhouettes with an elastic settle
      .to(
        crest,
        { filter: UNVEILED, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
        t0 + 0.85
      )
      .to(crest, { scale: 1.06, duration: 0.25, ease: "power3.out" }, t0 + 0.85)
      .to(
        crest,
        { scale: 1, duration: 1.1, ease: "elastic.out(1, 0.4)" },
        t0 + 1.1
      )
      // 6 — shockwave rings ripple outward
      .fromTo(
        rings,
        { scale: 0.6, opacity: 0.8 },
        {
          scale: 1.6,
          opacity: 0,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.12,
          immediateRender: false,
        },
        t0 + 0.9
      )
      // 7 — confetti cannons + the crowd on its feet
      .call(fireConfetti, undefined, t0 + 0.95)
      .call(() => sfx.cheer(), [], t0 + 0.95)
      .call(() => sfx.fanfare(), [], t0 + 1.4)
      // 8 — rays and ring ease into a steady glow, beams settle
      .to(
        [rays, pulseRing],
        { opacity: 0.3, duration: 0.9, ease: "power2.out" },
        t0 + 1.2
      )
      .to(beamsWrap, { opacity: 0.7, duration: 0.8, ease: "sine.inOut" }, t0 + 1.5)
      // 9 — the proclamation
      .set(postTitle, { autoAlpha: 1 }, t0 + 1.35)
      .fromTo(
        split.chars,
        { y: 80, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", stagger: 0.03 },
        t0 + 1.4
      )
      .fromTo(
        postSub,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.7 },
        t0 + 2.1
      )
      // 10 — replay control
      .fromTo(
        replayWrap,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        t0 + 2.4
      );
  });

  const onUnveil = () => {
    if (phase !== "pre" || startedRef.current) return;
    startedRef.current = true;
    setPhase("revealed");
    playReveal("initial");
  };

  // ----- the slide-to-serve track ------------------------------------------
  const BALL_PAD = 6; // px inset of the ball inside the track

  /** Paints one frame of the slide: ball position + roll, fill, label fade. */
  const applySlide = (x: number) => {
    const ball = slideBallRef.current;
    const fill = trackFillRef.current;
    const label = trackLabelRef.current;
    const s = slideRef.current;
    const p = s.max > 0 ? x / s.max : 0;
    // The ball rolls along the track as it travels.
    if (ball) gsap.set(ball, { x, rotation: x * 0.85 });
    if (fill) gsap.set(fill, { width: x + (ball?.offsetWidth ?? 52) + BALL_PAD });
    if (label) gsap.set(label, { opacity: Math.max(0, 1 - p * 1.8) });
  };

  /** The serve: the ball zips to the end of the track and fires the reveal. */
  const completeSlide = contextSafe(() => {
    if (startedRef.current) return;
    const s = slideRef.current;
    s.active = false;
    sfx.whoosh(0.3, "up"); // the ball zips off the end of the track
    springTweenRef.current?.kill();
    springTweenRef.current = gsap.to(s, {
      x: s.max,
      duration: 0.16,
      ease: "power2.in",
      onUpdate: () => applySlide(s.x),
      onComplete: onUnveil,
    });
  });

  const onSlidePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (phase !== "pre" || startedRef.current || prefersReducedMotion()) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const track = trackRef.current;
    const ball = slideBallRef.current;
    if (!track || !ball) return;
    const s = slideRef.current;
    springTweenRef.current?.kill();
    s.max = track.clientWidth - ball.offsetWidth - BALL_PAD * 2;
    s.grabDX = e.clientX - s.x;
    s.lastTickX = s.x;
    s.active = true;
    ball.setPointerCapture(e.pointerId);
  };

  const onSlidePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = slideRef.current;
    if (!s.active) return;
    s.x = Math.min(Math.max(e.clientX - s.grabDX, 0), s.max);
    applySlide(s.x);
    // ratchet ticks as the ball rolls forward, rising in pitch
    if (s.x - s.lastTickX > 26) {
      s.lastTickX = s.x;
      sfx.tick(s.max > 0 ? s.x / s.max : 0);
    } else if (s.x < s.lastTickX) {
      s.lastTickX = s.x;
    }
    if (s.x >= s.max - 1) completeSlide();
  };

  const onSlidePointerUp = contextSafe(() => {
    const s = slideRef.current;
    if (!s.active) return;
    s.active = false;
    // Close enough — count it as a serve. Otherwise spring back.
    if (s.x >= s.max * 0.8) {
      completeSlide();
      return;
    }
    springTweenRef.current?.kill();
    springTweenRef.current = gsap.to(s, {
      x: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)",
      onUpdate: () => applySlide(s.x),
    });
  });

  // Keyboard users shouldn't have to drag — activate instantly.
  const onCtaKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onUnveil();
  };

  const onReplay = () => playReveal("replay");

  // Post-reveal pointer tilt on the emblem (mouse only).
  const onEmblemMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tiltOnRef.current || e.pointerType !== "mouse" || prefersReducedMotion())
      return;
    const el = emblemWrapRef.current;
    const rx = rotXTo.current;
    const ry = rotYTo.current;
    if (!el || !rx || !ry) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry(px * 8);
    rx(-py * 8);
  };

  const onEmblemLeave = () => {
    if (!tiltOnRef.current) return;
    rotXTo.current?.(0);
    rotYTo.current?.(0);
  };

  // Kill non-GSAP-context resources on unmount.
  useEffect(
    () => () => {
      confettiCleanupRef.current?.();
      splitRef.current?.revert();
    },
    []
  );

  return (
    <section
      id="reveal"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-night via-night-800/80 to-night-800"
    >
      {/* Stadium light beams from the top corners */}
      <div
        ref={beamsWrapRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.55]"
      >
        <div
          data-beam
          className="absolute -left-24 -top-32 h-[70vh] w-[34vw] min-w-[16rem] rotate-[18deg] skew-x-[-8deg] bg-gradient-to-b from-royal-bright/15 via-royal-bright/5 to-transparent opacity-80 blur-2xl"
        />
        <div
          data-beam
          className="absolute -right-24 -top-32 h-[70vh] w-[34vw] min-w-[16rem] rotate-[-18deg] skew-x-[8deg] bg-gradient-to-b from-royal-bright/15 via-royal-bright/5 to-transparent opacity-80 blur-2xl"
        />
      </div>

      <div
        aria-hidden="true"
        className="glow-spot left-1/2 top-24 h-80 w-80 -translate-x-1/2 bg-royal/20"
      />
      <div
        aria-hidden="true"
        className="glow-spot bottom-12 right-[10%] h-72 w-72 bg-lime/[0.07]"
      />

      <div className="section-shell">
        <SectionHeading
          kicker={crestReveal.kicker}
          title={crestReveal.title}
          lead={crestReveal.lead}
        />

        <div className="grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr]">
          {/* ——— Karthi, the unveiler ——— */}
          <div ref={karthiRef} data-reveal className="order-1">
            <GlassCard tilt className="group overflow-hidden">
              <div className="overflow-hidden">
                <img
                  src={karthiPoster}
                  alt="Actor Karthi on stage unveiling the Salem Super Smashers crest"
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-line px-5 py-4">
                <div>
                  <p className="kicker text-xs tracking-[0.28em]">
                    {crestReveal.unveiledBy.label}
                  </p>
                  <p className="mt-1 font-display text-xl uppercase text-ink">
                    {crestReveal.unveiledBy.name}
                  </p>
                </div>
                <p className="font-condensed text-lg tracking-[0.18em] text-ink-dim">
                  {crestReveal.unveiledBy.date}
                </p>
              </div>
            </GlassCard>
          </div>

          {/* ——— The ceremony stage ——— */}
          <div
            ref={stageRef}
            className="relative order-2 flex flex-col items-center"
          >
            <div ref={emblemBlockRef} data-reveal className="relative">
              <div
                ref={emblemWrapRef}
                onPointerMove={onEmblemMove}
                onPointerLeave={onEmblemLeave}
                className="relative aspect-square w-[min(78vw,360px)] will-change-transform md:w-[min(72vw,420px)]"
              >
                {/* rotating rays disc */}
                <div
                  aria-hidden="true"
                  data-rays
                  className="absolute -inset-6 animate-spin-slow rounded-full opacity-50 blur-sm"
                  style={{
                    background:
                      "repeating-conic-gradient(from 0deg, rgba(27,116,224,0.10) 0deg 9deg, transparent 9deg 22deg)",
                  }}
                />
                {/* pulsing halo ring */}
                <div
                  aria-hidden="true"
                  data-pulse-ring
                  className="absolute -inset-3 rounded-full border border-lime/25"
                />

                <img
                  ref={crestRef}
                  src={crestLogo}
                  alt={CREST_ALT}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="relative z-10 h-full w-full select-none object-contain drop-shadow-[0_24px_60px_rgba(5,13,31,0.7)]"
                />

                {/* sheen sweep, clipped to the emblem circle */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-full"
                >
                  <div
                    ref={sheenRef}
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(-20deg, transparent 38%, rgba(255,255,255,0.22) 50%, transparent 62%)",
                      transform: "translateX(-120%)",
                    }}
                  />
                </div>

                {/* shockwave rings */}
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    data-shockwave
                    className="absolute inset-0 rounded-full border-2 border-lime/60 opacity-0"
                  />
                ))}

              </div>
            </div>

            {/* PRE and POST share one reserved box — no layout shift */}
            <div className="relative mt-10 w-full min-h-[15rem] md:min-h-[16rem]">
              <div className="flex min-h-[15rem] flex-col items-center justify-center gap-4 text-center md:min-h-[16rem]">
                <h3
                  ref={postTitleRef}
                  data-reveal
                  className="font-display text-display-md uppercase"
                >
                  <span className="block text-ink">
                    {crestReveal.postTitleLines[0]}
                  </span>
                  <span data-gradient-line className="text-gradient-lime block">
                    {crestReveal.postTitleLines[1]}
                  </span>
                </h3>
                <p
                  ref={postSubRef}
                  data-reveal
                  className="max-w-sm text-base leading-relaxed text-ink-soft"
                >
                  {crestReveal.postSub}
                </p>
                <div
                  ref={replayWrapRef}
                  data-reveal
                  className={cn(reduced && "hidden")}
                >
                  <Button variant="ghost" size="sm" onClick={onReplay}>
                    <RotateCcw aria-hidden="true" />
                    {crestReveal.replayLabel}
                  </Button>
                </div>
              </div>

              <div
                ref={preWrapRef}
                data-reveal
                aria-hidden={phase === "revealed"}
                className={cn(
                  "absolute inset-0 z-10 flex items-center justify-center",
                  phase === "revealed" && "pointer-events-none",
                  // Hidden for reduced-motion users, and whenever the crest is
                  // revealed without the ceremony having animated the button
                  // away (mid-session motion-preference flips).
                  (reduced || (phase === "revealed" && !startedRef.current)) &&
                    "hidden"
                )}
              >
                <div
                  ref={trackRef}
                  className="relative h-16 w-[min(82vw,340px)] overflow-hidden rounded-full border border-lime/30 bg-night/60 shadow-[inset_0_2px_12px_rgba(5,13,31,0.7)] backdrop-blur-md"
                >
                  {/* progress fill trailing the ball */}
                  <div
                    ref={trackFillRef}
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-0 rounded-full bg-gradient-to-r from-lime/5 via-lime/20 to-lime/40"
                  />
                  {/* label + nudge chevrons */}
                  <div
                    ref={trackLabelRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 pl-12"
                  >
                    <span className="flex items-center">
                      {[0, 1, 2].map((i) => (
                        <ChevronRight
                          key={i}
                          data-slide-chevron
                          className="-ml-2 h-4 w-4 text-lime opacity-30"
                        />
                      ))}
                    </span>
                    <span className="font-condensed text-sm uppercase tracking-[0.3em] text-lime">
                      {crestReveal.unveilCta}
                    </span>
                  </div>
                  {/* the ball — grab it and drag it down the track */}
                  <button
                    ref={slideBallRef}
                    type="button"
                    onPointerDown={onSlidePointerDown}
                    onPointerMove={onSlidePointerMove}
                    onPointerUp={onSlidePointerUp}
                    onPointerCancel={onSlidePointerUp}
                    onKeyDown={onCtaKeyDown}
                    onContextMenu={(e) => e.preventDefault()}
                    tabIndex={phase === "revealed" ? -1 : 0}
                    aria-label={`${crestReveal.unveilCta} — drag the ball to the end of the track, or press Enter, to unveil the crest`}
                    className="absolute left-1.5 top-1.5 h-[3.25rem] w-[3.25rem] cursor-grab touch-none select-none rounded-full outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-lime/70 active:cursor-grabbing"
                  >
                    <svg
                      viewBox="0 0 100 100"
                      className="h-full w-full drop-shadow-[0_10px_22px_rgba(5,13,31,0.65)]"
                    >
                      <defs>
                        <radialGradient
                          id="ctaSlideBall"
                          cx="0.36"
                          cy="0.3"
                          r="0.85"
                        >
                          <stop offset="0" stopColor="#fffef5" />
                          <stop offset="0.55" stopColor="#efeee6" />
                          <stop offset="1" stopColor="#c9c7b6" />
                        </radialGradient>
                      </defs>
                      <circle cx="50" cy="50" r="46" fill="url(#ctaSlideBall)" stroke="#0d2a55" strokeWidth="4" />
                      <circle cx="50" cy="28" r="7" fill="#0d2a55" />
                      <circle cx="30" cy="42" r="7" fill="#0d2a55" />
                      <circle cx="70" cy="42" r="7" fill="#0d2a55" />
                      <circle cx="40" cy="62" r="7" fill="#0d2a55" />
                      <circle cx="62" cy="63" r="7" fill="#0d2a55" />
                      <circle cx="51" cy="80" r="6" fill="#0d2a55" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* the served pickleball that smashes the crest open */}
            <div
              ref={throwBallRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-[25] h-11 w-11 opacity-0"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]">
                <defs>
                  <radialGradient id="crestThrowBall" cx="0.36" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#fffef5" />
                    <stop offset="0.55" stopColor="#efeee6" />
                    <stop offset="1" stopColor="#c9c7b6" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="46" fill="url(#crestThrowBall)" stroke="#0d2a55" strokeWidth="4" />
                <circle cx="50" cy="28" r="7" fill="#0d2a55" />
                <circle cx="30" cy="42" r="7" fill="#0d2a55" />
                <circle cx="70" cy="42" r="7" fill="#0d2a55" />
                <circle cx="40" cy="62" r="7" fill="#0d2a55" />
                <circle cx="62" cy="63" r="7" fill="#0d2a55" />
                <circle cx="51" cy="80" r="6" fill="#0d2a55" />
              </svg>
            </div>

          </div>
        </div>
      </div>

      {/* Ceremony overlay — dim veil, reveal flash and confetti across the
          WHOLE page (like the original site). Portaled to <body>: inside
          the ScrollSmoother's transformed content, position:fixed would
          not stick to the viewport. */}
      {createPortal(
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[85]"
        >
          <div ref={veilRef} className="absolute inset-0 bg-night opacity-0" />
          <div
            ref={flashRef}
            className="absolute inset-0 opacity-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,255,245,0.95) 0%, rgba(203,230,110,0.5) 32%, rgba(255,255,245,0.12) 55%, transparent 78%)",
            }}
          />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>,
        document.body
      )}
    </section>
  );
}
