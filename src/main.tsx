import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/anton";
import "@fontsource/bebas-neue";
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
