import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * Short cinematic boot: SSS monogram counts in, then the whole
 * screen wipes upward. Never longer than ~1.6s.
 */
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
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
        gsap.set(el, { autoAlpha: 0 });
        finish();
        return;
      }

      const counter = { n: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
      });

      tl.fromTo(
        "[data-loader-mark]",
        { y: 40, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7 }
      )
        .fromTo(
          "[data-loader-name]",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "<0.15"
        )
        .to(
          counter,
          {
            n: 100,
            duration: 0.7,
            ease: "power2.inOut",
            onUpdate: () => {
              const v = Math.round(counter.n);
              if (pctRef.current) pctRef.current.textContent = `${v}`;
              if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
            },
          },
          "<0.1"
        )
        // Boot the hero entrance as the wipe begins, so they overlap.
        .call(finish)
        .to(el, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.75,
          ease: "expo.inOut",
          delay: 0.05,
        })
        .set(el, { display: "none" });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-night"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      aria-hidden="true"
    >
      <div className="glow-spot left-1/2 top-1/2 h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2 bg-royal/25" />

      <div data-loader-mark className="relative font-display text-7xl text-gradient-lime md:text-8xl">
        SSS
      </div>
      <div
        data-loader-name
        className="relative mt-4 font-condensed text-sm uppercase tracking-[0.5em] text-ink-soft"
      >
        Salem Super Smashers
      </div>

      <div className="relative mt-10 w-56">
        <div className="h-px w-full bg-line">
          <div
            ref={barRef}
            className="h-px w-full origin-left bg-lime shadow-glow-lime"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <span
          ref={pctRef}
          className="absolute -top-6 right-0 font-condensed text-xs tracking-[0.2em] text-ink-dim"
        >
          0
        </span>
      </div>
    </div>
  );
}
