import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  className?: string;
  valueClassName?: string;
}

/**
 * Animated statistic. The number counts up with an expo ease and a
 * slight overshoot-settle scale, triggered when scrolled into view.
 */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  className,
  valueClassName,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const num = numRef.current;
      if (!el || !num) return;
      if (prefersReducedMotion()) {
        num.textContent = `${prefix}${value}${suffix}`;
        return;
      }

      const counter = { n: 0 };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });

      tl.fromTo(
        el,
        { y: 36, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "expo.out" }
      ).to(
        counter,
        {
          n: value,
          duration: 1.6,
          ease: "expo.out",
          onUpdate: () => {
            num.textContent = `${prefix}${Math.round(counter.n)}${suffix}`;
          },
        },
        "<0.15"
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <span
        ref={numRef}
        className={cn(
          "font-display text-5xl leading-none text-gradient-lime md:text-6xl",
          valueClassName
        )}
        aria-label={`${prefix}${value}${suffix} ${label}`}
      >
        {prefix}0{suffix}
      </span>
      <span className="mt-2 block font-condensed text-sm uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </span>
    </div>
  );
}
