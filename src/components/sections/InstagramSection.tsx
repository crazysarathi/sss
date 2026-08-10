import { useRef } from "react";
import { Instagram } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { instagram, INSTAGRAM_HANDLE } from "@/data/siteData";

export function InstagramSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Render the handle inside the sub copy as emphasised ink.
  const handleIndex = instagram.sub.indexOf(INSTAGRAM_HANDLE);
  const subPre = handleIndex >= 0 ? instagram.sub.slice(0, handleIndex) : instagram.sub;
  const subPost =
    handleIndex >= 0 ? instagram.sub.slice(handleIndex + INSTAGRAM_HANDLE.length) : "";

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = sectionRef.current;
      if (!el) return;

      gsap.fromTo(
        "[data-reveal]",
        { autoAlpha: 0, y: 44 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.15,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section id="insta" ref={sectionRef} className="section-shell relative max-w-3xl overflow-hidden">
      {/* Soft instagram-gradient atmosphere behind the card */}
      <div
        aria-hidden="true"
        className="glow-spot -left-28 top-16 h-[24rem] w-[24rem] bg-[#dd2a7b]/20"
      />
      <div
        aria-hidden="true"
        className="glow-spot -right-24 bottom-12 h-80 w-80 bg-[#f58529]/15"
      />

      <div data-reveal className="relative z-10">
        <GlassCard tilt tiltMax={4} className="relative overflow-hidden p-10 text-center md:p-14">
          <div
            aria-hidden="true"
            className="glow-spot left-1/2 -top-24 h-64 w-64 -translate-x-1/2 bg-[#8134af]/15"
          />

          <div className="relative z-10">
            <div data-reveal className="flex justify-center">
              <span className="inline-flex rounded-2xl border border-line bg-gradient-to-tr from-[#f58529]/20 via-[#dd2a7b]/20 to-[#8134af]/20 p-4">
                <Instagram aria-hidden="true" className="h-7 w-7 text-ink" />
              </span>
            </div>

            <AnimatedText
              as="h2"
              split="words"
              className="mt-8 font-display text-display-md uppercase text-ink"
            >
              {instagram.title}
            </AnimatedText>

            <p
              data-reveal
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg"
            >
              {subPre}
              <strong className="font-semibold text-ink">{INSTAGRAM_HANDLE}</strong>
              {subPost}
            </p>

            <ScrollReveal
              staggerChildren
              stagger={0.08}
              distance={26}
              className="mt-9 flex flex-wrap items-center justify-center gap-2.5"
            >
              {instagram.highlights.map((highlight) => (
                <Badge key={highlight} variant="outline">
                  {highlight}
                </Badge>
              ))}
            </ScrollReveal>

            <div data-reveal className="mt-11">
              <MagneticButton>
                <Button variant="insta" size="lg" asChild>
                  <a href={instagram.url} target="_blank" rel="noopener">
                    <Instagram aria-hidden="true" />
                    {instagram.cta}
                  </a>
                </Button>
              </MagneticButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
