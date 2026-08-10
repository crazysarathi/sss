import {
  useRef,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

interface MagneticButtonProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** How strongly the element is pulled toward the cursor (0–1). */
  strength?: number;
  className?: string;
}

/**
 * Wraps any element (usually a Button) with a magnetic hover pull.
 * Desktop pointer only — inert on touch and with reduced motion.
 */
export function MagneticButton({
  children,
  strength = 0.35,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || e.pointerType !== "mouse" || prefersReducedMotion()) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.5,
        ease: "power3.out",
      });
    },
    [strength]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("inline-block will-change-transform", className)}
      {...props}
    >
      {children}
    </div>
  );
}
