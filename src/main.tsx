import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Latin subsets only — every string on the site is Latin script, so the
// extra latin-ext/vietnamese @font-face declarations are dead weight.
import "@fontsource/anton/latin.css";
import "@fontsource/bebas-neue/latin.css";
import "@fontsource-variable/manrope";
import "./index.css";
import App from "./App";

// Reveal-hiding only applies when animations will actually run.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("gsap-ready");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
