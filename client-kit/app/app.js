import { SECTIONS, DOC_SECTIONS, DOC_ICONS } from "./schema.js";

const $ = (sel) => document.querySelector(sel);
const el = (tag, props = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const kid of kids.flat()) if (kid != null) node.append(kid);
  return node;
};
const iconUrl = (name) => `url("node_modules/lucide-static/icons/${name}.svg")`;
const icon = (name) => { const i = el("i", { className: "icon" }); i.style.setProperty("--src", iconUrl(name)); return i; };
const hydrateIcons = (root = document) => root.querySelectorAll("[data-icon]").forEach((i) => i.style.setProperty("--src", iconUrl(i.dataset.icon)));
document.documentElement.style.setProperty("--chev", iconUrl("chevron-down"));

const state = { documents: [], clients: [], slug: null, cfg: null, email: "", doc: "01-proposal", html: {}, zoom: null, gapIndex: -1 };

// ---------- config access ----------
const get = (path) => (path === "$email" ? state.email : path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), state.cfg));
function set(path, value) {
  if (path === "$email") { state.email = value; return changed(); }
  const keys = path.split("."), last = keys.pop();
  let o = state.cfg;
  for (const k of keys) o = o[k] ??= {};
  o[last] = value;
  changed();
}

// Dates are stored the way the documents print them ("23 Sep 2026"); the picker needs ISO.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const toIso = (s) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fromIso = (iso) => { if (!iso) return ""; const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const blank = (x) => x === null || x === undefined || x === "";
const numOrNull = (s) => (s === "" ? null : Number(s));

// ---------- saving and rendering ----------
let renderTimer, saveTimer;
function changed() {
  $("#saveState").textContent = "Editing";
  clearTimeout(renderTimer); renderTimer = setTimeout(render, 180);
  clearTimeout(saveTimer); saveTimer = setTimeout(save, 700);
}
async function save() {
  try {
    state.clients = await kit.save(state.slug, state.cfg, state.email);
    $("#saveState").textContent = "Saved";
    renderClientPicker();
  } catch (err) { toast(`Could not save: ${err.message}`, null, true); $("#saveState").textContent = "Not saved"; }
}

const PREVIEW_CSS = `<style>
@media screen {
  html { background: transparent; padding: 28px 0 60px; }
  body { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 18mm 22mm; background: #fff; box-shadow: var(--page-shadow, 0 30px 60px -30px rgba(0,31,73,.45)); border-radius: 2px; }
  ::-webkit-scrollbar { width: 12px; } ::-webkit-scrollbar-thumb { background: rgba(120,120,120,.35); border: 4px solid transparent; background-clip: padding-box; border-radius: 99px; }
  .ph { cursor: pointer; transition: box-shadow .2s; } .ph:hover { box-shadow: 0 0 0 2px #C99A2E; }
  .ph.is-current { box-shadow: 0 0 0 3px #C99A2E; }
}
</style>`;

async function render() {
  const docs = await kit.render(state.cfg, state.email);
  state.html = Object.fromEntries(docs);
  renderDocList();
  paintPreview();
  renderGapLine();
}

const gapCount = (name) => (state.html[name]?.match(/class="ph"/g) || []).length;

function paintPreview() {
  const frame = $("#page");
  const scroll = frame.contentWindow?.scrollY ?? 0;
  // The page sits on the app's stage colour; set it explicitly so the iframe never paints white around it.
  const stage = getComputedStyle(document.documentElement).getPropertyValue("--stage").trim();
  const html = (state.html[state.doc] || "").replace("</head>", `${PREVIEW_CSS}<style>@media screen { html { background: ${stage}; color-scheme: light; } }</style></head>`);
  frame.onload = () => {
    const w = frame.contentWindow;
    applyZoom();
    w.scrollTo(0, scroll);
    w.document.querySelectorAll(".ph").forEach((ph, i) => ph.addEventListener("click", () => jumpToField(i)));
  };
  frame.srcdoc = html;
}

