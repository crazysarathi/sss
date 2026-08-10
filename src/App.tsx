import { useEffect, useState } from "react";
import { ScrollSmoother, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";

import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NoiseOverlay } from "@/components/shared/NoiseOverlay";
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

  // Inertial smooth scrolling on fine pointers; native scroll on touch.
  useEffect(() => {
    if (prefersReducedMotion() || isMobile) return;
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.1,
      effects: true,
      smoothTouch: 0,
    });
    // Recalculate pin positions once fonts finish loading.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => smoother.kill();
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

      <div id="smooth-wrapper">
        <div id="smooth-content">
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
        </div>
      </div>

      <NoiseOverlay />
      <Toaster position="bottom-center" />
    </>
  );
}
