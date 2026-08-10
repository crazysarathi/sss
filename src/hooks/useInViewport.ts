import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks whether an element is (approximately) in the viewport.
 * Used to pause R3F canvases and continuous animations offscreen.
 *
 * If the observed element mounts conditionally AFTER the first render
 * (e.g. gated on a media query), pass the gating values via `deps` so
 * the observer re-attaches when the element appears.
 */
export function useInViewport(
  ref: RefObject<Element>,
  rootMargin = "200px",
  deps: readonly unknown[] = []
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setInView(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, rootMargin, ...deps]);

  return inView;
}
