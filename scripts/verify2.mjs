import puppeteer from "puppeteer-core";

const OUT = process.argv[2] || "/tmp/shots2";
import fs from "fs";
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"],
});

// ---- DESKTOP ----
const d = await browser.newPage();
d.on("pageerror", (e) => console.log("PAGEERROR:", String(e).slice(0, 200)));
await d.setViewport({ width: 1440, height: 900 });
await d.goto("http://localhost:4173/", { waitUntil: "load", timeout: 60000 });
await sleep(4200);
await d.screenshot({ path: `${OUT}/v-d01-hero.png` });

// stats after scrolling
await d.evaluate(() => {
  const el = document.querySelector("#tnppl");
  const y = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y + 200, behavior: "instant" });
});
await sleep(3000);
const statState = await d.evaluate(() => {
  const els = [...document.querySelectorAll("#tnppl span[aria-label]")];
  return els.map((e) => {
    const cs = getComputedStyle(e.parentElement);
    return { label: e.getAttribute("aria-label"), text: e.textContent, vis: cs.visibility, op: cs.opacity };
  });
});
console.log("STATS:", JSON.stringify(statState));
await d.screenshot({ path: `${OUT}/v-d02-stats.png` });

// crest reveal via JS click on the unveil button (found by text)
await d.evaluate(() => {
  const el = document.querySelector("#reveal");
  const y = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y, behavior: "instant" });
});
await sleep(1500);
const clicked = await d.evaluate(() => {
  const btns = [...document.querySelectorAll("#reveal button")];
  const target = btns.find((b) => /unveil/i.test(b.textContent || ""));
  if (target) {
    target.click();
    return (target.textContent || "").trim();
  }
  return null;
});
console.log("UNVEIL CLICKED:", clicked);
await sleep(4500);
await d.screenshot({ path: `${OUT}/v-d03-crest-post.png` });

// registration form fill + submit
await d.evaluate(() => {
  const el = document.querySelector("#join");
  const y = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y - 40, behavior: "instant" });
});
await sleep(2000);
try {
  const inputs = await d.$$("#join input");
  await inputs[0].type("Suresh Kumar");
  await inputs[1].type("suresh@example.com");
  const submit = await d.$('#join button[type="submit"]');
  await d.evaluate((b) => b.click(), submit);
  await sleep(2500);
  await d.screenshot({ path: `${OUT}/v-d04-join-success.png` });
} catch (e) {
  console.log("form test failed:", String(e).slice(0, 150));
}
await d.close();

// ---- MOBILE ----
const m = await browser.newPage();
m.on("pageerror", (e) => console.log("M-PAGEERROR:", String(e).slice(0, 200)));
await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await m.goto("http://localhost:4173/", { waitUntil: "load", timeout: 60000 });
await sleep(4200);
await m.screenshot({ path: `${OUT}/v-m01-hero.png` });

const burgerInfo = await m.evaluate(() => {
  const b = document.querySelector("header button[aria-expanded]");
  if (!b) return null;
  const r = b.getBoundingClientRect();
  b.click();
  return { x: Math.round(r.x), w: Math.round(r.width) };
});
console.log("BURGER:", JSON.stringify(burgerInfo));
await sleep(1600);
await m.screenshot({ path: `${OUT}/v-m02-menu.png` });
await m.close();

await browser.close();
console.log("done");
