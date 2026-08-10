import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";

const RADIUS = 21;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Floating back-to-top button. Lives OUTSIDE the ScrollSmoother wrapper
 * (position:fixed), fades in as soon as the user starts scrolling and
 * wears a lime ring that fills with reading progress.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      ticking.current = false;
      const y = window.scrollY;
      setVisible(y > window.innerHeight * 0.5);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, y / max) : 0;
      ringRef.current?.style.setProperty(
        "stroke-dashoffset",
        String(CIRCUMFERENCE * (1 - progress))
      );
    };
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => scrollToSection("#hero")}
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full",
        "border border-line bg-night-700/85 text-ink-soft backdrop-blur-md shadow-card-deep",
        "transition-[opacity,transform,color,border-color] duration-500 ease-out",
        "hover:border-lime/60 hover:text-lime focus-visible:text-lime",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      {/* scroll progress ring */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 48 48"
        fill="none"
      >
        <circle
          ref={ringRef}
          cx="24"
          cy="24"
          r={RADIUS}
          stroke="#cbe66e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          opacity="0.85"
        />
      </svg>
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
