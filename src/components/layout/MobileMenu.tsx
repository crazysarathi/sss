import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Instagram, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";
import { Button } from "@/components/ui/button";
import { navLinks, site, instagram, INSTAGRAM_URL } from "@/data/siteData";
import navLogo from "@/assets/logos/sss-logo-nav.png";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Fullscreen mobile navigation, portalled to document.body so position:fixed
 * works despite the ScrollSmoother-transformed wrapper. One GSAP timeline
 * drives open (play) and close (reverse); reduced motion jumps states.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Build the open/close timeline once. Its fromTo immediateRenders the
  // closed state (container autoAlpha 0), so nothing flashes on mount.
  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.fromTo(
        el,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.45, ease: "power2.out" }
      )
        .fromTo(
          "[data-menu-glow]",
          { scale: 0.7, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 1.1, stagger: 0.1 },
          0.05
        )
        .fromTo(
          "[data-menu-link]",
          { yPercent: 118 },
          { yPercent: 0, duration: 0.85, stagger: 0.08 },
          0.12
        )
        .fromTo(
          "[data-menu-foot]",
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.09 },
          0.42
        );

      tlRef.current = tl;
      return () => {
        tlRef.current = null;
      };
    },
    { scope: containerRef }
  );

  // Play / reverse on open state. Reduced motion: jump to the end state.
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) {
      const el = containerRef.current;
      if (el) gsap.set(el, { autoAlpha: open ? 1 : 0 });
      return;
    }
    if (prefersReducedMotion()) {
      tl.progress(open ? 1 : 0).pause();
      return;
    }
    if (open) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.75).reverse();
    }
  }, [open]);

  // While open: lock scroll, close on Escape, focus the close button,
  // and bail out if the viewport crosses into desktop.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const mql = window.matchMedia("(min-width: 1024px)");
    const onDesktop = (e: MediaQueryListEvent) => {
      if (e.matches) onClose();
    };
    mql.addEventListener("change", onDesktop);

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 120);

    return () => {
      window.removeEventListener("keydown", onKey);
      mql.removeEventListener("change", onDesktop);
      window.clearTimeout(focusTimer);
      root.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleNav =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      // Release the scroll lock synchronously so the scroll tween can run.
      document.documentElement.style.overflow = "";
      onClose();
      window.setTimeout(
        () => scrollToSection(href),
        prefersReducedMotion() ? 0 : 320
      );
    };

  return createPortal(
    <div
      ref={containerRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-night lg:hidden"
    >
      {/* Atmosphere */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="court-backdrop" />
        <div
          data-menu-glow
          className="glow-spot -top-32 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 bg-royal/25"
        />
        <div
          data-menu-glow
          className="glow-spot -bottom-24 -right-24 h-[22rem] w-[22rem] bg-royal-deep/40"
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-night via-night/60 to-transparent" />
      </div>

      {/* Top bar: brand + close */}
      <div className="relative flex h-[76px] shrink-0 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src={navLogo} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="font-condensed text-lg uppercase leading-none tracking-[0.34em] text-ink">
            {site.shortName}
          </span>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/[0.04] text-ink transition-colors duration-300 hover:border-lime/60 hover:text-lime"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Links */}
      <nav aria-label="Mobile" className="relative flex flex-1 items-center px-6">
        <ul className="w-full space-y-1">
          {navLinks.map((link, i) => (
            <li key={link.href} className="overflow-hidden border-b border-line/60 last:border-b-0">
              <a
                href={link.href}
                onClick={handleNav(link.href)}
                data-menu-link
                className="group flex items-baseline gap-4 py-4"
              >
                <span className="font-condensed text-sm leading-none tracking-[0.3em] text-lime">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display-title text-display-md transition-colors duration-300 group-hover:text-lime-bright group-active:text-lime-bright">
                  {link.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: Instagram CTA + hashtag */}
      <div className="relative shrink-0 space-y-5 px-6 pb-[max(2.25rem,env(safe-area-inset-bottom))] pt-4">
        <div data-menu-foot>
          <Button asChild variant="insta" className="w-full">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener"
              onClick={onClose}
            >
              <Instagram aria-hidden="true" />
              {instagram.cta}
            </a>
          </Button>
        </div>
        <p
          data-menu-foot
          className="text-center font-condensed text-sm uppercase tracking-[0.32em] text-ink-dim"
        >
          {site.hashtag}
        </p>
      </div>
    </div>,
    document.body
  );
}
