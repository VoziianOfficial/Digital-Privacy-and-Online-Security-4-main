import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:17654";

const browser = await chromium.launch({
  headless: true
});

const page = await browser.newPage({
  viewport: {
    width: 1366,
    height: 900
  }
});

await page.addInitScript(() => {
  sessionStorage.clear();
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const captureHeader = async (label) =>
  page.evaluate((name) => {
    const header = document.querySelector(".site-header");
    const loader = document.querySelector(".page-loader");
    const panel = document.querySelector(".page-transition__panel");
    const rect = header?.getBoundingClientRect();
    const styles = header ? getComputedStyle(header) : null;

    return {
      label: name,
      url: location.pathname,
      header: header
        ? {
            opacity: styles.opacity,
            visibility: styles.visibility,
            transform: styles.transform,
            position: styles.position,
            top: styles.top,
            height: Math.round(rect.height),
            y: Math.round(rect.y),
            zIndex: styles.zIndex,
            background: styles.backgroundColor,
            pointerEvents: styles.pointerEvents
          }
        : null,
      loaderHidden: loader?.classList.contains("is-hidden") ?? null,
      panelTransform: panel ? getComputedStyle(panel).transform : null,
      menuOpen: document.body.classList.contains("menu-open")
    };
  }, label);

const results = [];

await page.goto(`${baseUrl}/index.html`, {
  waitUntil: "domcontentloaded"
});

results.push(await captureHeader("home:first-dom-frame"));
await page.waitForLoadState("load");
await sleep(800);
results.push(await captureHeader("home:after-first-loader"));

await page.click('a[href="services/privacy-protection.html"]');
await page.waitForURL("**/services/privacy-protection.html");
results.push(await captureHeader("service:after-navigation"));
await sleep(250);
results.push(await captureHeader("service:after-transition"));

await page.click('a[href="../privacy.html"]');
await page.waitForURL("**/privacy.html");
results.push(await captureHeader("legal:after-navigation"));
await sleep(250);
results.push(await captureHeader("legal:after-transition"));

await page.click('a[href="index.html"]');
await page.waitForURL("**/index.html");
results.push(await captureHeader("home-return:after-navigation"));
await sleep(250);
results.push(await captureHeader("home-return:after-transition"));

await page.goBack({
  waitUntil: "domcontentloaded"
});
results.push(await captureHeader("back:after-pageshow"));
await sleep(250);
results.push(await captureHeader("back:after-settle"));

await page.goForward({
  waitUntil: "domcontentloaded"
});
results.push(await captureHeader("forward:after-pageshow"));
await sleep(250);
results.push(await captureHeader("forward:after-settle"));

console.log(JSON.stringify(results, null, 2));

await browser.close();
