const baseUrl = "http://127.0.0.1:8014";
const pages = [
  "index.html",
  "services/online-security.html",
  "services/privacy-protection.html",
  "privacy.html",
  "terms.html",
  "cookies.html",
];
const viewports = [
  { name: "mobile", width: 390, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "wide-tablet", width: 900, height: 1100 },
];
const selector = [
  "h1",
  "h2",
  ".home-about__title",
  ".home-services__title",
  ".home-service-showcase__title",
  ".home-scheme__title",
  ".home-testimonials__title",
  ".home-principles__title",
  ".home-faq__title",
  ".home-contact__title",
  ".service-hero__title",
  ".service-intro__title",
  ".service-overview__title",
  ".service-focus__title",
  ".service-scheme__title",
  ".service-flow__title",
  ".service-resources__title",
  ".service-parallax__title",
  ".service-faq__title",
  ".service-contact__title",
  ".service-end__title",
  ".service-testimonials__title",
  ".legal-hero__title",
  ".legal-section__title",
  ".legal-contact__title",
].join(",");

async function cdp(method, params = {}) {
  const response = await fetch(`http://127.0.0.1:9338/json/${method}`, {
    method: "PUT",
    body: JSON.stringify(params),
  });
  return response.text();
}

function wsSend(ws, id, method, params = {}) {
  ws.send(JSON.stringify({ id, method, params }));
}

const browserTab = await fetch("http://127.0.0.1:9338/json/new", {
  method: "PUT",
}).then((r) => r.json());
const ws = new WebSocket(browserTab.webSocketDebuggerUrl);

let id = 1;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.id && pending.has(data.id)) {
    pending.get(data.id)(data);
    pending.delete(data.id);
  }
});

await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));

function send(method, params = {}) {
  const next = id++;
  wsSend(ws, next, method, params);
  return new Promise((resolve) => pending.set(next, resolve));
}

await send("Page.enable");
await send("Runtime.enable");

async function waitForLoad() {
  await new Promise((resolve) => setTimeout(resolve, 800));
}

const failures = [];
for (const viewport of viewports) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width <= 560,
  });

  for (const page of pages) {
    await send("Page.navigate", { url: `${baseUrl}/${page}` });
    await waitForLoad();

    const expression = `(async () => {
      const selector = ${JSON.stringify(selector)};
      if (window.gsap) {
        window.gsap.globalTimeline.timeScale(12);
      }
      const headings = [...document.querySelectorAll(selector)];
      const results = [];
      for (const el of headings) {
        el.scrollIntoView({ block: "center", inline: "center" });
        await new Promise((resolve) => setTimeout(resolve, 180));
        const rect = el.getBoundingClientRect();
        const container = el.closest(".container") || el.closest("section") || document.documentElement;
        const containerRect = container.getBoundingClientRect();
        const style = getComputedStyle(el);
        results.push({
          text: el.textContent.trim().replace(/\\s+/g, " ").slice(0, 80),
          className: el.className || el.tagName,
          textAlign: style.textAlign,
          whiteSpace: style.whiteSpace,
          overflowX: rect.left < containerRect.left - 1 || rect.right > containerRect.right + 1,
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          containerLeft: Math.round(containerRect.left * 10) / 10,
          containerRight: Math.round(containerRect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          containerWidth: Math.round(containerRect.width * 10) / 10
        });
      }
      return results;
    })()`;
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    const headings = result.result.result.value;
    const bad = headings.filter(
      (item) => item.overflowX || item.textAlign !== "center"
    );
    if (bad.length) {
      failures.push({ viewport: viewport.name, page, bad });
    }
  }
}

console.log(JSON.stringify(failures, null, 2));

ws.close();
await cdp("close/" + browserTab.id);
