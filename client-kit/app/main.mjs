// Pactloom main process: client workspace on disk, document rendering, PDF export, theme.
import { app, BrowserWindow, ipcMain, nativeTheme, shell } from "electron";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// The document engine (build.mjs, fonts, templates, sample) sits next to the app during development
// and is bundled into resources/kit by the installer.
const kitDir = app.isPackaged ? path.join(process.resourcesPath, "kit") : path.resolve(here, "..");
const { DOCUMENTS, renderKit } = await import(pathToFileURL(path.join(kitDir, "build.mjs")).href);
// Each client is a folder holding kit.config.json, 09-proposal-email.md and an exported pdf/ folder.
// Installed: Documents\Pactloom\clients, so client files survive app updates and uninstalls.
const clientsDir = app.isPackaged ? path.join(app.getPath("documents"), "Pactloom", "clients") : path.join(kitDir, "clients");
const settingsFile = path.join(app.getPath("userData"), "settings.json");

const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } };
const settings = readJson(settingsFile, { theme: "system", lastClient: null });
const saveSettings = () => { fs.mkdirSync(path.dirname(settingsFile), { recursive: true }); fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2)); };
const slugify = (name) => name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "client";
const clientPath = (slug, file = "") => {
  const dir = path.join(clientsDir, path.basename(slug)); // basename: never escape the workspace
  return file ? path.join(dir, file) : dir;
};

/** First run: start the workspace with the TH Marble sample so the app is never empty. */
function seedWorkspace() {
  if (fs.existsSync(clientsDir) && fs.readdirSync(clientsDir).length) return;
  const sample = path.join(kitDir, "samples", "thmarble");
  const dest = clientPath("th-marble-granite");
  fs.mkdirSync(dest, { recursive: true });
  for (const f of ["kit.config.json", "09-proposal-email.md"]) fs.copyFileSync(path.join(sample, f), path.join(dest, f));
}

function listClients() {
  return fs.readdirSync(clientsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(clientPath(d.name, "kit.config.json")))
    .map((d) => {
      const cfg = readJson(clientPath(d.name, "kit.config.json"), {});
      return { slug: d.name, name: cfg.client?.company || cfg.client?.contactName || d.name, project: cfg.project?.name || "" };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function loadClient(slug) {
  const email = clientPath(slug, "09-proposal-email.md");
  return {
    slug,
    cfg: readJson(clientPath(slug, "kit.config.json"), null),
    email: fs.existsSync(email) ? fs.readFileSync(email, "utf8") : fs.readFileSync(path.join(kitDir, "09-proposal-email.md"), "utf8"),
  };
}

function saveClient(slug, cfg, email) {
  fs.mkdirSync(clientPath(slug), { recursive: true });
  // Write to a temp file first so a crash mid-save never leaves a half-written config.
  const target = clientPath(slug, "kit.config.json");
  fs.writeFileSync(target + ".tmp", JSON.stringify(cfg, null, 2));
  fs.renameSync(target + ".tmp", target);
  fs.writeFileSync(clientPath(slug, "09-proposal-email.md"), email);
  settings.lastClient = slug;
  saveSettings();
}

/** A new client starts from the blank template, keeping your own studio details. */
function newClient(name) {
  let slug = slugify(name), n = 2;
  while (fs.existsSync(clientPath(slug))) slug = `${slugify(name)}-${n++}`;
  const cfg = readJson(path.join(kitDir, "kit.config.json"), {});
  cfg.client = { ...cfg.client, company: name.trim() };
  saveClient(slug, cfg, fs.readFileSync(path.join(kitDir, "09-proposal-email.md"), "utf8"));
  return slug;
}

async function exportPdfs(slug, names, cfg, email) {
  const docs = renderKit(cfg, { emailMd: email }).filter(([name]) => names.includes(name));
  const outDir = clientPath(slug, "pdf");
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pactloom-"));
  fs.mkdirSync(outDir, { recursive: true });
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  try {
    for (const [name, html] of docs) {
      const file = path.join(tmpDir, `${name}.html`);
      fs.writeFileSync(file, html);
      await win.loadFile(file);
      await win.webContents.executeJavaScript("document.fonts.ready.then(() => true)");
      const pdf = await win.webContents.printToPDF({ pageSize: "A4", printBackground: true, preferCSSPageSize: true });
      fs.writeFileSync(path.join(outDir, `${name}.pdf`), pdf);
    }
  } finally {
    win.destroy();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  return { outDir, count: docs.length, single: docs.length === 1 ? path.join(outDir, `${docs[0][0]}.pdf`) : null };
}

// Title bar buttons follow the theme; these match --chrome in app.css.
const overlay = () => (nativeTheme.shouldUseDarkColors ? { color: "#00142F", symbolColor: "#F7E7CE", height: 44 } : { color: "#EFE2CB", symbolColor: "#001F49", height: 44 });

function createWindow() {
  const win = new BrowserWindow({
    width: 1480, height: 920, minWidth: 1100, minHeight: 680,
    title: "Pactloom", show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#000E22" : "#F7E7CE",
    titleBarStyle: "hidden", titleBarOverlay: overlay(),
    icon: path.join(here, process.platform === "win32" ? "icon.ico" : "icon.png"),
    webPreferences: { preload: path.join(here, "preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  nativeTheme.on("updated", () => { if (!win.isDestroyed()) win.setTitleBarOverlay(overlay()); });
  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.loadFile(path.join(here, "index.html"));
}

ipcMain.handle("kit:init", () => {
  seedWorkspace();
  return { documents: DOCUMENTS, clients: listClients(), lastClient: settings.lastClient, theme: settings.theme, clientsDir };
});
ipcMain.handle("kit:clients", () => listClients());
ipcMain.handle("kit:load", (_e, slug) => loadClient(slug));
ipcMain.handle("kit:save", (_e, slug, cfg, email) => { saveClient(slug, cfg, email); return listClients(); });
ipcMain.handle("kit:new", (_e, name) => newClient(name));
ipcMain.handle("kit:render", (_e, cfg, email) => renderKit(cfg, { emailMd: email }));
ipcMain.handle("kit:export", (_e, slug, names, cfg, email) => exportPdfs(slug, names, cfg, email));
ipcMain.handle("kit:reveal", (_e, target) => (fs.statSync(target).isDirectory() ? shell.openPath(target) : shell.showItemInFolder(target)));
ipcMain.handle("kit:open", (_e, target) => shell.openPath(target));
ipcMain.handle("kit:theme", (_e, theme) => { nativeTheme.themeSource = theme; settings.theme = theme; saveSettings(); return nativeTheme.shouldUseDarkColors; });

app.whenReady().then(() => {
  nativeTheme.themeSource = settings.theme;
  fs.mkdirSync(clientsDir, { recursive: true });
  seedWorkspace();
  createWindow();
});
app.on("window-all-closed", () => app.quit());
