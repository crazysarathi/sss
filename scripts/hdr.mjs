import puppeteer from "puppeteer-core";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await p.goto("http://localhost:4173/", { waitUntil: "load", timeout: 60000 });
await sleep(3500);
const info = await p.evaluate(() => {
  const header = document.querySelector("header");
  const walk = (el, depth) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const row = { d: depth, tag: el.tagName, cls: (el.className || "").toString().slice(0, 60), x: Math.round(r.x), w: Math.round(r.width), disp: cs.display };
    return [row, ...(depth < 3 ? [...el.children].flatMap((c) => walk(c, depth + 1)) : [])];
  };
  return { vw: document.documentElement.clientWidth, scrollW: document.documentElement.scrollWidth, rows: walk(header, 0) };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
