# Pactloom

A Windows desktop app where Ziad Hossam, a freelance software engineer in Cairo, fills in and exports the ten documents of a client project: proposal, one-page contract, terms, invoice, welcome pack, kick-off, mid-project report, final deliverables, completion report and proposal email.

## Who and where

One user, Ziad, at his desk between client calls. He opens it to prepare a proposal after a discovery call, to issue an invoice at a milestone, or to send a report. Sessions are short and task-shaped: pick the client, pick the document, fill the gaps, export.

## What success looks like

- Every field a document needs is visible next to a live A4 preview of that document.
- Missing information is obvious (counted per document, highlighted in the preview) and reachable in one click.
- Export produces the same branded PDFs as `client-kit/build.mjs`, with no other tools installed.

## Constraints

- Brand: navy #001F49, sand #F7E7CE, paper #FFF8EC, Geist and DM Mono, the Z. mark.
- Theme follows Windows light/dark, with a manual override (chosen by Ziad).
- Mode: Operate. The documents are the product; the app is a quiet, fast tool around them.
- Data stays on disk as plain `kit.config.json` and `09-proposal-email.md` per client, so the command-line build keeps working.
