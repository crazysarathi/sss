import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother, SplitText, useGSAP);

gsap.defaults({
  ease: "expo.out",
  duration: 1,
});

ScrollTrigger.config({
  ignoreMobileResize: true,
});

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, useGSAP };
