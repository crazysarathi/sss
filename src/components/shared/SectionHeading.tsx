import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker: string;
  title: string;
  lead?: string;
  align?: "center" | "left";
  className?: string;
}

/**
 * Standard section header: kicker / display title / lead.
 * Animates in with a masked line reveal when scrolled into view.
 */
export function SectionHeading({
  kicker,
  title,
  lead,
  align = "center",
  className,
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = ref.current;
      if (!el) return;

      const items = el.querySelectorAll<HTMLElement>("[data-heading-part]");
      gsap.fromTo(
        items,
        { y: 44, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            once: true,
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className={cn(
        "relative z-10 mx-auto mb-14 max-w-2xl md:mb-20",
        align === "center" ? "text-center" : "text-left md:mx-0",
        className
      )}
    >
      <p data-heading-part className="kicker mb-4">
        {kicker}
      </p>
      <h2 data-heading-part className="display-title text-display-md">
        {title}
      </h2>
      {lead && (
        <p data-heading-part className="mt-5 text-base leading-relaxed text-ink-soft md:text-lg">
          {lead}
        </p>
      )}
    </div>
  );
}
