import { lazy, Suspense, useCallback, useLayoutEffect, useEffect, useState } from "react";
import { ScrollSmoother, ScrollTrigger } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";

import { attachSoundUnlock, stopMusic, tryAutoStart } from "@/lib/sound";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { NoiseOverlay } from "@/components/shared/NoiseOverlay";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { BallHandoff } from "@/components/shared/BallHandoff";
import { BallJourney } from "@/components/shared/BallJourney";
import { Toaster } from "@/components/ui/sonner";

// Lazy: the dialog pulls in three.js via its 3D crest — a static import
// would hoist the whole three ecosystem into the entry bundle.
const LeagueInviteDialog = lazy(() =>
  import("@/components/shared/LeagueInviteDialog").then((m) => ({
    default: m.LeagueInviteDialog,
  }))
);

// Lazy: the per-event moments wall (and its sample media) only loads when
// a "View Moments" button is pressed or the page is deep-linked.
const EventMomentsPage = lazy(() =>
  import("@/components/pages/EventMomentsPage").then((m) => ({
    default: m.EventMomentsPage,
  }))
);

/** #/moments/<slug> — distinct from plain #section anchors. */
const MOMENTS_ROUTE = /^#\/moments\/(.+)$/;

const momentsSlugFromHash = () =>
  window.location.hash.match(MOMENTS_ROUTE)?.[1] ?? null;

import { HeroSection } from "@/components/sections/HeroSection";
import { LeagueSection } from "@/components/sections/LeagueSection";
import { CrestRevealSection } from "@/components/sections/CrestRevealSection";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { ProgramSection } from "@/components/sections/ProgramSection";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { InstagramSection } from "@/components/sections/InstagramSection";
import { RegistrationSection } from "@/components/sections/RegistrationSection";

export default function App() {
  const [booted, setBooted] = useState(false);
  const isMobile = useIsMobile();
  // Sections mount only after ScrollSmoother exists (or is not wanted):
  // pins created before the smoother would use fixed positioning, which
  // breaks inside the smoother's transformed wrapper and lets later
  // sections scroll over pinned stages.
  const [scrollReady, setScrollReady] = useState(false);
  // Per-event moments overlay, driven by the #/moments/<slug> hash route
  // so browser back/forward and deep links both work.
  const [momentsSlug, setMomentsSlug] = useState<string | null>(momentsSlugFromHash);

  useEffect(() => {
    const onHashChange = () => setMomentsSlug(momentsSlugFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // While the moments overlay is up, freeze the page behind it.
  useEffect(() => {
    if (!momentsSlug) return;
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    document.documentElement.style.overflow = "hidden";
    return () => {
      smoother?.paused(false);
      document.documentElement.style.overflow = "";
    };
  }, [momentsSlug]);

  const closeMoments = useCallback(() => {
    // Clear the route without a native anchor jump, then settle back on
    // the timeline the button lives in.
    history.replaceState(null, "", window.location.pathname + window.location.search);
    setMomentsSlug(null);
    requestAnimationFrame(() => scrollToSection("#events"));
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || isMobile) {
      setScrollReady(true);
      return;
    }
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.1,
      effects: true,
      smoothTouch: 0,
    });
    setScrollReady(true);
    // Recalculate pin positions once fonts finish loading.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      smoother.kill();
      setScrollReady(false);
    };
  }, [isMobile]);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Sound is always on. Try to start the score with the page (browsers
  // that allow it), and arm gesture listeners as the guaranteed fallback.
  // Music belongs to the intro only: once it finishes, fade the
  // soundtrack out for good and leave just the one-shot SFX.
  useEffect(() => {
    attachSoundUnlock();
    tryAutoStart();
  }, []);
  useEffect(() => {
    if (booted) stopMusic();
  }, [booted]);

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[110] -translate-y-24 rounded-full bg-lime px-5 py-2.5 font-condensed uppercase tracking-widest text-night-800 transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <LoadingScreen onComplete={() => setBooted(true)} />
      <Navbar booted={booted} />
      {/* Fixed ambient light layer — painted behind #smooth-wrapper (DOM order) */}
      <AmbientBackground />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          {scrollReady && (
            <>
              <main id="main-content">
                <HeroSection booted={booted} />
                <LeagueSection />
                <CrestRevealSection />
                <IdentitySection />
                {/* pickleball served from the crest stage into the timeline */}
                <BallHandoff />
                <TimelineSection />
                <ProgramSection />
                <CommunitySection />
                <InstagramSection />
                <RegistrationSection />
              </main>
              <Footer />
            </>
          )}
        </div>
      </div>

      {/* The hero ball's site-long scrubbed flight — fixed layer, so it
          must live outside the smoother's transformed content */}
      {scrollReady && <BallJourney />}
      <BackToTop />
      {/* Per-event moments wall — overlays the site, keeps scroll state below */}
      {momentsSlug && (
        <Suspense fallback={<div className="fixed inset-0 z-[92] bg-night" />}>
          <EventMomentsPage slug={momentsSlug} onBack={closeMoments} />
        </Suspense>
      )}
      <NoiseOverlay />
      {/* TNPPL invite — auto-opens once per session, a beat after boot.
          Unmounted while the moments overlay is up so it can't pop over it
          (its open-timer restarts once the visitor is back on the page). */}
      {!momentsSlug && (
        <Suspense fallback={null}>
          <LeagueInviteDialog booted={booted} />
        </Suspense>
      )}
      <Toaster position="bottom-center" />
    </>
  );
}
