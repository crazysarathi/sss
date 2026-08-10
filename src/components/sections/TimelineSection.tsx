import { useRef } from "react";
import { ArrowUpRight, CheckCircle2, Images } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { events, type EventItem } from "@/data/siteData";
import { eventMoments } from "@/data/momentsData";
import { openEventMoments } from "@/lib/momentsNav";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassCard } from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MARKER_SIZE = 28;

function badgeVariant(item: EventItem): "lime" | "blue" | "outline" {
  return item.status === "done" ? "lime" : "outline";
}

/** Inline pickleball: cream ball with five navy holes, riding the rail tip. */
function PickleballMarker() {
  return (
    <svg
      viewBox="0 0 28 28"
      width={MARKER_SIZE}
      height={MARKER_SIZE}
      className="block"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="14" cy="14" r="13" fill="#efeee6" />
      <circle cx="14" cy="14" r="13" fill="none" stroke="rgba(5,13,31,0.25)" strokeWidth="1" />
      <circle cx="14" cy="7.6" r="2" fill="#0d2a55" />
      <circle cx="7.9" cy="12.1" r="2" fill="#0d2a55" />
      <circle cx="20.1" cy="12.1" r="2" fill="#0d2a55" />
      <circle cx="10.2" cy="19.4" r="2" fill="#0d2a55" />
      <circle cx="17.8" cy="19.4" r="2" fill="#0d2a55" />
    </svg>
  );
}

function EventCard({ item }: { item: EventItem }) {
  const done = item.status === "done";

  return (
    <GlassCard
      className={cn(
        "relative w-full max-w-md overflow-hidden p-4 transition-transform duration-300 hover:-translate-y-1 sm:p-6 md:p-8",
        done && "opacity-80"
      )}
    >
      {done && (
        <CheckCircle2
          aria-hidden="true"
          strokeWidth={1}
          className="absolute -bottom-6 -right-6 h-32 w-32 text-lime opacity-[0.07]"
        />
      )}

      <div className="relative flex items-start gap-4 sm:gap-6">
        {/* Date block */}
        <div className="shrink-0 text-center">
          <div
            className={cn(
              "font-display text-3xl leading-none sm:text-5xl",
              done ? "text-lime" : "text-ink"
            )}
          >
            {item.day}
          </div>
          <div className="mt-2 font-condensed text-xs uppercase tracking-[0.3em] text-ink-soft sm:text-sm">
            {item.month}
          </div>
        </div>

        {/* Divider */}
        <div aria-hidden="true" className="mt-1 hidden h-16 w-px shrink-0 bg-line sm:block" />

        {/* Copy */}
        <div className="min-w-0">
          <Badge variant={badgeVariant(item)}>{item.tag}</Badge>
          <h3 className="mt-3 font-display text-base uppercase leading-tight text-ink sm:text-xl">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.detail}</p>
        </div>
      </div>
    </GlassCard>
  );
}

/**
 * Cinematic events timeline (id="events") — a glowing lime progress rail with
 * a pickleball riding its tip, event cards alternating sides on desktop.
 */
