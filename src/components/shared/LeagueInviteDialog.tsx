import { useCallback, useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, MapPin, Trophy, Users } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  LEAGUE_INVITE_EVENT,
  hasSeenLeagueInvite,
  markLeagueInviteSeen,
} from "@/lib/leagueInvite";
import { tnppl } from "@/data/siteData";
import { scrollToSection } from "@/lib/scroll";
import { sfx } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLights, FloatGroup, Paddle, Pickleball } from "@/components/three/models";

/** How long after the loading screen finishes before the invite appears. */
const INVITE_DELAY_MS = 5000;

const ICONS = { trophy: Trophy, "map-pin": MapPin, users: Users } as const;

function SpinningBall({
  reduced,
  radius = 1.22,
}: {
  reduced: boolean;
  radius?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g || reduced) return;
    const t = clock.getElapsedTime();
    g.rotation.y = t * 0.9;
    g.rotation.x = Math.sin(t * 0.6) * 0.22;
  });
  return (
    <group ref={ref}>
      <Pickleball radius={radius} />
    </group>
  );
}

/** The crest brought to life: twin crossed paddles, ball floating between. */
function InviteCrest({ reduced }: { reduced: boolean }) {
  return (
    <group position={[0, -0.2, 0]}>
      <group position={[-0.68, -0.35, -0.5]} rotation={[0.05, 0.35, 0.5]}>
        <Paddle scale={0.74} />
      </group>
      <group position={[0.68, -0.35, -0.5]} rotation={[0.05, -0.35, -0.5]}>
        <Paddle scale={0.74} />
      </group>
      <FloatGroup amplitude={0.07} rotAmplitude={0.04}>
        <group position={[0, 0.78, 0.6]}>
          <SpinningBall reduced={reduced} radius={0.6} />
        </group>
      </FloatGroup>
    </group>
  );
}

/**
 * The TNPPL invitation — a 3D-tilting card crowned by a floating,
 * spinning pickleball.
 *
 * Opens after a short delay on the home page (and after the first crest
 * ceremony). It keeps returning on refresh until the visitor commits to
 * a button — only "Count Me In" / "Keep Exploring" store the session flag.
 */