// ---------- zoom ----------
const PAGE_PX = 794; // 210mm at 96dpi
function fitZoom() { return Math.min(1.25, Math.max(.4, ($("#stage").clientWidth - 64) / PAGE_PX)); }
function applyZoom() {
  const z = state.zoom ?? fitZoom();
  const doc = $("#page").contentDocument;
  if (doc?.documentElement) doc.documentElement.style.zoom = z;
  $("#zoomFit").textContent = `${Math.round(z * 100)}%`;
}
$("#zoomIn").onclick = () => { state.zoom = Math.min(2, (state.zoom ?? fitZoom()) + .1); applyZoom(); };
$("#zoomOut").onclick = () => { state.zoom = Math.max(.4, (state.zoom ?? fitZoom()) - .1); applyZoom(); };
$("#zoomFit").onclick = () => { state.zoom = null; applyZoom(); };
new ResizeObserver(() => { if (state.zoom === null) applyZoom(); }).observe($("#stage"));

// ---------- sidebar ----------
function renderClientPicker() {
  const sel = $("#clientSelect");
  sel.replaceChildren(...state.clients.map((c) => el("option", { value: c.slug, textContent: c.project ? `${c.name}  ·  ${c.project}` : c.name, selected: c.slug === state.slug })));
  const current = state.clients.find((c) => c.slug === state.slug);
  const title = state.documents.find(([n]) => n === state.doc)?.[1];
  $("#crumbs").replaceChildren(el("b", { textContent: current?.name ?? "" }), `  /  ${title}`);
}

function renderDocList() {
  const list = $("#docList");
  list.replaceChildren(...state.documents.map(([name, title], i) => {
    const gaps = gapCount(name);
    const badge = gaps ? el("span", { className: "badge", textContent: String(gaps), title: `${gaps} empty field${gaps > 1 ? "s" : ""}` })
      : el("span", { className: "badge done", title: "Every field is filled" }, icon("circle-check"));
    const btn = el("button", { className: "doc", type: "button" }, icon(DOC_ICONS[name]), el("span", { className: "name" }, el("span", { className: "num", textContent: name.slice(0, 3).replace("-", "") }), title), badge);
    if (name === state.doc) btn.setAttribute("aria-current", "page");
    btn.onclick = () => selectDoc(name);
    btn.title = title;
    return btn;
  }));
}

function renderGapLine() {
  const n = gapCount(state.doc);
  $("#docGaps").replaceChildren(n ? el("span", {}, el("b", { textContent: `${n} empty field${n > 1 ? "s" : ""}` }), " show in yellow on the page. Click one to jump to it.")
    : el("span", { className: "ok", textContent: "Every field is filled. Ready to export." }));
  $("#nextGapBtn").disabled = !n;
}

function selectDoc(name) {
  state.doc = name; state.gapIndex = -1;
  $("#docTitle").textContent = state.documents.find(([n]) => n === name)[1];
  renderClientPicker(); renderDocList(); renderForm(); paintPreview(); renderGapLine();
  $("#form").scrollTop = 0;
}

// ---------- form ----------
function renderForm() {
  const form = $("#form");
  const keys = DOC_SECTIONS[state.doc];
  const sections = keys.map((k, i) => section(k, i > 0 && keys.length > 3 && i >= 3));
  sections.push(section("studio", true));
  form.replaceChildren(...sections);
}

function section(key, collapsed) {
  const { title, icon: ic, fields } = SECTIONS[key];
  const grid = el("div", { className: "grid" }, fields.map(field));
  if (!collapsed) return el("section", { className: "section" }, el("h2", {}, icon(ic), title), grid);
  return el("details", { className: "section" }, el("summary", {}, icon(ic), title), grid);
}

let uid = 0;
function field(f) {
  const id = `f${uid++}`;
  const wrap = el("div", { className: `field${f.half ? " half" : ""}` });
  const label = el("label", { htmlFor: id, textContent: f.label });
  const control = buildControl(f, id);
  if (["list", "table", "chips"].includes(f.type)) wrap.append(el("span", { className: "field-label", textContent: f.label }), control);
  else wrap.append(label, control);
  if (f.hint) wrap.append(el("p", { className: "hint", textContent: f.hint }));
  return wrap;
}

const markEmpty = (input) => input.classList.toggle("empty", blank(input.value));

