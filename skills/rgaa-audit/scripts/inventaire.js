// Inventaire RGAA du DOM rendu — rgaa-audit
//
// Expression JavaScript autonome : elle s'évalue dans la page (capacité
// « Évaluer du JavaScript » d'un navigateur piloté, ou script
// rgaa-runtime.mjs) et renvoie un objet JSON. Aucune dépendance.
//
// Chaque clé alimente un ou plusieurs critères : voir
// references/inventaire-applicabilite.md (correspondance clé → critère et
// déclencheurs d'applicabilité). Les listes sont tronquées à MAX éléments ;
// le champ `count` donne toujours le total.
(() => {
  const MAX = 40;
  const doc = document;
  const all = [...doc.querySelectorAll('body *')];

  // ---------- utilitaires ----------
  const clip = (s, n = 80) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const list = (arr) => ({ count: arr.length, items: arr.slice(0, MAX) });
  const cs = (el) => getComputedStyle(el);
  const isRendered = (el) => {
    if (!el.isConnected) return false;
    for (let e = el; e && e !== doc.documentElement; e = e.parentElement) {
      const s = cs(e);
      if (s.display === 'none' || s.visibility === 'hidden') return false;
    }
    return true;
  };
  const isSrOnly = (el) => {
    const r = el.getBoundingClientRect();
    const s = cs(el);
    return (r.width <= 1 && r.height <= 1) || s.clipPath === 'inset(50%)' || /rect\(0(px)?,? ?0(px)?,? ?0(px)?,? ?0(px)?\)/.test(s.clip);
  };
  const ariaHidden = (el) => !!el.closest('[aria-hidden="true"]');
  const path = (el) => {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && parts.length < 5; e = e.parentElement) {
      let p = e.tagName.toLowerCase();
      if (e.id) { parts.unshift(`#${CSS.escape(e.id)}`); break; }
      const cls = [...e.classList].filter((c) => !/[:[\]/]/.test(c)).slice(0, 2);
      if (cls.length) p += '.' + cls.map((c) => CSS.escape(c)).join('.');
      const sib = e.parentElement ? [...e.parentElement.children].filter((c) => c.tagName === e.tagName) : [];
      if (sib.length > 1) p += `:nth-of-type(${sib.indexOf(e) + 1})`;
      parts.unshift(p);
    }
    return parts.join(' > ');
  };
  const byIds = (ids) => (ids || '').split(/\s+/).filter(Boolean).map((id) => doc.getElementById(id));

  // Nom accessible simplifié (suffisant pour repérer les manques)
  const textOf = (node) => {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return '';
    const el = node;
    if (el.getAttribute('aria-hidden') === 'true') return '';
    if (el.tagName === 'IMG' || (el.tagName === 'INPUT' && el.type === 'image')) return el.getAttribute('alt') || '';
    if (el.tagName === 'SVG' || el.tagName === 'svg') {
      const t = el.querySelector('title');
      return el.getAttribute('aria-label') || (t ? t.textContent : '');
    }
    if (el.hasAttribute('aria-label')) return el.getAttribute('aria-label');
    if (['STYLE', 'SCRIPT', 'TEMPLATE', 'NOSCRIPT'].includes(el.tagName)) return '';
    return [...el.childNodes].map(textOf).join(' ');
  };
  const accName = (el) => {
    const lb = el.getAttribute('aria-labelledby');
    if (lb) {
      const t = byIds(lb).filter(Boolean).map((e) => textOf(e)).join(' ');
      if (t.trim()) return clip(t, 120);
    }
    if (el.getAttribute('aria-label')?.trim()) return clip(el.getAttribute('aria-label'), 120);
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) {
      const labels = el.labels ? [...el.labels] : [];
      const t = labels.map((l) => textOf(l)).join(' ');
      if (t.trim()) return clip(t, 120);
      if (['submit', 'button', 'reset'].includes(el.type)) return clip(el.value || '', 120);
      if (el.type === 'image') return clip(el.alt || '', 120);
    } else {
      const t = [...el.childNodes].map(textOf).join(' ');
      if (t.trim()) return clip(t, 120);
    }
    return clip(el.getAttribute('title') || '', 120);
  };
  const visibleText = (el) => clip(el.innerText || '', 120);

  const FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable="true"], summary, iframe, audio[controls], video[controls]';

  // ---------- document ----------
  const html = doc.documentElement;
  const metaViewport = doc.querySelector('meta[name="viewport"]')?.content || null;
  const metaRefresh = doc.querySelector('meta[http-equiv="refresh" i]')?.content || null;
  const document_ = {
    doctype: doc.doctype ? `<!DOCTYPE ${doc.doctype.name}${doc.doctype.publicId ? ' PUBLIC' : ''}>` : null,
    lang: html.getAttribute('lang'),
    xmlLang: html.getAttribute('xml:lang'),
    dir: html.getAttribute('dir'),
    title: doc.title,
    metaViewport,
    // 10.4 : user-scalable=no ou maximum-scale < 2 bloque le zoom
    viewportBlocksZoom: !!metaViewport && (/user-scalable\s*=\s*(no|0)/i.test(metaViewport) || (() => {
      const m = metaViewport.match(/maximum-scale\s*=\s*([\d.]+)/i);
      return !!m && parseFloat(m[1]) < 2;
    })()),
    metaRefresh,
  };

  // ---------- validité (8.2, partiel) ----------
  const ids = {};
  doc.querySelectorAll('[id]').forEach((e) => { ids[e.id] = (ids[e.id] || 0) + 1; });
  const duplicateIds = Object.entries(ids).filter(([, n]) => n > 1).map(([id, n]) => ({ id, n }));
  const brokenRefs = [];
  doc.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls], label[for]').forEach((e) => {
    ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for'].forEach((a) => {
      const v = e.getAttribute(a);
      if (!v || (a === 'for' && e.tagName !== 'LABEL')) return;
      v.split(/\s+/).filter(Boolean).forEach((id) => { if (!doc.getElementById(id)) brokenRefs.push({ el: path(e), attr: a, id }); });
    });
  });
  const nestedInteractive = [...doc.querySelectorAll('a a, a button, button a, button button, a input, button input, a select, button select')].map((e) => path(e));
  const invalidListChildren = [...doc.querySelectorAll('ul > :not(li):not(script):not(template), ol > :not(li):not(script):not(template)')].map((e) => ({ el: path(e), tag: e.tagName.toLowerCase() }));
  const invalidDlChildren = [...doc.querySelectorAll('dl > :not(dt):not(dd):not(div):not(script):not(template)')].map((e) => path(e));
  const validity = {
    duplicateIds: list(duplicateIds),
    brokenIdRefs: list(brokenRefs),
    nestedInteractive: list(nestedInteractive),
    invalidListChildren: list(invalidListChildren),
    invalidDlChildren: list(invalidDlChildren),
  };

  // ---------- titres (9.1) ----------
  const headings = [...doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')]
    .filter((h) => isRendered(h) || isSrOnly(h))
    .map((h) => ({
      level: h.getAttribute('aria-level') ? +h.getAttribute('aria-level') : +h.tagName[1] || 2,
      text: clip(textOf(h), 90),
      ariaHidden: ariaHidden(h),
    }));
  const jumps = [];
  headings.forEach((h, i) => {
    const prev = i ? headings[i - 1].level : 0;
    if (h.level > prev + 1) jumps.push({ index: i, from: prev ? `h${prev}` : 'début', to: `h${h.level}`, text: h.text });
  });
  const headingsOut = {
    outline: list(headings),
    h1Count: headings.filter((h) => h.level === 1).length,
    jumps: list(jumps),
    empty: list(headings.filter((h) => !h.text)),
  };

  // ---------- régions et navigation (9.2, 12.x) ----------
  const count = (sel) => doc.querySelectorAll(sel).length;
  const firstFocusables = [...doc.querySelectorAll(FOCUSABLE)].filter((e) => e.tabIndex >= 0).slice(0, 5);
  const skipLinks = firstFocusables
    .filter((a) => a.tagName === 'A' && /^#./.test(a.getAttribute('href') || ''))
    .map((a) => ({ text: accName(a), href: a.getAttribute('href'), targetExists: !!doc.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))) }));
  const searchForms = [...doc.querySelectorAll('[role="search"], search, form')].filter((f) =>
    f.matches('[role="search"], search') || f.querySelector('input[type="search"]') || /search|recherche|query|[?&]q=/i.test((f.getAttribute('action') || '') + ' ' + (f.id || '') + ' ' + f.className));
  const links = [...doc.querySelectorAll('a[href], [role="link"]')];
  const sitemapLinks = links.filter((a) => /plan du site|sitemap/i.test(accName(a) + ' ' + (a.getAttribute('href') || '')));
  const navs = [...doc.querySelectorAll('nav, [role="navigation"]')].map((n) => ({
    name: accName(n) || null,
    links: n.querySelectorAll('a[href]').length,
    rect: (() => { const r = n.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; })(),
  }));
  const landmarks = {
    header: count('header, [role="banner"]'),
    nav: count('nav, [role="navigation"]'),
    main: count('main, [role="main"]'),
    mainId: doc.querySelector('main, [role="main"]')?.id || null,
    footer: count('footer, [role="contentinfo"]'),
    aside: count('aside, [role="complementary"]'),
    search: searchForms.length,
    navs: list(navs),
    skipLinks,
    sitemapLinks: list(sitemapLinks.map((a) => ({ text: accName(a), href: a.getAttribute('href') }))),
    breadcrumb: count('[aria-label*="fil" i], [aria-label*="breadcrumb" i], nav ol'),
  };

  // ---------- images (1.x) ----------
  const imgs = [...doc.querySelectorAll('img')].map((img) => {
    const inControl = img.closest('a, button, [role="link"], [role="button"]');
    return {
      el: path(img),
      src: (img.currentSrc || img.src || '').split('/').pop().split('?')[0].slice(0, 60),
      alt: img.hasAttribute('alt') ? img.getAttribute('alt') : null,
      role: img.getAttribute('role'),
      ariaHidden: ariaHidden(img),
      ariaLabel: img.getAttribute('aria-label'),
      title: img.getAttribute('title'),
      describedby: img.getAttribute('aria-describedby'),
      inControl: inControl ? { tag: inControl.tagName.toLowerCase(), name: accName(inControl) } : null,
      inFigure: !!img.closest('figure'),
      rendered: isRendered(img),
      size: `${img.naturalWidth}x${img.naturalHeight}`,
    };
  });
  const svgs = [...doc.querySelectorAll('svg')].filter((s) => !s.parentElement?.closest('svg')).map((s) => {
    const inControl = s.closest('a, button, [role="link"], [role="button"]');
    return {
      el: path(s),
      role: s.getAttribute('role'),
      ariaHidden: s.getAttribute('aria-hidden') === 'true' || ariaHidden(s),
      focusable: s.getAttribute('focusable'),
      name: s.getAttribute('aria-label') || s.querySelector(':scope > title')?.textContent || null,
      inControl: inControl ? { tag: inControl.tagName.toLowerCase(), name: accName(inControl) } : null,
    };
  });
  const roleImg = [...doc.querySelectorAll('[role="img"]:not(svg):not(img)')].map((e) => ({ el: path(e), name: accName(e) }));
  const bgImages = all.filter((e) => {
    const b = cs(e).backgroundImage;
    return b && b !== 'none' && /url\(/.test(b) && !visibleText(e) && isRendered(e) && e.getBoundingClientRect().width > 40;
  }).map((e) => ({ el: path(e), role: e.getAttribute('role'), name: accName(e) || null }));
  const figures = [...doc.querySelectorAll('figure')].map((f) => {
    const cap = f.querySelector('figcaption');
    const img = f.querySelector('img, svg, [role="img"]');
    return {
      el: path(f),
      figcaption: cap ? clip(cap.textContent, 80) : null,
      role: f.getAttribute('role'),
      figureName: f.getAttribute('aria-label') || f.getAttribute('aria-labelledby') || null,
      imgAlt: img?.getAttribute('alt') ?? null,
    };
  });
  const images = {
    img: list(imgs),
    imgMissingAlt: list(imgs.filter((i) => i.alt === null && !i.ariaHidden && i.role !== 'presentation' && i.role !== 'none' && !i.ariaLabel)),
    // alt textes suspects (nom de fichier, mots génériques) → pertinence 1.3
    imgSuspiciousAlt: list(imgs.filter((i) => i.alt && /(\.(png|jpe?g|svg|webp|gif)$)|^(image|img|photo|picture|logo|icon|icone|visuel|banner|banniere)[\s\-_\d]*$/i.test(i.alt.trim()))),
    svg: list(svgs),
    svgUnlabelledNotHidden: list(svgs.filter((s) => !s.ariaHidden && !s.name && s.role !== 'presentation' && s.role !== 'none')),
    roleImg: list(roleImg),
    inputImage: list([...doc.querySelectorAll('input[type="image"]')].map((i) => ({ el: path(i), alt: i.getAttribute('alt') }))),
    area: list([...doc.querySelectorAll('area')].map((a) => ({ el: path(a), alt: a.getAttribute('alt') }))),
    backgroundImagesWithoutText: list(bgImages),
    figures: list(figures),
    canvas: count('canvas'),
  };

  // ---------- cadres (2.x) ----------
  const frames = [...doc.querySelectorAll('iframe, frame')].map((f) => ({
    el: path(f),
    src: (f.getAttribute('src') || '').slice(0, 100),
    title: f.getAttribute('title'),
    rendered: isRendered(f),
    ariaHidden: ariaHidden(f),
  }));

  // ---------- multimédia (4.x) ----------
  const mediaHosts = /youtube|youtu\.be|vimeo|dailymotion|soundcloud|spotify|podcast|wistia|brightcove|jwplayer/i;
  const media = {
    video: list([...doc.querySelectorAll('video')].map((v) => ({
      el: path(v), autoplay: v.autoplay, muted: v.muted, loop: v.loop, controls: v.controls,
      tracks: [...v.querySelectorAll('track')].map((t) => t.kind), duration: isFinite(v.duration) ? Math.round(v.duration) : null,
    }))),
    audio: list([...doc.querySelectorAll('audio')].map((a) => ({ el: path(a), autoplay: a.autoplay, muted: a.muted, controls: a.controls }))),
    embeddedPlayers: list(frames.filter((f) => mediaHosts.test(f.src))),
    objectEmbed: list([...doc.querySelectorAll('object, embed')].map((o) => ({ el: path(o), type: o.getAttribute('type'), data: o.getAttribute('data') || o.getAttribute('src') }))),
    animatedImages: list(imgs.filter((i) => /\.gif$/i.test(i.src))),
  };

  // ---------- tableaux (5.x) ----------
  const tables = [...doc.querySelectorAll('table, [role="table"], [role="grid"]')].map((t) => ({
    el: path(t),
    role: t.getAttribute('role'),
    caption: t.querySelector('caption') ? clip(t.querySelector('caption').textContent) : null,
    name: accName(t) || null,
    th: t.querySelectorAll('th, [role="columnheader"], [role="rowheader"]').length,
    thScope: t.querySelectorAll('th[scope]').length,
    headersAttr: t.querySelectorAll('td[headers], th[headers]').length,
    rows: t.querySelectorAll('tr, [role="row"]').length,
    nestedTable: !!t.querySelector('table'),
    layoutHints: t.getAttribute('role') === 'presentation' || t.getAttribute('role') === 'none',
  }));

  // ---------- liens (6.x, 13.2, 13.3) ----------
  const NEW_WIN = /nouvelle fen[eê]tre|nouvel onglet|new (window|tab)|ouvre une fen/i;
  const OFFICE = /\.(pdf|docx?|xlsx?|pptx?|odt|ods|odp|rtf|csv|epub|zip)(\?|#|$)/i;
  const linkInfo = links.map((a) => ({
    el: path(a),
    href: (a.getAttribute('href') || '').slice(0, 120),
    name: accName(a),
    visible: visibleText(a),
    target: a.getAttribute('target'),
    title: a.getAttribute('title'),
    rendered: isRendered(a),
  }));
  const byName = {};
  linkInfo.filter((l) => l.name).forEach((l) => { (byName[l.name.toLowerCase()] ||= new Set()).add(l.href); });
  const linksOut = {
    count: linkInfo.length,
    withoutName: list(linkInfo.filter((l) => !l.name && l.rendered)),
    // identifiants techniques ou intitulés génériques → 6.1
    technicalOrGeneric: list(linkInfo.filter((l) => l.name && (/^[a-z0-9]+([-_][a-z0-9]+)+$/i.test(l.name) || /^(cliquez ici|ici|en savoir plus|lire la suite|voir plus|plus|more|read more|découvrir|link|lien)$/i.test(l.name.trim())))),
    sameNameDifferentTarget: list(Object.entries(byName).filter(([, s]) => s.size > 1).map(([name, s]) => ({ name, hrefs: [...s].slice(0, 5) }))),
    // 2.5.3 : le nom accessible doit contenir l'intitulé visible
    visibleNotInName: list(linkInfo.filter((l) => l.visible && l.name && !l.name.toLowerCase().includes(l.visible.toLowerCase().slice(0, 30)))),
    targetBlank: list(linkInfo.filter((l) => l.target === '_blank').map((l) => ({ ...l, signalled: NEW_WIN.test(l.name) }))),
    officeDocuments: list(linkInfo.filter((l) => OFFICE.test(l.href))),
    all: list(linkInfo.map((l) => ({ name: l.name, href: l.href }))),
  };

  // ---------- boutons (11.9, 7.1) ----------
  const buttons = [...doc.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], input[type="reset"]')].map((b) => ({
    el: path(b), name: accName(b), visible: visibleText(b), expanded: b.getAttribute('aria-expanded'), pressed: b.getAttribute('aria-pressed'),
    haspopup: b.getAttribute('aria-haspopup'), controls: b.getAttribute('aria-controls'), rendered: isRendered(b),
  }));

  // ---------- formulaires (11.x) ----------
  const FIELD = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea, [role="textbox"], [role="combobox"], [role="listbox"], [role="spinbutton"], [role="slider"], [role="searchbox"], [contenteditable="true"]';
  const AUTOCOMPLETE_HINTS = [
    [/(^|[-_ ])(e-?mail|courriel)/i, 'email'], [/(t[eé]l|phone|mobile|portable)/i, 'tel'],
    [/(given|first|pr[eé]nom)/i, 'given-name'], [/(family|last|nom)$/i, 'family-name'],
    [/(code.?postal|zip|postal)/i, 'postal-code'], [/(ville|city|locality)/i, 'address-level2'],
    [/(adresse|address|street|rue)/i, 'street-address'], [/(naissance|birth|bday)/i, 'bday'],
    [/(organi[sz]ation|soci[eé]t[eé]|company|entreprise)/i, 'organization'],
  ];
  const fields = [...doc.querySelectorAll(FIELD)].filter((f) => isRendered(f) || f.type === 'checkbox' || f.type === 'radio').map((f) => {
    const labels = f.labels ? [...f.labels] : [];
    const label = labels[0];
    const key = `${f.name || ''} ${f.id || ''} ${f.type || ''} ${f.getAttribute('placeholder') || ''} ${accName(f)}`;
    const hint = AUTOCOMPLETE_HINTS.find(([re]) => re.test(key));
    let distance = null;
    if (label && isRendered(label) && !isSrOnly(label)) {
      const a = label.getBoundingClientRect(); const b = f.getBoundingClientRect();
      const dx = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
      const dy = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom));
      distance = Math.round(Math.hypot(dx, dy));
    }
    const fs = f.closest('fieldset, [role="group"], [role="radiogroup"]');
    return {
      el: path(f),
      tag: f.tagName.toLowerCase(),
      type: f.getAttribute('type') || f.getAttribute('role') || f.tagName.toLowerCase(),
      name: accName(f),
      labelSource: f.getAttribute('aria-labelledby') ? 'aria-labelledby' : f.getAttribute('aria-label') ? 'aria-label' : labels.length ? (label.contains(f) ? 'label englobant' : 'label for') : f.getAttribute('title') ? 'title' : 'aucune',
      labelVisible: label ? isRendered(label) && !isSrOnly(label) : false,
      labelDistancePx: distance,
      placeholder: f.getAttribute('placeholder'),
      required: f.required || f.getAttribute('aria-required') === 'true',
      requiredSignalled: !!(label && /\*|obligatoire|requis/i.test(label.textContent)) || /obligatoire|requis/i.test(accName(f)),
      autocomplete: f.getAttribute('autocomplete'),
      expectedAutocomplete: hint ? hint[1] : null,
      invalid: f.getAttribute('aria-invalid'),
      describedby: f.getAttribute('aria-describedby'),
      group: fs ? { tag: fs.tagName.toLowerCase(), legend: fs.tagName === 'FIELDSET' ? clip(fs.querySelector('legend')?.textContent || '') : accName(fs) } : null,
      form: f.form ? path(f.form) : null,
    };
  });
  const radioGroups = {};
  fields.filter((f) => f.type === 'radio' || f.type === 'checkbox').forEach((f) => {
    const el = doc.querySelector(f.el); const n = el?.name || f.el;
    (radioGroups[n] ||= { name: n, type: f.type, count: 0, grouped: !!f.group, legend: f.group?.legend || null }).count++;
  });
  const forms = {
    count: count('form'),
    fields: list(fields),
    unlabelled: list(fields.filter((f) => !f.name)),
    placeholderOnly: list(fields.filter((f) => f.labelSource === 'aucune' && f.placeholder)),
    labelFar: list(fields.filter((f) => f.labelDistancePx !== null && f.labelDistancePx > 50)),
    groups: list(Object.values(radioGroups).filter((g) => g.count > 1)),
    ungroupedChoiceSets: list(Object.values(radioGroups).filter((g) => g.count > 1 && !g.grouped)),
    selects: list([...doc.querySelectorAll('select')].map((s) => ({ el: path(s), options: s.options.length, optgroups: s.querySelectorAll('optgroup').length }))),
    autocompleteMissing: list(fields.filter((f) => f.expectedAutocomplete && !f.autocomplete)),
    autocompleteInvalid: list(fields.filter((f) => f.autocomplete && !/^(on|off|((section-\S+ )?((shipping|billing) )?((home|work|mobile|fax|pager) )?(name|honorific-prefix|given-name|additional-name|family-name|honorific-suffix|nickname|username|new-password|current-password|one-time-code|organization-title|organization|street-address|address-line[123]|address-level[1234]|country|country-name|postal-code|cc-name|cc-given-name|cc-additional-name|cc-family-name|cc-number|cc-exp|cc-exp-month|cc-exp-year|cc-csc|cc-type|transaction-currency|transaction-amount|language|bday|bday-day|bday-month|bday-year|sex|url|photo|tel|tel-country-code|tel-national|tel-area-code|tel-local|tel-local-prefix|tel-local-suffix|tel-extension|email|impp)( webauthn)?))$/i.test(f.autocomplete.trim()))),
    requiredNotSignalled: list(fields.filter((f) => f.required && !f.requiredSignalled)),
    // 11.12 : formulaires à conséquence (paiement, mot de passe, suppression)
    sensitive: list([...doc.querySelectorAll('form')].filter((f) =>
      f.querySelector('input[type="password"], [autocomplete^="cc-"], [name*="iban" i], [name*="card" i]') ||
      /supprimer|payer|paiement|commander|valider (la|ma) commande|signer|delete|pay/i.test(f.textContent)).map((f) => path(f))),
    errorRegions: count('[role="alert"], [aria-live], .error, .invalid-feedback, [class*="error" i]'),
  };

  // ---------- structure et présentation (8.9, 9.3, 9.4, 10.1, 10.5, 10.8) ----------
  const presentationalTags = [...doc.querySelectorAll('b, i, u, s, strike, center, font, big, tt, blink, marquee')].map((e) => ({ tag: e.tagName.toLowerCase(), text: clip(e.textContent, 50), el: path(e) }));
  const brRuns = [...doc.querySelectorAll('br + br')].map((e) => path(e.parentElement));
  const presentationalAttrs = [...doc.querySelectorAll('[align], [bgcolor], [border]:not(table), [color], [face], [valign], [hspace], [vspace], [background]')].map((e) => ({ el: path(e), attrs: ['align', 'bgcolor', 'border', 'color', 'face', 'valign', 'hspace', 'vspace', 'background'].filter((a) => e.hasAttribute(a)) }));
  const inlineColor = [...doc.querySelectorAll('[style]')].filter((e) => /(^|;)\s*(color|background(-color)?)\s*:/i.test(e.getAttribute('style'))).map((e) => {
    const st = e.getAttribute('style');
    return { el: path(e), color: /(^|;)\s*color\s*:/i.test(st), background: /(^|;)\s*background(-color)?\s*:/i.test(st) };
  });
  // Listes potentielles : ≥ 3 frères consécutifs de même balise/classe contenant un lien ou du texte court, hors ul/ol
  const fakeLists = [];
  doc.querySelectorAll('div, nav, section, footer, header, aside').forEach((p) => {
    if (p.closest('ul, ol, [role="list"], table')) return;
    const kids = [...p.children].filter((c) => !['SCRIPT', 'TEMPLATE', 'STYLE'].includes(c.tagName));
    if (kids.length < 3) return;
    const sig = (c) => c.tagName + '.' + [...c.classList].sort().join('.');
    const same = kids.every((c) => sig(c) === sig(kids[0]));
    if (same && kids[0].tagName !== 'LI' && kids.every((c) => c.querySelector('a') || c.tagName === 'A') && !p.matches('[role="list"], [role="tablist"], [role="menu"], [role="menubar"], [role="toolbar"], [role="radiogroup"]')) {
      fakeLists.push({ el: path(p), items: kids.length, sample: clip(kids[0].innerText, 40) });
    }
  });
  const hiddenFocusable = [...doc.querySelectorAll('[aria-hidden="true"]')].flatMap((h) => [...h.querySelectorAll(FOCUSABLE)].filter((f) => f.tabIndex >= 0 && isRendered(f)).map((f) => ({ el: path(f), name: accName(f) })));
  const srOnlyTexts = all.filter((e) => e.children.length === 0 && e.textContent.trim() && isRendered(e) && isSrOnly(e)).map((e) => ({ el: path(e), text: clip(e.textContent, 80) }));
  const generatedContent = all.slice(0, 4000).flatMap((e) => ['::before', '::after'].map((p) => {
    const c = getComputedStyle(e, p).content;
    if (!c || c === 'none' || c === 'normal' || c === '""' || c === "''") return null;
    const txt = c.replace(/^["']|["']$/g, '');
    // ignore les icônes (zone privée Unicode) et les puces/séparateurs
    if (/^[-]$/.test(txt) || /^(\\[0-9a-f]{4}|[•·›»|/,:\-–—*]|counter.*|attr.*|url.*)$/i.test(txt.trim())) return null;
    return { el: path(e), pseudo: p, content: txt.slice(0, 40) };
  }).filter(Boolean));
  const structure = {
    lists: { ul: count('ul'), ol: count('ol'), dl: count('dl'), roleList: count('[role="list"]'), potentialFakeLists: list(fakeLists) },
    quotes: { blockquote: count('blockquote'), q: count('q'), cite: count('cite'), guillemetsParagraphs: list([...doc.querySelectorAll('p')].filter((p) => /^\s*[«"“].{40,}[»"”]\s*$/.test(p.textContent)).map((p) => clip(p.textContent, 80))) },
    presentationalTags: list(presentationalTags),
    brRuns: list(brRuns),
    presentationalAttrs: list(presentationalAttrs),
    inlineColor: list(inlineColor),
    inlineColorHalfDeclared: list(inlineColor.filter((c) => c.color !== c.background)),
    stylesheets: doc.styleSheets.length,
    hiddenFocusable: list(hiddenFocusable),
    srOnlyTexts: list(srOnlyTexts),
    cssGeneratedContent: list(generatedContent),
  };

  // ---------- langue et sens de lecture (8.7, 8.8, 8.10) ----------
  const BCP47 = /^[a-z]{2,3}(-[A-Za-z]{4})?(-([A-Za-z]{2}|\d{3}))?(-[A-Za-z0-9]{5,8})*$/;
  const langChanges = [...doc.querySelectorAll('body [lang]')].map((e) => ({ el: path(e), lang: e.getAttribute('lang'), valid: BCP47.test(e.getAttribute('lang')), text: clip(e.textContent, 60) }));
  const bodyText = doc.body.innerText || '';
  const rtlChars = (bodyText.match(/[֐-ࣿיִ-﷿ﹰ-﻿]/g) || []).length;
  // Mots anglais fréquents : signal pour 8.7, à juger (emprunts courants admis)
  const enWords = (bodyText.match(/\b(the|and|with|your|our|for|you|now|discover|learn|more|shop|new|free|sale|get|best)\b/gi) || []);
  const language = {
    langChanges: list(langChanges),
    invalidLangCodes: list(langChanges.filter((l) => !l.valid)),
    dirAttributes: list([...doc.querySelectorAll('body [dir]')].map((e) => ({ el: path(e), dir: e.getAttribute('dir') }))),
    rtlCharCount: rtlChars,
    englishWordSample: { count: enWords.length, sample: [...new Set(enWords.map((w) => w.toLowerCase()))].slice(0, 15) },
  };

  // ---------- scripts et interaction (7.x, 12.8, 12.10, 13.x) ----------
  const clickableNonNative = all.filter((e) => {
    if (e.matches('a, button, input, select, textarea, summary, label, option, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="option"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"]')) return false;
    if (e.closest('a, button, label, [role="button"], [role="link"]')) return false;
    if (e.hasAttribute('onclick')) return true;
    if (!isRendered(e) || cs(e).cursor !== 'pointer') return false;
    return !e.parentElement || cs(e.parentElement).cursor !== 'pointer';
  }).map((e) => ({ el: path(e), tag: e.tagName.toLowerCase(), tabindex: e.getAttribute('tabindex'), text: visibleText(e).slice(0, 40) }));
  const widgets = [...doc.querySelectorAll('[role="tablist"], [role="dialog"], [role="alertdialog"], [role="menu"], [role="menubar"], [role="listbox"], [role="combobox"], [role="slider"], [role="tree"], [role="grid"], [aria-expanded], details, dialog, [class*="swiper" i], [class*="carousel" i], [class*="slider" i], [class*="slick" i], [class*="splide" i]')]
    .filter((w) => !w.parentElement?.closest('[class*="swiper" i], [class*="carousel" i], [class*="slick" i], [class*="splide" i]'))
    .map((w) => ({ el: path(w), role: w.getAttribute('role'), expanded: w.getAttribute('aria-expanded'), cls: clip(w.className?.baseVal ?? w.className, 50) }));
  const scripts = {
    clickableNonNative: list(clickableNonNative),
    positiveTabindex: list([...doc.querySelectorAll('[tabindex]')].filter((e) => +e.getAttribute('tabindex') > 0).map((e) => ({ el: path(e), tabindex: e.getAttribute('tabindex') }))),
    widgets: list(widgets),
    liveRegions: list([...doc.querySelectorAll('[aria-live], [role="status"], [role="alert"], [role="log"], [role="progressbar"], output')].map((e) => ({ el: path(e), role: e.getAttribute('role'), live: e.getAttribute('aria-live') }))),
    accesskeys: list([...doc.querySelectorAll('[accesskey]')].map((e) => ({ el: path(e), key: e.getAttribute('accesskey') }))),
    // 7.4 : select ou champ qui soumet/navigue au changement (attribut inline seulement)
    onchangeNavigation: list([...doc.querySelectorAll('select[onchange], input[onchange]')].map((e) => path(e))),
    autoplayCandidates: list([...doc.querySelectorAll('[data-autoplay], [data-swiper-autoplay], [data-slick*="autoplay"], [autoplay]')].map((e) => path(e))),
    draggable: count('[draggable="true"]'),
  };

  // ---------- consultation (1.4/1.5, 13.x) ----------
  const consultation = {
    captcha: list([...doc.querySelectorAll('.g-recaptcha, .h-captcha, .cf-turnstile, [class*="captcha" i], [id*="captcha" i], iframe[src*="captcha" i], iframe[src*="recaptcha" i], iframe[src*="turnstile" i], img[src*="captcha" i], img[alt*="captcha" i]')].map((e) => path(e))),
    metaRefresh,
    // contenus cryptiques : émojis hors role="img"/aria-label, art ASCII
    emojis: list(all.filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && /\p{Extended_Pictographic}/u.test(n.textContent)) && !e.closest('[role="img"][aria-label], [aria-hidden="true"]')).map((e) => ({ el: path(e), text: clip(e.textContent, 40) }))),
    asciiArt: list([...doc.querySelectorAll('pre')].filter((p) => (p.textContent.match(/[\/\\|_\-=+*#]/g) || []).length > 40).map((p) => path(p))),
    timeoutWords: /(session|expir|d[eé]lai|temps restant|minutes? restantes?|timeout)/i.test(bodyText),
  };

  return {
    url: location.href,
    viewport: { w: innerWidth, h: innerHeight },
    document: document_,
    validity,
    headings: headingsOut,
    landmarks,
    images,
    frames: list(frames),
    media,
    tables: list(tables),
    links: linksOut,
    buttons: { count: buttons.length, withoutName: list(buttons.filter((b) => !b.name && b.rendered)), all: list(buttons.map((b) => ({ name: b.name, expanded: b.expanded, haspopup: b.haspopup }))) },
    forms,
    structure,
    language,
    scripts,
    consultation,
  };
})();
