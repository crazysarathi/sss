import { Instagram } from "lucide-react";
import { footer, INSTAGRAM_URL } from "@/data/siteData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
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

        <p className="text-sm text-ink-soft">{footer.copyright}</p>
      </ScrollReveal>

    </footer>
  );
}