export function TimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const markerWrapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const list = listRef.current;
      if (!list) return;

      /* Scrubbed progress: lime fill grows down the rail while the
         pickleball marker rides its tip. Same grammar on mobile + desktop. */
      const fill = fillRef.current;
      const markerWrap = markerWrapRef.current;
      const marker = markerRef.current;
      if (fill && markerWrap && marker) {
        const progress = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: list,
            start: "top 70%",
            end: "bottom 55%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        progress
          // marker appears with the scrub — after the handoff ball from the
          // identity stage has landed and faded, so only one ball shows
          .fromTo(markerWrap, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0)
          .fromTo(fill, { scaleY: 0 }, { scaleY: 1 }, 0)
          .fromTo(marker, { y: 0 }, { y: () => list.offsetHeight - MARKER_SIZE }, 0)
          // Physically-correct roll: one full turn per circumference of
          // travel, scrubbed — so it back-spins when scrolling up.
          .fromTo(
            marker,
            { rotation: 0 },
            {
              rotation: () =>
                ((list.offsetHeight - MARKER_SIZE) / (Math.PI * MARKER_SIZE)) * 360,
              transformOrigin: "50% 50%",
            },
            0
          );
      }

      /* Cards reveal once, sliding in from their side. */
      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" },
        (context) => {
          const isDesktop = Boolean(context.conditions?.isDesktop);
          gsap.utils
            .toArray<HTMLElement>("[data-event-row]", list)
            .forEach((row, index) => {
              const card = row.querySelector<HTMLElement>("[data-reveal]");
              if (!card) return;
              const fromLeft = isDesktop && index % 2 === 0;
              gsap.fromTo(
                card,
                { autoAlpha: 0, x: fromLeft ? -60 : 60 },
                {
                  autoAlpha: 1,
                  x: 0,
                  duration: 1.1,
                  ease: "expo.out",
                  scrollTrigger: {
                    trigger: row,
                    start: "top 82%",
                    once: true,
                  },
                }
              );
            });
        }
      );

      /* Quiet closing line. */
      const foot = footRef.current;
      if (foot) {
        gsap.fromTo(
          foot,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: foot, start: "top 92%", once: true },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section id="events" ref={sectionRef} className="relative overflow-hidden">
      {/* Atmosphere */}
      <div className="court-backdrop" aria-hidden="true" />
      <div
        className="glow-spot -top-16 right-[8%] h-80 w-80 bg-royal/20"
        aria-hidden="true"
      />
      <div
        className="glow-spot bottom-10 left-[4%] h-64 w-64 bg-lime/[0.07]"
        aria-hidden="true"
      />

      <div className="section-shell">
        <SectionHeading kicker={events.kicker} title={events.title} />

        <div ref={listRef} className="relative">
          {/* Rail — left edge on mobile, center on md+ */}
          <div
            aria-hidden="true"
            data-timeline-rail
            className="absolute inset-y-0 left-4 w-0.5 -translate-x-1/2 bg-line md:left-1/2"
          >
            <div
              ref={fillRef}
              className="absolute inset-0 origin-top bg-lime shadow-glow-lime"
            />
          </div>

          {/* Pickleball marker riding the fill tip */}
          <div
            ref={markerWrapRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-4 z-20 w-7 -translate-x-1/2 opacity-0 md:left-1/2"
          >
            <div ref={markerRef} className="h-7 w-7 rounded-full shadow-glow-lime">
              <PickleballMarker />
            </div>
          </div>

          <ol className="relative z-10 flex flex-col gap-16 md:gap-24">
            {events.items.map((item, index) => {
              const left = index % 2 === 0;
              const done = item.status === "done";
              return (
                <li
                  key={item.title}
                  data-event-row
                  className="relative grid grid-cols-1 md:grid-cols-[1fr_80px_1fr] md:items-center"
                >
                  {/* Node dot on the rail */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-4 top-10 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2",
                      "md:static md:col-start-2 md:row-start-1 md:translate-x-0 md:justify-self-center",
                      done
                        ? "border-lime bg-lime shadow-glow-lime"
                        : "border-royal-bright bg-night"
                    )}
                  />

                  {/* Card — alternating sides on desktop, right of rail on mobile */}
                  <div
                    data-reveal
                    className={cn(
                      "pl-9 sm:pl-12 md:row-start-1 md:pl-0",
                      left
                        ? "md:col-start-1 md:justify-self-end"
                        : "md:col-start-3 md:justify-self-start"
                    )}
                  >
                    <EventCard item={item} />
                    {/* Done events open their moments wall — button rides the
                        card's outer corner: left cards left, right cards right */}
                    {done && item.id in eventMoments && (
                      <div
                        className={cn(
                          "mt-4 flex justify-start",
                          !left && "md:justify-end"
                        )}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEventMoments(item.id, left ? "left" : "right")}
                        >
                          <Images aria-hidden="true" />
                          {events.momentsCta}
                          <ArrowUpRight aria-hidden="true" />
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Closing footnote */}
        <p
          ref={footRef}
          data-reveal
          className="mt-16 text-center font-condensed text-sm uppercase tracking-[0.3em] text-ink-dim md:mt-24"
        >
          Season 2 · {events.items[2].detail}
        </p>
      </div>
    </section>
  );
}
