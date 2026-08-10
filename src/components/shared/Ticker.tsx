import { cn } from "@/lib/utils";

interface TickerProps {
  text: string;
  className?: string;
}

/**
 * Infinite marquee strip. Pure CSS animation (GPU-composited),
 * pauses for users who prefer reduced motion via the global rule.
 */
export function Ticker({ text, className }: TickerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none w-full overflow-hidden", className)}
    >
      <div className="flex w-max animate-marquee whitespace-nowrap font-condensed text-sm uppercase tracking-[0.3em] text-ink-dim">
        <span className="pr-2">{text}</span>
        <span className="pr-2">{text}</span>
      </div>
    </div>
  );
}
