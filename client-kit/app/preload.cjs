// The only bridge between the window and the disk: a fixed set of named calls.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kit", {
  init: () => ipcRenderer.invoke("kit:init"),
  clients: () => ipcRenderer.invoke("kit:clients"),
  load: (slug) => ipcRenderer.invoke("kit:load", slug),
  save: (slug, cfg, email) => ipcRenderer.invoke("kit:save", slug, cfg, email),
  newClient: (name) => ipcRenderer.invoke("kit:new", name),
  render: (cfg, email) => ipcRenderer.invoke("kit:render", cfg, email),
  exportPdfs: (slug, names, cfg, email) => ipcRenderer.invoke("kit:export", slug, names, cfg, email),
  reveal: (target) => ipcRenderer.invoke("kit:reveal", target),
  open: (target) => ipcRenderer.invoke("kit:open", target),
  theme: (theme) => ipcRenderer.invoke("kit:theme", theme),
});
