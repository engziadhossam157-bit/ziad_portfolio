// Copies what the window needs into the app folder: brand fonts and logo from client-kit/assets,
// and the Lucide icons the UI uses. Runs before `npm start` and `npm run dist`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
fs.cpSync(path.join(app, "..", "assets"), path.join(app, "assets"), { recursive: true });

const ICONS = ["arrow-down-to-line", "badge-check", "briefcase", "chart-gantt", "chevron-down", "circle-check", "crosshair", "download",
  "file-signature", "file-text", "folder-open", "hand-heart", "mail", "monitor", "moon", "package-check", "plus", "receipt", "rocket",
  "scroll-text", "settings-2", "sun", "trash-2", "user-round", "zoom-in", "zoom-out"];
fs.mkdirSync(path.join(app, "icons"), { recursive: true });
for (const name of ICONS) fs.copyFileSync(path.join(app, "node_modules", "lucide-static", "icons", `${name}.svg`), path.join(app, "icons", `${name}.svg`));
console.log(`synced assets and ${ICONS.length} icons`);
