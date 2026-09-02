const baseUrl = "http://127.0.0.1:17654";
const tabsUrl = "http://127.0.0.1:9345/json/new";

const tab = await fetch(tabsUrl, {
  method: "PUT"
}).then((response) => response.json());

const socket = new WebSocket(tab.webSocketDebuggerUrl);
let sequence = 0;
const callbacks = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && callbacks.has(message.id)) {
    const { resolve, reject } = callbacks.get(message.id);
    callbacks.delete(message.id);
    if (message.error) {
      reject(new Error(message.error.message));
    } else {
      resolve(message.result);
    }
  }
});

await new Promise((resolve) => {
  socket.addEventListener("open", resolve, {
    once: true
  });
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++sequence;
    callbacks.set(id, {
      resolve,
      reject
    });
    socket.send(JSON.stringify({
      id,
      method,
      params
    }));
  });

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.text ||
      "Evaluation failed"
    );
  }

  return result.result.value;
};

const waitForPath = async (pathname) => {
  const started = Date.now();

  while (Date.now() - started < 10000) {
    const currentPath = await evaluate("location.pathname");
    if (currentPath.endsWith(pathname)) {
      return;
    }

    await wait(50);
  }

  throw new Error(`Timed out waiting for ${pathname}`);
};

const navigate = async (url) => {
  await send("Page.navigate", {
    url
  });
  await waitForPath(new URL(url).pathname);
};

const capture = (label) =>
  evaluate(`(() => {
    const header = document.querySelector(".site-header");
    const loader = document.querySelector(".page-loader");
    const panel = document.querySelector(".page-transition__panel");
    const rect = header.getBoundingClientRect();
    const styles = getComputedStyle(header);

    return {
      label: ${JSON.stringify(label)},
      path: location.pathname,
      opacity: styles.opacity,
      visibility: styles.visibility,
      transform: styles.transform,
      position: styles.position,
      top: styles.top,
      height: Math.round(rect.height),
      y: Math.round(rect.y),
      zIndex: styles.zIndex,
      pointerEvents: styles.pointerEvents,
      background: styles.backgroundColor,
      loaderHidden: loader.classList.contains("is-hidden"),
      bodyLoading: document.body.classList.contains("is-loading"),
      panelTransform: getComputedStyle(panel).transform,
      menuOpen: document.body.classList.contains("menu-open")
    };
  })()`);

const clickPath = async (pathname) => {
  const expression = `(() => {
    const link = Array.from(document.querySelectorAll("a[href]")).find((anchor) =>
      new URL(anchor.href).pathname.endsWith(${JSON.stringify(pathname)})
    );
    if (!link) {
      throw new Error("Missing link: ${pathname}");
    }
    link.click();
  })()`;
  await evaluate(expression);
  await waitForPath(pathname);
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1366,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false
});

const results = [];

await navigate(`${baseUrl}/index.html`);
await evaluate("sessionStorage.clear()");
await navigate(`${baseUrl}/index.html`);
results.push(await capture("home:first-load"));
await wait(900);
results.push(await capture("home:after-loader"));

await clickPath("/services/privacy-protection.html");
results.push(await capture("service:after-navigation"));
await wait(350);
results.push(await capture("service:after-transition"));

await clickPath("/privacy.html");
results.push(await capture("legal:after-navigation"));
await wait(350);
results.push(await capture("legal:after-transition"));

await clickPath("/index.html");
results.push(await capture("home-return:after-navigation"));
await wait(350);
results.push(await capture("home-return:after-transition"));

const historyBeforeBack = await send("Page.getNavigationHistory");
const backEntry =
  historyBeforeBack.entries[historyBeforeBack.currentIndex - 1];
await send("Page.navigateToHistoryEntry", {
  entryId: backEntry.id
});
await waitForPath(new URL(backEntry.url).pathname);
results.push(await capture("back:after-pageshow"));
await wait(350);
results.push(await capture("back:after-settle"));

const history = await send("Page.getNavigationHistory");
const currentIndex = history.currentIndex;
const forwardEntry = history.entries[currentIndex + 1];
if (forwardEntry) {
  await send("Page.navigateToHistoryEntry", {
    entryId: forwardEntry.id
  });
  await waitForPath(new URL(forwardEntry.url).pathname);
  results.push(await capture("forward:after-pageshow"));
  await wait(350);
  results.push(await capture("forward:after-settle"));
}

console.log(JSON.stringify(results, null, 2));
socket.close();
