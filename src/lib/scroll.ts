import { gsap, ScrollSmoother } from "@/lib/gsap";

/**
 * Smooth-scroll to an in-page anchor. Routes through ScrollSmoother
 * when active (native anchors don't, inside a transformed wrapper),
 * falls back to a plain GSAP scroll tween otherwise.
 */
export function scrollToSection(hash: string) {
  const target = document.querySelector(hash);
  if (!target) return;

  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(target, true, "top 72px");
  } else {
    gsap.to(window, {
      scrollTo: { y: target, offsetY: 72 },
      duration: 1,
      ease: "power3.inOut",
    });
  }
}
