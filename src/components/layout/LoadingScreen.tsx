import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { sfx, startMusic } from "@/lib/sound";
import { site } from "@/data/siteData";
import crestLogo from "@/assets/logos/sss-logo-small.png";

interface LoadingScreenProps {
  onComplete: () => void;
}

/** Deterministic sparkle positions (percent coordinates). */
const SPARKLES = [
  [12, 24], [22, 68], [31, 38], [44, 82], [58, 16],
  [67, 62], [76, 30], [85, 74], [8, 52], [92, 44],
  [38, 12], [54, 90], [17, 86], [83, 12],
] as const;

/** Paddle silhouette used by the assembly sequence. */
function PaddleGlyph({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 190"
      className="h-full w-full"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`pfill-${flip ? "r" : "l"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b74e0" />
          <stop offset="1" stopColor="#0d3f8f" />
        </linearGradient>
      </defs>
      <rect
        x="14" y="8" width="92" height="122" rx="42"
        fill={`url(#pfill-${flip ? "r" : "l"})`}
        stroke="#cbe66e" strokeWidth="4"
      />
      <rect x="50" y="126" width="20" height="52" rx="9" fill="#0d2a55" stroke="#cbe66e" strokeWidth="3" />
      {[
        [44, 44], [64, 38], [82, 52], [38, 72], [60, 66], [80, 82], [48, 96], [70, 102],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.4" fill="#0d2a55" opacity="0.55" />
      ))}
    </svg>
  );
}

/** Cream pickleball with navy holes. */
function BallGlyph() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="introBall" cx="0.36" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#fffef5" />
          <stop offset="0.55" stopColor="#efeee6" />
          <stop offset="1" stopColor="#c9c7b6" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#introBall)" stroke="#0d2a55" strokeWidth="4" />
      <circle cx="50" cy="28" r="7" fill="#0d2a55" />
      <circle cx="30" cy="42" r="7" fill="#0d2a55" />
      <circle cx="70" cy="42" r="7" fill="#0d2a55" />
      <circle cx="40" cy="62" r="7" fill="#0d2a55" />
      <circle cx="62" cy="63" r="7" fill="#0d2a55" />
      <circle cx="51" cy="80" r="6" fill="#0d2a55" />
    </svg>
  );
}

