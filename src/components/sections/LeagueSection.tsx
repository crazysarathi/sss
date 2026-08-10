import { Fragment, useRef } from "react";
import { ArrowUpRight, Gavel, Trophy, MapPin, type LucideIcon } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { liveStrip, tnppl } from "@/data/siteData";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatCounter } from "@/components/shared/StatCounter";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import tnpplLogo from "@/assets/logos/tnppl-logo.png";

const KEY_ICONS: Record<(typeof tnppl.keyItems)[number]["icon"], LucideIcon> = {
  gavel: Gavel,
  trophy: Trophy,
  "map-pin": MapPin,
};

/** Phrases inside tnppl.cardBody that deserve typographic emphasis. */
const HIGHLIGHTS: readonly string[] = [
  "16 franchise teams",
  "160 players",
  "₹7,00,000 prize pool",
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Renders the plain copy string with the key figures emphasized. */
function EmphasizedBody({ text }: { text: string }) {
  const pattern = new RegExp(`(${HIGHLIGHTS.map(escapeRegExp).join("|")})`);
  return (
    <>
      {text.split(pattern).map((part, i) =>
        HIGHLIGHTS.includes(part) ? (
          <strong key={i} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

/**
 * TNPPL league presentation — the slim "live strip" band followed by the
 * flagship league card, stat counters and key facts.
 */
export function LeagueSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      /* Giant background word — slow scrubbed parallax, desktop only. */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.to("[data-bg-word]", {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      /* Flagship card — one-shot clip-path unveil, then cells cascade in. */
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: {
          trigger: "[data-flagship]",
          start: "top 75%",
          once: true,
        },
      });
      tl.fromTo(
        "[data-flagship]",
        { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
        { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.4 }
      )
        .fromTo(
          "[data-flagship-logo]",
          { autoAlpha: 0, x: -64, rotate: -5 },
          { autoAlpha: 1, x: 0, rotate: 0, duration: 1.1 },
          "-=1.0"
        )
        .fromTo(
          "[data-flagship-copy]",
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 1 },
          "-=0.85"
        );

      /* Gentle float on the league crest. */
      gsap.to("[data-logo-float]", {
        y: -12,
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: sectionRef }
  );

  return (
    <>
      {/* ── Live strip ─────────────────────────────────────────────── */}
      <div className="relative border-y border-line bg-night-800/60 py-4">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-center gap-x-5 gap-y-2.5 px-6">
          <span className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-lime shadow-glow-lime animate-pulse-dot"
            />
            <span className="font-condensed text-sm uppercase tracking-[0.28em] text-lime">
              {liveStrip.badge}
            </span>
          </span>
          <span aria-hidden="true" className="hidden text-ink-dim sm:inline">
            ·
          </span>
          <span className="font-condensed text-sm uppercase tracking-[0.18em] text-ink-soft">
            {liveStrip.line}
          </span>
          <Badge variant="blue">{liveStrip.hashtag}</Badge>
        </div>
      </div>

      {/* ── Main section ───────────────────────────────────────────── */}
      <section id="tnppl" ref={sectionRef} className="relative overflow-hidden">
        {/* Giant stroked background word */}
        <span
          aria-hidden="true"
          data-bg-word
          className="pointer-events-none absolute -right-[3vw] -top-[3vw] z-0 select-none font-display text-[20vw] uppercase leading-none text-stroke-ink opacity-40"
        >
          TNPPL
        </span>

        {/* Ambient royal glow */}
        <div
          aria-hidden="true"
          className="glow-spot left-[-12%] top-[24%] h-[26rem] w-[26rem] bg-royal/20"
        />

        <div className="section-shell relative z-10">
          <SectionHeading
            kicker={tnppl.kicker}
            title={tnppl.title}
            lead={tnppl.lead}
          />

          {/* Flagship league card */}
          <GlassCard
            data-flagship
            data-reveal
            className="grid overflow-hidden shadow-card-deep md:grid-cols-[0.9fr_1.4fr]"
          >
            {/* Logo cell */}
            <div
              data-flagship-logo
              data-reveal
              className="relative flex min-h-[16rem] items-center justify-center overflow-hidden border-b border-line p-10 md:min-h-full md:border-b-0 md:border-r md:p-12"
            >
              <div aria-hidden="true" className="court-backdrop" />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 50% 45%, rgba(27,116,224,0.30), transparent 68%)",
                }}
              />
              <img
                data-logo-float
                src={tnpplLogo}
                alt="Tamil Nadu Pickleball Premier League — TNPPL official logo"
                loading="lazy"
                decoding="async"
                className="relative z-10 w-48 max-w-[75%] rounded-lg shadow-glow-blue drop-shadow-[0_12px_30px_rgba(5,13,31,0.6)] md:w-56"
              />
            </div>

            {/* Copy + stats cell */}
            <div data-flagship-copy data-reveal className="p-8 md:p-12">
              <h3 className="font-display text-2xl uppercase leading-tight text-ink md:text-3xl">
                {tnppl.cardTitle}
              </h3>
              <p className="mt-5 leading-relaxed text-ink-soft">
                <EmphasizedBody text={tnppl.cardBody} />
              </p>

              <Separator className="my-8 md:my-10" />

              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {tnppl.stats.map((stat) => (
                  <StatCounter
                    key={stat.label}
                    value={stat.value}
                    prefix={"prefix" in stat ? stat.prefix : undefined}
                    suffix={stat.suffix}
                    label={stat.label}
                    valueClassName="text-4xl md:text-5xl"
                  />
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Key facts */}
          <ScrollReveal
            staggerChildren
            stagger={0.1}
            className="mt-6 grid gap-5 md:mt-8 md:grid-cols-3"
          >
            {tnppl.keyItems.map((item) => {
              const Icon = KEY_ICONS[item.icon];
              const href = "href" in item ? item.href : undefined;
              const card = (
                <GlassCard
                  className={cn(
                    "flex h-full items-center gap-5 p-6 transition-[transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-royal-bright/40",
                    href && "group-hover:-translate-y-1 group-hover:border-lime/40"
                  )}
                >
                  <span className="shrink-0 rounded-full border border-line bg-white/[0.03] p-3 text-lime">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-condensed text-base uppercase tracking-[0.18em] text-ink">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm text-ink-soft">{item.detail}</p>
                  </div>
                  {href && (
                    <ArrowUpRight
                      aria-hidden="true"
                      className="ml-auto h-4 w-4 shrink-0 text-ink-dim transition-colors duration-300 group-hover:text-lime"
                    />
                  )}
                </GlassCard>
              );
              return href ? (
                <a
                  key={item.title}
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${item.title}: ${item.detail} — open in Google Maps`}
                  className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {card}
                </a>
              ) : (
                <div key={item.title}>{card}</div>
              );
            })}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
