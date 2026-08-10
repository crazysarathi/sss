import { useLayoutEffect, useEffect, useState } from "react";
import { ScrollSmoother, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";

import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { NoiseOverlay } from "@/components/shared/NoiseOverlay";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Toaster } from "@/components/ui/sonner";

import { HeroSection } from "@/components/sections/HeroSection";
import { LeagueSection } from "@/components/sections/LeagueSection";
import { CrestRevealSection } from "@/components/sections/CrestRevealSection";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { TimelineSection } from "@/components/sections/TimelineSection";
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
                <TimelineSection />
                <CommunitySection />
                <InstagramSection />
                <RegistrationSection />
              </main>
              <Footer />
            </>
          )}
        </div>
      </div>

      <BackToTop />
      <NoiseOverlay />
      <Toaster position="bottom-center" />
    </>
  );
}
