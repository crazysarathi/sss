import { useEffect, useRef, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { crestReveal } from "@/data/siteData";
import { burstConfetti } from "@/lib/confetti";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassCard } from "@/components/shared/GlassCard";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Button } from "@/components/ui/button";
import crestLogo from "@/assets/logos/sss-logo-800.png";
import karthiPoster from "@/assets/images/karthi-reveal.jpg";

const SILHOUETTE = "brightness(0) saturate(0) blur(2px)";
const UNVEILED = "brightness(1) saturate(1) blur(0px)";
const CREST_ALT =
  "Salem Super Smashers official crest — twin paddles, ball and the hills of Salem";

type Phase = "pre" | "revealed";

/**
 * The crest reveal ceremony — tap to unveil the SSS crest with stadium
 * beams, a light flash, shockwaves and confetti. Replayable.
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
  const postTitleRef = useRef<HTMLHeadingElement>(null);
  const postSubRef = useRef<HTMLParagraphElement>(null);
  const replayWrapRef = useRef<HTMLDivElement>(null);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
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
      gsap.to("[data-cta-ring]", {
        scale: 1.16,
        opacity: 0.15,
        duration: 1.7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
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
    confettiCleanupRef.current = burstConfetti(canvas, 160);
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
      // 7 — confetti cannons
      .call(fireConfetti, undefined, t0 + 0.95)
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

                {/* reveal flash */}
                <div
                  ref={flashRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-12 z-30 rounded-full opacity-0"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(203,230,110,0.55) 38%, transparent 72%)",
                  }}
                />
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
                <MagneticButton strength={0.3} className="relative">
                  <span
                    aria-hidden="true"
                    data-cta-ring
                    className="absolute -inset-4 rounded-full border border-lime/40 opacity-60"
                  />
                  <button
                    type="button"
                    onClick={onUnveil}
                    tabIndex={phase === "revealed" ? -1 : 0}
                    className="relative flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-full border border-lime/50 bg-lime/10 px-5 font-condensed text-sm uppercase leading-relaxed tracking-[0.3em] text-lime backdrop-blur-md transition-all duration-300 hover:bg-lime/20 hover:shadow-glow-lime"
                  >
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                    {crestReveal.unveilCta}
                  </button>
                </MagneticButton>
              </div>
            </div>

            {/* dim veil + confetti canvas over the whole stage column */}
            <div
              ref={veilRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 bg-night opacity-0"
            />
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30 h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
