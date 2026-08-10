import puppeteer from "puppeteer-core";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await p.goto("http://localhost:4173/", { waitUntil: "load", timeout: 60000 });
await sleep(3500);
const res = await p.evaluate(() => {
  const isClippedBy = (el) => {
    let a = el.parentElement;
    while (a && a !== document.body) {
      const cs = getComputedStyle(a);
      if (/(hidden|clip|scroll|auto)/.test(cs.overflowX)) return true;
      a = a.parentElement;
    }
    return false;
  };
  const out = [];
  document.querySelectorAll("body *").forEach((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.position === "fixed") return;
    if (r.width > 0 && r.right > 486 - 4 && !isClippedBy(el)) {
      out.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 80),
        sec: el.closest("section, footer")?.id || "?", l: Math.round(r.left), rgt: Math.round(r.right) });
    }
  });
  return { scrollW: document.documentElement.scrollWidth, out: out.slice(0, 15) };
});
console.log(JSON.stringify(res, null, 1));
await b.close();