function input(value, onInput, { type = "text", placeholder = "", id } = {}) {
  const i = el("input", { type, value: value ?? "", placeholder: placeholder || "Not filled yet" });
  if (id) i.id = id;
  markEmpty(i);
  i.addEventListener("input", () => { markEmpty(i); onInput(i.value); });
  return i;
}
function dateInput(value, onInput, id) {
  const i = input(toIso(value), (v) => onInput(fromIso(v)), { type: "date", id });
  return i;
}
function moneyInput(value, onInput, id) {
  const i = input(blank(value) ? "" : value, (v) => onInput(numOrNull(v)), { type: "number", id, placeholder: "0" });
  i.min = 0; i.step = "any";
  return el("div", { className: "affix money no-arrow" }, i, el("span", { className: "unit", textContent: state.cfg.money?.currency || "EGP" }));
}
function selectInput(f, value, onChange, id) {
  const opts = [...f.options];
  if (!blank(value) && !opts.includes(String(value))) opts.unshift(String(value));
  const s = el("select", { id }, el("option", { value: "", textContent: "Choose" }), opts.map((o) => el("option", { value: o, textContent: o, selected: String(value) === o })));
  s.onchange = () => { markEmpty(s); onChange(f.number ? numOrNull(s.value) : s.value); };
  markEmpty(s);
  const box = el("div", { className: "select-wrap affix" }, s, f.suffix ? el("span", { className: "unit", textContent: f.suffix }) : null, icon("chevron-down"));
  return box;
}

function buildControl(f, id) {
  const value = get(f.path);
  const put = (v) => set(f.path, v);
  switch (f.type) {
    case "text": return input(value, put, { id, placeholder: f.placeholder });
    case "date": return dateInput(value, put, id);
    case "money": return moneyInput(value, put, id);
    case "select": return selectInput(f, value, put, id);
    case "textarea": case "markdown": {
      const t = el("textarea", { id, value: value ?? "", placeholder: "Not filled yet", className: f.type === "markdown" ? "markdown" : "" });
      markEmpty(t); t.oninput = () => { markEmpty(t); put(t.value); };
      return t;
    }
    case "range": {
      const out = el("output", { textContent: blank(value) ? "Not set" : `${value}%` });
      const r = el("input", { type: "range", id, min: 0, max: 100, step: 5, value: value ?? 0 });
      r.oninput = () => { out.textContent = `${r.value}%`; put(Number(r.value)); };
      return el("div", { className: "range" }, r, out);
    }
    case "chips": {
      const chosen = new Set(value || []);
      return el("div", { className: "chips", role: "group" }, f.options.map((o) => {
        const c = el("button", { type: "button", className: "chip", textContent: o });
        c.setAttribute("aria-pressed", chosen.has(o));
        c.onclick = () => {
          chosen.has(o) ? chosen.delete(o) : chosen.add(o);
          c.setAttribute("aria-pressed", chosen.has(o));
          put(f.options.filter((x) => chosen.has(x)));
        };
        return c;
      }));
    }
    case "list": return listControl(f, value);
    case "table": return tableControl(f, value);
  }
}

function listControl(f, value) {
  const items = Array.isArray(value) ? [...value] : [];
  if (f.fixed) while (items.length < f.fixed.length) items.push("");
  const rows = el("div", { className: "rows" });
  const commit = () => set(f.path, [...items]);
  const draw = () => rows.replaceChildren(...items.map((item, i) => {
    const update = (v) => { items[i] = v; commit(); };
    const control = f.itemType === "date" ? dateInput(item, update) : input(item, update);
    const row = el("div", { className: "row-item" });
    if (f.fixed) row.append(el("span", { className: "lead", textContent: f.fixed[i] }), control);
    else {
      const del = el("button", { type: "button", className: "icon-btn", title: "Remove" }, icon("trash-2"));
      del.onclick = () => { items.splice(i, 1); commit(); draw(); };
      row.append(control, del);
    }
    return row;
  }), ...(f.fixed ? [] : [addButton(f.add, () => { items.push(""); commit(); draw(); rows.querySelectorAll("input")[items.length - 1]?.focus(); })]));
  draw();
  return rows;
}

