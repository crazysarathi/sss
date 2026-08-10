import { useRef } from "react";
import { MapPin } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { GlassCard } from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";
import { community } from "@/data/siteData";

/* ------------------------------------------------------------------ */
/* Decorative line-art equipment — inline SVGs, purely presentational  */
/* ------------------------------------------------------------------ */

function PaddleArt() {
  return (
    <svg viewBox="0 0 64 96" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="12" y="5" width="40" height="54" rx="19" />
      <rect x="26" y="59" width="12" height="30" rx="5.5" />
      <circle cx="26" cy="22" r="2" />
      <circle cx="38" cy="18" r="2" />
      <circle cx="32" cy="34" r="2" />
      <circle cx="22" cy="42" r="2" />
      <circle cx="42" cy="40" r="2" />
    </svg>
  );
}

function BallArt() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="24" cy="24" r="20" />
      <circle cx="17" cy="17" r="2.2" />
      <circle cx="30" cy="14" r="2.2" />
      <circle cx="19" cy="31" r="2.2" />
      <circle cx="32" cy="28" r="2.2" />
    </svg>
  );
}

function PilatesBallArt() {
  return (
    <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="48" cy="48" r="42" />
      <path d="M9 38 Q48 60 87 38" />
      <path d="M14 68 Q48 86 82 68" />
    </svg>
  );
}

function MatArt() {
  return (
    <svg viewBox="0 0 96 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M70 18 H18 a14 14 0 0 0 0 28 H70" />
      <circle cx="70" cy="32" r="14" />
      <circle cx="70" cy="32" r="7.5" />
      <circle cx="70" cy="32" r="2" />
    </svg>
  );
}

function DumbbellArt() {
  return (
    <svg viewBox="0 0 96 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="28" y="20" width="40" height="8" rx="4" />
      <rect x="16" y="8" width="10" height="32" rx="4" />
      <rect x="70" y="8" width="10" height="32" rx="4" />
      <rect x="7" y="15" width="7" height="18" rx="3" />
      <rect x="82" y="15" width="7" height="18" rx="3" />
    </svg>
  );
}

/** Absolutely-positioned floating decor wrapper. */
function Decor({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      data-reveal
      data-decor
      className={`pointer-events-none absolute ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function CommunitySection() {
  const sectionRef = useRef<HTMLElement>(null);

  const ampIndex = community.title.indexOf("&");
  const titlePre = ampIndex >= 0 ? community.title.slice(0, ampIndex) : community.title;
  const titlePost = ampIndex >= 0 ? community.title.slice(ampIndex + 1) : "";

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = sectionRef.current;
      if (!el) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
      });

      tl.fromTo(
        "[data-banner]",
        { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
        {
          autoAlpha: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.35,
          ease: "expo.out",
        }
      )
        .fromTo(
          "[data-item]",
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.11, ease: "expo.out" },
          "-=0.75"
        )
        .fromTo(
          "[data-decor]",
          { autoAlpha: 0, scale: 0.35 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.09,
            ease: "back.out(2.2)",
          },
          "-=0.65"
        );

      // Gentle perpetual float on the equipment line-art.
      gsap.utils.toArray<HTMLElement>("[data-decor]").forEach((decor, i) => {
        gsap.to(decor, {
          y: i % 2 === 0 ? 10 : -10,
          rotation: i % 2 === 0 ? 4 : -4,
          duration: 2.4 + (i % 3) * 0.55,
          delay: 1.2 + i * 0.3,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="community" ref={sectionRef} className="section-shell">
      <div data-reveal data-banner>
        <GlassCard className="relative overflow-hidden bg-gradient-to-br from-night-700 via-royal-deep/25 to-night-800 p-6 text-center sm:p-10 md:p-16">
          {/* Atmosphere */}
          <div aria-hidden="true" className="glow-spot -bottom-28 -left-24 h-80 w-80 bg-lime/15" />
          <div aria-hidden="true" className="glow-spot -right-20 -top-32 h-96 w-96 bg-royal/25" />

          {/* Floating equipment line-art around the edges */}
          <Decor className="left-[3%] top-[9%] w-14 text-royal-bright md:w-20">
            <span className="block -rotate-12 opacity-50">
              <PaddleArt />
            </span>
          </Decor>
          <Decor className="right-[7%] top-[13%] w-9 text-lime md:w-12">
            <span className="block opacity-50">
              <BallArt />
            </span>
          </Decor>
          <Decor className="bottom-[10%] right-[3%] hidden w-24 text-lime sm:block md:w-32">
            <span className="block rotate-6 opacity-50">
              <PilatesBallArt />
            </span>
          </Decor>
          <Decor className="bottom-[12%] left-[4%] hidden w-20 text-royal-bright md:block md:w-28">
            <span className="block -rotate-6 opacity-50">
              <MatArt />
            </span>
          </Decor>
          <Decor className="right-[2%] top-[46%] hidden w-16 text-lime md:block lg:w-24">
            <span className="block -rotate-[18deg] opacity-50">
              <DumbbellArt />
            </span>
          </Decor>

          {/* Content */}
          <div className="relative z-10 py-4 md:py-8">
            <p data-reveal data-item className="kicker mb-5">
              {community.kicker}
            </p>
            <h2 data-reveal data-item className="display-title text-display-lg">
              {titlePre}
              <span className="text-gradient-lime">&amp;</span>
              {titlePost}
            </h2>
            <div data-reveal data-item className="mt-6 flex justify-center">
              <a
                href={community.venueHref}
                target="_blank"
                rel="noopener"
                aria-label={`${community.venue} — open in Google Maps`}
                className="group inline-flex items-center gap-2.5 text-lg text-ink-soft transition-colors duration-300 hover:text-ink"
              >
                <MapPin className="h-5 w-5 shrink-0 text-lime" aria-hidden="true" />
                <span className="underline decoration-line underline-offset-4 transition-colors duration-300 group-hover:decoration-lime">
                  {community.venue}
                </span>
              </a>
            </div>
            <div data-reveal data-item className="mt-9 flex justify-center">
              <Badge variant="lime" className="px-5 py-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 animate-pulse-dot rounded-full bg-lime"
                />
                {community.note}
              </Badge>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
