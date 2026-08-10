/**
 * ProgramSection — "Moments that made us" (id="moments").
 *
 * A React Bits–flavoured gallery of the franchise's programs: ShinyText
 * kicker, BlurText lead, and an accordion image gallery where one moment
 * expands while the rest collapse to labelled strips. A StatCounter row
 * (React Bits CountUp equivalent) closes the section.
 *
 * Photos live in src/assets/gallery (cropped via scripts/crop-gallery.py).
 */
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { program } from "@/data/siteData";
import { openEventMoments } from "@/lib/momentsNav";
import { ShinyText } from "@/components/reactbits/ShinyText";
import { BlurText } from "@/components/reactbits/BlurText";
import { AccordionGallery } from "@/components/reactbits/AccordionGallery";
import { StatCounter } from "@/components/shared/StatCounter";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { MediaLightbox, type LightboxMedia } from "@/components/shared/MediaLightbox";

import teamReveal from "@/assets/gallery/team-reveal.jpg";
import leagueLaunch from "@/assets/gallery/league-launch.jpg";
import launchNight from "@/assets/gallery/launch-night.jpg";
import pressCoverage from "@/assets/gallery/press-coverage.jpg";
import crestUnveiling from "@/assets/images/karthi-reveal.jpg";

const GALLERY_IMAGES: Record<string, string> = {
  reveal: teamReveal,
  launch: leagueLaunch,
  owners: launchNight,
  press: pressCoverage,
  crest: crestUnveiling,
};

/** Per-photo focal point (CSS object-position) so crops keep faces in frame. */
const GALLERY_FOCUS: Record<string, string> = {
  launch: "50% 35%",
  owners: "50% 40%",
  press: "50% 30%",
  crest: "50% 22%",
};

export function ProgramSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  // Clicking the expanded gallery panel opens the moment in a dialog.
  const [viewer, setViewer] = useState<LightboxMedia | null>(null);

  // Title rise-in, matching SectionHeading's reveal language.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = headingRef.current;
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll<HTMLElement>("[data-program-heading]"),
        { y: 44, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        }
      );
    },
    { scope: headingRef }
  );

  return (
    <section id="moments" className="relative overflow-hidden">
      {/* atmosphere */}
      <div
        aria-hidden="true"
        className="glow-spot left-[-10%] top-[8%] h-[40vw] w-[40vw] max-h-[520px] max-w-[520px] bg-royal/15"
      />
      <div
        aria-hidden="true"
        className="glow-spot bottom-[-14%] right-[-8%] h-64 w-64 bg-lime/10"
      />

      <div className="section-shell">
        <div ref={headingRef} className="relative z-10 mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <p data-program-heading className="mb-4 font-condensed text-kicker uppercase">
            <ShinyText text={program.kicker} />
          </p>
          <h2 data-program-heading className="display-title text-display-md">
            {program.title}
          </h2>
          <BlurText
            text={program.lead}
            className="mt-5 text-base leading-relaxed text-ink-soft md:text-lg"
          />
        </div>

        <ScrollReveal from="up" distance={56}>
          <AccordionGallery
            items={program.items.map((item) => ({
              src: GALLERY_IMAGES[item.key],
              alt: `${item.title} — ${item.caption}`,
              tag: item.tag,
              title: item.title,
              caption: item.caption,
              position: GALLERY_FOCUS[item.key],
            }))}
            onView={(item) =>
              setViewer({
                type: "image",
                src: item.src,
                alt: item.alt,
                tag: item.tag,
                title: item.title,
                caption: item.caption,
              })
            }
          />
          <p className="mt-4 text-center font-condensed text-[0.7rem] uppercase tracking-[0.3em] text-ink-dim">
            {program.note}
          </p>
          {/* hyperlink into the combined moments page */}
          <button
            type="button"
            onClick={() => openEventMoments("all", "left")}
            className="mx-auto mt-4 flex items-center gap-1.5 font-condensed text-sm uppercase tracking-[0.2em] text-lime underline decoration-lime/40 underline-offset-4 transition-colors hover:text-lime-bright hover:decoration-lime-bright"
          >
            {program.viewAllCta}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </ScrollReveal>

        {/* the numbers behind the moments */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 md:mt-20">
          {program.stats.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </div>

      <MediaLightbox media={viewer} onClose={() => setViewer(null)} />
    </section>
  );
}
