/**
 * embedSafety.browser — F03 safe content/embed boundary, proven in real Chrome.
 *
 * These tests EXECUTE restrictions instead of asserting strings:
 * - sandbox="" is present as an attribute and scripts inside do not run,
 *   while allow-scripts frames do run (B02, no over-restriction).
 * - form submission navigates only with allow-forms; without it Chrome logs
 *   a sandbox violation and no navigation happens (B02/E10).
 * - window.open() returns null without allow-popups and a handle with it.
 * - postMessage acceptance mirrors the html widget gate 1:1 (exact
 *   source === contentWindow + envelope + payload): the intended frame is
 *   accepted, an unrelated frame and a parent-window spoof are rejected,
 *   oversized/non-record payloads are rejected (B20/E13).
 * - hostile Markdown rendered by the REAL shared pipeline produces no script
 *   execution and no activatable javascript: link in a live DOM (B03/E05).
 *
 * This is behavioral regression coverage, not a penetration test or a
 * security certification.
 *
 * Requires system Chrome (CHROME_EXECUTABLE_PATH override supported); the
 * suite skips gracefully when no browser is present.
 */
import fs from "fs";
import path from "path";

const DEFAULT_CHROME_PATHS = process.platform === "win32"
  ? [
    process.env.CHROME_EXECUTABLE_PATH || "",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ]
  : [process.env.CHROME_EXECUTABLE_PATH || "", "/usr/bin/google-chrome"];

const chromePath = DEFAULT_CHROME_PATHS.find((p) => p && fs.existsSync(p)) || null;
const HAS_CHROME = !!chromePath;

let puppeteer;
try {
  // eslint-disable-next-line global-require
  puppeteer = HAS_CHROME ? require("puppeteer-core") : null;
} catch {
  puppeteer = null;
}

const canRun = HAS_CHROME && !!puppeteer;
const suite = canRun ? describe : describe.skip;
if (!canRun) {
  console.info("[embedSafety.browser] skipped: no Chrome/puppeteer-core available");
}