export function LeagueInviteDialog({ booted }: { booted: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  // Radix's Portal mounts its children one commit AFTER `open` flips, so
  // the entrance effect keys off the stage element appearing, not `open`.
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);

  const tiltRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const tiltOnRef = useRef(false);
  const rotXTo = useRef<gsap.QuickToFunc | null>(null);
  const rotYTo = useRef<gsap.QuickToFunc | null>(null);

  const openOnce = useCallback(() => {
    if (hasSeenLeagueInvite()) return;
    setOpen(true);
  }, []);

  // Trigger 1 — the home page: a short beat after the loading screen.
  useEffect(() => {
    if (!booted || hasSeenLeagueInvite()) return;
    const t = window.setTimeout(openOnce, INVITE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [booted, openOnce]);

  // Trigger 2 — the crest ceremony summons it via requestLeagueInvite().
  useEffect(() => {
    window.addEventListener(LEAGUE_INVITE_EVENT, openOnce);
    return () => window.removeEventListener(LEAGUE_INVITE_EVENT, openOnce);
  }, [openOnce]);

  // Announce the invitation: a rising whoosh, then a fanfare.
  useEffect(() => {
    if (!open) return;
    sfx.whoosh(0.5, "up");
    const t = window.setTimeout(() => sfx.fanfare(), 260);
    return () => window.clearTimeout(t);
  }, [open]);

  // 3D entrance: the card flips up out of the depth of the page while
  // the ball pops in above it and the content rises line by line.
  useGSAP(
    () => {
      tiltOnRef.current = false;
      if (!open || !stageEl || reduced) return;
      const wrap = tiltRef.current;
      const card = cardRef.current;
      const ball = ballRef.current;
      const sheen = sheenRef.current;
      const title = titleRef.current;
      if (!wrap || !card || !ball || !sheen || !title) return;

      gsap.set(wrap, { transformPerspective: 1100 });

      const split = new SplitText(title, { type: "chars,words" });
      split.chars.forEach((char) => {
        if (char.closest("[data-gradient-line]")) {
          char.classList.add("text-gradient-lime");
        }
      });
      splitRef.current = split;

      const rise = gsap.utils.toArray<HTMLElement>("[data-invite-rise]", card);

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          splitRef.current?.revert();
          splitRef.current = null;
          tiltOnRef.current = true;
        },
      });
      tl.fromTo(
        wrap,
        { y: 90, rotationX: -32, scale: 0.85, autoAlpha: 0 },
        { y: 0, rotationX: 0, scale: 1, autoAlpha: 1, duration: 0.9 }
      )
        // no scale here — the R3F canvas measures its parent at mount, and
        // a scale(0) parent measures 0×0 (transforms never re-trigger
        // ResizeObserver), leaving the ball invisible forever
        .fromTo(
          ball,
          { y: -52, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.75, ease: "back.out(1.8)" },
          0.3
        )
        .fromTo(
          split.chars,
          { y: 42, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.02 },
          0.35
        )
        .fromTo(
          rise,
          { y: 26, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.07 },
          0.45
        )
        .fromTo(
          sheen,
          { xPercent: -130 },
          { xPercent: 130, duration: 1.1, ease: "power2.inOut" },
          0.7
        );

      rotXTo.current = gsap.quickTo(wrap, "rotationX", {
        duration: 0.6,
        ease: "power3.out",
      });
      rotYTo.current = gsap.quickTo(wrap, "rotationY", {
        duration: 0.6,
        ease: "power3.out",
      });

      return () => {
        splitRef.current?.revert();
        splitRef.current = null;
      };
    },
    { dependencies: [open, stageEl, reduced] }
  );

  // Post-entrance pointer tilt (mouse only) — the card leans toward the cursor.
  const onTiltMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tiltOnRef.current || e.pointerType !== "mouse" || prefersReducedMotion())
      return;
    const el = tiltRef.current;
    const rx = rotXTo.current;
    const ry = rotYTo.current;
    if (!el || !rx || !ry) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry(px * 7);
    rx(-py * 7);
  };

  const onTiltLeave = () => {
    if (!tiltOnRef.current) return;
    rotXTo.current?.(0);
    rotYTo.current?.(0);
  };

  // Only a committed click remembers the invite for this session — a
  // refresh without choosing brings it back.
  const onCountMeIn = () => {
    sfx.chime();
    markLeagueInviteSeen();
    setOpen(false);
    scrollToSection("#join");
  };
  const onKeepExploring = () => {
    sfx.pop();
    markLeagueInviteSeen();
    setOpen(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[94] bg-night/80 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        />
        <DialogPrimitive.Content
          aria-describedby="league-invite-desc"
          // dismissal is a deliberate choice here: buttons (or Esc) only —
          // a stray click outside must not swallow the invite
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            "fixed left-1/2 top-[52%] z-[95] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 outline-none sm:top-1/2",
            // never scroll the invite — on short screens the whole ticket
            // scales down to fit instead
            "[@media(max-height:700px)]:scale-90 [@media(max-height:600px)]:scale-[0.78] [@media(max-height:500px)]:scale-[0.62]",
            "duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-4",
            // reduced motion (or GSAP unavailable): plain fade/zoom entrance
            reduced &&
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          )}
        >
          <div
            ref={(el) => {
              tiltRef.current = el;
              setStageEl(el);
            }}
            onPointerMove={onTiltMove}
            onPointerLeave={onTiltLeave}
            className="relative will-change-transform"
          >
            {/* ——— crossed paddles + spinning ball, breaking out of the card top ——— */}
            <div
              ref={ballRef}
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 left-1/2 z-20 h-24 w-44 -translate-x-1/2 sm:-top-[5.5rem] sm:h-36 sm:w-64"
            >
              {/* rotating rays halo behind the crest */}
              <div
                className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 animate-spin-slow rounded-full opacity-60 blur-[2px]"
                style={{
                  background:
                    "repeating-conic-gradient(from 0deg, rgba(27,116,224,0.18) 0deg 9deg, transparent 9deg 22deg)",
                }}
              />
              <div className="absolute inset-x-8 bottom-2 top-4 rounded-full bg-royal/25 blur-2xl" />
              <Canvas
                dpr={[1, 1.75]}
                gl={{ antialias: true, alpha: true }}
                camera={{ position: [0, 0, 5.2], fov: 40 }}
                frameloop={reduced ? "demand" : "always"}
              >
                <BrandLights />
                {/* warm fill so the cream ball doesn't read grey */}
                <pointLight position={[2.4, 1.2, 2.2]} intensity={0.55} color="#ffe9c4" />
                <InviteCrest reduced={reduced} />
              </Canvas>
            </div>

            {/* ——— the card: beam-lit gradient border + glass night body ——— */}
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-2xl p-px shadow-card-deep"
            >
              {/* static border tint */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl bg-gradient-to-b from-royal-bright/40 via-line to-lime/30"
              />
              {/* traveling light running along the border */}
              <div
                aria-hidden="true"
                className="absolute -inset-[150%] animate-spin-slow"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg 296deg, rgba(203,230,110,0.55) 326deg, rgba(79,160,255,0.45) 342deg, transparent 360deg)",
                }}
              />
              <div className="relative rounded-[15px] bg-night-700/95 px-5 pb-5 pt-14 backdrop-blur-xl sm:px-8 sm:pb-8 sm:pt-20">
                {/* ambient glows inside the card */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 left-1/2 h-52 w-80 -translate-x-1/2 rounded-full bg-royal/25 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-lime/[0.07] blur-3xl"
                />
                {/* faint pickleball court watermark */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 100"
                  className="pointer-events-none absolute left-1/2 top-1/2 w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-3 opacity-[0.06]"
                >
                  <g stroke="#4fa0ff" strokeWidth="1.5" fill="none">
                    <rect x="10" y="10" width="180" height="80" rx="3" />
                    <line x1="100" y1="4" x2="100" y2="96" />
                    <line x1="66" y1="10" x2="66" y2="90" />
                    <line x1="134" y1="10" x2="134" y2="90" />
                    <line x1="10" y1="50" x2="66" y2="50" />
                    <line x1="134" y1="50" x2="190" y2="50" />
                  </g>
                </svg>
                {/* court-corner accents */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-3 h-6 w-6 rounded-tl-xl border-l-2 border-t-2 border-lime/40"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-royal-bright/40"
                />
                {/* entrance sheen sweep */}
                <div
                  ref={sheenRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{
                    background:
                      "linear-gradient(-24deg, transparent 40%, rgba(255,255,255,0.09) 50%, transparent 60%)",
                    transform: "translateX(-130%)",
                  }}
                />

                <div className="relative z-10 flex flex-col text-center">
                  <div data-invite-rise className="mx-auto mb-3 flex justify-center">
                    <Badge variant="lime">
                      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-lime" />
                      Official Invitation
                    </Badge>
                  </div>

                  <DialogPrimitive.Title asChild>
                    <h2
                      ref={titleRef}
                      className="font-display text-2xl uppercase leading-tight text-ink sm:text-4xl"
                    >
                      You&apos;re invited.
                      <span data-gradient-line className="text-gradient-lime block">
                        Season 2 is calling.
                      </span>
                    </h2>
                  </DialogPrimitive.Title>

                  <DialogPrimitive.Description
                    id="league-invite-desc"
                    data-invite-rise
                    className="mx-auto mt-2.5 max-w-sm text-[13px] leading-relaxed text-ink-soft sm:mt-3 sm:text-sm"
                  >
                    {tnppl.lead}
                  </DialogPrimitive.Description>

                  {/* ticket perforation with punch notches */}
                  <div
                    data-invite-rise
                    aria-hidden="true"
                    className="relative -mx-5 my-4 sm:-mx-8 sm:my-5"
                  >
                    <div className="border-t border-dashed border-line" />
                    <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-line bg-night" />
                    <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-line bg-night" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-night-700 px-3 font-condensed text-[10px] uppercase tracking-[0.32em] text-ink-dim">
                      Match Details
                    </span>
                  </div>

                  <ul className="mx-auto mb-5 flex w-full max-w-sm flex-col gap-2.5 sm:mb-6 sm:gap-3">
                    {tnppl.keyItems.map((item) => {
                      const Icon = ICONS[item.icon as keyof typeof ICONS] ?? MapPin;
                      return (
                        <li
                          key={item.title}
                          data-invite-rise
                          className="group flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-3.5 py-2 text-left transition-colors duration-300 hover:border-lime/40 hover:bg-lime/[0.06] sm:px-4 sm:py-2.5"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-lime/25 bg-lime/10 text-lime transition-transform duration-300 group-hover:scale-110 sm:h-9 sm:w-9">
                            <Icon aria-hidden="true" className="h-4 w-4" />
                          </span>
                          <span className="font-condensed text-xs uppercase tracking-[0.14em] text-ink sm:text-sm">
                            {item.title}
                          </span>
                          <span className="ml-auto text-right text-xs text-ink-soft sm:text-sm">
                            {item.detail}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div
                    data-invite-rise
                    className="flex flex-col gap-3 sm:flex-row sm:justify-center"
                  >
                    <Button onClick={onCountMeIn}>
                      Count Me In
                      <ArrowRight aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" onClick={onKeepExploring}>
                      Keep exploring
                    </Button>
                  </div>

                  {/* ticket-stub small print */}
                  <p
                    data-invite-rise
                    className="mt-4 font-condensed text-[10px] uppercase tracking-[0.3em] text-ink-dim sm:mt-5"
                  >
                    Admit: all of Salem · {tnppl.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
