import puppeteer from "puppeteer-core";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"],
});

async function probe(width, height, mobile) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await page.goto("http://localhost:4173/", { waitUntil: "load", timeout: 60000 });
  await sleep(4000);

  const info = await page.evaluate(() => {
    const styleOf = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        vis: cs.visibility, op: cs.opacity, disp: cs.display,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        text: (el.textContent || "").trim().slice(0, 40),
      };
    };
    const ctas = document.querySelector("[data-hero-ctas]");
    const ghost = ctas ? ctas.children[1] : null;
    const burger = document.querySelector("header button[aria-expanded]");
    const stats = document.querySelectorAll("#tnppl [aria-label]");
    const statEls = [...document.querySelectorAll("#tnppl span")].filter((s) =>
      /Franchise|Players|Prize/.test(s.getAttribute("aria-label") || "")
    );
    const instaTitle = document.querySelector("#insta h2, #insta [class*=display]");
    return {
      ctasChildren: ctas ? ctas.children.length : -1,
      ctaContainer: styleOf(ctas),
      ghost: styleOf(ghost),
      burger: styleOf(burger),
      statCount: statEls.length,
      stat0: styleOf(statEls[0]),
      statParent: statEls[0] ? styleOf(statEls[0].parentElement) : null,
      instaTitle: styleOf(instaTitle),
      instaTitleFontSize: instaTitle ? getComputedStyle(instaTitle).fontSize : null,
      statsAria: stats.length,
    };
  });
  console.log(`--- ${width}x${height} mobile=${mobile} ---`);
  console.log(JSON.stringify(info, null, 1));
  await page.close();
}

await probe(1440, 900, false);
await probe(390, 844, true);
await browser.close();