const q = (s) => String(s).replace(/"/g, "&quot;");
const frameHtml = (id, name, sandbox, inner) =>
  `<iframe id="${id}" name="${name}" sandbox="${sandbox}" srcdoc="${q(inner)}"></iframe>`;

// Frame reporter: posts `count` ticks; at tick 3 it attempts submit+popup and
// reports outcomes. Navigation (successful submit) ends the tick stream early
// because the replacement document carries no script.
const reporterFrame = (tag) =>
  `<form id=f action='about:blank'><input name=x value=1></form>` +
  `<script>var n=0;var t=setInterval(function(){n++;var info={tag:'${tag}',n:n,submitted:false,opened:'none'};` +
  `try{if(n===3){var w=null;try{w=window.open('about:blank','_blank');}catch(e){}info.opened=(w===null?'null':'obj');` +
  `if(w&&!w.closed){try{w.close();}catch(e){}}try{document.getElementById('f').requestSubmit();info.submitted=true;}catch(e){}}}` +
  `catch(e){info.err=String((e&&e.message)||e);}` +
  `parent.postMessage(info,'*');if(n>=6)clearInterval(t);},200);</scr` +
  `ipt>`;

const tickFrame = (tag, sandbox) =>
  frameHtml(
    `f-${tag}`,
    `frm-${tag}`,
    sandbox,
    `<script>var n=0;var t=setInterval(function(){n++;parent.postMessage({tag:'${tag}',n:n},'*');if(n>=6)clearInterval(t);},150);</scr` +
      `ipt>`
  );

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

suite("embedSafety in real Chrome (F03/B02/B20)", () => {
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      executablePath: chromePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      headless: "new",
    });
  }, 120000);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test("sandbox attribute stays present when empty; scripts run only when enabled", async () => {
    const page = await browser.newPage();
    try {
      await page.setContent(
        tickFrame("locked", "") + tickFrame("open", "allow-scripts"),
        { waitUntil: "load" }
      );
      await page.evaluate(() => {
        window.__hits = [];
        window.addEventListener("message", (e) => {
          window.__hits.push(e.data && e.data.tag);
        });
      });
      await sleep(1400);
      const result = await page.evaluate(() => ({
        hits: window.__hits,
        lockedAttr: document.getElementById("f-locked").getAttribute("sandbox"),
        openAttr: document.getElementById("f-open").getAttribute("sandbox"),
      }));
      // Attribute present (not null) even with the empty value.
      expect(result.lockedAttr).toBe("");
      expect(result.openAttr).toBe("allow-scripts");
      // Locked frame's script never executed; enabled frame's did.
      expect(result.hits.filter((t) => t === "locked")).toEqual([]);
      expect(result.hits.filter((t) => t === "open").length).toBeGreaterThan(0);
    } finally {
      await page.close();
    }
  }, 90000);

  test("forms submit only with allow-forms; violation is logged otherwise", async () => {
    const page = await browser.newPage();
    const pageConsole = [];
    page.on("console", (m) => pageConsole.push(`${m.type()}: ${m.text()}`));
    const navigated = [];
    page.on("framenavigated", (f) => navigated.push(`${f.name()}@${f.url()}`));
    try {
      await page.setContent(
        frameHtml("f-noform", "frm-noform", "allow-scripts", reporterFrame("noform")) +
          frameHtml("f-yesform", "frm-yesform", "allow-scripts allow-forms", reporterFrame("yesform")),
        { waitUntil: "load" }
      );
      await page.evaluate(() => {
        window.__hits = [];
        window.addEventListener("message", (e) => {
          window.__hits.push(e.data);
        });
      });
      await sleep(2400);
      const byTag = await page.evaluate(() => {
        const groups = {};
        for (const h of window.__hits) {
          (groups[h.tag] = groups[h.tag] || []).push(h.n);
        }
        return groups;
      });
      // Disabled: full tick stream, no navigation away from srcdoc.
      expect(byTag.noform).toEqual([1, 2, 3, 4, 5, 6]);
      expect(navigated.filter((u) => u.startsWith("frm-noform@about:blank"))).toEqual([]);
      // Enabled: submission navigated the frame (ticks end at the submit).
      expect(byTag.yesform).toEqual([1, 2, 3]);
      expect(
        navigated.filter((u) => u.startsWith("frm-yesform@about:blank"))
      ).not.toEqual([]);
      // Chrome records the sandbox violation for the disabled frame.
      expect(
        pageConsole.some((c) => /Blocked form submission/i.test(c))
      ).toBe(true);
    } finally {
      await page.close();
    }
  }, 90000);

  test("popups open only with allow-popups (window.open return value)", async () => {
    const page = await browser.newPage();
    try {
      await page.setContent(
        frameHtml("f-nopop", "frm-nopop", "allow-scripts", reporterFrame("nopop")) +
          frameHtml("f-yespop", "frm-yespop", "allow-scripts allow-popups", reporterFrame("yespop")),
        { waitUntil: "load" }
      );
      await page.evaluate(() => {
        window.__hits = [];
        window.addEventListener("message", (e) => {
          window.__hits.push(e.data);
        });
      });
      await sleep(2400);
      const opened = await page.evaluate(() => {
        const out = {};
        for (const h of window.__hits) {
          if (h.n === 3) out[h.tag] = h.opened;
        }
        return out;
      });
      expect(opened.nopop).toBe("null");
      expect(opened.yespop).toBe("obj");
    } finally {
      await page.close();
    }
  }, 90000);

  test("widget message gate: intended frame accepted, spoofs and bad payloads rejected", async () => {
    const page = await browser.newPage();
    try {
      const validPost = (tag, widgetID, payloadJson) =>
        `<script>var n=0;var t=setInterval(function(){n++;parent.postMessage({type:'jet-html-message',widgetID:'${widgetID}',payload:${payloadJson},n:n,tag:'${tag}'},'*');if(n>=4)clearInterval(t);},150);</scr` +
        `ipt>`;
      await page.setContent(
        frameHtml("f-target", "frm-target", "allow-scripts", validPost("target", "widget-1", "{n:n}")) +
          frameHtml("f-other", "frm-other", "allow-scripts", validPost("other", "widget-2", "{n:n}")),
        { waitUntil: "load" }
      );
      // Mirror of HtmlWidget's gate: exact source + envelope + payload policy.
      await page.evaluate(() => {
        window.__accepted = [];
        window.__rejected = [];
        const targetWindow = () => document.getElementById("f-target").contentWindow;
        window.addEventListener("message", (e) => {
          const trusted = !!e.source && !!targetWindow() && e.source === targetWindow();
          const d = e.data || {};
          const envelopeOk =
            d && typeof d === "object" && d.type === "jet-html-message" && d.widgetID === "widget-1";
          const p = d.payload;
          const payloadOk =
            p === undefined
              ? true
              : !!p && typeof p === "object" && !Array.isArray(p);
          let sizeOk = true;
          try {
            sizeOk = JSON.stringify(p === undefined ? {} : p).length <= 65536;
          } catch (err) {
            sizeOk = false;
          }
          (trusted && envelopeOk && payloadOk && sizeOk
            ? window.__accepted
            : window.__rejected
          ).push({ trusted, origin: e.origin, tag: d && d.tag });
        });
        // Spoof from the parent window itself (knows the widget ID).
        window.postMessage(
          { type: "jet-html-message", widgetID: "widget-1", payload: { spoof: true }, tag: "spoof" },
          "*"
        );
      });
      await sleep(1200);
      const result = await page.evaluate(() => ({
        accepted: window.__accepted,
        rejected: window.__rejected,
      }));
      // Only genuine target payloads accepted.
      expect(result.accepted.length).toBeGreaterThan(0);
      expect(
        result.accepted.every((a) => a.trusted && a.origin === "null")
      ).toBe(true);
      // Spoof + unrelated frame rejected despite knowing the protocol/ID.
      const rejectedTags = result.rejected.map((r) => r.tag);
      expect(rejectedTags).toContain("spoof");
      expect(rejectedTags).toContain("other");
    } finally {
      await page.close();
    }
  }, 90000);

  test("bad payloads from the trusted frame are still rejected", async () => {
    const page = await browser.newPage();
    try {
      const big = "x".repeat(70 * 1024);
      await page.setContent(
        frameHtml(
          "f-target",
          "frm-target",
          "allow-scripts",
          `<script>var bigPayload = ${JSON.stringify(big)};` +
            `parent.postMessage({type:'jet-html-message',widgetID:'widget-1',payload:{blob:bigPayload},tag:'huge'},'*');` +
            `parent.postMessage({type:'jet-html-message',widgetID:'widget-1',payload:[1,2],tag:'arr'},'*');` +
            `parent.postMessage({type:'jet-html-message',widgetID:'widget-1',payload:'str',tag:'str'},'*');</scr` +
            `ipt>`
        ),
        { waitUntil: "load" }
      );
      await page.evaluate(() => {
        window.__accepted = [];
        window.__rejected = [];
        const targetWindow = () => document.getElementById("f-target").contentWindow;
        window.addEventListener("message", (e) => {
          const trusted = !!e.source && !!targetWindow() && e.source === targetWindow();
          const d = e.data || {};
          const envelopeOk =
            d && typeof d === "object" && d.type === "jet-html-message" && d.widgetID === "widget-1";
          const p = d.payload;
          const payloadOk =
            !!p && typeof p === "object" && !Array.isArray(p);
          let sizeOk = true;
          try {
            sizeOk = JSON.stringify(p).length <= 65536;
          } catch (err) {
            sizeOk = false;
          }
          (trusted && envelopeOk && payloadOk && sizeOk
            ? window.__accepted
            : window.__rejected
          ).push({ tag: d && d.tag });
        });
      });
      // Re-fire: frames posted before the listener existed; ask them again by
      // reloading the frame content (deterministic re-emit).
      await page.evaluate(() => {
        const f = document.getElementById("f-target");
        f.srcdoc = f.srcdoc;
      });
      await sleep(1200);
      const result = await page.evaluate(() => ({
        accepted: window.__accepted,
        rejectedTags: window.__rejected.map((r) => r.tag),
      }));
      expect(result.accepted).toEqual([]);
      expect(result.rejectedTags).toEqual(
        expect.arrayContaining(["huge", "arr", "str"])
      );
    } finally {
      await page.close();
    }
  }, 90000);

  test("hostile Markdown rendered by the real pipeline stays inert in a live DOM", async () => {
    const page = await browser.newPage();
    try {
      const srcPath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "packages",
        "widgets-ui",
        "src",
        "_shared",
        "embedSafety.js"
      );
      const src = fs
        .readFileSync(srcPath, "utf8")
        .replace(/^export\s+/gm, "")
        .replace(/^export\s*\{[^}]*\};?\s*$/gm, "");
      const hostile = [
        "<script>window.__xss='pwned'</script>",
        "<img src=x onerror=\"window.__xss='pwned'\">",
        "[steal](javascript:window.__xss='pwned')",
        "![evil](data:text/html,<script>alert(1)</script>)",
        "**bold <svg onload=alert(1)>**",
      ].join("\n\n");
      const fnSrc = "(md) => { " + src + "; return renderMarkdownSafe(md); }";
      const rendered = await page.evaluate(fnSrc, hostile);
      await page.setContent(
        `<div id="md">${rendered}</div><script>window.__xss = window.__xss || 'clean';</scr` + `ipt>`,
        { waitUntil: "load" }
      );
      await sleep(600);
      const result = await page.evaluate(() => ({
        flag: window.__xss,
        scriptTags: document.querySelectorAll("#md script").length,
        jsLinks: document.querySelectorAll('#md a[href^="javascript:"]').length,
        anchors: document.querySelectorAll("#md a").length,
        imgs: document.querySelectorAll("#md img").length,
      }));
      expect(result.flag).toBe("clean");
      expect(result.scriptTags).toBe(0);
      expect(result.jsLinks).toBe(0);
      expect(result.anchors).toBe(0);
      expect(result.imgs).toBe(0);
    } finally {
      await page.close();
    }
  }, 90000);
});
