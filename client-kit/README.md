# Client kit

Eight branded PDF documents for a client project, plus a proposal email.

| # | File | Send it when |
|---|------|-------------|
| 1 | `out/01-proposal.pdf` | After the discovery call |
| 9 | `09-proposal-email.md` | With the proposal attached |
| 2 | `out/02-contract.pdf` | After the client accepts the proposal |
| 3 | `out/03-invoice.pdf` | With the contract (deposit), then at each payment milestone |
| 4 | `out/04-welcome.pdf` | Once the deposit is paid |
| 5 | `out/05-kickoff.pdf` | Within a day of the kick-off call |
| 6 | `out/06-mid-project-report.pdf` | When the design is approved and development starts |
| 7 | `out/07-final-deliverables.pdf` | At launch and handover |
| 8 | `out/08-project-completion.pdf` | After the final payment |

## Making documents for a client

1. Fill in `kit.config.json`: client, project, prices (`money.items`, `hourlyRate`, `minorEditFee`), bank details, and the section for the document you are sending (`invoice`, `midProject`, `delivery` or `completion`).
2. Run `node client-kit/build.mjs` from the repo root.
3. Open the PDFs in `out/`. Anything still highlighted in yellow is a field you have not filled in.

Totals, payment amounts and the invoice balance are calculated from the config. Change the policy numbers (revision rounds, late fee, support days and so on) in `terms` and every document updates.

The build uses your installed Chrome to print. Set `CHROME_PATH` if Chrome is somewhere else.

## Before using the contract

The contract is a plain-language template, not legal advice. Have a lawyer in Egypt review it once before first use. Documents filed with Egyptian courts or authorities must be in Arabic or bilingual.
