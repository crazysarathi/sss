import { gsap, ScrollSmoother } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Smooth-scroll to an in-page anchor. Routes through ScrollSmoother
 * when active (native anchors don't, inside a transformed wrapper),
 * falls back to a plain GSAP scroll tween otherwise. Reduced-motion
 * users jump instantly.
 */
export function scrollToSection(hash: string) {
  const target = document.querySelector(hash);
  if (!target) return;

  const smoother = ScrollSmoother.get();

  if (prefersReducedMotion()) {
    const y = target.getBoundingClientRect().top + window.scrollY - 72;
    if (smoother) smoother.scrollTo(target, false, "top 72px");
    else window.scrollTo(0, Math.max(0, y));
    return;
  }

  if (smoother) {
    smoother.scrollTo(target, true, "top 72px");
  } else {
    gsap.to(window, {
      scrollTo: { y: target, offsetY: 72, autoKill: true },
      duration: 1,
      ease: "power3.inOut",
    });
  }
}
