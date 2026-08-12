import { useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound";

export interface AccordionGalleryItem {
  src: string;
  alt: string;
  /** Small tag above the title, e.g. a date or venue. */
  tag: string;
  title: string;
  caption: string;
  /** CSS object-position, e.g. "50% 20%" to keep faces in frame. */
  position?: string;
}

interface AccordionGalleryProps {
  items: AccordionGalleryItem[];
  /** Called when the already-expanded panel is clicked (open a viewer). */
  onView?: (item: AccordionGalleryItem, index: number) => void;
  className?: string;
}

/**
 * React Bits–style accordion image gallery. One panel is expanded at a
 * time; the rest collapse to slim strips showing only their title.
 * Horizontal on desktop (hover/focus expands), vertical on mobile (tap).
 * Expansion animates flex-grow only — no layout thrash, no reflow storms.
 */
export function AccordionGallery({ items, onView, className }: AccordionGalleryProps) {
  const [active, setActive] = useState(0);
  // Ref mirror of `active`: a tap fires focus then click before React
  // re-renders, so guarding on state alone would double-blip.
  const activeRef = useRef(0);

  // One blip per panel change — hover, focus and tap all funnel through
  // here, so switching panels never double-fires.
  const activate = (i: number) => {
    if (i === activeRef.current) return;
    activeRef.current = i;
    sfx.hover();
    setActive(i);
  };

  return (
    <div
      className={cn(
        "flex h-[640px] flex-col gap-3 md:h-[540px] md:flex-row md:gap-4",
        className
      )}
    >
      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <button
            key={item.title}
            type="button"
            aria-expanded={isActive}
            aria-label={
              isActive && onView
                ? `View ${item.title} full size`
                : `${item.title} — ${item.caption}`
            }
            // First click/tap expands; a click on the expanded panel opens
            // the viewer (on desktop hover has already expanded it).
            onClick={() => (isActive ? onView?.(item, i) : activate(i))}
            onMouseEnter={() => activate(i)}
            onFocus={() => activate(i)}
            className={cn(
              "group relative min-h-0 overflow-hidden rounded-lg border text-left",
              "transition-[flex-grow,border-color] duration-700 ease-[cubic-bezier(0.16,0.84,0.44,1)]",
              isActive ? "border-lime/40" : "border-line hover:border-royal-bright/40"
            )}
            style={{ flexGrow: isActive ? 4.2 : 1, flexBasis: 0 }}
          >
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              style={item.position ? { objectPosition: item.position } : undefined}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700",
                isActive
                  ? "opacity-100 md:group-hover:scale-[1.03]"
                  : "opacity-40 saturate-50"
              )}
            />
            {/* legibility gradient over the lower edge */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/25 to-transparent"
            />

            {/* index badge */}
            <span
              className={cn(
                "absolute left-4 top-4 font-condensed text-xs tracking-[0.3em] transition-colors duration-500",
                isActive ? "text-lime" : "text-ink-dim"
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* expand hint — the active panel is one click from the viewer */}
            {onView && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-night/50 text-ink-soft backdrop-blur-sm",
                  "transition-opacity duration-300 group-hover:text-lime",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </span>
            )}

            {/* collapsed label — horizontal on mobile, vertical on desktop */}
            <span
              className={cn(
                "absolute font-condensed uppercase tracking-[0.25em] text-ink-soft",
                "bottom-4 left-4 md:bottom-5 md:left-1/2 md:-translate-x-1/2 md:[writing-mode:vertical-rl]",
                "transition-opacity duration-300",
                isActive ? "opacity-0" : "opacity-100"
              )}
            >
              {item.title}
            </span>

            {/* expanded caption */}
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 block p-5 transition-[opacity,transform] duration-500 md:p-6",
                isActive
                  ? "translate-y-0 opacity-100 delay-200"
                  : "translate-y-4 opacity-0"
              )}
            >
              <span className="block font-condensed text-xs uppercase tracking-[0.3em] text-lime">
                {item.tag}
              </span>
              <span className="mt-1.5 block font-display text-2xl uppercase leading-none text-ink md:text-3xl">
                {item.title}
              </span>
              <span className="mt-2 block max-w-md text-sm leading-relaxed text-ink-soft">
                {item.caption}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
