import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

interface BlurTextProps {
  text: string;
  className?: string;
  /** Per-word stagger in seconds. */
  stagger?: number;
  delay?: number;
}

/**
 * React Bits–style BlurText — words de-blur and rise into place when
 * the paragraph scrolls into view. Runs once; reduced-motion users get
 * the text plain and instantly readable.
 */
export function BlurText({ text, className, stagger = 0.05, delay = 0 }: BlurTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el.querySelectorAll<HTMLElement>("[data-blur-word]"),
        { opacity: 0, y: 14, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    },
    { scope: ref }
  );

  return (
    <p ref={ref} className={cn(className)}>
      {words.map((word, i) => (
        <span key={i} data-blur-word className="inline-block">
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
