import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  Mountain,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { join } from "@/data/siteData";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassCard } from "@/components/shared/GlassCard";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VenueIconKey = (typeof join.venues)[number]["icon"];

const VENUE_ICONS: Record<VenueIconKey, LucideIcon> = {
  mountain: Mountain,
  trophy: Trophy,
  "map-pin": MapPin,
};

const EMAIL_RE = /.+@.+\..+/;

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

type Phase = "form" | "success";

/**
 * Registration experience — a single split glass card: venue facts on the
 * left, a validated join form on the right that GSAP-swaps into a celebratory
 * success state. Purely client-side; nothing is persisted.
 */
export function RegistrationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const hasSwappedRef = useRef(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("fan");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [phase, setPhase] = useState<Phase>("form");

  /* ------------------------------------------------------------------ */
  /* Entrance reveals — venue rows sweep in, form fields rise, once.     */
  /* ------------------------------------------------------------------ */
  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const card = cardWrapRef.current;
      if (!card) return;

      const venueRows = gsap.utils.toArray<HTMLElement>("[data-reveal-venue]", card);
      if (venueRows.length) {
        gsap.fromTo(
          venueRows,
          { autoAlpha: 0, x: -26 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 72%", once: true },
          }
        );
      }

      const fields = gsap.utils.toArray<HTMLElement>("[data-reveal-field]", card);
      if (fields.length) {
        gsap.fromTo(
          fields,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 72%", once: true },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  /* ------------------------------------------------------------------ */
  /* Phase swap-in animations (form <-> success).                        */
  /* ------------------------------------------------------------------ */
  useGSAP(
    () => {
      if (prefersReducedMotion() || !hasSwappedRef.current) return;

      if (phase === "success" && successRef.current) {
        const root = successRef.current;
        const ring = root.querySelector<HTMLElement>("[data-success-ring]");
        const pops = root.querySelectorAll<HTMLElement>("[data-success-pop]");
        const tl = gsap.timeline();
        tl.fromTo(
          root,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.35, ease: "power2.out" }
        );
        if (ring) {
          tl.fromTo(
            ring,
            { autoAlpha: 0, scale: 0.25 },
            { autoAlpha: 1, scale: 1, duration: 1.1, ease: "elastic.out(1, 0.4)" },
            0.08
          );
        }
        tl.fromTo(
          pops,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09, ease: "expo.out" },
          0.28
        );
      }

      if (phase === "form" && formRef.current) {
        const fields = formRef.current.querySelectorAll<HTMLElement>("[data-reveal-field]");
        gsap.fromTo(
          formRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.35, ease: "power2.out" }
        );
        gsap.fromTo(
          fields,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: "expo.out", delay: 0.08 }
        );
      }
    },
    { scope: rightColRef, dependencies: [phase] }
  );

  /* ------------------------------------------------------------------ */
  /* Swap helpers.                                                       */
  /* ------------------------------------------------------------------ */
  const swapToSuccess = contextSafe(() => {
    hasSwappedRef.current = true;
    if (prefersReducedMotion() || !formRef.current) {
      setPhase("success");
      return;
    }
    gsap.to(formRef.current, {
      autoAlpha: 0,
      y: -28,
      duration: 0.45,
      ease: "power3.inOut",
      onComplete: () => setPhase("success"),
    });
  });

  const resetForRegisterAnother = contextSafe(() => {
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("fan");
    setErrors({});
    setSubmittedName("");
    if (prefersReducedMotion() || !successRef.current) {
      setPhase("form");
      return;
    }
    gsap.to(successRef.current, {
      autoAlpha: 0,
      y: -20,
      duration: 0.4,
      ease: "power3.inOut",
      onComplete: () => setPhase("form"),
    });
  });

  /* Keyboard focus follows the phase swap — the DOM the user was focused
     in gets unmounted, which would otherwise drop focus to <body>.
     Never runs before the first swap (would steal focus on page load). */
  useEffect(() => {
    if (!hasSwappedRef.current) return;
    if (phase === "success") {
      successRef.current?.focus({ preventScroll: true });
    } else if (document.activeElement === document.body) {
      nameRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  /* ------------------------------------------------------------------ */
  /* Validation + submit.                                                */
  /* ------------------------------------------------------------------ */
  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (fullName.trim().length < 2) {
      next.fullName = "Please enter your name (at least 2 characters).";
    }
    if (!EMAIL_RE.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    const phoneTrim = phone.trim();
    if (phoneTrim.length > 0) {
      const digits = phoneTrim.replace(/[\s+-]/g, "");
      if (!/^\d{7,15}$/.test(digits)) {
        next.phone = "Phone should be 7–15 digits (spaces, + and - are fine).";
      }
    }
    return next;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);

    if (nextErrors.fullName || nextErrors.email || nextErrors.phone) {
      if (nextErrors.fullName) nameRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else phoneRef.current?.focus();
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setSubmittedName(fullName.trim());
    toast.success(join.successNote);
    swapToSuccess();
  };

  const firstName = submittedName.split(/\s+/)[0] ?? submittedName;

  return (
    <section id="join" ref={sectionRef} className="relative overflow-hidden">
      <div className="section-shell">
        <div ref={cardWrapRef} className="relative">
          {/* Royal glow behind the card's top-left corner */}
          <div
            aria-hidden="true"
            className="glow-spot -left-28 -top-24 h-[26rem] w-[26rem] bg-royal/30"
          />

          <ScrollReveal from="up" className="relative">
            <GlassCard className="relative grid gap-0 overflow-hidden shadow-card-deep lg:grid-cols-[1fr_1.1fr]">
              <div aria-hidden="true" className="court-backdrop opacity-60" />

              {/* ------------------------------------------------------ */}
              {/* LEFT — heading + venue facts + watermark               */}
              {/* ------------------------------------------------------ */}
              <div className="relative z-10 overflow-hidden border-b border-line p-6 sm:p-8 md:p-14 lg:border-b-0 lg:border-r">
                <SectionHeading
                  align="left"
                  kicker={join.kicker}
                  title={join.title}
                  lead={join.lead}
                  className="mb-10 md:mb-12"
                />

                <ul className="relative z-10 space-y-4">
                  {join.venues.map((venue) => {
                    const Icon = VENUE_ICONS[venue.icon];
                    return (
                      <li
                        key={venue.label}
                        data-reveal
                        data-reveal-venue
                        className="flex items-center gap-4"
                      >
                        <span className="flex shrink-0 items-center justify-center rounded-full border border-line bg-white/[0.03] p-2.5 text-lime">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="font-condensed text-base uppercase tracking-[0.16em] text-ink-soft md:text-lg">
                          {venue.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Quiet Anton outline watermark */}
                <div
                  aria-hidden="true"
                  className="text-stroke-ink pointer-events-none absolute -bottom-10 -left-3 select-none font-display text-[9rem] uppercase leading-none opacity-30 md:text-[13rem]"
                >
                  SSS
                </div>
              </div>

              {/* ------------------------------------------------------ */}
              {/* RIGHT — form / success                                 */}
              {/* ------------------------------------------------------ */}
              <div ref={rightColRef} className="relative z-10 p-6 sm:p-8 md:p-14">
                {phase === "form" ? (
                  <form
                    ref={formRef}
                    noValidate
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col justify-center gap-6"
                  >
                    <div data-reveal data-reveal-field className="space-y-2">
                      <Label htmlFor="join-name">Full Name</Label>
                      <Input
                        ref={nameRef}
                        id="join-name"
                        name="fullName"
                        autoComplete="name"
                        placeholder="Your name"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) {
                            setErrors((prev) => ({ ...prev, fullName: undefined }));
                          }
                        }}
                        aria-invalid={errors.fullName ? true : undefined}
                        aria-describedby={errors.fullName ? "join-name-error" : undefined}
                      />
                      {errors.fullName && (
                        <p id="join-name-error" role="alert" className="text-sm text-destructive">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div data-reveal data-reveal-field className="space-y-2">
                      <Label htmlFor="join-email">Email</Label>
                      <Input
                        ref={emailRef}
                        id="join-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) {
                            setErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                        aria-invalid={errors.email ? true : undefined}
                        aria-describedby={errors.email ? "join-email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="join-email-error" role="alert" className="text-sm text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div data-reveal data-reveal-field className="space-y-2">
                      <Label htmlFor="join-phone">Phone (optional)</Label>
                      <Input
                        ref={phoneRef}
                        id="join-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) {
                            setErrors((prev) => ({ ...prev, phone: undefined }));
                          }
                        }}
                        aria-invalid={errors.phone ? true : undefined}
                        aria-describedby={errors.phone ? "join-phone-error" : undefined}
                      />
                      {errors.phone && (
                        <p id="join-phone-error" role="alert" className="text-sm text-destructive">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div data-reveal data-reveal-field className="space-y-2">
                      <Label htmlFor="join-role">I&rsquo;m joining as</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger id="join-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {join.roles.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div data-reveal data-reveal-field className="pt-2">
                      <MagneticButton className="block w-full">
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="animate-spin" aria-hidden="true" />
                              Counting you in&hellip;
                            </>
                          ) : (
                            <>
                              {join.cta}
                              <ArrowRight aria-hidden="true" />
                            </>
                          )}
                        </Button>
                      </MagneticButton>
                    </div>
                  </form>
                ) : (
                  <div
                    ref={successRef}
                    role="status"
                    tabIndex={-1}
                    className="flex h-full min-h-[24rem] flex-col items-center justify-center py-6 text-center outline-none"
                  >
                    <div
                      data-success-ring
                      className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-lime/40 bg-lime/10 shadow-glow-lime"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-lime/15 blur-xl"
                      />
                      <CheckCircle2 className="relative h-12 w-12 text-lime" aria-hidden="true" />
                    </div>

                    <h3
                      data-success-pop
                      className="font-display text-4xl uppercase text-ink md:text-5xl"
                    >
                      You&rsquo;re in!
                    </h3>

                    <p
                      data-success-pop
                      className="mt-4 max-w-sm text-base leading-relaxed text-ink-soft"
                    >
                      {join.successNote}
                    </p>

                    {firstName && (
                      <p
                        data-success-pop
                        className="mt-3 font-condensed text-lg uppercase tracking-[0.16em] text-lime"
                      >
                        See you courtside, {firstName}.
                      </p>
                    )}

                    <div data-success-pop className="mt-9">
                      <Button variant="ghost" onClick={resetForRegisterAnother}>
                        Register another
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
