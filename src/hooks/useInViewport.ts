import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks whether an element is (approximately) in the viewport.
 * Used to pause R3F canvases and continuous animations offscreen.
 */
export function useInViewport(
  ref: RefObject<Element>,
  rootMargin = "200px"
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
