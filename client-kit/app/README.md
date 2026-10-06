# Pactloom

Desktop app for filling in and exporting the client kit documents. Pick a client, pick a document, fill the fields on the left, and the A4 page on the right updates as you type. Empty fields show in yellow on the page and are counted per document in the sidebar.

## Open it

Double-click **Pactloom** on the desktop. To run it from a terminal: `cd client-kit/app`, `npm install` once, then `npm start`.

## Where things are saved

Each client is a folder in `client-kit/clients/` with `kit.config.json`, `09-proposal-email.md`, and a `pdf/` folder for exports. The folder button in the app opens it. These are the same files `node client-kit/build.mjs <config> <output>` reads, so the command line still works.

## Shortcuts

| Keys | Action |
|------|--------|
| Ctrl+S | Save now (it also saves automatically) |
| Ctrl+E | Export the current document as PDF |
| Ctrl+G | Jump to the next empty field |
| Ctrl+1 to Ctrl+9, Ctrl+0 | Switch document |
