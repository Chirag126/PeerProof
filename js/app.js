/* PeerProof front-end (vanilla JS, no build step) */
(function () {
  "use strict";
  const E = window.PeerProofEngine;
  const SAMPLE = window.PEERPROOF_SAMPLE;
  const C = E.CATEGORIES;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const view = $("#view");

  /* ---------------- Icons ---------------- */
  const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = {
    home: P('<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'),
    plus: P('<path d="M12 5v14M5 12h14"/>'),
    file: P('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>'),
    shield: P('<path d="M12 3l8 3v6c0 5-3.4 8.6-8 9.9C7.4 20.6 4 17 4 12V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
    flask: P('<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>'),
    gear: P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    cpu: P('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>'),
    menu: P('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    upload: P('<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>'),
    download: P('<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>'),
    check: P('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    checkCircle: P('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 10"/>'),
    x: P('<path d="M6 6l12 12M18 6L6 18"/>'),
    alert: P('<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/>'),
    info: P('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>'),
    lock: P('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    printer: P('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>'),
    trash: P('<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13M9 7V4h6v3"/>'),
    arrow: P('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    sparkle: P('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>'),
    book: P('<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5V21.5"/><path d="M8 7h8M8 11h6"/>'),
    link: P('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    hash: P('<path d="M5 9h14M5 15h14M10 3L8 21M16 3l-2 18"/>'),
  };
  function hydrateIcons(root = document) {
    $$("[data-icon]", root).forEach((el) => { if (!el.dataset.done) { el.innerHTML = ICONS[el.dataset.icon] || ""; el.dataset.done = 1; } });
  }
  const ic = (n) => `<i data-icon="${n}"></i>`;

  /* ---------------- Utils ---------------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const catKey = (c) => ({ [C.SUPPORTED]: "sup", [C.PARTIAL]: "par", [C.UNVERIFIED]: "unv", [C.REVIEW]: "rev" }[c] || "unv");
  const pill = (c) => `<span class="pill cat-${catKey(c)}">${esc(c)}</span>`;
  const shortHash = (h) => (h ? "0x" + h.slice(0, 8) + "…" + h.slice(-6) : "—");
  const fmtDate = (iso) => new Date(iso).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const fmtNum = (n) => Number(n || 0).toLocaleString();

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function download(name, content, type = "application/json") {
    const blob = new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------------- Storage (local audit log) ---------------- */
  const KEY = "peerproof.reports.v1";
  let memoryStore = [];
  const store = {
    all() {
      try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return memoryStore; }
    },
    save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { memoryStore = list; } },
    add(r) { const l = store.all(); l.unshift(r); store.save(l); },
    get(id) { return store.all().find((r) => r.id === id); },
    remove(id) { store.save(store.all().filter((r) => r.id !== id)); },
    bytes() { try { return (localStorage.getItem(KEY) || "").length; } catch (e) { return 0; } },
  };

  /* ---------------- File reading (txt / md / pdf / docx) ---------------- */
  const scriptCache = {};
  function loadScript(src) {
    if (!scriptCache[src]) {
      scriptCache[src] = new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = src; s.onload = res; s.onerror = () => rej(new Error("Could not load " + src + " (internet needed for PDF/DOCX)."));
        document.head.appendChild(s);
      });
    }
    return scriptCache[src];
  }
  async function readFileText(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      const lib = window.pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
      let out = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        tc.items.forEach((it) => { out += it.str + (it.hasEOL ? "\n" : " "); });
        out += "\n\n";
      }
      return out;
    }
    if (name.endsWith(".docx")) {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");
      const r = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return r.value;
    }
    return file.text();
  }

  /* ---------------- Router ---------------- */
  const routes = {
    dashboard: renderDashboard,
    new: renderNew,
    reports: renderReports,
    report: renderReport,
    integrity: renderIntegrity,
    methodology: renderMethodology,
    about: renderAbout,
  };
  function route() {
    const parts = (location.hash.replace(/^#\/?/, "").split("?")[0] || "dashboard").split("/");
    const name = routes[parts[0]] ? parts[0] : "dashboard";
    $$("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === (name === "report" ? "reports" : name)));
    $("#sidebar").classList.remove("open");
    view.innerHTML = "";
    view.className = "fade-in";
    routes[name](parts.slice(1));
    hydrateIcons(view);
    window.scrollTo(0, 0);
  }

  function head(title, sub, right = "") {
    return `<div class="page-head"><div class="row"><div><h1>${title}</h1><p>${sub}</p></div>${right ? `<div class="actions no-print">${right}</div>` : ""}</div></div>`;
  }

  function totals(list) {
    const t = { papers: list.length, claims: 0, cats: { [C.SUPPORTED]: 0, [C.PARTIAL]: 0, [C.UNVERIFIED]: 0, [C.REVIEW]: 0 } };
    list.forEach((r) => { t.claims += r.stats.claims; Object.keys(t.cats).forEach((k) => (t.cats[k] += r.stats.byCategory[k] || 0)); });
    return t;
  }

  function catBar(cats, total) {
    const pct = (k) => (total ? (cats[k] / total) * 100 : 0);
    return `<div class="bar">
      <span class="s" style="width:${pct(C.SUPPORTED)}%"></span><span class="p" style="width:${pct(C.PARTIAL)}%"></span>
      <span class="u" style="width:${pct(C.UNVERIFIED)}%"></span><span class="r" style="width:${pct(C.REVIEW)}%"></span></div>
      <div class="legend">
        <span><i style="background:var(--c-sup)"></i>Supported ${cats[C.SUPPORTED]}</span>
        <span><i style="background:#e9a23b"></i>Partially supported ${cats[C.PARTIAL]}</span>
        <span><i style="background:#94a3b8"></i>Unverified ${cats[C.UNVERIFIED]}</span>
        <span><i style="background:#ea6a3a"></i>Requires review ${cats[C.REVIEW]}</span>
      </div>`;
  }

  /* Dashboard illustration: paper -> citations -> sources -> verified fingerprint */
  const HERO_ART = `<svg class="hero-art" viewBox="0 0 340 220" aria-hidden="true">
    <defs>
      <linearGradient id="hg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eaf7ef"/></linearGradient>
      <filter id="hsh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#1f6b3d" flood-opacity=".12"/></filter>
    </defs>
    <circle cx="190" cy="110" r="96" fill="#dff3e7"/>
    <circle cx="190" cy="110" r="70" fill="none" stroke="#c4e8d2" stroke-dasharray="3 6"/>
    <!-- links paper -> sources -->
    <path class="ha-link" d="M150 70 C 200 70, 210 40, 252 40" />
    <path class="ha-link" d="M150 112 C 200 112, 210 110, 252 110" />
    <path class="ha-link warn" d="M150 154 C 200 154, 210 180, 252 180" />
    <!-- paper -->
    <g filter="url(#hsh)" class="ha-float">
      <rect x="40" y="30" width="118" height="160" rx="10" fill="url(#hg1)" stroke="#c9ecd6"/>
      <rect x="54" y="44" width="62" height="7" rx="3.5" fill="#1f9d55"/>
      <rect x="54" y="58" width="88" height="4" rx="2" fill="#cfe3d6"/>
      <rect x="54" y="66" width="76" height="9" rx="3" fill="#c9f0d8"/><rect x="134" y="66" width="14" height="9" rx="3" fill="#1f9d55"/>
      <rect x="54" y="82" width="90" height="4" rx="2" fill="#cfe3d6"/>
      <rect x="54" y="90" width="70" height="4" rx="2" fill="#cfe3d6"/>
      <rect x="54" y="108" width="76" height="9" rx="3" fill="#c9f0d8"/><rect x="134" y="108" width="14" height="9" rx="3" fill="#1f9d55"/>
      <rect x="54" y="124" width="88" height="4" rx="2" fill="#cfe3d6"/>
      <rect x="54" y="132" width="60" height="4" rx="2" fill="#cfe3d6"/>
      <rect x="54" y="150" width="76" height="9" rx="3" fill="#fde6b8"/><rect x="134" y="150" width="14" height="9" rx="3" fill="#e9a23b"/>
      <rect x="54" y="166" width="84" height="4" rx="2" fill="#cfe3d6"/>
    </g>
    <!-- source cards -->
    <g filter="url(#hsh)">
      <g class="ha-float d1"><rect x="252" y="24" width="64" height="34" rx="8" fill="#fff" stroke="#c9ecd6"/><rect x="262" y="34" width="30" height="4" rx="2" fill="#9fdcb6"/><rect x="262" y="43" width="42" height="4" rx="2" fill="#dbeee2"/><circle cx="308" cy="24" r="8" fill="#1f9d55"/><path d="M304.5 24l2.5 2.5 4.5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g>
      <g class="ha-float d2"><rect x="252" y="94" width="64" height="34" rx="8" fill="#fff" stroke="#c9ecd6"/><rect x="262" y="104" width="30" height="4" rx="2" fill="#9fdcb6"/><rect x="262" y="113" width="42" height="4" rx="2" fill="#dbeee2"/><circle cx="308" cy="94" r="8" fill="#1f9d55"/><path d="M304.5 94l2.5 2.5 4.5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g>
      <g class="ha-float d3"><rect x="252" y="164" width="64" height="34" rx="8" fill="#fff" stroke="#f4dfb0"/><rect x="262" y="174" width="30" height="4" rx="2" fill="#f3cf8a"/><rect x="262" y="183" width="42" height="4" rx="2" fill="#f5ead3"/><circle cx="308" cy="164" r="8" fill="#e9a23b"/><path d="M308 160v4.5M308 167.5v.1" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>
    </g>
    <!-- magnifier -->
    <g class="ha-scan">
      <circle cx="132" cy="122" r="22" fill="rgba(255,255,255,.55)" stroke="#157a41" stroke-width="5"/>
      <path d="M148 138l16 16" stroke="#157a41" stroke-width="7" stroke-linecap="round"/>
    </g>
    <!-- fingerprint shield -->
    <g filter="url(#hsh)">
      <path d="M200 176l20 7v13c0 11-8.5 19-20 22-11.5-3-20-11-20-22v-13z" fill="#1f9d55"/>
      <text x="200" y="203" text-anchor="middle" font-family="monospace" font-size="9" font-weight="700" fill="#fff">#SHA</text>
    </g>
  </svg>`;

  /* ================= Dashboard ================= */
  function renderDashboard() {
    const list = store.all();
    const t = totals(list);
    const attention = t.cats[C.PARTIAL] + t.cats[C.REVIEW];
    const supRate = t.claims ? Math.round((t.cats[C.SUPPORTED] / t.claims) * 100) : 0;
    view.innerHTML = `
      ${head("Dashboard", "Overview of research papers verified in this browser.")}
      <div class="hero">
        <div class="hero-text">
          <h2>Check the claims in a research paper — and the sources behind them.</h2>
          <p>PeerProof finds the important claims in a paper, links them to their citations, compares them with the cited sources and explains the result. Every report gets a SHA-256 fingerprint so it can be re-checked later.</p>
          <div class="actions" style="margin-top:18px">
            <a class="btn primary" href="#/new">${ic("plus")}New verification</a>
            <button class="btn soft" id="trySample">${ic("sparkle")}Try sample paper</button>
          </div>
        </div>
        ${HERO_ART}
      </div>
      <div class="grid g4" style="margin-top:16px">
        <div class="card stat accent"><div class="label">${ic("file")}Papers verified</div><div class="value">${fmtNum(t.papers)}</div><div class="sub">Stored in local audit log</div></div>
        <div class="card stat"><div class="label">Claims analysed</div><div class="value">${fmtNum(t.claims)}</div><div class="sub">Across all reports</div></div>
        <div class="card stat"><div class="label">Supported rate</div><div class="value">${supRate}%</div><div class="sub">${t.cats[C.SUPPORTED]} supported claims</div></div>
        <div class="card stat"><div class="label">Need attention</div><div class="value">${fmtNum(attention)}</div><div class="sub">Partial or requires review</div></div>
      </div>
      <div class="grid g2" style="margin-top:16px">
        <div class="card"><h2>Verification categories</h2>${t.claims ? catBar(t.cats, t.claims) : `<p class="muted">No claims analysed yet. Run a verification to see the distribution.</p>`}
          <div class="note" style="margin-top:16px">${ic("info")}<span>Categories are indicative, not proof of truth or falsity. Each result includes a rationale and an uncertainty note for human review.</span></div>
        </div>
        <div class="card"><div class="row" style="display:flex;justify-content:space-between;align-items:center"><h2>Recent reports</h2><a href="#/reports" class="small">View all</a></div>
          ${list.length ? `<div class="table-wrap"><table><tbody>${list.slice(0, 5).map((r) => `
            <tr><td><a href="#/report/${esc(r.id)}"><b>${esc(r.title)}</b></a><div class="small muted">${esc(r.id)} · ${fmtDate(r.createdAt)}</div></td>
            <td style="text-align:right;white-space:nowrap"><span class="tag">${r.stats.claims} claims</span></td></tr>`).join("")}</tbody></table></div>`
            : `<div class="empty">${ic("file")}<h3>No reports yet</h3><p>Load the sample paper to see a full demo report.</p></div>`}
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <h2>How it works</h2>
        <div class="pipeline">
          ${[["Add paper", "Paste text or upload a .txt, .md, .pdf or .docx file."], ["Detect claims", "NLP cues find candidate claims; citations are linked to the reference list."], ["Compare sources", "Each claim is compared with the cited source text for wording, numbers and hedging."], ["Report & fingerprint", "Categories with rationale, exported as JSON with a SHA-256 integrity fingerprint."]]
            .map((s, i) => `<div class="pipe"><div class="n">${i + 1}</div><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join("")}
        </div>
      </div>`;
    $("#trySample").onclick = () => { loadSampleIntoDraft(); location.hash = "#/new"; };
  }

  /* ================= New verification ================= */
  const draft = { title: "", authors: "", text: "", sources: {}, mode: "paste", fileName: "" };
  function loadSampleIntoDraft() {
    Object.assign(draft, { title: SAMPLE.title, authors: SAMPLE.authors, text: SAMPLE.text, sources: { ...SAMPLE.sources }, mode: "paste", fileName: "" });
  }

  function renderNew() {
    view.innerHTML = `
      ${head("New Verification", "Detect claims and citations in a research paper, then compare them with the cited sources.")}
      <div class="grid g2" style="grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)">
        <div class="card">
          <h2>Research paper</h2>
          <label class="field"><span>Paper title</span><input type="text" id="fTitle" placeholder="e.g. Effect of spaced repetition on vocabulary retention" value="${esc(draft.title)}"></label>
          <label class="field"><span>Authors (optional)</span><input type="text" id="fAuthors" placeholder="e.g. A. Author, B. Author" value="${esc(draft.authors)}"></label>
          <div class="tabs" id="modeTabs"><button data-m="paste" class="${draft.mode === "paste" ? "on" : ""}">Paste text</button><button data-m="upload" class="${draft.mode === "upload" ? "on" : ""}">Upload file</button></div>
          <div id="inputArea"></div>
          <div class="actions" style="margin-top:12px;justify-content:space-between">
            <span class="small muted" id="textStats"></span>
            <span class="actions"><button class="btn sm soft" id="sampleBtn">${ic("sparkle")}Load sample paper</button><button class="btn sm" id="clearBtn">Clear</button></span>
          </div>
        </div>
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px">
            <h2 style="margin:0">Cited source texts <span class="muted small" style="font-weight:500">(optional)</span></h2>
            <button class="btn sm primary" id="fillSA" title="Fill source abstracts from the demo library">${ic("sparkle")}Fill SA</button>
          </div>
          <p class="small muted" style="margin-top:-6px">Paste the abstract or a relevant excerpt of each cited source. Claims are compared with this text. References without source text are marked <b>Unverified</b>.</p>
          <div id="refPanel" class="ref-list"></div>
        </div>
      </div>
      <div class="note" style="margin:16px 0">${ic("lock")}<span>Papers are processed in your browser and never uploaded. Only a SHA-256 fingerprint of the text is stored with the report.</span></div>
      <button class="btn primary" id="runBtn">${ic("shield")}Run verification</button>
      <div id="progress" style="margin-top:16px"></div>
      <div id="result" style="margin-top:16px"></div>`;

    const titleEl = $("#fTitle"), authEl = $("#fAuthors");
    titleEl.oninput = () => (draft.title = titleEl.value);
    authEl.oninput = () => (draft.authors = authEl.value);
    $$("#modeTabs button").forEach((b) => (b.onclick = () => { draft.mode = b.dataset.m; $$("#modeTabs button").forEach((x) => x.classList.toggle("on", x === b)); renderInput(); }));
    $("#sampleBtn").onclick = () => { loadSampleIntoDraft(); route(); toast("Sample paper loaded"); };
    $("#clearBtn").onclick = () => { Object.assign(draft, { title: "", authors: "", text: "", sources: {}, fileName: "" }); route(); };
    $("#runBtn").onclick = runVerification;
    $("#fillSA").onclick = fillSourceAbstracts;
    renderInput();
    renderRefPanel();
  }

  function renderInput() {
    const area = $("#inputArea");
    if (draft.mode === "paste") {
      area.innerHTML = `<textarea class="paper" id="fText" placeholder="Paste the full paper text here, including the References section…">${esc(draft.text)}</textarea>`;
      const ta = $("#fText");
      ta.oninput = () => { draft.text = ta.value; updateStats(); clearTimeout(renderInput._t); renderInput._t = setTimeout(renderRefPanel, 350); };
    } else {
      area.innerHTML = `<label class="drop" id="drop">${ic("upload")}<strong>${draft.fileName ? esc(draft.fileName) : "Drop a file or click to choose"}</strong>
        <span class="small muted">${draft.fileName ? "Text extracted · switch to “Paste text” to review it" : "Supported: .txt, .md, .pdf, .docx"}</span><input type="file" id="fFile" accept=".txt,.md,.pdf,.docx,text/plain"></label>`;
      const drop = $("#drop"), inp = $("#fFile");
      const handle = async (file) => {
        if (!file) return;
        try {
          toast("Extracting text from " + file.name + "…");
          const txt = await readFileText(file);
          draft.text = txt; draft.fileName = file.name;
          if (!draft.title) { draft.title = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "); $("#fTitle").value = draft.title; }
          renderInput(); renderRefPanel(); toast("Text extracted (" + fmtNum(txt.split(/\s+/).length) + " words)");
        } catch (e) { toast(e.message || "Could not read file"); }
      };
      inp.onchange = () => handle(inp.files[0]);
      drop.ondragover = (e) => { e.preventDefault(); drop.classList.add("over"); };
      drop.ondragleave = () => drop.classList.remove("over");
      drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove("over"); handle(e.dataTransfer.files[0]); };
    }
    hydrateIcons(area);
    updateStats();
  }

  function updateStats() {
    const el = $("#textStats");
    if (!el) return;
    const words = draft.text.trim() ? draft.text.trim().split(/\s+/).length : 0;
    el.textContent = words ? fmtNum(words) + " words · " + E.previewReferences(draft.text).length + " references detected" : "No text yet";
  }

  function renderRefPanel() {
    const panel = $("#refPanel");
    if (!panel) return;
    const refs = draft.text ? E.previewReferences(draft.text) : [];
    if (!refs.length) {
      panel.innerHTML = `<div class="empty" style="padding:24px 10px">${ic("book")}<h3>No references detected yet</h3><p class="small">References appear here once the paper has a “References” or “Bibliography” section.</p></div>`;
    } else {
      panel.innerHTML = refs.map((r) => `<div class="ref-src" style="margin-bottom:12px">
          <div class="ref-line"><b>[${esc(r.id)}]</b> ${esc(r.raw.length > 140 ? r.raw.slice(0, 140) + "…" : r.raw)}</div>
          <textarea data-ref="${esc(r.id)}" placeholder="Paste abstract / excerpt for [${esc(r.id)}]…">${esc(draft.sources[r.id] || "")}</textarea></div>`).join("");
      $$("textarea[data-ref]", panel).forEach((ta) => (ta.oninput = () => (draft.sources[ta.dataset.ref] = ta.value)));
    }
    hydrateIcons(panel);
  }

  function fillSourceAbstracts() {
    const refs = draft.text ? E.previewReferences(draft.text) : [];
    if (!refs.length) { toast("Add the paper first — no references detected yet."); return; }
    const lib = SAMPLE.library || [];
    let filled = 0;
    refs.forEach((r) => {
      const hit = lib.find((e) => e.surname.toLowerCase() === r.surname.toLowerCase() && e.year === r.year.slice(0, 4));
      if (hit) { draft.sources[r.id] = hit.text; filled++; }
    });
    renderRefPanel();
    if (filled) {
      toast("Filled " + filled + " of " + refs.length + " source abstracts" + (filled < refs.length ? " (others left empty on purpose)" : ""));
      const first = $("#refPanel textarea[data-ref]");
      if (first) $("#refPanel").scrollTop = 0;
    } else toast("No demo abstracts match these references. Paste them manually.");
  }

  const STEPS = ["Reading and normalising text", "Detecting sections and sentences", "Parsing reference list", "Identifying candidate claims", "Mapping citations to references", "Comparing claims with source text", "Classifying and generating report", "Computing SHA-256 fingerprints"];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function runVerification() {
    if (!draft.text || draft.text.trim().length < 200) { toast("Please add the paper text first (at least a few paragraphs)."); return; }
    const btn = $("#runBtn");
    btn.disabled = true;
    $("#result").innerHTML = "";
    const prog = $("#progress");
    prog.innerHTML = `<div class="card"><h2>Running verification…</h2><ul class="steps">${STEPS.map((s) => `<li><span class="ic"></span>${s}</li>`).join("")}</ul></div>`;
    const items = $$(".steps li", prog);
    let report;
    for (let i = 0; i < items.length; i++) {
      items[i].classList.add("run");
      await sleep(230);
      if (i === 6) report = E.analyze({ title: draft.title.trim() || "Untitled paper", authors: draft.authors.trim(), text: draft.text, sources: draft.sources });
      items[i].classList.remove("run");
      items[i].classList.add("done");
      items[i].querySelector(".ic").innerHTML = ICONS.check;
    }
    store.add(report);
    await sleep(150);
    prog.innerHTML = "";
    btn.disabled = false;
    const b = report.stats.byCategory;
    $("#result").innerHTML = `<div class="card fade-in">
      <div class="success-head">${ICONS.checkCircle}Verification complete</div>
      <div class="kv">
        <div><div class="k">Report ID</div><div class="v mono">${esc(report.id)}</div></div>
        <div><div class="k">Paper</div><div class="v">${esc(report.title)}</div></div>
        <div><div class="k">Engine</div><div class="v mono">${esc(report.engine)}</div></div>
      </div>
      <div class="k small muted">Paper fingerprint (SHA-256)</div><div class="hash" style="margin-bottom:14px">0x${report.paperHash}</div>
      <div class="actions" style="margin-bottom:16px">
        <span class="tag">${report.stats.claims} claims</span>${pill(C.SUPPORTED)} ${b[C.SUPPORTED]} ${pill(C.PARTIAL)} ${b[C.PARTIAL]} ${pill(C.UNVERIFIED)} ${b[C.UNVERIFIED]} ${pill(C.REVIEW)} ${b[C.REVIEW]}
      </div>
      <div class="actions"><a class="btn primary" href="#/report/${esc(report.id)}">Open report ${ic("arrow")}</a><button class="btn" id="dlNew">${ic("download")}Download report JSON</button></div>
    </div>`;
    hydrateIcons($("#result"));
    $("#dlNew").onclick = () => download(report.id + ".peerproof.json", JSON.stringify(report, null, 2));
    $("#result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ================= Reports list ================= */
  function renderReports() {
    const list = store.all();
    view.innerHTML = `${head("Verification Reports", "Reports created in this browser. Each one is recorded in the local audit log with its fingerprints.", `<a class="btn primary" href="#/new">${ic("plus")}New verification</a>`)}
      <div class="card">${list.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Report</th><th>Paper</th><th>Claims</th><th>Results</th><th>Fingerprint</th><th>Created</th><th></th></tr></thead>
        <tbody>${list.map((r) => { const b = r.stats.byCategory; return `<tr>
          <td class="mono">${esc(r.id)}</td>
          <td style="max-width:280px"><b>${esc(r.title)}</b>${r.authors ? `<div class="small muted">${esc(r.authors)}</div>` : ""}</td>
          <td>${r.stats.claims}</td>
          <td style="min-width:150px"><div class="bar" style="height:8px">${[["s", C.SUPPORTED], ["p", C.PARTIAL], ["u", C.UNVERIFIED], ["r", C.REVIEW]].map(([k, c]) => `<span class="${k}" style="width:${r.stats.claims ? (b[c] / r.stats.claims) * 100 : 0}%"></span>`).join("")}</div>
            <div class="small muted" style="margin-top:4px">${b[C.SUPPORTED]} supported · ${b[C.PARTIAL] + b[C.REVIEW]} need attention</div></td>
          <td class="hash">${shortHash(r.paperHash)}</td>
          <td class="small">${fmtDate(r.createdAt)}</td>
          <td><div class="actions" style="flex-wrap:nowrap"><a class="btn sm primary" href="#/report/${esc(r.id)}">Open</a><button class="btn sm" data-dl="${esc(r.id)}">${ic("download")}JSON</button></div></td>
        </tr>`; }).join("")}</tbody></table></div>`
        : `<div class="empty">${ic("file")}<h3>No reports yet</h3><p>Create your first verification or try the sample paper.</p><a class="btn primary" href="#/new">New verification</a></div>`}</div>`;
    $$("[data-dl]").forEach((b) => (b.onclick = () => { const r = store.get(b.dataset.dl); download(r.id + ".peerproof.json", JSON.stringify(r, null, 2)); }));
  }

  /* ================= Single report ================= */
  function highlightCitations(text, claim) {
    let h = esc(text);
    const seen = new Set();
    claim.citations.forEach((c, i) => {
      if (seen.has(c.marker)) return;
      seen.add(c.marker);
      const ok = claim.references[i] && claim.references[i].id;
      h = h.split(esc(c.marker)).join(`<span class="cite-mark ${ok ? "" : "bad"}">${esc(c.marker)}</span>`);
    });
    return h;
  }
  function highlightEvidence(sentence, stems) {
    const set = new Set(stems);
    return esc(sentence).replace(/[A-Za-z][A-Za-z\-']+/g, (w) => (w.length > 2 && set.has(E.stem(w)) ? `<mark>${w}</mark>` : w));
  }

  function claimCard(c, report) {
    const k = catKey(c.category);
    const best = c.comparisons && c.comparisons[0];
    const ref = best ? report.references.find((r) => r.id === best.refId) : null;
    return `<div class="claim k-${k}" data-cat="${esc(c.category)}">
      <div class="claim-head">
        <div class="claim-meta"><span class="claim-id">${esc(c.id)}</span><span class="tag">${esc(c.section)}</span><span class="tag">${esc(c.kind)}</span><span class="tag">Importance: ${esc(c.importance)}</span></div>
        ${pill(c.category)}
      </div>
      <p class="claim-text">${highlightCitations(c.text, c)}</p>
      <div class="why"><b>Rationale:</b> ${esc(c.rationale)}</div>
      <div class="small muted" style="margin-top:4px"><b>Uncertainty:</b> ${esc(c.uncertainty)}</div>
      ${best ? `<div class="evidence"><div class="src">Closest evidence · Source [${esc(best.refId)}]${ref ? " · " + esc(ref.surname) + " " + esc(ref.year) : ""}</div>${highlightEvidence(best.evidence, best.matchedStems)}
        <div class="actions" style="margin-top:8px"><span class="meter">Match score <span class="track"><span class="fill" style="width:${Math.round(best.score * 100)}%;display:block"></span></span>${Math.round(best.score * 100)}%</span>
        ${best.numericMismatch ? `<span class="tag" style="background:var(--c-par-bg);color:var(--c-par)">Numeric mismatch</span>` : ""}
        ${best.overclaim ? `<span class="tag" style="background:var(--c-par-bg);color:var(--c-par)">Possible overstatement</span>` : ""}
        ${best.contradiction ? `<span class="tag" style="background:var(--c-rev-bg);color:var(--c-rev)">Negative finding in source</span>` : ""}</div></div>` : ""}
      ${c.references.length ? `<details class="more"><summary>Linked references (${c.references.length})</summary><ul class="small" style="margin:6px 0 0;padding-left:18px">${c.references.map((r) => `<li>${r.id ? "[" + esc(r.id) + "] " : ""}${esc(r.raw)} ${r.id ? (r.hasSource ? `<span class="tag">source text attached</span>` : `<span class="tag">no source text</span>`) : ""}</li>`).join("")}</ul></details>` : ""}
      <details class="more"><summary>Why was this detected as a claim?</summary><div class="small muted" style="margin-top:4px">Claim cues: ${esc(c.cues.join(", ") || "—")} · claim score ${c.claimScore}</div></details>
    </div>`;
  }

  function renderReport([id]) {
    const r = store.get(id);
    if (!r) { view.innerHTML = `${head("Report not found", "This report is not in the local audit log.")}<a class="btn" href="#/reports">Back to reports</a>`; return; }
    const b = r.stats.byCategory;
    view.innerHTML = `
      ${head(esc(r.title), `<span class="mono">${esc(r.id)}</span> · ${fmtDate(r.createdAt)}${r.authors ? " · " + esc(r.authors) : ""}`,
        `<button class="btn" id="dl">${ic("download")}JSON</button><button class="btn" id="pr">${ic("printer")}Print / PDF</button><button class="btn danger" id="del">${ic("trash")}Delete</button>`)}
      <div class="note warn" style="margin-bottom:16px">${ic("alert")}<span>${esc(r.disclaimer)}</span></div>
      <div class="grid g5">
        <div class="card stat accent"><div class="label">Claims found</div><div class="value">${r.stats.claims}</div><div class="sub">${r.stats.sentences} sentences scanned</div></div>
        ${[C.SUPPORTED, C.PARTIAL, C.UNVERIFIED, C.REVIEW].map((c) => `<div class="card stat"><div class="label">${pill(c)}</div><div class="value">${b[c]}</div><div class="sub">${r.stats.claims ? Math.round((b[c] / r.stats.claims) * 100) : 0}% of claims</div></div>`).join("")}
      </div>
      <div class="card" style="margin-top:16px">
        <h2>Summary</h2>${catBar(b, r.stats.claims)}
        <div class="grid g4" style="margin-top:16px;font-size:13px">
          <div><div class="muted small">Words</div><b>${fmtNum(r.stats.words)}</b></div>
          <div><div class="muted small">Sections detected</div><b>${r.stats.sections.length}</b></div>
          <div><div class="muted small">References</div><b>${r.stats.references}</b></div>
          <div><div class="muted small">In-text citations</div><b>${r.stats.citations}</b></div>
        </div>
        ${r.warnings.length ? `<div class="note warn" style="margin-top:16px">${ic("alert")}<div>${r.warnings.map((w) => `<div>${esc(w)}</div>`).join("")}</div></div>` : ""}
      </div>
      <div style="margin-top:20px" class="no-print"><div class="tabs" id="rTabs"><button data-t="claims" class="on">Claims (${r.claims.length})</button><button data-t="refs">References (${r.references.length})</button><button data-t="int">Integrity</button></div></div>
      <div id="rBody"></div>`;

    const body = $("#rBody");
    let filter = "All";
    const showClaims = () => {
      const list = filter === "All" ? r.claims : r.claims.filter((c) => c.category === filter);
      body.innerHTML = `<div class="filters">${["All", C.SUPPORTED, C.PARTIAL, C.UNVERIFIED, C.REVIEW].map((f) => `<button class="chip ${f === filter ? "on" : ""}" data-f="${esc(f)}">${esc(f)} (${f === "All" ? r.claims.length : b[f]})</button>`).join("")}</div>
        ${list.length ? list.map((c) => claimCard(c, r)).join("") : `<div class="card empty"><p>No claims in this category.</p></div>`}`;
      $$(".chip", body).forEach((ch) => (ch.onclick = () => { filter = ch.dataset.f; showClaims(); }));
    };
    const showRefs = () => {
      body.innerHTML = `<div class="card"><div class="table-wrap"><table><thead><tr><th>#</th><th>Reference</th><th>Cited in text</th><th>Source text</th></tr></thead><tbody>
        ${r.references.map((x) => `<tr><td class="mono">[${esc(x.id)}]</td><td>${esc(x.raw)}</td><td>${x.cited ? `<span class="pill cat-sup">Cited</span>` : `<span class="pill cat-par">Not cited</span>`}</td><td>${x.hasSource ? `<span class="pill cat-sup">Attached</span>` : `<span class="pill cat-unv">Missing</span>`}</td></tr>`).join("") || `<tr><td colspan="4" class="muted">No reference list detected.</td></tr>`}
      </tbody></table></div></div>`;
    };
    const showInt = () => {
      body.innerHTML = `<div class="card"><h2>Integrity record</h2>
        <dl class="info">
          <dt>Report ID</dt><dd class="mono">${esc(r.id)}</dd>
          <dt>Paper fingerprint</dt><dd class="hash">0x${r.paperHash}</dd>
          <dt>Report fingerprint</dt><dd class="hash">0x${r.reportHash}</dd>
          <dt>Engine</dt><dd class="mono">${esc(r.engine)}</dd>
          <dt>Created</dt><dd>${fmtDate(r.createdAt)}</dd>
          <dt>Audit log</dt><dd><span class="pill cat-sup">Recorded in local audit log</span></dd>
        </dl>
        <div class="note" style="margin-top:16px">${ic("info")}<span>The paper fingerprint is a SHA-256 hash of the normalised paper text. The report fingerprint covers the claims and their categories, so any later edit to the paper or the report can be detected on the Integrity Check page.</span></div>
        <div class="actions" style="margin-top:14px"><a class="btn primary" href="#/integrity?id=${esc(r.id)}">${ic("shield")}Verify this report</a></div></div>`;
    };
    const tabs = { claims: showClaims, refs: showRefs, int: showInt };
    $$("#rTabs button").forEach((t) => (t.onclick = () => { $$("#rTabs button").forEach((x) => x.classList.toggle("on", x === t)); tabs[t.dataset.t](); hydrateIcons(body); }));
    showClaims();
    $("#dl").onclick = () => download(r.id + ".peerproof.json", JSON.stringify(r, null, 2));
    $("#pr").onclick = () => window.print();
    $("#del").onclick = () => { if (confirm("Delete report " + r.id + " from this browser?")) { store.remove(r.id); toast("Report deleted"); location.hash = "#/reports"; } };
  }

  /* ================= Integrity check ================= */
  function renderIntegrity() {
    const list = store.all();
    const pre = (location.hash.match(/id=([^&]+)/) || [])[1];
    const state = { report: pre ? store.get(decodeURIComponent(pre)) : null, reportName: "", paperText: null, paperName: "" };
    if (state.report) state.reportName = state.report.id + " (saved)";
    view.innerHTML = `
      ${head("Integrity Check", "Recomputes fingerprints in your browser and compares them with the values recorded in a PeerProof report.")}
      <div class="grid g3">
        <div class="card" style="padding:16px">
          <div class="file-card" style="cursor:default"><div class="t">Report</div>
            <select id="selRep" style="width:100%;margin-top:6px;border:1px solid var(--line);border-radius:7px;padding:6px;background:#fbfdfb;font-size:12px">
              <option value="">Choose a saved report…</option>${list.map((r) => `<option value="${esc(r.id)}" ${state.report && state.report.id === r.id ? "selected" : ""}>${esc(r.id)} — ${esc(r.title.slice(0, 40))}</option>`).join("")}
            </select></div>
          <label class="file-card ${""}" id="repCard" style="margin-top:10px"><div class="t">…or upload report JSON</div><div class="f" id="repName">Choose file…</div><input type="file" id="repFile" accept=".json,application/json"></label>
        </div>
        <div class="card" style="padding:16px">
          <label class="file-card" id="paperCard"><div class="t">Paper file (recommended)</div><div class="f" id="paperName">Choose file… (.txt, .md, .pdf, .docx)</div><input type="file" id="paperFile" accept=".txt,.md,.pdf,.docx,text/plain"></label>
          <div class="small muted" style="margin-top:10px">Used to check that the paper has not changed since it was verified.</div>
        </div>
        <div class="card" style="padding:16px">
          <div class="file-card" style="cursor:default"><div class="t">…or paste paper text</div>
            <textarea id="paperPaste" style="margin-top:6px;min-height:70px;font-size:12px" placeholder="Paste the paper text"></textarea></div>
          <button class="btn sm soft" id="useSample" style="margin-top:8px">${ic("sparkle")}Use sample paper text</button>
        </div>
      </div>
      <div class="actions" style="margin-top:16px"><button class="btn primary" id="runInt">${ic("shield")}Run integrity check</button></div>
      <div id="intOut" style="margin-top:16px"></div>`;

    const setRep = () => { const c = $("#repCard"); $("#repName").textContent = state.reportName && !$("#selRep").value ? state.reportName : "Choose file…"; c.classList.toggle("has", !!(state.reportName && !$("#selRep").value)); };
    $("#selRep").onchange = (e) => { state.report = e.target.value ? store.get(e.target.value) : null; state.reportName = state.report ? state.report.id : ""; setRep(); };
    $("#repFile").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { state.report = JSON.parse(await f.text()); state.reportName = f.name; $("#selRep").value = ""; setRep(); toast("Report loaded"); }
      catch (err) { toast("That file is not a valid report JSON"); }
    };
    $("#paperFile").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { state.paperText = await readFileText(f); state.paperName = f.name; $("#paperName").textContent = f.name; $("#paperCard").classList.add("has"); $("#paperPaste").value = ""; }
      catch (err) { toast(err.message || "Could not read file"); }
    };
    $("#paperPaste").oninput = (e) => { state.paperText = e.target.value || null; state.paperName = "pasted text"; $("#paperName").textContent = "Choose file… (.txt, .md, .pdf, .docx)"; $("#paperCard").classList.remove("has"); };
    $("#useSample").onclick = () => { $("#paperPaste").value = SAMPLE.text; state.paperText = SAMPLE.text; state.paperName = "pasted text"; toast("Sample text pasted — edit a word to simulate tampering"); };
    $("#runInt").onclick = () => {
      if (!state.report || !state.report.reportHash) { toast("Choose a saved report or upload a report JSON first"); return; }
      const res = E.verifyIntegrity(state.report, state.paperText);
      const logged = store.all().find((x) => x.id === state.report.id && x.reportHash === state.report.reportHash);
      const allOk = res.reportIntact && res.paperMatches !== false;
      const row = (ok, title, detail) => `<div class="check-row"><div class="check-ic ${ok === null ? "na" : ok ? "ok" : "bad"}">${ok === null ? ICONS.info : ok ? ICONS.check : ICONS.x}</div><div><b>${title}</b><div class="small muted">${detail}</div></div></div>`;
      $("#intOut").innerHTML = `<div class="fade-in stack">
        <div class="verdict ${allOk ? "ok" : "bad"}">${allOk ? ICONS.checkCircle : ICONS.alert}<div>${allOk ? (res.paperMatches ? "Verified — the paper and report match their recorded fingerprints." : "Report is intact. Add the paper to also confirm the paper itself.") : "Mismatch detected — the paper or report has changed since verification."}</div></div>
        <div class="card">
          ${row(res.reportIntact, res.reportIntact ? "Report fingerprint intact" : "Report has been modified", `Recorded <span class="hash">${shortHash(state.report.reportHash)}</span>`)}
          ${row(res.paperMatches, res.paperMatches === null ? "Paper not provided" : res.paperMatches ? "Paper matches recorded fingerprint" : "Paper does not match recorded fingerprint",
            res.paperMatches === null ? "Upload or paste the paper to check it." : `Recorded <span class="hash">${shortHash(state.report.paperHash)}</span> · Recomputed <span class="hash">${shortHash(res.recomputedPaperHash)}</span>`)}
          ${row(logged ? true : null, logged ? "Found in local audit log" : "Not found in this browser's audit log", logged ? "Recorded on " + fmtDate(logged.createdAt) : "The report may have been created on another device.")}
        </div></div>`;
    };
  }

  /* ================= Methodology ================= */
  function renderMethodology() {
    const steps = [
      ["Input", "Obtain a research paper in a supported digital text format (.txt, .md, .pdf, .docx or pasted text)."],
      ["Text processing", "Normalise the text, detect section headings, split sentences and extract the reference list."],
      ["Claim identification", "Score each sentence with cues: finding verbs, effect/comparison words, quantitative values and citations."],
      ["Citation mapping", "Detect [1], [2–4], (Author, 2020) and Author (2020) citations and link them to reference entries."],
      ["Source review", "Compare claim wording with cited-source text: term overlap, best-matching sentence, numbers and hedging."],
      ["Classification", "Assign an indicative category and record a short rationale and an uncertainty note."],
      ["Report generation", "Present claims, linked references, warnings and a summary; export JSON with SHA-256 fingerprints."],
      ["Validation", "Test on sample papers and compare system suggestions with manually reviewed claims."],
    ];
    const cats = [
      [C.SUPPORTED, "Available source material appears to support the claim.", "Match score ≥ 55%, numbers agree, no hedging conflict."],
      [C.PARTIAL, "The source appears to support only part of the claim or adds important qualifications.", "Match 30–55%, or a numeric mismatch, or a strong claim vs. hedged source."],
      [C.UNVERIFIED, "Sufficient supporting evidence could not be located from the material available.", "No citation, no source text attached, or match below 15%."],
      [C.REVIEW, "The relationship is ambiguous, context-dependent, or needs expert judgement.", "Broken citation, negative finding in source, or weak match (15–30%)."],
    ];
    view.innerHTML = `${head("Methodology", "How PeerProof turns a research paper into an explainable verification report.")}
      <div class="card"><h2>Workflow</h2><div class="pipeline">${steps.map((s, i) => `<div class="pipe"><div class="n">${i + 1}</div><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join("")}</div></div>
      <div class="card" style="margin-top:16px"><h2>Verification categories</h2>
        <div class="grid g2">${cats.map((c) => `<div class="claim k-${catKey(c[0])}" style="margin:0">${pill(c[0])}<p style="margin:8px 0 4px">${c[1]}</p><div class="small muted"><b>Rule in this prototype:</b> ${c[2]}</div></div>`).join("")}</div>
        <div class="note" style="margin-top:14px">${ic("info")}<span>These labels are preliminary indicators, not proof of truth or falsity. Each result includes the claim, citation/reference information when available, a brief rationale, and its uncertainty.</span></div>
      </div>
      <div class="grid g2" style="margin-top:16px">
        <div class="card"><h2>How support is measured</h2>
          <ul style="margin:0;padding-left:18px;line-height:1.8">
            <li>Stop-words are removed and words are reduced to stems.</li>
            <li><b>Best-sentence overlap</b>: share of claim terms found in the closest source sentence (60% weight).</li>
            <li><b>Coverage</b>: share of claim terms found anywhere in the source (40% weight).</li>
            <li><b>Numeric check</b>: numbers in the claim must appear in the source.</li>
            <li><b>Hedging check</b>: strong words (“prove”, “all”, “always”) vs. hedged sources (“may”, “pilot”, “limited”).</li>
            <li><b>Negation check</b>: source says “not significant”, “did not”, “no effect”.</li>
          </ul></div>
        <div class="card"><h2>Scope, limitations &amp; ethics</h2>
          <ul style="margin:0;padding-left:18px;line-height:1.8">
            <li>An academic prototype, not a production-grade scientific verification service.</li>
            <li>Results depend on document quality, reference availability and the source text supplied.</li>
            <li>The system may miss claims or misread context, so every output requires human review.</li>
            <li>AI assessments are never presented as definitive scientific conclusions.</li>
            <li>Papers are processed locally; only fingerprints and results are stored.</li>
          </ul></div>
      </div>`;
  }

  /* ================= About ================= */
  function renderAbout() {
    const list = store.all();
    const team = [["Chirag Pardeshi", "3022411017"], ["Saee Nimbalkar", "3022411019"], ["Sharvari Chinchkar", "3022411015"]];
    const initials = (n) => n.split(" ").map((x) => x[0]).join("");
    view.innerHTML = `${head("About &amp; System Info", "Project details and the technical configuration of this demo.")}
      <div class="card"><h2>Project</h2>
        <dl class="info">
          <dt>Title</dt><dd>PeerProof — AI-Powered Research Paper Verification and Integrity System</dd>
          <dt>Type</dt><dd>Research / Innovation</dd>
          <dt>School</dt><dd>School of Science and Mathematics, Deccan Education Society Pune University</dd>
          <dt>Academic year</dt><dd>2026–27 · Semester V</dd>
          <dt>Project guide</dt><dd>Smita Patil</dd>
          <dt>Aim</dt><dd>To design an AI-assisted system for preliminary research-paper claim and citation verification.</dd>
        </dl>
        <h3 style="margin-top:18px">Team</h3>
        <div class="team">${team.map((t) => `<div class="person"><div class="avatar">${initials(t[0])}</div><div><b>${t[0]}</b><div class="small muted">${t[1]}</div></div></div>`).join("")}</div>
      </div>
      <div class="grid g2" style="margin-top:16px">
        <div class="card"><h2>System info</h2>
          <dl class="info">
            <dt>Engine</dt><dd class="mono">${esc(E.ENGINE_VERSION)}</dd>
            <dt>Processing</dt><dd>In-browser (no server, no upload)</dd>
            <dt>Fingerprints</dt><dd>SHA-256 (pure JavaScript)</dd>
            <dt>File support</dt><dd>.txt, .md, pasted text · .pdf via pdf.js · .docx via mammoth.js (loaded on demand)</dd>
            <dt>Audit log</dt><dd>Browser localStorage · ${list.length} report(s) · ${(store.bytes() / 1024).toFixed(1)} KB</dd>
            <dt>Self-test</dt><dd id="selfTest">running…</dd>
          </dl>
          <div class="actions" style="margin-top:14px"><button class="btn danger sm" id="wipe">${ic("trash")}Clear local audit log</button></div>
        </div>
        <div class="card"><h2>Responsible use</h2>
          <p>PeerProof supports a reader's review; it does not replace expert judgement or certify that a paper is scientifically correct.</p>
          <ul style="padding-left:18px;line-height:1.8;margin:0">
            <li>Outputs are indicative and always require human review.</li>
            <li>Cite sources appropriately and handle research documents responsibly.</li>
            <li>The sample paper in this demo is synthetic and its references are fictional.</li>
            <li>Evaluation results should only reflect tests actually performed.</li>
          </ul>
        </div>
      </div>`;
    const ok = E.sha256("abc") === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
    const sr = E.analyze(SAMPLE);
    $("#selfTest").innerHTML = ok && sr.claims.length > 0 ? `<span class="pill cat-sup">Passed</span> <span class="small muted">SHA-256 test vector · sample paper: ${sr.claims.length} claims</span>` : `<span class="pill cat-rev">Failed</span>`;
    $("#wipe").onclick = () => { if (confirm("Delete all reports stored in this browser?")) { store.save([]); toast("Audit log cleared"); route(); } };
  }

  /* ---------------- Boot ---------------- */
  $("#engineVersion").textContent = E.ENGINE_VERSION;
  $("#menuBtn").onclick = () => $("#sidebar").classList.toggle("open");
  hydrateIcons(document);
  window.addEventListener("hashchange", route);
  route();
})();
