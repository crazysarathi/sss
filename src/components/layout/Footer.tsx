import { ArrowUp, Instagram } from "lucide-react";
import { footer, site, INSTAGRAM_URL } from "@/data/siteData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { scrollToSection } from "@/lib/scroll";
import crestLogo from "@/assets/logos/sss-logo-small.png";

/**
 * Site footer — quiet, premium sign-off. Crest, franchise name,
 * Instagram CTA, copyright and powered-by credit over a faint
 * court grid with a royal glow behind the crest.
 */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-night-800">
      {/* Ambient layers */}
      <div aria-hidden="true" className="court-backdrop opacity-50" />
      <div
        aria-hidden="true"
        className="glow-spot left-1/2 top-4 h-72 w-72 -translate-x-1/2 bg-royal/25 md:h-96 md:w-96"
      />

      <ScrollReveal
        staggerChildren
        stagger={0.08}
        className="section-shell z-10 flex flex-col items-center gap-6 py-16 text-center md:py-20"
      >
        <div>
          <img
            src={crestLogo}
            alt="Salem Super Smashers crest"
            className="h-20 w-auto transition-transform duration-500 ease-out hover:rotate-3 hover:scale-105 md:h-24"
            loading="lazy"
            decoding="async"
          />
        </div>

        <p className="font-display text-2xl uppercase tracking-wide text-ink md:text-3xl">
          {footer.name}
        </p>

        <Button asChild variant="ghost">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
            <Instagram aria-hidden="true" />
            {footer.instagramLabel}
          </a>
        </Button>

        <Separator className="max-w-xs" />

        <p className="text-sm text-ink-dim">{footer.copyright}</p>

        <p className="text-sm text-ink-dim">
          {footer.poweredByPrefix}{" "}
          <a
            href={site.poweredBy.url}
            target="_blank"
            rel="noopener"
            className="text-ink-soft underline-offset-4 transition-colors hover:text-lime hover:underline"
          >
            <strong>{site.poweredBy.label}</strong>
          </a>
        </p>
      </ScrollReveal>

      {/* Back to top */}
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => scrollToSection("#hero")}
        className="absolute bottom-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/[0.03] text-ink-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-lime/50 hover:text-lime md:bottom-auto md:top-6"
      >
        <ArrowUp className="h-5 w-5" aria-hidden="true" />
      </button>
    </footer>
  );
}
