import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Clapperboard, Image as ImageIcon, Play } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { eventMoments } from "@/data/momentsData";
import { getMomentsEntrySide } from "@/lib/momentsNav";
import { ShinyText } from "@/components/reactbits/ShinyText";
import { MediaLightbox, type LightboxMedia } from "@/components/shared/MediaLightbox";
import { Button } from "@/components/ui/button";

/** Cream pickleball with navy holes — the one that takes the smash. */
function BallSprite() {
  return (
    <svg viewBox="0 0 28 28" width="64" height="64" aria-hidden="true" focusable="false">
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

/** Simple 2D Smashers paddle: royal blade, lime rim, night grip. */
function PaddleSprite({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="0 0 120 210"
      width="150"
      height="262"
      aria-hidden="true"
      focusable="false"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <rect x="12" y="8" width="96" height="136" rx="46" fill="#0d2a55" stroke="#cbe66e" strokeWidth="4" />
      <rect x="26" y="22" width="68" height="108" rx="34" fill="#1b74e0" opacity="0.35" />
      <rect x="50" y="140" width="20" height="58" rx="9" fill="#050d1f" stroke="#cbe66e" strokeWidth="3" />
      <circle cx="60" cy="200" r="7" fill="#cbe66e" />
    </svg>
  );
}

const PARTICLE_COUNT = 12;

interface EventMomentsPageProps {
  slug: string;
  onBack: () => void;
}

/**
 * Full-screen Moments gallery for one event (route: #/moments/<slug>),
 * rendered as a fixed overlay so the smoother-driven page below keeps its
 * scroll state. Enters with a pickleball smash: the page slides in from
 * the side whose "View Moments" button was clicked while a paddle swings
 * in, smashes the ball across the screen and bursts into a lime splash.
 * Tiles open in the shared MediaLightbox; Escape / back returns to the
 * timeline.
 */
export function EventMomentsPage({ slug, onBack }: EventMomentsPageProps) {
  const data = eventMoments[slug];
  const side = getMomentsEntrySide();
  const [viewer, setViewer] = useState<LightboxMedia | null>(null);
  const [introDone, setIntroDone] = useState(() => prefersReducedMotion());

  const rootRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const paddleRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);
  const exitBallRef = useRef<HTMLDivElement>(null);
  const exiting = useRef(false);

  /** Leaving is its own beat (distinct from the smash entrance): the ball
   *  drops in and bounces away across the court while the gallery slides
   *  back out the side it came from — then hands control to onBack. */
  const requestClose = useCallback(() => {
    if (exiting.current) return;
    const page = pageRef.current;
    const ball = exitBallRef.current;
    if (prefersReducedMotion() || !page || !ball) {
      onBack();
      return;
    }
    exiting.current = true;
    const dir = side === "left" ? 1 : -1;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const tl = gsap.timeline({ onComplete: onBack });
    tl.set(ball, { autoAlpha: 1 })
      .to(ball, { x: -dir * vw * 0.42, rotation: -dir * 720, duration: 0.8, ease: "power1.in" }, 0)
      .to(ball, { y: vh * 0.78, duration: 0.8, ease: "bounce.out" }, 0)
      .to(
        page.querySelectorAll("[data-moment-tile]"),
        { y: 24, autoAlpha: 0, duration: 0.3, ease: "power2.in", stagger: { each: 0.006, from: "end" } },
        0
      )
      .to(page, { xPercent: -100 * dir, duration: 0.55, ease: "power3.in" }, 0.15)
      .to(ball, { autoAlpha: 0, duration: 0.18 }, 0.62);
  }, [onBack, side]);

  // Escape closes the page — but not the Escape that Radix just consumed
  // to close the lightbox (that one arrives with defaultPrevented set).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented && !viewer) requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose, viewer]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !data) return;
      const page = pageRef.current;
      const intro = introRef.current;
      const paddle = paddleRef.current;
      const ball = ballRef.current;
      const splash = splashRef.current;
      if (!page || !intro || !paddle || !ball || !splash) return;

      // dir: which way the ball flies (left entrance smashes it rightward)
      const dir = side === "left" ? 1 : -1;
      const vw = window.innerWidth;
      const rings = splash.querySelectorAll("[data-ring]");
      const dots = splash.querySelectorAll("[data-dot]");

      const tl = gsap.timeline({
        onComplete: () => setIntroDone(true),
      });

      tl.set(page, { xPercent: -100 * dir })
        .set(splash, { autoAlpha: 0 })
        // ball pops up at centre court
        .fromTo(
          ball,
          { scale: 0, y: 40, autoAlpha: 0 },
          { scale: 1, y: 0, autoAlpha: 1, duration: 0.35, ease: "back.out(2)" },
          0
        )
        // paddle swings in from the entrance side
        .fromTo(
          paddle,
          { x: -dir * vw * 0.45, rotation: -dir * 80, autoAlpha: 0 },
          { x: -dir * 80, rotation: dir * 22, autoAlpha: 1, duration: 0.45, ease: "power2.in" },
          0.18
        );

      const impact = 0.63;
      tl.addLabel("impact", impact)
        // the smash: ball rockets across on an arc, spinning
        .to(ball, { x: dir * vw * 0.58, duration: 0.75, ease: "power2.out" }, "impact")
        .to(ball, { keyframes: { y: [0, -110, 30] }, duration: 0.75, ease: "power1.inOut" }, "impact")
        .to(ball, { rotation: dir * 880, duration: 0.75, ease: "power1.out" }, "impact")
        .to(ball, { autoAlpha: 0, duration: 0.2 }, impact + 0.55)
        // paddle recoils off the follow-through
        .to(paddle, { rotation: -dir * 6, x: -dir * 120, duration: 0.45, ease: "expo.out" }, "impact")
        // splash: rings + lime/royal dots burst from the impact point
        .set(splash, { autoAlpha: 1 }, "impact")
        .fromTo(
          rings,
          { scale: 0.2, autoAlpha: 0.9 },
          { scale: 2.6, autoAlpha: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 },
          "impact"
        )
        .fromTo(
          dots,
          { x: 0, y: 0, scale: 1, autoAlpha: 1 },
          {
            x: (i) => Math.cos((i / PARTICLE_COUNT) * Math.PI * 2) * (110 + (i % 3) * 38),
            y: (i) => Math.sin((i / PARTICLE_COUNT) * Math.PI * 2) * (110 + (i % 3) * 38),
            scale: 0.2,
            autoAlpha: 0,
            duration: 0.65,
            ease: "power2.out",
          },
          "impact"
        )
        // impact shockwave shivers the whole page
        .fromTo(
          rootRef.current,
          { x: 0 },
          { x: dir * 7, duration: 0.05, repeat: 5, yoyo: true, ease: "none" },
          "impact"
        )
        .set(rootRef.current, { x: 0 }, impact + 0.35)
        // the gallery rides in behind the smash
        .to(page, { xPercent: 0, duration: 0.8, ease: "expo.out" }, impact + 0.05)
        .fromTo(
          page.querySelectorAll("[data-moment-tile]"),
          { y: 28, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out", stagger: 0.02 },
          impact + 0.35
        )
        // curtain up
        .to(intro, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, impact + 0.5);
    },
    { scope: rootRef, dependencies: [slug] }
  );

  if (!data) {
    return (
      <div className="fixed inset-0 z-[92] flex flex-col items-center justify-center gap-6 bg-night">
        <p className="font-condensed uppercase tracking-[0.3em] text-ink-soft">
          Moments for this event are coming soon
        </p>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Back to events
        </Button>
      </div>
    );
  }

  const photoCount = data.media.filter((m) => m.type === "image").length;
  const videoCount = data.media.length - photoCount;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[92] overflow-hidden bg-night">
      {/* ——— the gallery page (slides in from the entrance side) ——— */}
      <div ref={pageRef} className="h-full overflow-y-auto">
        {/* top bar stays put while the grid scrolls */}
        <div className="sticky top-0 z-10 border-b border-line bg-night/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <Button variant="ghost" size="sm" onClick={requestClose} className="shrink-0">
              <ArrowLeft aria-hidden="true" />
              <span className="hidden sm:inline">Back to events</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex shrink-0 items-center gap-3 font-condensed text-[11px] uppercase tracking-[0.18em] text-ink-soft sm:gap-4 sm:text-xs sm:tracking-[0.25em]">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <ImageIcon className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
                {photoCount} photos
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Clapperboard className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
                {videoCount} videos
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-8 sm:px-6 md:pt-14">
          <header className="mb-8 text-center sm:mb-10 md:mb-14">
            <p className="font-condensed text-kicker uppercase">
              <ShinyText text={data.kicker} />
            </p>
            <h1 className="display-title mt-3 text-3xl sm:text-6xl">{data.title}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft md:text-base">
              {data.lead}
            </p>
          </header>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {data.media.map((item, i) => {
              const isVideo = item.type === "video";
              return (
                <button
                  key={`${item.src}-${i}`}
                  type="button"
                  data-moment-tile
                  aria-label={`View ${item.alt}`}
                  onClick={() =>
                    setViewer({ ...item, tag: data.kicker, title: data.title, caption: item.alt })
                  }
                  className={cn(
                    "group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-night-700",
                    "transition-[border-color,box-shadow] duration-300 hover:border-lime/50 hover:shadow-glow-lime"
                  )}
                >
                  <img
                    src={isVideo ? item.poster : item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-30"
                  />
                  {isVideo && (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-night/60 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
                      >
                        <Play className="ml-0.5 h-4 w-4 fill-lime text-lime" />
                      </span>
                      <span className="absolute bottom-2 left-2 rounded-full border border-line bg-night/70 px-2 py-0.5 font-condensed text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                        Video
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-12 text-center font-condensed text-xs uppercase tracking-[0.3em] text-ink-dim">
            {data.date} · tap any tile to view
          </p>
        </div>
      </div>

      {/* ——— smash intro: paddle beats the ball, splash, curtain up ——— */}
      {!introDone && (
        <div
          ref={introRef}
          aria-hidden="true"
          className="absolute inset-0 z-20 overflow-hidden bg-night"
        >
          <div className="court-backdrop" aria-hidden="true" />
          <div className="glow-spot left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 bg-royal/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div ref={paddleRef} className="absolute will-change-transform">
              <PaddleSprite flip={side === "right"} />
            </div>
            <div ref={ballRef} className="absolute will-change-transform">
              <BallSprite />
            </div>
            {/* splash burst at the impact point */}
            <div ref={splashRef} className="absolute opacity-0">
              {[0, 1].map((r) => (
                <span
                  key={r}
                  data-ring
                  className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-lime/70"
                />
              ))}
              {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
                <span
                  key={i}
                  data-dot
                  className={cn(
                    "absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
                    i % 3 === 0 ? "bg-royal-bright" : "bg-lime"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* exit ball — drops and bounces away when leaving the page */}
      <div
        ref={exitBallRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-6 z-30 -translate-x-1/2 opacity-0 will-change-transform"
      >
        <BallSprite />
      </div>

      <MediaLightbox media={viewer} onClose={() => setViewer(null)} />
    </div>
  );
}
