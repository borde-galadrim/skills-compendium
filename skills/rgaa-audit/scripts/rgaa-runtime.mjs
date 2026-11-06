#!/usr/bin/env node
// Passe runtime RGAA sans dépendance — rgaa-audit
//
// Pilote un Chrome / Chromium / Edge déjà installé via le protocole DevTools
// (CDP), avec les seuls modules natifs de Node ≥ 22 (fetch, WebSocket).
// N'installe rien. Produit un JSON de mesures et des captures PNG.
//
// Usage :
//   node scripts/rgaa-runtime.mjs <url> [--out <dossier>] [--compare <url2,url3>]
//        [--chrome <chemin>] [--no-axe] [--max-tabs 150]
//
// Sortie : <dossier>/runtime.json + captures. Correspondance mesure → critère :
// references/runtime-browser.md, section « Script runtime sans dépendance ».

import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const AXE_URL = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';

// ---------- arguments ----------
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
const flag = (name) => argv.includes(`--${name}`);
const VALUED = ['--out', '--compare', '--chrome', '--max-tabs'];
const url = argv.find((a, i) => !a.startsWith('--') && !VALUED.includes(argv[i - 1]));
if (!url) {
  console.error('Usage : node rgaa-runtime.mjs <url> [--out dir] [--compare url2,url3] [--chrome path] [--no-axe] [--max-tabs 150]');
  process.exit(2);
}
const OUT = opt('out', join(process.cwd(), 'rgaa-runtime'));
const COMPARE = (opt('compare', '') || '').split(',').filter(Boolean);
const MAX_TABS = +opt('max-tabs', 150);

// ---------- navigateur ----------
function findChrome() {
  const cand = [
    opt('chrome'), process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  return cand.find((p) => existsSync(p));
}

async function launch() {
  const bin = findChrome();
  if (!bin) throw new Error('Aucun Chrome/Chromium/Edge trouvé (option --chrome ou variable CHROME_PATH).');
  const profile = await mkdtemp(join(tmpdir(), 'rgaa-chrome-'));
  const proc = spawn(bin, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars',
    '--window-size=1280,800', 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error('Chrome ne répond pas (15 s).')), 15000);
    proc.stderr.on('data', (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(t); resolve(m[1]); }
    });
    proc.on('exit', (c) => reject(new Error(`Chrome s'est arrêté (code ${c}).`)));
  });
  return { proc, profile, wsUrl, bin };
}