function tableControl(f, value) {
  const items = Array.isArray(value) ? value.map((r) => ({ ...r })) : [];
  const rows = el("div", { className: "rows" });
  const commit = () => { set(f.path, items.map((r) => ({ ...r }))); drawTotal(); };
  const total = el("div", { className: "total-line" });
  const drawTotal = () => {
    if (f.path === "money.items") {
      const sum = items.reduce((a, r) => a + (Number(r.amount) || 0), 0) - (Number(state.cfg.money?.discount) || 0);
      total.replaceChildren("Total", el("b", { textContent: `${state.cfg.money?.currency || "EGP"} ${sum.toLocaleString("en-US")}` }));
    } else if (f.path === "money.milestones") {
      const sum = items.reduce((a, r) => a + (Number(r.percent) || 0), 0);
      total.className = `total-line${sum === 100 ? "" : " warn"}`;
      total.replaceChildren(sum === 100 ? "Shares add up to" : "Shares should add up to 100%. Now", el("b", { textContent: `${sum}%` }));
    }
  };
  const flex = (c) => ({ style: `flex:${c.grow} 1 0` });
  const head = el("div", { className: "table-head" }, f.columns.map((c) => el("span", { textContent: c.label, ...flex(c) })));
  const cell = (row, c) => {
    const update = (v) => { row[c.key] = v; commit(); };
    let node;
    if (c.type === "date") node = dateInput(row[c.key], update);
    else if (c.type === "money") node = input(row[c.key] ?? "", (v) => update(numOrNull(v)), { type: "number", placeholder: "0" });
    else if (c.type === "percent") node = input(row[c.key] ?? "", (v) => update(numOrNull(v)), { type: "number", placeholder: "0" });
    else if (c.type === "select") node = selectInput({ options: c.options }, row[c.key], update);
    else if (c.type === "combo") {
      const listId = `dl${uid++}`;
      node = el("div", {}, input(row[c.key], update), el("datalist", { id: listId }, c.options.map((o) => el("option", { value: o }))));
      node.firstChild.setAttribute("list", listId);
    } else node = input(row[c.key], update);
    node.style.flex = `${c.grow} 1 0`;
    return node;
  };
  const draw = () => rows.replaceChildren(head, ...items.map((row, i) => {
    const del = el("button", { type: "button", className: "icon-btn", title: "Remove row" }, icon("trash-2"));
    del.onclick = () => { items.splice(i, 1); commit(); draw(); };
    return el("div", { className: "row-item" }, f.columns.map((c) => cell(row, c)), del);
  }), addButton(f.add, () => { items.push(Object.fromEntries(f.columns.map((c) => [c.key, ["money", "percent"].includes(c.type) ? null : c.type === "select" ? c.options[0] : ""]))); commit(); draw(); }), total);
  draw(); drawTotal();
  return rows;
}

const addButton = (label, onClick) => { const b = el("button", { type: "button", className: "add-row" }, icon("plus"), label); b.onclick = onClick; return b; };

// ---------- gaps: preview highlight to form field ----------
function emptyControls() { return [...$("#form").querySelectorAll("input.empty, select.empty, textarea.empty")]; }
function jumpToField(gapIndex) {
  const page = $("#page").contentDocument;
  page.querySelectorAll(".ph.is-current").forEach((p) => p.classList.remove("is-current"));
  const ph = page.querySelectorAll(".ph")[gapIndex];
  if (ph) { ph.classList.add("is-current"); ph.scrollIntoView({ block: "center", behavior: "smooth" }); }
  // Placeholders read like "[Client name]"; match them to a field label, else take the next empty field.
  const label = ph?.textContent.replace(/[[\]]/g, "").trim().toLowerCase() ?? "";
  const empties = emptyControls();
  const byLabel = empties.find((c) => {
    const l = c.closest(".field")?.querySelector("label, .field-label")?.textContent.toLowerCase() ?? "";
    return label && (l.includes(label) || label.includes(l));
  });
  const target = byLabel ?? empties[gapIndex % Math.max(empties.length, 1)];
  if (!target) return;
  target.closest("details")?.setAttribute("open", "");
  target.scrollIntoView({ block: "center", behavior: "smooth" });
  target.focus({ preventScroll: true });
  target.classList.remove("flash"); void target.offsetWidth; target.classList.add("flash");
}
$("#nextGapBtn").onclick = () => {
  const n = gapCount(state.doc);
  if (!n) return;
  state.gapIndex = (state.gapIndex + 1) % n;
  jumpToField(state.gapIndex);
};

