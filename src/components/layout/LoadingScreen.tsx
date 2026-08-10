import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
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

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          unlock();
          finish();
          gsap.set(el, { display: "none" });
        },
      });

      tl
        // ---- stage lights up
        .fromTo("[data-c-spot]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0)
        .fromTo(
          "[data-c-line]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power3.inOut", stagger: 0.12 },
          0.1
        )
        .fromTo(
          "[data-intro-sparkle]",
          { autoAlpha: 0, scale: 0.4 },
          { autoAlpha: 0.8, scale: 1, duration: 0.8, stagger: 0.03, ease: "power2.out" },
          0.15
        )
        .to("[data-intro-sparkle]", { y: -12, duration: 2.4, ease: "sine.inOut", stagger: 0.05 }, 0.4)

        // ---- twin paddles swing in and cross (the crest X).
        // Centering lives in the GSAP transform (-50/-50) — Tailwind
        // translate classes would be clobbered by xPercent/yPercent.
        .fromTo(
          "[data-c-pl]",
          { xPercent: -290, yPercent: -14, rotation: -80, autoAlpha: 0 },
          { xPercent: -76, yPercent: -50, rotation: -24, autoAlpha: 1, duration: 0.85, ease: "back.out(1.4)" },
          0.55
        )
        .fromTo(
          "[data-c-pr]",
          { xPercent: 190, yPercent: -14, rotation: 80, autoAlpha: 0 },
          { xPercent: -24, yPercent: -50, rotation: 24, autoAlpha: 1, duration: 0.85, ease: "back.out(1.4)" },
          0.62
        )

        // ---- the ball drops in and bounces at the cross
        .fromTo(
          "[data-c-ball]",
          { xPercent: -50, yPercent: -50, y: "-58vh", autoAlpha: 1 },
          { y: 0, duration: 0.55, ease: "power2.in" },
          1.15
        )
        .to("[data-c-ball]", { scaleY: 0.78, scaleX: 1.16, duration: 0.09, ease: "power1.in" }, 1.7)
        .to("[data-c-ball]", { scaleY: 1, scaleX: 1, y: -26, duration: 0.3, ease: "power2.out" }, 1.79)
        .to("[data-c-ball]", { y: 0, duration: 0.28, ease: "bounce.out" }, 2.09)
        .fromTo(
          "[data-c-ring]",
          { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0.9 },
          { scale: 2.6, autoAlpha: 0, duration: 0.7, ease: "power2.out" },
          1.7
        )

        // ---- flash: the parts become the crest
        .fromTo(
          "[data-c-flash]",
          { autoAlpha: 0 },
          { autoAlpha: 0.85, duration: 0.16, ease: "power1.in" },
          2.4
        )
        .to("[data-c-flash]", { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 2.56)
        .to(
          "[data-c-parts]",
          { scale: 0.6, autoAlpha: 0, duration: 0.4, ease: "power2.inOut" },
          2.42
        )
        .fromTo(
          "[data-intro-crest]",
          { scale: 0.55, autoAlpha: 0, rotation: -6 },
          { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.55)" },
          2.52
        )

        // ---- the words
        .fromTo(
          "[data-intro-kicker]",
          { autoAlpha: 0, letterSpacing: "0.6em" },
          { autoAlpha: 1, letterSpacing: "0.42em", duration: 0.7 },
          2.75
        )
        .fromTo(
          split ? split.chars : "[data-intro-title]",
          { y: 110, rotateX: -32, transformOrigin: "50% 100%", transformPerspective: 600 },
          { y: 0, rotateX: 0, duration: 0.95, stagger: 0.03 },
          2.9
        )
        .fromTo(
          "[data-intro-sweep]",
          { xPercent: -160 },
          { xPercent: 160, duration: 0.85, ease: "power2.inOut" },
          3.45
        )
        .fromTo("[data-intro-sub]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 3.6)
        .fromTo("[data-intro-hint]", { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.5 }, 3.7)

        // ---- EXIT: the stage parts like curtains
        .addLabel("exit", 4.5)
        .to("[data-intro-content]", { autoAlpha: 0, y: -30, duration: 0.4, ease: "power2.in" }, "exit")
        .to(["[data-intro-sparkle]", "[data-c-spot]", "[data-c-line]"], { autoAlpha: 0, duration: 0.3 }, "exit")
        .to("[data-intro-seam]", { autoAlpha: 1, duration: 0.25 }, "exit")
        .call(finish, [], "exit+=0.3")
        .to("[data-intro-panel='l']", { xPercent: -101, duration: 0.95, ease: "expo.inOut" }, "exit+=0.3")
        .to("[data-intro-panel='r']", { xPercent: 101, duration: 0.95, ease: "expo.inOut" }, "exit+=0.3")
        .to("[data-intro-seam]", { autoAlpha: 0, duration: 0.4 }, "exit+=0.5")
        .set(el, { pointerEvents: "none" }, "exit+=0.3");

      // Skip: click/tap, Enter or Escape jumps straight to the exit.
      const skip = () => {
        if (tl.progress() < 1 && tl.time() < tl.labels.exit) tl.play("exit");
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" || e.key === "Enter") skip();
      };
      el.addEventListener("pointerdown", skip);
      window.addEventListener("keydown", onKey);

      return () => {
        el.removeEventListener("pointerdown", skip);
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
        <p
          data-intro-hint
          className="absolute bottom-8 font-condensed text-[0.7rem] uppercase tracking-[0.3em] text-ink-dim"
          style={{ opacity: 0 }}
        >
          Tap anywhere to enter
        </p>
      </div>
    </div>
  );
}
