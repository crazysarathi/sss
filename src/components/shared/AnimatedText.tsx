import { useRef, type ElementType } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

interface AnimatedTextProps {
  children: string;
  as?: ElementType;
  className?: string;
  /** "chars" for hero-style char cascade, "lines" for masked line reveal */
  split?: "chars" | "lines" | "words";
  delay?: number;
  stagger?: number;
  /** Animate on scroll into view (default) or immediately on mount */
  trigger?: "scroll" | "mount";
  y?: number;
}

/**
 * SplitText-powered text reveal. Falls back to a simple fade when
 * the user prefers reduced motion.
 */
export function AnimatedText({
  children,
  as: Tag = "div",
  className,
  split = "lines",
  delay = 0,
  stagger,
  trigger = "scroll",
  y = 60,
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) return;

      const splitter = new SplitText(el, {
        type: split === "chars" ? "chars,words" : split,
        mask: split === "lines" ? "lines" : undefined,
      });
      const targets =
        split === "chars" ? splitter.chars : split === "words" ? splitter.words : splitter.lines;

      gsap.fromTo(
        targets,
        { y, opacity: split === "lines" ? 1 : 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.15,
          delay,
          ease: "expo.out",
          stagger: stagger ?? (split === "chars" ? 0.025 : 0.09),
          scrollTrigger:
            trigger === "scroll"
              ? { trigger: el, start: "top 85%", once: true }
              : undefined,
          onComplete: () => splitter.revert(),
        }
      );
    },
    { scope: ref, dependencies: [children] }
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