// ---------- clients ----------
async function openClient(slug) {
  const data = await kit.load(slug);
  if (!data.cfg) return toast("That client's settings file could not be read.", null, true);
  Object.assign(state, { slug, cfg: data.cfg, email: data.email });
  renderClientPicker(); renderForm();
  await render();
  $("#saveState").textContent = "Saved";
}
$("#clientSelect").onchange = (e) => openClient(e.target.value);
$("#newClientBtn").onclick = () => { $("#newClientForm").hidden = false; $("#newClientBtn").hidden = true; $("#newClientName").focus(); };
const closeNew = () => { $("#newClientForm").hidden = true; $("#newClientBtn").hidden = false; $("#newClientName").value = ""; };
$("#newClientCancel").onclick = closeNew;
$("#newClientForm").onsubmit = async (e) => {
  e.preventDefault();
  const name = $("#newClientName").value.trim();
  if (!name) return;
  const slug = await kit.newClient(name);
  state.clients = await kit.clients();
  closeNew();
  state.doc = "01-proposal";
  await openClient(slug);
  selectDoc("01-proposal");
};
$("#newClientName").onkeydown = (e) => { if (e.key === "Escape") closeNew(); };

// ---------- export ----------
async function exportDocs(names, button) {
  clearTimeout(saveTimer); await save();
  button.disabled = true;
  const original = button.lastChild.textContent;
  button.lastChild.textContent = "Exporting";
  try {
    const res = await kit.exportPdfs(state.slug, names, state.cfg, state.email);
    const gaps = names.reduce((a, n) => a + gapCount(n), 0);
    const note = gaps ? ` ${gaps} empty field${gaps > 1 ? "s are" : " is"} still marked in yellow.` : "";
    toast(res.count === 1 ? `PDF saved.${note}` : `${res.count} PDFs saved.${note}`, { label: res.single ? "Open" : "Show folder", run: () => (res.single ? kit.open(res.single) : kit.reveal(res.outDir)) });
  } catch (err) {
    toast(`Export failed: ${err.message}`, null, true);
  } finally { button.disabled = false; button.lastChild.textContent = original; }
}
$("#exportBtn").onclick = (e) => exportDocs([state.doc], e.currentTarget);
$("#exportAllBtn").onclick = (e) => exportDocs(state.documents.map(([n]) => n), e.currentTarget);
$("#openFolderBtn").onclick = () => kit.reveal(`${state.folder}`);

let toastTimer;
function toast(message, action, isError = false) {
  const t = $("#toast");
  t.className = `toast${isError ? " error" : ""}`;
  t.replaceChildren(el("span", { textContent: message }), action ? el("button", { type: "button", textContent: action.label, onclick: () => { action.run(); t.hidden = true; } }) : null);
  t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 7000);
}

// ---------- theme ----------
async function setTheme(theme) {
  const dark = await kit.theme(theme);
  document.documentElement.toggleAttribute("data-dark", dark);
  document.querySelectorAll(".theme-switch button").forEach((b) => b.setAttribute("aria-checked", b.dataset.theme === theme));
  if (state.cfg) paintPreview();
}
document.querySelectorAll(".theme-switch button").forEach((b) => (b.onclick = () => setTheme(b.dataset.theme)));
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (document.querySelector('.theme-switch [data-theme="system"]').getAttribute("aria-checked") !== "true") return;
  document.documentElement.toggleAttribute("data-dark", e.matches);
  paintPreview();
});

// ---------- keyboard ----------
document.addEventListener("keydown", (e) => {
  if (!e.ctrlKey) return;
  if (e.key === "s") { e.preventDefault(); clearTimeout(saveTimer); save(); }
  if (e.key === "e") { e.preventDefault(); $("#exportBtn").click(); }
  if (e.key === "g") { e.preventDefault(); $("#nextGapBtn").click(); }
  if (/^[0-9]$/.test(e.key)) { const d = state.documents[(Number(e.key) + 9) % 10]; if (d) { e.preventDefault(); selectDoc(d[0]); } }
});

// ---------- start ----------
(async () => {
  hydrateIcons();
  const init = await kit.init();
  Object.assign(state, { documents: init.documents, clients: init.clients });
  state.folderRoot = init.assets.replace(/assets$/, "clients");
  await setTheme(init.theme);
  const slug = init.clients.some((c) => c.slug === init.lastClient) ? init.lastClient : init.clients[0]?.slug;
  await openClient(slug);
  selectDoc("01-proposal");
})();
Object.defineProperty(state, "folder", { get: () => `${state.folderRoot}\\${state.slug}` });
