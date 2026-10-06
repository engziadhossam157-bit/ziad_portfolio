# Pactloom

Desktop app for filling in and exporting the client kit documents. Pick a client, pick a document, fill the fields on the left, and the A4 page on the right updates as you type. Empty fields show in yellow on the page and are counted per document in the sidebar.

## Install

Run `client-kit/app/dist/Pactloom-Setup-1.0.0.exe`. It installs for your Windows user only (no admin needed), lets you pick the folder, and adds Start menu and desktop shortcuts. Uninstall from Windows Settings > Apps; your client files stay.

To rebuild the installer after changing the app or the documents: `cd client-kit/app`, `npm install` once, then `npm run dist`. To run it without installing: `npm start`.

## Where things are saved

The installed app keeps each client in `Documents\Pactloom\clients\<client>` with `kit.config.json`, `09-proposal-email.md`, and a `pdf/` folder for exports. When run with `npm start` it uses `client-kit/clients/` instead. The folder button in the app opens it. These are the same files `node client-kit/build.mjs <config> <output>` reads, so the command line still works.

## Shortcuts

| Keys | Action |
|------|--------|
| Ctrl+S | Save now (it also saves automatically) |
| Ctrl+E | Export the current document as PDF |
| Ctrl+G | Jump to the next empty field |
| Ctrl+1 to Ctrl+9, Ctrl+0 | Switch document |