/**
 * Opening ceremony v2 — the crest ASSEMBLES before your eyes.
 *
 * Night stage → spotlight + court lines draw → twin paddles swing in and
 * cross → the ball drops with a bounce → flash → the parts become the
 * official crest → "YOU'RE INVITED" rises with a light sweep → the stage
 * parts like curtains into the hero. Tap / Enter / Escape skips.
 */
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  };

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 0, display: "none" });
        finish();
        return;
      }

      const prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      const unlock = () => {
        document.documentElement.style.overflow = prevOverflow;
      };

      const title = el.querySelector<HTMLElement>("[data-intro-title]");
      const split = title ? new SplitText(title, { type: "chars,words" }) : null;

      // While the entry gate is up, the ceremony stage stays dark: the
      // timeline waits paused and pre-lit elements are hidden by hand.
      gsap.set("[data-intro-content]", { autoAlpha: 0 });
      gsap.set("[data-c-line]", { scaleX: 0 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out" },
        onComplete: () => {
          unlock();
          finish();
          gsap.set(el, { display: "none" });
        },
      });

      tl
        .set("[data-intro-content]", { autoAlpha: 1 }, 0)
        // ---- stage lights up
        .fromTo("[data-c-spot]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 0)
        .fromTo(
          "[data-c-line]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: "power3.inOut", stagger: 0.1 },
          0.08
        )
        .fromTo(
          "[data-intro-sparkle]",
          { autoAlpha: 0, scale: 0.4 },
          { autoAlpha: 0.8, scale: 1, duration: 0.7, stagger: 0.025, ease: "power2.out" },
          0.12
        )
        .to("[data-intro-sparkle]", { y: -12, duration: 2.2, ease: "sine.inOut", stagger: 0.04 }, 0.35)

        // ---- twin paddles swing in and cross (the crest X).
        // Centering lives in the GSAP transform (-50/-50) — Tailwind
        // translate classes would be clobbered by xPercent/yPercent.
        .fromTo(
          "[data-c-pl]",
          { xPercent: -290, yPercent: -14, rotation: -80, autoAlpha: 0 },
          { xPercent: -76, yPercent: -50, rotation: -24, autoAlpha: 1, duration: 0.8, ease: "back.out(1.4)" },
          0.4
        )
        .fromTo(
          "[data-c-pr]",
          { xPercent: 190, yPercent: -14, rotation: 80, autoAlpha: 0 },
          { xPercent: -24, yPercent: -50, rotation: 24, autoAlpha: 1, duration: 0.8, ease: "back.out(1.4)" },
          0.46
        )

        // ---- the ball drops in and bounces at the cross
        .fromTo(
          "[data-c-ball]",
          { xPercent: -50, yPercent: -50, y: "-58vh", autoAlpha: 1 },
          { y: 0, duration: 0.55, ease: "power2.in" },
          0.95
        )
        .to("[data-c-ball]", { scaleY: 0.78, scaleX: 1.16, duration: 0.09, ease: "power1.in" }, 1.5)
        .to("[data-c-ball]", { scaleY: 1, scaleX: 1, y: -26, duration: 0.3, ease: "power2.out" }, 1.59)
        .to("[data-c-ball]", { y: 0, duration: 0.28, ease: "bounce.out" }, 1.89)
        .fromTo(
          "[data-c-ring]",
          { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0.9 },
          { scale: 2.6, autoAlpha: 0, duration: 0.7, ease: "power2.out" },
          1.5
        )

        // ---- flash: the parts become the crest
        .fromTo(
          "[data-c-flash]",
          { autoAlpha: 0 },
          { autoAlpha: 0.85, duration: 0.16, ease: "power1.in" },
          2.05
        )
        .to("[data-c-flash]", { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 2.21)
        .to(
          "[data-c-parts]",
          { scale: 0.6, autoAlpha: 0, duration: 0.4, ease: "power2.inOut" },
          2.07
        )
        .fromTo(
          "[data-intro-crest]",
          { scale: 0.55, autoAlpha: 0, rotation: -6 },
          { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.55)" },
          2.15
        )

        // ---- the words
        .fromTo(
          "[data-intro-kicker]",
          { autoAlpha: 0, letterSpacing: "0.6em" },
          { autoAlpha: 1, letterSpacing: "0.42em", duration: 0.7 },
          2.35
        )
        .fromTo(
          split ? split.chars : "[data-intro-title]",
          { y: 110, rotateX: -32, transformOrigin: "50% 100%", transformPerspective: 600 },
          { y: 0, rotateX: 0, duration: 0.95, stagger: 0.03 },
          2.5
        )
        .fromTo(
          "[data-intro-sweep]",
          { xPercent: -160 },
          { xPercent: 160, duration: 0.85, ease: "power2.inOut" },
          2.95
        )
        .fromTo("[data-intro-sub]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 3.05)

        // ---- EXIT: the stage parts like curtains
        .addLabel("exit", 3.8)
        .to("[data-intro-content]", { autoAlpha: 0, y: -30, duration: 0.4, ease: "power2.in" }, "exit")
        .to(["[data-intro-sparkle]", "[data-c-spot]", "[data-c-line]"], { autoAlpha: 0, duration: 0.3 }, "exit")
        .to("[data-intro-seam]", { autoAlpha: 1, duration: 0.25 }, "exit")
        .call(finish, [], "exit+=0.3")
        .to("[data-intro-panel='l']", { xPercent: -101, duration: 0.95, ease: "expo.inOut" }, "exit+=0.3")
        .to("[data-intro-panel='r']", { xPercent: 101, duration: 0.95, ease: "expo.inOut" }, "exit+=0.3")
        .to("[data-intro-seam]", { autoAlpha: 0, duration: 0.4 }, "exit+=0.5")
        .set(el, { pointerEvents: "none" }, "exit+=0.3");

      // ---- sound cues, riding the same timeline. Silent no-ops until the
      // first tap unlocks audio; skipped entirely when the user jumps to
      // "exit" (play() seeks with events suppressed).
      tl.call(() => sfx.whoosh(0.6, "up"), [], 0.1) // stage lights + court lines
        .call(() => sfx.swish(), [], 0.42) // left paddle swings in
        .call(() => sfx.swish(), [], 0.5) // right paddle answers
        .call(() => sfx.bounce(1), [], 1.5) // the ball lands
        .call(() => sfx.bounce(0.45), [], 1.92) // settle bounce
        .call(() => sfx.smash(), [], 2.05) // flash — parts become the crest
        .call(() => sfx.fanfare(), [], 2.5) // "YOU'RE INVITED"
        .call(() => sfx.whoosh(0.8, "down"), [], "exit+=0.3"); // curtains part

      // ---- the entry gate: one tap opens the lock, starts the score and
      // rolls the ceremony — the opening always plays WITH sound.
      const gate = el.querySelector<HTMLElement>("[data-gate]");
      let entered = false;

      // gate idle life: the ball drops into the lock, the shackle lands,
      // then the whole lock floats on a pulsing halo
      gsap.from("[data-gate-ball]", {
        y: -160,
        duration: 0.7,
        ease: "bounce.out",
        delay: 0.2,
      });
      gsap.from("[data-gate-shackle]", {
        y: -24,
        autoAlpha: 0,
        duration: 0.45,
        ease: "back.out(2)",
        delay: 0.85,
      });
      gsap.to("[data-gate-float]", {
        y: -10,
        duration: 1.7,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.3,
      });
      gsap.to("[data-gate-ring]", {
        scale: 1.14,
        opacity: 0.25,
        duration: 1.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      const enter = () => {
        if (entered) return;
        entered = true;
        startMusic(); // the gate tap carries the activation — guaranteed
        sfx.paddle();
        const g = gsap.timeline();
        g.to("[data-gate-shackle]", {
          rotation: -42,
          y: -12,
          transformOrigin: "20% 100%",
          duration: 0.32,
          ease: "back.out(2.2)",
        })
          .to(
            "[data-gate-ring]",
            { scale: 2.4, autoAlpha: 0, duration: 0.5, ease: "power2.out" },
            0.04
          )
          .to(
            gate,
            { autoAlpha: 0, scale: 1.05, duration: 0.4, ease: "power2.in" },
            0.3
          )
          .call(
            () => {
              if (gate) {
                gsap.killTweensOf(gate.querySelectorAll("*"));
                gsap.set(gate, { display: "none" });
              }
              tl.play();
            },
            [],
            0.66
          );
      };

      // The ceremony always plays through — no tap-to-skip. Escape stays
      // as a quiet keyboard escape hatch; Enter/Space opens the gate.
      const onKey = (e: KeyboardEvent) => {
        if (!entered && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          enter();
          return;
        }
        if (e.key === "Escape" && tl.progress() < 1 && tl.time() < tl.labels.exit) {
          tl.play("exit");
        }
      };
      gate?.addEventListener("click", enter);
      window.addEventListener("keydown", onKey);

      return () => {
        gate?.removeEventListener("click", enter);
        window.removeEventListener("keydown", onKey);
        split?.revert();
        unlock();
      };
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      {/* Curtain panels — the stage itself parts on exit */}
      <div
        data-intro-panel="l"
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-b from-night-800 via-night to-night"
      >
        <div className="court-backdrop opacity-60" />
      </div>
      <div
        data-intro-panel="r"
        className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-b from-night-800 via-night to-night"
      >
        <div className="court-backdrop opacity-60" />
      </div>
      {/* Lime seam that glows as the curtains part */}
      <div
        data-intro-seam
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-lime opacity-0 shadow-glow-lime"
      />

      {/* Spotlight + court lines */}
      <div
        data-c-spot
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(27,116,224,0.16) 0%, rgba(27,116,224,0.05) 38%, transparent 68%)",
        }}
      />
      <div
        data-c-line
        className="pointer-events-none absolute left-[10%] right-[10%] top-[30%] h-px origin-left bg-gradient-to-r from-transparent via-royal-bright/40 to-transparent"
      />
      <div
        data-c-line
        className="pointer-events-none absolute left-[10%] right-[10%] bottom-[26%] h-px origin-right bg-gradient-to-r from-transparent via-royal-bright/30 to-transparent"
      />

      {/* Sparkles */}
      {SPARKLES.map(([x, y], i) => (
        <span
          key={i}
          data-intro-sparkle
          className="absolute h-1 w-1 rounded-full bg-royal-bright/80"
          style={{ left: `${x}%`, top: `${y}%`, opacity: 0 }}
        />
      ))}

      {/* Content */}
      <div
        data-intro-content
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        {/* Assembly stage: paddles + ball, then the crest takes their place */}
        <div className="relative h-[clamp(150px,26vmin,230px)] w-[clamp(150px,26vmin,230px)]">
          <div data-c-parts className="absolute inset-0">
            <div data-c-pl className="absolute left-1/2 top-1/2 h-[86%] w-[52%] opacity-0">
              <PaddleGlyph />
            </div>
            <div data-c-pr className="absolute left-1/2 top-1/2 h-[86%] w-[52%] opacity-0">
              <PaddleGlyph flip />
            </div>
            <div data-c-ball className="absolute left-1/2 top-[34%] h-[30%] w-[30%] opacity-0">
              <BallGlyph />
            </div>
            <div
              data-c-ring
              className="absolute left-1/2 top-[34%] h-[34%] w-[34%] rounded-full border-2 border-lime/70 opacity-0"
            />
          </div>
          <img
            data-intro-crest
            src={crestLogo}
            alt=""
            className="absolute inset-0 h-full w-full object-contain opacity-0"
          />
        </div>

        {/* Flash */}
        <div
          data-c-flash
          className="pointer-events-none absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,245,0.95) 0%, rgba(203,230,110,0.4) 32%, transparent 62%)",
          }}
        />

        <p
          data-intro-kicker
          className="mt-8 font-condensed text-xs uppercase tracking-[0.42em] text-ink-soft md:text-sm"
          style={{ opacity: 0 }}
        >
          {site.name} · {site.league}
        </p>
        <div className="relative mt-4 overflow-hidden px-2 pb-2">
          <h2
            data-intro-title
            className="font-display text-[clamp(2.6rem,9vw,7rem)] uppercase leading-none text-ink"
          >
            You're Invited
          </h2>
          <div
            data-intro-sweep
            className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            style={{ transform: "translateX(-160%)" }}
          />
        </div>
        <p
          data-intro-sub
          className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft md:text-base"
          style={{ opacity: 0 }}
        >
          Salem's own pickleball franchise · Est. {site.year}
        </p>
      </div>

      {/* Entry gate — a locked pickleball; one tap pops the shackle,
          starts the score and rolls the ceremony with sound */}
      <button
        type="button"
        data-gate
        tabIndex={-1}
        className="absolute inset-0 z-30 flex cursor-pointer flex-col items-center justify-center gap-10 outline-none"
      >
        <div data-gate-float className="relative flex flex-col items-center">
          {/* pulsing halo */}
          <span
            data-gate-ring
            className="absolute left-1/2 top-[58%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-lime/35"
          />
          {/* shackle */}
          <svg
            data-gate-shackle
            viewBox="0 0 100 62"
            className="h-12 w-24 text-lime drop-shadow-[0_0_14px_rgba(203,230,110,0.35)]"
            aria-hidden="true"
          >
            <path
              d="M22 62 V36 a28 28 0 0 1 56 0 V62"
              fill="none"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </svg>
          {/* the pickleball is the lock body */}
          <div
            data-gate-ball
            className="-mt-3 h-28 w-28 drop-shadow-[0_18px_40px_rgba(5,13,31,0.7)] md:h-32 md:w-32"
          >
            <BallGlyph />
          </div>
        </div>
        <p className="font-display text-3xl uppercase leading-none text-ink md:text-4xl">
          Tap to enter
        </p>
      </button>
    </div>
  );
}