// ---------- client CDP minimal ----------
class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        this.handlers.forEach((h) => h(msg));
      }
    });
  }
  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
    return new CDP(ws);
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  on(fn) { this.handlers.push(fn); }
  waitFor(method, sessionId, timeout = 20000) {
    return new Promise((resolve) => {
      const t = setTimeout(() => resolve(null), timeout);
      const h = (m) => { if (m.method === method && m.sessionId === sessionId) { clearTimeout(t); this.handlers = this.handlers.filter((x) => x !== h); resolve(m); } };
      this.on(h);
    });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newPage(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => cdp.send(m, p, sessionId);
  await s('Page.enable'); await s('Runtime.enable'); await s('DOM.enable'); await s('Log.enable');
  const page = {
    sessionId, targetId, send: s, console: [],
    async goto(u) {
      const loaded = cdp.waitFor('Page.loadEventFired', sessionId, 30000);
      const r = await s('Page.navigate', { url: u });
      if (r.errorText) throw new Error(`Navigation impossible : ${r.errorText}`);
      await loaded; await sleep(1500);
    },
    async eval(expr) {
      const r = await s('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async key(key, shift = false) {
      const map = { Tab: [9, 'Tab'], Escape: [27, 'Escape'], Enter: [13, 'Enter'] };
      const [code, k] = map[key];
      const modifiers = shift ? 8 : 0;
      await s('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k, windowsVirtualKeyCode: code, modifiers });
      await s('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k, windowsVirtualKeyCode: code, modifiers });
    },
    async viewport(width, height, dpr = 1, mobile = false) {
      await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
      await sleep(600);
    },
    async shot(name, full = false) {
      const p = { format: 'png' };
      if (full) {
        const m = await s('Page.getLayoutMetrics');
        const c = m.cssContentSize || m.contentSize;
        p.clip = { x: 0, y: 0, width: c.width, height: Math.min(c.height, 12000), scale: 1 };
        p.captureBeyondViewport = true;
      }
      const { data } = await s('Page.captureScreenshot', p);
      const file = join(OUT, `${name}.png`);
      await writeFile(file, Buffer.from(data, 'base64'));
      return file;
    },
  };
  cdp.on((m) => {
    if (m.sessionId !== sessionId) return;
    if (m.method === 'Runtime.exceptionThrown') page.console.push({ level: 'exception', text: m.params.exceptionDetails.exception?.description?.slice(0, 200) || m.params.exceptionDetails.text });
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') page.console.push({ level: 'error', text: m.params.entry.text.slice(0, 200) });
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') page.console.push({ level: 'console.error', text: m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200) });
  });
  return page;
}

// ---------- snippets évalués dans la page ----------
const OVERFLOW = `(() => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const offenders = [...document.querySelectorAll('body *')].filter((e) => {
    const r = e.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const s = getComputedStyle(e);
    if (s.position === 'fixed' && r.right <= vw + 1) return false;
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(ps.overflowX)) return false;
    }
    return r.right > vw + 2 || r.left < -2;
  }).filter((e, i, arr) => !arr.some((o) => o !== e && o.contains(e))).slice(0, 15).map((e) => ({
    el: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : ''),
    left: Math.round(e.getBoundingClientRect().left), right: Math.round(e.getBoundingClientRect().right),
  }));
  const clipped = [...document.querySelectorAll('body *')].filter((e) => {
    const s = getComputedStyle(e);
    if (!/(hidden|clip)/.test(s.overflow + s.overflowY + s.overflowX)) return false;
    if (!e.innerText || !e.innerText.trim()) return false;
    const r = e.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    return e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2;
  }).map((e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : '') + ' « ' + e.innerText.trim().slice(0, 30) + ' »');
  return { viewportWidth: vw, scrollWidth: de.scrollWidth, horizontalScroll: de.scrollWidth > vw + 1, offenders, clippedCount: clipped.length, clipped: clipped.slice(0, 15) };
})()`;

const FOCUS_INFO = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return { body: true };
  const path = (e) => { const p = []; for (; e && e.nodeType === 1; e = e.parentElement) { if (e === document.body) { p.unshift('body'); break; } if (e.id) { p.unshift('#' + CSS.escape(e.id)); break; } p.unshift(e.tagName.toLowerCase() + ':nth-child(' + ([...e.parentElement.children].indexOf(e) + 1) + ')'); } return p.join(' > '); };
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  let hiddenAncestor = false;
  for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') { hiddenAncestor = true; break; } }
  return {
    path: path(el), tag: el.tagName.toLowerCase(), role: el.getAttribute('role'),
    name: (el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('title') || el.getAttribute('alt') || '').trim().replace(/\\s+/g, ' ').slice(0, 60),
    expanded: el.getAttribute('aria-expanded'),
    ariaHiddenAncestor: !!el.closest('[aria-hidden="true"]'),
    inert: !!el.closest('[inert]'),
    offscreen: r.bottom < -window.scrollY || r.right < 0 || r.left > document.documentElement.scrollWidth || r.width * r.height === 0,
    invisible: hiddenAncestor,
    rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
    style: { outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, boxShadow: s.boxShadow, bg: s.backgroundColor, color: s.color, border: s.borderColor + ' ' + s.borderWidth, textDecoration: s.textDecorationLine, transform: s.transform },
  };
})()`;

const UNFOCUSED_STYLE = (paths) => `(() => {
  document.activeElement && document.activeElement.blur();
  return ${JSON.stringify(paths)}.map((p) => {
    const el = document.querySelector(p);
    if (!el) return null;
    const s = getComputedStyle(el);
    return { outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, boxShadow: s.boxShadow, bg: s.backgroundColor, color: s.color, border: s.borderColor + ' ' + s.borderWidth, textDecoration: s.textDecorationLine, transform: s.transform };
  });
})()`;

const CONTRAST = `(() => {
  const parse = (str) => { const m = str.match(/[\\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
  const lum = ([r, g, b]) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const blend = (fg, bg) => { const a = fg[3] ?? 1; return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)); };
  const bgOf = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage !== 'none') return { image: true };
      const c = parse(s.backgroundColor);
      if ((c[3] ?? 1) > 0) { layers.push(c); if ((c[3] ?? 1) >= 1) break; }
    }
    let bg = [255, 255, 255];
    for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
    return { rgb: bg };
  };
  const fails = []; const onImage = []; let checked = 0;
  document.querySelectorAll('body *').forEach((el) => {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return;
    if (el.closest('[aria-hidden="true"]') && !el.innerText.trim()) return;
    const disabled = el.closest('[disabled], [aria-disabled="true"]');
    checked++;
    const bg = bgOf(el);
    const text = el.innerText.trim().replace(/\\s+/g, ' ').slice(0, 40);
    if (bg.image) { onImage.push(text); return; }
    const fg = blend(parse(s.color), bg.rgb);
    const a = lum(fg) + 0.05, b = lum(bg.rgb) + 0.05;
    const ratio = Math.max(a, b) / Math.min(a, b);
    const size = parseFloat(s.fontSize), weight = parseInt(s.fontWeight, 10);
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    if (ratio < need) fails.push({ text, ratio: +ratio.toFixed(2), need, fontSize: size, weight, color: s.color, disabled: !!disabled });
  });
  return { checked, failures: fails.slice(0, 40), failureCount: fails.length, onBackgroundImage: { count: onImage.length, items: onImage.slice(0, 20) } };
})()`;

const UI_CONTRAST = `(() => {
  const parse = (str) => { const m = str.match(/[\\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
  const lum = ([r, g, b]) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const bgOf = (el) => { for (let e = el.parentElement; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if ((c[3] ?? 1) > 0.9) return c; } return [255, 255, 255]; };
  const ratio = (x, y) => { const a = lum(x) + 0.05, b = lum(y) + 0.05; return Math.max(a, b) / Math.min(a, b); };
  const out = [];
  document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea').forEach((f) => {
    const s = getComputedStyle(f); const bg = bgOf(f);
    const own = parse(s.backgroundColor);
    const border = parseFloat(s.borderBottomWidth) > 0 ? ratio(parse(s.borderBottomColor), bg) : 0;
    const fill = (own[3] ?? 1) > 0.9 ? ratio(own, bg) : 0;
    const best = Math.max(border, fill);
    if (best < 3) out.push({ el: f.tagName.toLowerCase() + (f.id ? '#' + f.id : '') + (f.name ? '[name=' + f.name + ']' : ''), borderRatio: +border.toFixed(2), fillRatio: +fill.toFixed(2) });
  });
  return { fieldsBelow3: out.slice(0, 20), count: out.length };
})()`;

const SPACING_ON = `(() => { const st = document.createElement('style'); st.id = 'rgaa-spacing'; st.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }'; document.head.appendChild(st); return true; })()`;
const SPACING_OFF = `(() => { document.getElementById('rgaa-spacing')?.remove(); return true; })()`;

const NO_CSS = `(() => {
  const before = document.body.innerText.length;
  const sheets = [...document.styleSheets];
  sheets.forEach((s) => { try { s.disabled = true; } catch (e) {} });
  const styled = [...document.querySelectorAll('[style]')].map((e) => [e, e.getAttribute('style')]);
  styled.forEach(([e]) => e.removeAttribute('style'));
  const after = document.body.innerText.length;
  window.__rgaaRestoreCss = () => { sheets.forEach((s) => { try { s.disabled = false; } catch (e) {} }); styled.forEach(([e, v]) => e.setAttribute('style', v)); };
  return { textLengthWithCss: before, textLengthWithoutCss: after, sheetsDisabled: sheets.length };
})()`;

const ANIMATIONS = `(() => {
  const anims = document.getAnimations ? document.getAnimations() : [];
  const running = anims.filter((a) => a.playState === 'running');
  const long = running.filter((a) => { const t = a.effect?.getComputedTiming?.(); return t && (t.iterations === Infinity || t.activeDuration > 5000); });
  const describe = (a) => { const t = a.effect?.target; return t ? t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') + (t.classList?.length ? '.' + [...t.classList].slice(0, 2).join('.') : '') : '?'; };
  const videos = [...document.querySelectorAll('video')].map((v) => ({ paused: v.paused, muted: v.muted, autoplay: v.autoplay, loop: v.loop }));
  return { running: running.length, longOrInfinite: long.length, targets: long.slice(0, 10).map(describe), videos };
})()`;

// Signature visuelle des carrousels : détecte un défilement automatique
const CAROUSEL_SIG = `(() => [...document.querySelectorAll('[class*="swiper-wrapper" i], [class*="carousel" i] [class*="track" i], [class*="slick-track" i], [class*="splide__list" i], [aria-roledescription="carousel"], [aria-roledescription="carrousel"]')].slice(0, 10).map((e) => ({
  el: e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : ''),
  sig: getComputedStyle(e).transform + '|' + e.scrollLeft + '|' + ([...e.children].findIndex((c) => c.classList.contains('swiper-slide-active') || c.classList.contains('slick-active') || c.classList.contains('is-active'))),
  hasPauseControl: !!e.closest('section, div')?.querySelector('button[aria-label*="pause" i], button[aria-label*="arr" i], button[title*="pause" i], [class*="pause" i]'),
})))()`;

const HOVER_RULES = `(() => {
  const hover = [], focus = new Set(); let blocked = 0;
  const walk = (rules) => { for (const r of rules) {
    if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue; }
    if (!r.selectorText) continue;
    r.selectorText.split(',').forEach((sel) => {
      sel = sel.trim();
      if (sel.includes(':hover')) {
        const body = r.style.cssText;
        if (/(display|visibility|opacity|transform|max-height|clip|height)\\s*:/.test(body) && /:hover\\s*[\\s>+~]/.test(sel)) hover.push({ sel: sel.slice(0, 120), base: sel.split(':hover')[0].trim() });
      }
      if (/:focus(-within|-visible)?/.test(sel)) focus.add(sel.split(/:focus(-within|-visible)?/)[0].trim());
    });
  } };
  for (const s of document.styleSheets) { try { walk(s.cssRules); } catch (e) { blocked++; } }
  const noFocus = hover.filter((h) => !focus.has(h.base));
  return { revealOnHover: hover.length, withoutFocusEquivalent: noFocus.slice(0, 20), crossOriginSheetsNotRead: blocked };
})()`;

const NAV_SIG = `(() => ({
  url: location.href,
  title: document.title,
  navs: [...document.querySelectorAll('nav, [role="navigation"], header, [role="banner"]')].map((n) => { const r = n.getBoundingClientRect(); return { tag: n.tagName.toLowerCase(), name: n.getAttribute('aria-label'), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), links: [...n.querySelectorAll('a[href]')].slice(0, 30).map((a) => (a.getAttribute('aria-label') || a.innerText || '').trim().slice(0, 30)) }; }),
  search: !!document.querySelector('[role="search"], search, input[type="search"]'),
  sitemapLink: [...document.querySelectorAll('a[href]')].some((a) => /plan du site|sitemap/i.test(a.innerText + a.href)),
  formLabels: [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].map((f) => ({ type: f.type, name: f.name, label: (f.labels?.[0]?.innerText || f.getAttribute('aria-label') || '').trim().slice(0, 40) })),
}))()`;

// ---------- passes ----------
async function eventListeners(page) {
  // 12.10, 13.10, 13.11, 13.12 : écouteurs sur window, document, body et widgets
  const targets = {
    window: 'window', document: 'document', body: 'document.body',
  };
  const out = {};
  const types = ['keydown', 'keypress', 'keyup', 'devicemotion', 'deviceorientation', 'touchstart', 'touchmove', 'pointerdown', 'mousedown', 'wheel'];
  for (const [k, expr] of Object.entries(targets)) {
    const { result } = await page.send('Runtime.evaluate', { expression: expr });
    const { listeners } = await page.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
    out[k] = [...new Set(listeners.filter((l) => types.includes(l.type)).map((l) => l.type))];
  }
  const { result: arr } = await page.send('Runtime.evaluate', { expression: `[...document.querySelectorAll('[class*="swiper" i], [class*="carousel" i], [class*="slider" i], [class*="slick" i], [role="slider"], [draggable="true"]')].slice(0, 15)` });
  const { result: props } = await page.send('Runtime.getProperties', { objectId: arr.objectId, ownProperties: true });
  const widgetTypes = new Set();
  for (const p of props) {
    if (!p.value?.objectId || !/^\d+$/.test(p.name)) continue;
    const { listeners } = await page.send('DOMDebugger.getEventListeners', { objectId: p.value.objectId });
    listeners.forEach((l) => types.includes(l.type) && widgetTypes.add(l.type));
  }
  out.widgets = [...widgetTypes];
  return out;
}

async function tabWalk(page, shift = false) {
  await page.eval('(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); return true; })()');
  const stops = [];
  let bodyHits = 0;
  for (let i = 0; i < MAX_TABS; i++) {
    await page.key('Tab', shift);
    await sleep(60);
    const f = await page.eval(FOCUS_INFO);
    if (f.body) { if (++bodyHits >= 1 && stops.length) break; continue; }
    stops.push(f);
    // boucle détectée : on retombe sur le premier arrêt
    if (stops.length > 2 && f.path === stops[0].path) { stops.pop(); return { stops, cycledToStart: true }; }
  }
  const counts = {};
  stops.forEach((s) => { counts[s.path] = (counts[s.path] || 0) + 1; });
  const repeated = Object.entries(counts).filter(([, n]) => n > 2);
  return { stops, reachedEnd: bodyHits > 0, maxTabsReached: stops.length >= MAX_TABS, repeated };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const { proc, profile, wsUrl, bin } = await launch();
  const cdp = await CDP.connect(wsUrl);
  const result = { url, date: new Date().toISOString(), browser: bin, source: 'rgaa-runtime.mjs (CDP, Chrome headless)', errors: [] };
  const step = async (name, fn) => {
    try { result[name] = await fn(); } catch (e) { result.errors.push({ step: name, message: String(e.message || e).slice(0, 300) }); }
  };
  try {
    const page = await newPage(cdp);
    await page.viewport(1280, 800);
    await page.goto(url);
    await page.eval('document.readyState');

    await step('title', () => page.eval('document.title'));
    await step('screenshotDesktop', () => page.shot('desktop', true));
    await step('inventory', async () => page.eval(await readFile(join(HERE, 'inventaire.js'), 'utf8')));

    if (!flag('no-axe')) {
      await step('axe', async () => {
        const src = await (await fetch(AXE_URL)).text();
        await page.eval(src + ';true');
        return page.eval(`axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] }, resultTypes: ['violations','incomplete'] }).then((r) => ({
          version: axe.version,
          violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, wcag: v.tags.filter((t) => /^wcag\\d{3,4}$/.test(t)), bestPractice: v.tags.includes('best-practice'), help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 8).map((n) => n.target.join(' ')) })),
          incomplete: r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
        }))`);
      });
    }

    await step('contrast', () => page.eval(CONTRAST));
    await step('uiContrast', () => page.eval(UI_CONTRAST));
    await step('hoverRules', () => page.eval(HOVER_RULES));
    await step('eventListeners', () => eventListeners(page));

    await step('keyboard', async () => {
      const fwd = await tabWalk(page, false);
      const paths = [...new Set(fwd.stops.map((s) => s.path))];
      const unfocused = await page.eval(UNFOCUSED_STYLE(paths));
      const noVisibleChange = [];
      paths.forEach((p, i) => {
        const f = fwd.stops.find((s) => s.path === p).style;
        const u = unfocused[i];
        if (u && JSON.stringify(f) === JSON.stringify(u)) noVisibleChange.push(fwd.stops.find((s) => s.path === p));
      });
      const back = await tabWalk(page, true);
      const fwdOrder = fwd.stops.map((s) => s.path);
      const backOrder = back.stops.map((s) => s.path).reverse();
      // ordre visuel : un arrêt qui remonte de plus de 200 px par rapport au précédent
      const jumps = [];
      fwd.stops.forEach((s, i) => { if (i && s.rect.y < fwd.stops[i - 1].rect.y - 200) jumps.push({ index: i, from: fwd.stops[i - 1].name, to: s.name, dy: s.rect.y - fwd.stops[i - 1].rect.y }); });
      return {
        stopCount: fwd.stops.length,
        stops: fwd.stops.map((s) => ({ tag: s.tag, role: s.role, name: s.name, expanded: s.expanded, y: s.rect.y })),
        focusOnHidden: fwd.stops.filter((s) => s.ariaHiddenAncestor || s.invisible || s.offscreen).map((s) => ({ tag: s.tag, name: s.name, ariaHiddenAncestor: s.ariaHiddenAncestor, invisible: s.invisible, offscreen: s.offscreen })),
        focusNotVisible: noVisibleChange.map((s) => ({ tag: s.tag, name: s.name, style: s.style.outline })),
        reverseMatchesForward: JSON.stringify(fwdOrder) === JSON.stringify(backOrder),
        upwardJumps: jumps.slice(0, 15),
        possibleTrap: fwd.maxTabsReached && fwd.repeated?.length > 0 ? fwd.repeated : null,
        reachedEnd: fwd.reachedEnd || fwd.cycledToStart || false,
      };
    });
    await step('screenshotFocusFirst', async () => { await page.key('Tab'); await sleep(150); return page.shot('focus-premier-arret'); });

    await step('zoom200', async () => {
      // Équivalent du zoom navigateur 200 % : viewport CSS 640 px à DPR 2
      await page.viewport(640, 400, 2);
      const r = await page.eval(OVERFLOW);
      r.screenshot = await page.shot('zoom-200', true);
      r.method = 'viewport CSS 640×400 à DPR 2 (équivalent zoom navigateur 200 % depuis 1280×800)';
      return r;
    });
    await step('reflow320', async () => {
      await page.viewport(320, 256, 1, true);
      const r = await page.eval(OVERFLOW);
      r.screenshot = await page.shot('reflow-320', true);
      return r;
    });
    await step('orientation', async () => {
      await page.viewport(390, 844, 2, true);
      const portrait = await page.eval('({ text: document.body.innerText.length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth })');
      await page.viewport(844, 390, 2, true);
      const landscape = await page.eval('({ text: document.body.innerText.length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth })');
      const shot = await page.shot('paysage');
      return { portrait, landscape, textRatio: +(landscape.text / Math.max(1, portrait.text)).toFixed(2), screenshot: shot };
    });
    await page.viewport(1280, 800);

    await step('textSpacing', async () => {
      const before = await page.eval(OVERFLOW);
      await page.eval(SPACING_ON); await sleep(300);
      const after = await page.eval(OVERFLOW);
      const shot = await page.shot('espacement-texte', true);
      await page.eval(SPACING_OFF);
      const newlyClipped = after.clipped.filter((c) => !before.clipped.includes(c));
      return { clippedBefore: before.clippedCount, clippedAfter: after.clippedCount, newlyClipped, horizontalScrollAfter: after.horizontalScroll, screenshot: shot };
    });

    await step('noCss', async () => {
      const r = await page.eval(NO_CSS);
      r.screenshot = await page.shot('sans-css', true);
      await page.eval('window.__rgaaRestoreCss(); true');
      return r;
    });

    await step('motion', async () => {
      const a = await page.eval(ANIMATIONS);
      const c1 = await page.eval(CAROUSEL_SIG);
      await sleep(6000);
      const c2 = await page.eval(CAROUSEL_SIG);
      const autoMoving = c1.filter((c, i) => c2[i] && c2[i].sig !== c.sig).map((c) => ({ el: c.el, hasPauseControl: c.hasPauseControl }));
      await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await page.goto(url);
      const reduced = await page.eval(ANIMATIONS);
      const r1 = await page.eval(CAROUSEL_SIG); await sleep(6000); const r2 = await page.eval(CAROUSEL_SIG);
      await page.send('Emulation.setEmulatedMedia', { features: [] });
      return { animations: a, autoMovingCarousels: autoMoving, reducedMotion: { animations: reduced, autoMovingCarousels: r1.filter((c, i) => r2[i] && r2[i].sig !== c.sig).map((c) => c.el) } };
    });

    if (COMPARE.length) {
      await step('consistency', async () => {
        const sigs = [await page.eval(NAV_SIG)];
        for (const u of COMPARE) { await page.goto(u); sigs.push(await page.eval(NAV_SIG)); }
        return sigs;
      });
    }

    result.console = page.console.slice(0, 30);
  } finally {
    await writeFile(join(OUT, 'runtime.json'), JSON.stringify(result, null, 2));
    try { cdp.ws.close(); } catch {}
    proc.kill();
    await sleep(300);
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
  console.log(join(OUT, 'runtime.json'));
  if (result.errors.length) console.error(`${result.errors.length} étape(s) en erreur : ${result.errors.map((e) => e.step).join(', ')}`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
