import { useRef, useCallback, type ReactNode, type HTMLAttributes } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Enable pointer-tracking 3D tilt (desktop only). */
  tilt?: boolean;
  /** Max tilt angle in degrees. */
  tiltMax?: number;
  className?: string;
}

/**
 * The standard SSS glass surface, optionally with a subtle 3D tilt
 * that follows the cursor.
 */
export function GlassCard({
  children,
  tilt = false,
  tiltMax = 6,
  className,
  ...props
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || !tilt || e.pointerType !== "mouse" || prefersReducedMotion()) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        rotateY: px * tiltMax,
        rotateX: -py * tiltMax,
        transformPerspective: 900,
        duration: 0.6,
        ease: "power3.out",
      });
    },
    [tilt, tiltMax]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el || !tilt) return;
    gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" });
  }, [tilt]);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("glass-panel", tilt && "will-change-transform", className)}
      {...props}
    >
      {children}
    </div>
  );
}
