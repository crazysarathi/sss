import puppeteer from "puppeteer-core";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await p.goto("http://localhost:4173/", { waitUntil: "load", timeout: 60000 });
await sleep(3500);
const bad = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll("body *").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > 396 || r.left < -6) && r.width < 2000) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed") return;
      out.push({
        tag: el.tagName,
        cls: (el.className || "").toString().slice(0, 70),
        sec: el.closest("section, footer, header")?.id || el.closest("section, footer, header")?.tagName || "?",
        l: Math.round(r.left), rgt: Math.round(r.right), w: Math.round(r.width),
      });
    }
  });
  // keep only the outermost offenders (dedupe children of same section)
  return out.slice(0, 40);
});
console.log(JSON.stringify(bad, null, 1));
await b.close();
