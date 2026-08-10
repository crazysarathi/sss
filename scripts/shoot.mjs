import puppeteer from "puppeteer-core";
import fs from "fs";

const OUT = process.argv[2] || "/tmp/shots";
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"],
});

const errors = [];

async function newPage(width, height, mobile = false) {
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[console ${width}w] ${m.text().slice(0, 300)}`);
  });
  page.on("pageerror", (e) => errors.push(`[pageerror ${width}w] ${String(e).slice(0, 300)}`));
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await page.goto("http://localhost:4173/", { waitUntil: "load", timeout: 60000 });
  await sleep(3500); // loader + hero entrance
  return page;
}

async function scrollToAndShoot(page, selector, name, settle = 1800) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, y - 60), behavior: "instant" });
    }
  }, selector);
  await sleep(settle);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("shot", name);
}

// ---------- DESKTOP ----------
const d = await newPage(1440, 900);
await d.screenshot({ path: `${OUT}/d01-hero.png` });
console.log("shot d01-hero");

await scrollToAndShoot(d, "#tnppl", "d02-tnppl");
await scrollToAndShoot(d, "#reveal", "d03-crest-pre");

// click the unveil button
try {
  const btn = await d.$("#reveal button");
  if (btn) {
    await btn.click();
    await sleep(4200);
    await d.screenshot({ path: `${OUT}/d04-crest-post.png` });
    console.log("shot d04-crest-post");
  }
} catch (e) {
  console.log("unveil click failed:", String(e).slice(0, 200));
}

// identity is pinned: scroll into the middle of the pin range
await d.evaluate(() => {
  const el = document.querySelector("#identity");
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y + window.innerHeight * 0.5, behavior: "instant" });
  }
});
await sleep(2500);
await d.screenshot({ path: `${OUT}/d05-identity-a.png` });
console.log("shot d05-identity-a");
await d.evaluate(() => window.scrollBy({ top: window.innerHeight * 2.2, behavior: "instant" }));
await sleep(2500);
await d.screenshot({ path: `${OUT}/d06-identity-b.png` });
console.log("shot d06-identity-b");

await scrollToAndShoot(d, "#events", "d07-events", 2500);
await scrollToAndShoot(d, "#community", "d08-community");
await scrollToAndShoot(d, "#insta", "d09-insta");
await scrollToAndShoot(d, "#join", "d10-join");
await scrollToAndShoot(d, "footer", "d11-footer");
await d.close();

// ---------- MOBILE ----------
const m = await newPage(390, 844, true);
await m.screenshot({ path: `${OUT}/m01-hero.png` });
console.log("shot m01-hero");

// open the mobile menu
try {
  const burger = await m.$('header button[aria-expanded], header button[aria-label*="menu" i], header button[aria-label*="Menu" i], header button');
  if (burger) {
    await burger.click();
    await sleep(1500);
    await m.screenshot({ path: `${OUT}/m02-menu.png` });
    console.log("shot m02-menu");
    await m.keyboard.press("Escape");
    await sleep(800);
  }
} catch (e) {
  console.log("menu open failed:", String(e).slice(0, 200));
}

await scrollToAndShoot(m, "#tnppl", "m03-tnppl");
await scrollToAndShoot(m, "#reveal", "m04-crest");
await scrollToAndShoot(m, "#identity", "m05-identity");
await scrollToAndShoot(m, "#events", "m06-events", 2500);
await scrollToAndShoot(m, "#join", "m07-join");
await m.close();

await browser.close();

console.log("\n=== PAGE ERRORS (deduped) ===");
console.log([...new Set(errors)].slice(0, 20).join("\n") || "none");
