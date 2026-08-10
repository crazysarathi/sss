import puppeteer from "puppeteer-core";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto("http://localhost:4173/", { waitUntil: "load", timeout: 60000 });
await sleep(3000);
const fs = await p.evaluate(() => {
  const h2 = document.querySelector("#insta h2");
  return h2 ? getComputedStyle(h2).fontSize : "not found";
});
console.log("insta h2 font-size:", fs);
await b.close();
