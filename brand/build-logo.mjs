import opentype from "opentype.js";
import fs from "node:fs";
const NAVY = "#001F49", SAND = "#F7E7CE", PAPER = "#FFF8EC";
const geist = opentype.loadSync("node_modules/@fontsource/geist-sans/files/geist-sans-latin-700-normal.woff");
const mono = opentype.loadSync("node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff");

// The mark: a Z cut as one filled shape on a 100-unit grid, plus the period from the "ZIAD." wordmark.
// Bars are 10 units; the diagonal is ~9.2 perpendicular so it reads as the same weight.
// The glyph spans x 24..83 (period included), so it is shifted left 3.5 to sit optically centred.
const Z = "M24 26H70V36L38 64H66V74H24V64L56 36H24Z";
const DOT = { cx: 77, cy: 69, r: 6 };
const glyph = (fill) => `<g transform="translate(-3.5 0)" fill="${fill}"><path d="${Z}"/><circle cx="${DOT.cx}" cy="${DOT.cy}" r="${DOT.r}"/></g>`;
const mark = (bg, fg, rx = 22, scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="${rx}" fill="${bg}"/>${scale === 1 ? glyph(fg) : `<g transform="translate(50 50) scale(${scale}) translate(-50 -50)">${glyph(fg)}</g>`}</svg>`;

// Text set as outlines so the files render the same everywhere without the fonts installed.
function textPath(font, str, x, baseline, size, tracking) {
  let d = "", cx = x;
  for (const ch of str) { const g = font.charToGlyph(ch); d += g.getPath(cx, baseline, size).toPathData(2); cx += (g.advanceWidth / font.unitsPerEm) * size + tracking; }
  return { d, width: cx - x - tracking };
}
function lockup(bg, markBg, markFg, ink, sub) {
  // Optical alignment with the mark: name cap-height starts on the Z's top edge (y 26),
  // the role line sits on the Z's baseline (y 74).
  const cap = (font) => (font.tables.os2.sCapHeight || font.charToGlyph("H").yMax) / font.unitsPerEm;
  const name = textPath(geist, "ZIAD HOSSAM", 127, 26 + cap(geist) * 40, 40, -40 * 0.035);
  const role = textPath(mono, "SOFTWARE ENGINEER", 129, 74, 13.5, 13.5 * 0.16);
  const w = Math.ceil(128 + Math.max(name.width, role.width) + 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 100">${bg ? `<rect width="${w}" height="100" fill="${bg}"/>` : ""}<svg x="0" y="0" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="${markBg}"/>${glyph(markFg)}</svg><path d="${name.d}" fill="${ink}"/><path d="${role.d}" fill="${sub}"/></svg>`;
}

// Run from the repo root: node brand/build-logo.mjs (needs: npm i -D opentype.js@1)
fs.mkdirSync("brand", { recursive: true });
const files = {
  "logo-mark.svg": mark(NAVY, SAND),
  "logo-mark-inverse.svg": mark(SAND, NAVY),
  "logo-mark-mono.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${glyph(NAVY)}</svg>`,
  "logo-lockup.svg": lockup(null, NAVY, SAND, NAVY, "#4E5F76"),
  "logo-lockup-inverse.svg": lockup(null, SAND, NAVY, SAND, "#A9B4CC"),
  "favicon.svg": mark(NAVY, SAND, 24, 1.16),
};
for (const [f, s] of Object.entries(files)) fs.writeFileSync("brand/" + f, s);
console.log(Object.keys(files).join(" "));
