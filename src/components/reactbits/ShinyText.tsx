import { cn } from "@/lib/utils";

interface ShinyTextProps {
  text: string;
  /** Seconds for one light sweep across the text. */
  speed?: number;
  className?: string;
}

/**
 * React Bits–style ShinyText — a soft light sweep travels across the
 * glyphs forever. Pure CSS (background-clip: text), zero JS per frame;
 * the global reduced-motion rule freezes it automatically.
 */
export function ShinyText({ text, speed = 3.5, className }: ShinyTextProps) {
  return (
    <span
      className={cn("shiny-text", className)}
      style={{ animationDuration: `${speed}s` }}
    >
      {text}
    </span>
  );
}
