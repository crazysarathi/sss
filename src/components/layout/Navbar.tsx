import { useCallback, useEffect, useRef, useState } from "react";
import { Instagram, Menu } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";
import { Button } from "@/components/ui/button";
import { navLinks, site, INSTAGRAM_URL } from "@/data/siteData";
import { MobileMenu } from "@/components/layout/MobileMenu";
import navLogo from "@/assets/logos/sss-logo-nav.png";

interface NavbarProps {
  booted: boolean;
}

/**
 * Premium sticky navigation. Rendered OUTSIDE the ScrollSmoother wrapper,
 * so position:fixed is safe here. Transparent over the hero, compacts into
 * a glass bar once the page scrolls.
 */
export function Navbar({ booted }: NavbarProps) {
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Native scrollbar still drives ScrollSmoother, so window.scrollY is live.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Entrance: slide the bar down once the loader hands over, stagger items in.
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      if (prefersReducedMotion()) {
        gsap.set(header, { autoAlpha: 1, yPercent: 0 });
        gsap.set("[data-reveal]", { autoAlpha: 1, y: 0 });
        return;
      }

      if (!booted) {
        gsap.set(header, { yPercent: -100, autoAlpha: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        header,
        { yPercent: -100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.9 }
      ).fromTo(
        "[data-reveal]",
        { autoAlpha: 0, y: -18 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 },
        "-=0.55"
      );
    },
    { scope: headerRef, dependencies: [booted] }
  );

  const handleAnchor = useCallback(
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      scrollToSection(href);
    },
    []
  );

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        data-reveal
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b will-change-transform",
          "transition-[background-color,border-color,box-shadow] duration-500",
          scrolled
            ? "border-line bg-night/75 shadow-[0_18px_48px_-28px_rgba(2,8,23,0.95)] backdrop-blur-lg"
            : "border-transparent bg-transparent"
        )}
      >
        <nav
          aria-label="Primary"
          className={cn(
            "mx-auto flex w-full max-w-[1240px] items-center justify-between gap-6 px-6",
            "transition-[height] duration-500 ease-[var(--ease-out-expo)]",
            scrolled ? "h-[60px]" : "h-[76px]"
          )}
        >
          {/* Brand */}
          <a
            href="#hero"
            onClick={handleAnchor("#hero")}
            data-reveal
            aria-label={`${site.name} — back to top`}
            className="group flex min-h-[44px] shrink-0 items-center gap-3"
          >
            <img
              src={navLogo}
              alt=""
              width={56}
              height={56}
              className={cn(
                "h-12 w-12 object-contain md:h-14 md:w-14",
                "transition-transform duration-500",
                scrolled && "scale-[0.85]"
              )}
            />
            <span className="hidden font-condensed text-sm uppercase leading-none tracking-[0.28em] text-ink transition-colors duration-300 group-hover:text-lime-bright sm:inline sm:text-base md:text-lg">
              {site.name}
            </span>
          </a>

          {/* Desktop links + CTA */}
          <div className="hidden items-center gap-9 lg:flex">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href} data-reveal>
                  <a
                    href={link.href}
                    onClick={handleAnchor(link.href)}
                    className={cn(
                      "relative inline-block py-2 font-condensed text-[0.95rem] uppercase tracking-[0.22em]",
                      "text-ink-soft transition-colors duration-300 hover:text-ink focus-visible:text-ink",
                      "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0",
                      "after:bg-lime after:transition-transform after:duration-300 after:ease-out",
                      "hover:after:scale-x-100 focus-visible:after:scale-x-100"
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div data-reveal>
              <Button asChild variant="insta" size="sm">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
                  <Instagram aria-hidden="true" />
                  Follow Us
                </a>
              </Button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={toggleRef}
            type="button"
            data-reveal
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/[0.04] text-ink backdrop-blur-sm transition-colors duration-300 hover:border-royal-bright/50 hover:bg-royal/15 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
