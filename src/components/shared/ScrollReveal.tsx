import { useRef, type ReactNode, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Direction the element travels from. */
  from?: "up" | "down" | "left" | "right" | "scale";
  distance?: number;
  delay?: number;
  duration?: number;
  /** Stagger direct children instead of animating the wrapper. */
  staggerChildren?: boolean;
  stagger?: number;
  start?: string;
}

/**
 * General-purpose scroll-into-view reveal wrapper.
 */
export function ScrollReveal({
  children,
  as: Tag = "div",
  className,
  from = "up",
  distance = 48,
  delay = 0,
  duration = 1.1,
  staggerChildren = false,
  stagger = 0.1,
  start = "top 85%",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const vars: gsap.TweenVars = { opacity: 0 };
      if (from === "up") vars.y = distance;
      if (from === "down") vars.y = -distance;
      if (from === "left") vars.x = -distance;
      if (from === "right") vars.x = distance;
      if (from === "scale") vars.scale = 0.88;

      const targets = staggerChildren ? Array.from(el.children) : el;

      gsap.fromTo(targets, vars, {
        y: 0,
        x: 0,
        scale: 1,
        opacity: 1,
        duration,
        delay,
        ease: "expo.out",
        stagger: staggerChildren ? stagger : 0,
        scrollTrigger: { trigger: el, start, once: true },
        // Drop the inline transform when done so CSS hover transforms
        // (e.g. hover:-translate-y-1 cards) work again.
        clearProps: "transform",
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
