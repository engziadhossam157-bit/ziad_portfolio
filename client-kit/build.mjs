// Client kit: renders the eight project documents to PDF from kit.config.json.
// Run from the repo root:  node client-kit/build.mjs [config.json] [output folder]
// With no arguments it uses client-kit/kit.config.json and writes to client-kit/out.
// Empty config fields print as highlighted [placeholders], so a blank config gives you templates
// and a filled one gives you documents ready to send. Chrome prints the PDFs (no npm packages);
// set CHROME_PATH if it is not in the default Windows location.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const cfgPath = path.resolve(process.argv[2] || path.join(here, "kit.config.json"));
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const { studio: S, client: C, project: P, money: M, terms: T } = cfg;
const outDir = path.resolve(process.argv[3] || path.join(here, "out"));
const htmlDir = path.join(outDir, ".html");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(htmlDir, { recursive: true });

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const blank = (x) => x === null || x === undefined || x === "";
/** A config value, or a highlighted placeholder when it is empty. */
const v = (x, label) => (blank(x) ? `<span class="ph">[${esc(label)}]</span>` : esc(x));
const num = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const money = (n, label = "amount") => (blank(n) ? `<span class="ph">[${label}]</span>` : `${esc(M.currency)} ${num(n)}`);
const sum = (rows) => (rows.some((r) => blank(r.amount)) ? null : rows.reduce((a, r) => a + Number(r.amount), 0));
const subtotal = sum(M.items);
const total = subtotal === null ? null : subtotal - Number(M.discount || 0);
const pct = (p) => (total === null ? null : Math.round((total * p) / 100 * 100) / 100);
const ul = (items, label) => `<ul>${items.map((i) => `<li>${v(i, label)}</li>`).join("")}</ul>`;
const clientName = v(C.company || C.contactName, "Client name");
const projectName = v(P.name, "Project name");
const logo = fs.readFileSync(path.join(root, "brand", "logo-mark.svg"), "utf8").replace("<svg ", '<svg class="mark" ');
const font = (file) => pathToFileURL(path.join(root, "node_modules", "@fontsource", file)).href;

const css = `
@font-face { font-family: Geist; font-weight: 400; src: url(${font("geist-sans/files/geist-sans-latin-400-normal.woff2")}); }
@font-face { font-family: Geist; font-weight: 500; src: url(${font("geist-sans/files/geist-sans-latin-500-normal.woff2")}); }
@font-face { font-family: Geist; font-weight: 600; src: url(${font("geist-sans/files/geist-sans-latin-600-normal.woff2")}); }
@font-face { font-family: Geist; font-weight: 700; src: url(${font("geist-sans/files/geist-sans-latin-700-normal.woff2")}); }
@font-face { font-family: Mono; font-weight: 400; src: url(${font("dm-mono/files/dm-mono-latin-400-normal.woff2")}); }
@font-face { font-family: Mono; font-weight: 500; src: url(${font("dm-mono/files/dm-mono-latin-500-normal.woff2")}); }
:root { --navy: #001F49; --sand: #F7E7CE; --paper: #FFF8EC; --ink: #1B2B44; --muted: #4E5F76; --line: #D9CDB8; --soft: #F3E9D7; }
@page { size: A4; margin: 20mm 18mm 22mm;
  @bottom-left { content: "${esc(S.name)}  ·  ${esc(S.email)}  ·  ${esc(S.phone)}"; font: 7.5pt Mono; color: #6B7A8F; }
  @bottom-right { content: counter(page) " / " counter(pages); font: 7.5pt Mono; color: #6B7A8F; } }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 400 9.6pt/1.6 Geist; color: var(--ink); }
.brand { display: flex; justify-content: space-between; align-items: center; padding-bottom: 7mm; margin-bottom: 9mm; border-bottom: 1.5px solid var(--navy); }
.brand-id { display: flex; align-items: center; gap: 10px; }
.mark { width: 34px; height: 34px; }
.brand-id b { display: block; font: 700 12pt Geist; letter-spacing: -.02em; color: var(--navy); }
.brand-id span, .doc-tag { font: 7.5pt Mono; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.doc-tag { text-align: right; line-height: 1.7; }
h1 { margin: 0 0 3mm; font: 700 30pt/1.02 Geist; letter-spacing: -.045em; color: var(--navy); }
.lede { margin: 0 0 8mm; max-width: 135mm; font-size: 11pt; line-height: 1.55; color: var(--muted); }
.meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin: 0 0 9mm; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.meta div { padding: 3.2mm 3mm 3.2mm 0; }
.meta div + div { padding-left: 3mm; border-left: 1px solid var(--line); }
.meta span, .label { display: block; font: 7pt Mono; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-bottom: 1mm; }
.meta b { font-weight: 600; font-size: 9.4pt; color: var(--navy); }
h2 { margin: 8mm 0 2.5mm; font: 600 13pt Geist; letter-spacing: -.02em; color: var(--navy); break-after: avoid; }
h3 { margin: 4mm 0 1.5mm; font: 600 10pt Geist; color: var(--navy); break-after: avoid; }
p { margin: 0 0 2.5mm; }
ul, ol { margin: 0 0 3mm; padding-left: 5mm; } li { margin: 0 0 1.2mm; }
.ph { background: #FBE3A6; color: #5A3E00; padding: 0 1.2mm; border-radius: 2px; font-weight: 500; }
table { width: 100%; border-collapse: collapse; margin: 1mm 0 4mm; break-inside: auto; }
th { text-align: left; font: 500 7pt Mono; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); padding: 0 3mm 2mm 0; border-bottom: 1.2px solid var(--navy); }
td { padding: 2.6mm 3mm 2.6mm 0; border-bottom: 1px solid var(--line); vertical-align: top; }
tr { break-inside: avoid; }
table.keep, .keep-block { break-inside: avoid; }
td:first-child, td.nowrap { white-space: nowrap; }
td:first-child small { white-space: normal; }
td small { display: block; color: var(--muted); font-size: 8.4pt; }
.num { text-align: right; white-space: nowrap; padding-right: 6mm; }
th:last-child, td:last-child { padding-right: 0; }
.totals { margin-left: auto; width: 78mm; break-inside: avoid; }
.totals div { display: flex; justify-content: space-between; padding: 1.6mm 0; border-bottom: 1px solid var(--line); }
.totals .grand { margin-top: 2mm; padding: 3.5mm 4mm; border: 0; border-radius: 3px; background: var(--navy); color: var(--sand); font-weight: 600; font-size: 11pt; }
.panel { padding: 4mm 5mm; border-radius: 4px; background: var(--soft); margin: 2mm 0 4mm; break-inside: avoid; }
.panel p:last-child, .panel ul:last-child { margin-bottom: 0; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
.meta .pill, .pill { display: inline-block; margin: 0; padding: .4mm 2.2mm; border-radius: 99px; background: var(--navy); color: var(--sand); font: 500 7pt Mono; letter-spacing: .08em; text-transform: uppercase; }
.check li { list-style: none; position: relative; padding-left: 1mm; } .check { padding-left: 5mm; }
.check li::before { content: ""; position: absolute; left: -5mm; top: 1.2mm; width: 2.6mm; height: 2.6mm; border: 1px solid var(--navy); border-radius: 1px; }
.clause { break-inside: avoid-page; }
.clause h2 { margin-top: 6mm; font-size: 11pt; }
.sign { display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; margin-top: 10mm; break-inside: avoid; }
.sign div { border-top: 1.2px solid var(--navy); padding-top: 2mm; }
.sign .space { height: 16mm; border: 0; }
.fine { font-size: 8pt; color: var(--muted); }
/* One-page agreement: tighter rhythm so it always fits on a single A4 sheet. */
.one-page .brand { padding-bottom: 5mm; margin-bottom: 6mm; }
.one-page h1 { font-size: 26pt; margin-bottom: 4mm; }
.one-page .meta { margin-bottom: 5mm; }
.one-page .panel { padding: 3mm 5mm; margin: 0 0 4mm; }
.one-page h2 { margin: 5mm 0 2mm; }
.one-page td { padding: 1.8mm 3mm 1.8mm 0; }
.one-page .sign { margin-top: 6mm; } .one-page .sign .space { height: 12mm; }
.big { font: 700 22pt Geist; letter-spacing: -.03em; color: var(--navy); }
`;

const header = (tag, code) => `<div class="brand"><div class="brand-id">${logo}<div><b>${esc(S.name)}</b><span>${esc(S.title)}  ·  ${esc(S.city)}</span></div></div><div class="doc-tag">${tag}<br>${code}</div></div>`;
const meta = (pairs) => `<div class="meta">${pairs.map(([k, val]) => `<div><span>${k}</span><b>${val}</b></div>`).join("")}</div>`;
const signatures = (left = "Client", right = "Service provider") => `
  <div class="sign">
    <div class="space"></div><div class="space"></div>
    <div><span class="label">${left}</span>${clientName}<br><span class="fine">Name, signature and date</span></div>
    <div><span class="label">${right}</span>${esc(S.legalName)}<br><span class="fine">Name, signature and date</span></div>
  </div>`;
const contactBlock = `<p>${esc(S.email)}<br>${esc(S.phone)}<br>${esc(S.linkedin)}${S.website ? `<br>${esc(S.website)}` : ""}</p>`;
const itemsTable = (rows) => `<table><tr><th>Item</th><th class="num">Amount</th></tr>${rows.map((r) => `<tr><td>${v(r.label, "Item")}${r.detail ? `<small>${esc(r.detail)}</small>` : ""}</td><td class="num">${money(r.amount)}</td></tr>`).join("")}</table>`;
const totalsBox = () => `<div class="totals">
  <div><span>Subtotal</span><span>${money(subtotal, "subtotal")}</span></div>
  ${M.discount ? `<div><span>Discount</span><span>- ${money(M.discount)}</span></div>` : ""}
  <div class="grand"><span>Total</span><span>${money(total, "total")}</span></div></div>`;
const scheduleTable = () => `<table class="keep"><tr><th>Payment</th><th>When</th><th class="num">Share</th><th class="num">Amount</th></tr>${M.milestones.map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.trigger)}</td><td class="num">${m.percent}%</td><td class="num">${money(pct(m.percent))}</td></tr>`).join("")}</table>`;
const doc = (title, body, cls = "") => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body class="${cls}">${body}</body></html>`;

// ---------- 1. Proposal ----------
const proposal = doc("Proposal", `
${header("Project proposal", "PRO-" + (P.proposalDate || "000").replace(/\D/g, ""))}
<h1>${projectName}</h1>
<p class="lede">A proposal for ${clientName}: what I will build, how we will work, what it costs and when it will be ready.</p>
${meta([["Prepared for", clientName], ["Date", v(P.proposalDate, "Date")], ["Valid for", `${P.proposalValidDays} days`], ["Estimated launch", v(P.endDate, "Launch date")]])}
<h2>Where you are now</h2>
<p>${v(P.summary, "Two or three sentences in the client's words: the business, the problem, and why now")}</p>
<h2>What this project will achieve</h2>
${ul(P.goals, "Measurable goal, for example: let customers book online without calling")}
<h2>Scope</h2>
<div class="cols"><div><h3>Included</h3>${ul(P.inScope, "Feature or page")}</div><div><h3>Not included</h3>${ul(P.outOfScope, "Excluded item")}</div></div>
<p class="fine">Anything outside this list is quoted separately before any work starts on it.</p>
<div class="keep-block"><h2>How we will work</h2>
<table><tr><th>Phase</th><th>What happens</th><th>You receive</th></tr>
<tr><td>1. Discovery</td><td>Kick-off call, requirements, sitemap and user flows</td><td>Kick-off document and project plan</td></tr>
<tr><td>2. Design</td><td>Desktop and mobile designs for the agreed screens, ${T.revisionRoundsPerMilestone} revision rounds</td><td>Approved designs</td></tr>
<tr><td>3. Build</td><td>Development, content setup and testing on a private preview link</td><td>Mid-project report and preview link</td></tr>
<tr><td>4. Launch</td><td>Final testing, deployment, handover and a training session</td><td>Live product, files and admin guide</td></tr></table></div>
<p>You can follow every milestone, deliverable and change request in your client portal on my website.</p>
<h2>Investment</h2>
${itemsTable(M.items)}${totalsBox()}
<h3>Payment schedule</h3>${scheduleTable()}
<h2>What is included</h2>
<ul><li>${T.revisionRoundsPerMilestone} rounds of revisions on each milestone</li><li>${T.supportDays} days of free bug fixes after launch</li><li>Full ownership of the final work once the final payment is made</li><li>A recorded walkthrough of how to manage the product</li></ul>
<h2>Next steps</h2>
<ol><li>Reply to confirm the proposal, or ask for changes.</li><li>I send the contract for signature.</li><li>You pay the ${M.milestones[0].percent}% deposit and we book the kick-off call.</li></ol>
<p class="fine">Prices are valid for ${P.proposalValidDays} days from the date above. Timelines start once the deposit is received and the content listed in the welcome document is ready.</p>
${signatures("Accepted by the client", "Prepared by")}
`);

// ---------- 2. Contract ----------
const clauses = [
  ["Services", `The Service Provider will deliver the work described in the accepted proposal for ${projectName} (the "Project"). The proposal forms part of this agreement. Work that is not listed in it is outside the scope.`],
  ["Timeline", `The Project starts on ${v(P.startDate, "start date")} and is planned for completion on ${v(P.endDate, "end date")}. The timeline moves forward day for day when the Client delays payments, feedback, content or access.`],
  ["Fees and payment", `The total fee is ${money(total, "total")}, paid in the instalments set out in the payment schedule below. Invoices are due within ${M.paymentDueDays} days of issue by ${esc(M.paymentMethods.join(", "))}. The deposit secures the project slot and is non-refundable once work has started. Work on each phase begins after the matching payment clears.`],
  ["Late payment", `Unpaid invoices incur a late fee of ${M.lateFeePercentPerMonth}% of the overdue amount for each month or part of a month they remain unpaid. If an invoice is more than 14 days overdue, the Service Provider may pause all work until it is paid, and the timeline moves accordingly.`],
  ["Revisions", `Each milestone includes ${T.revisionRoundsPerMilestone} rounds of revisions. A revision round is one consolidated list of changes to existing work, sent in a single message. Further rounds are billed at ${money(M.hourlyRate, "hourly rate")} per hour.`],
  ["Edits and change requests", `Every edit requested after a milestone is approved, and every new feature, page or change in direction, costs extra and is quoted in writing before work starts. Small edits (text, image or colour swaps under 30 minutes) are billed at a flat ${money(M.minorEditFee, "minor edit fee")} each. Larger changes are billed at the hourly rate or as a fixed quote. Changes are submitted through the client portal or by email, and no change is made until the Client approves the quote. Approved changes may extend the timeline.`],
  ["Rush requests", `Work the Client asks to be delivered faster than the agreed timeline carries a ${T.rushSurchargePercent}% surcharge on that work, if the Service Provider can accept it.`],
  ["Client responsibilities", `The Client provides content, brand assets, account access and one person with authority to approve work. Feedback is due within ${T.feedbackDays} business days of each delivery. The Client confirms it owns or is licensed to use everything it supplies.`],
  ["Acceptance", `The Client reviews each deliverable within ${T.acceptanceDays} business days and either approves it or sends one list of revisions. A deliverable with no response in that time counts as approved. Launching or using the work in public also counts as approval.`],
  ["Third-party costs", `Domains, hosting, paid plugins, fonts, stock media, API usage and other subscriptions are paid by the Client directly or reimbursed at cost. They are not part of the fee.`],
  ["Ownership", `When all fees are paid in full, the Client owns the final deliverables made for this Project. Until then, all rights stay with the Service Provider. General tools, code libraries and know-how the Service Provider used before or outside this Project remain the Service Provider's property, and the Client receives a permanent licence to use them as part of the deliverables.`],
  ["Portfolio", `The Service Provider may show the finished work and a short description of the Project in a portfolio, social media and proposals, without sharing confidential information. The Client can ask in writing to keep the Project private.`],
  ["Confidentiality", `Both parties keep private any business, technical or financial information they receive from the other, during the Project and after it ends.`],
  ["Support and warranty", `For ${T.supportDays} days after launch, the Service Provider fixes defects in the delivered work at no cost. A defect is something that does not work as approved. New features, content updates and problems caused by other people's changes, hosting or third-party services are billed separately.`],
  ["Paused projects", `If the Client does not respond for ${T.pauseAfterDays} days, the Project is paused and the Service Provider may take on other work. Restarting it costs ${T.restartFeePercent}% of the remaining fee and depends on availability.`],
  ["Termination", `Either party may end this agreement with ${T.noticeDays} days' written notice. The Client then pays for all completed phases in full, the in-progress phase in proportion to the work done, and a cancellation fee of ${T.killFeePercent}% of the unpaid remainder. The deposit is not refunded. Ownership of finished work passes to the Client once these amounts are paid.`],
  ["Liability", `The Service Provider's total liability under this agreement is limited to the fees the Client has paid. Neither party is liable for indirect losses such as lost profit, revenue or data. The Client is responsible for keeping backups of its own content.`],
  ["Independent contractor", `The Service Provider works as an independent contractor, chooses how and when to do the work, and is responsible for its own taxes. Nothing in this agreement creates employment, partnership or agency.`],
  ["Events outside our control", `Neither party is responsible for delays caused by events it cannot reasonably control, such as outages, natural disasters or government action. The affected party informs the other promptly.`],
  ["Governing law", `This agreement is governed by the laws of the Arab Republic of Egypt. The parties first try to settle any dispute by talking in good faith. If that fails within 30 days, the courts of Cairo have jurisdiction.`],
  ["Whole agreement", `This agreement, the accepted proposal and any signed change requests are the full agreement between the parties. Changes to this agreement must be in writing and accepted by both parties. Email counts as writing.`],
];
// One-page agreement; the rules live in the separate terms document, which it incorporates.
const contract = doc("Contract", `
${header("Service agreement", "AGR-" + (P.contractDate || "000").replace(/\D/g, ""))}
<h1>Service agreement</h1>
${meta([["Project", projectName], ["Date", v(P.contractDate, "Date")], ["Timeline", `${v(P.startDate, "start")} to ${v(P.endDate, "end")}`], ["Total fee", money(total, "total")]])}
<div class="cols panel"><div><span class="label">Client</span>${clientName}<br>${v(C.contactName, "Contact person")}<br>${v(C.address, "Address")}<br>${v(C.email, "Email")}</div>
<div><span class="label">Service provider</span>${esc(S.legalName)}<br>${esc(S.city)}<br>${esc(S.email)}<br>${esc(S.phone)}</div></div>
<p>The Service Provider will deliver ${projectName} as described in the accepted proposal dated ${v(P.proposalDate, "proposal date")}. The Client will pay the fee below and provide the content, access and feedback the project needs.</p>
<h2>Payment schedule</h2>${scheduleTable()}
<h2>Agreed terms</h2>
<p>This agreement includes the Terms and Conditions attached to it (document TC-1.0), which set out revisions, paid edits and change requests, late payment, acceptance, ownership, support, termination and the governing law. The main points:</p>
<ul><li>${T.revisionRoundsPerMilestone} revision rounds per milestone. Every edit after approval is extra and quoted in writing first.</li><li>Invoices are due in ${M.paymentDueDays} days. Late invoices add ${M.lateFeePercentPerMonth}% per month, and the deposit is non-refundable.</li><li>The Client owns the final work once all fees are paid. Governed by the laws of Egypt.</li></ul>
${signatures()}
`, "one-page");

const terms = doc("Terms and conditions", `
${header("Terms and conditions", "TC-1.0")}
<h1>Terms and conditions</h1>
<p class="lede">These terms are part of the service agreement for ${projectName} between ${clientName} (the "Client") and ${esc(S.legalName)} (the "Service Provider").</p>
${clauses.map(([h, t], i) => `<div class="clause"><h2>${i + 1}. ${h}</h2><p>${t}</p></div>`).join("")}
<div class="keep-block"><h2>Rates for extra work</h2>
<table><tr><th>Request</th><th class="num">Price</th></tr>
<tr><td>Extra revision round, or any edit after approval<small>Billed per hour, quoted first</small></td><td class="num">${money(M.hourlyRate, "hourly rate")} / hour</td></tr>
<tr><td>Small edit<small>Text, image or colour change under 30 minutes</small></td><td class="num">${money(M.minorEditFee, "flat fee")}</td></tr>
<tr><td>New page, feature or integration</td><td class="num">Fixed quote</td></tr>
<tr><td>Rush delivery</td><td class="num">+${T.rushSurchargePercent}%</td></tr>
<tr><td>Restarting a paused project</td><td class="num">${T.restartFeePercent}% of remaining fee</td></tr></table></div>
<p class="fine" style="margin-top:6mm">Initials: Client ________ Service provider ________</p>
<p class="fine">This template is a starting point, not legal advice. Have a lawyer review it before first use. Documents filed with Egyptian courts or authorities must be in Arabic or bilingual.</p>
`);

// ---------- 3. Invoice ----------
const inv = cfg.invoice;
const invTotal = sum(inv.lines);
const due = invTotal === null ? null : invTotal - Number(inv.amountPaid || 0);
const invoice = doc("Invoice", `
${header("Invoice", "INV-" + (inv.number || "000"))}
<h1>Invoice</h1>
${meta([["Invoice no.", v(inv.number, "Number")], ["Issued", v(inv.issueDate, "Date")], ["Due", v(inv.dueDate, "Due date")], ["Project", projectName]])}
<div class="cols"><div><span class="label">Billed to</span><p>${clientName}<br>${v(C.contactName, "Contact person")}<br>${v(C.address, "Address")}<br>${v(C.email, "Email")}</p></div>
<div><span class="label">From</span><p>${esc(S.legalName)}<br>${esc(S.city)}<br>${esc(S.email)}<br>${esc(S.phone)}</p></div></div>
<div style="height:6mm"></div>${itemsTable(inv.lines)}
<div class="totals"><div><span>Total</span><span>${money(invTotal, "total")}</span></div>
<div><span>Paid</span><span>${money(inv.amountPaid || 0)}</span></div>
<div class="grand"><span>Balance due</span><span>${money(due, "balance")}</span></div></div>
<h2>How to pay</h2>
<div class="panel"><p><b>${esc(M.paymentMethods.join("  ·  "))}</b></p><p>${v(M.bankDetails, "Account name, bank, account number or IBAN, InstaPay address")}</p><p class="fine">Please write the invoice number in the transfer reference.</p></div>
<h2>Terms</h2>
<p>Payment is due within ${M.paymentDueDays} days. Unpaid invoices incur a late fee of ${M.lateFeePercentPerMonth}% per month, and work may pause until payment is received, as set out in the service agreement.</p>
<p class="big" style="margin-top:10mm">Thank you.</p>
`);

// ---------- 4. Welcome ----------
const welcome = doc("Welcome", `
${header("Welcome pack", projectName)}
<h1>Welcome aboard, ${v(C.contactName, "first name")}.</h1>
<p class="lede">Thank you for trusting me with ${projectName}. This guide explains how we will work together, what I need from you, and what happens over the next few weeks.</p>
${meta([["Project", projectName], ["Start", v(P.startDate, "Start date")], ["Planned launch", v(P.endDate, "Launch date")], ["Your contact", esc(S.name)]])}
<h2>What happens next</h2>
<ol><li>We hold the kick-off call within 3 business days of your deposit.</li><li>I send the kick-off document with the plan, dates and decisions from the call.</li><li>You send the content and access listed below.</li><li>Design starts. You review and approve each milestone before we move on.</li></ol>
<h2>How we will work</h2>
<table><tr><th>Topic</th><th>How it works</th></tr>
<tr><td>Client portal</td><td>Milestones, deliverables, files, messages and change requests live in your portal. Log in with the email you shared with me.</td></tr>
<tr><td>Messages</td><td>Portal or email for anything about scope, money or approvals, so we both keep a record. WhatsApp for quick questions.</td></tr>
<tr><td>Working hours</td><td>Sunday to Thursday, 10:00 to 18:00 Cairo time. I reply within one business day.</td></tr>
<tr><td>Meetings</td><td>Book a call from my website. We hold a short check-in at each milestone.</td></tr>
<tr><td>Feedback</td><td>Please send all changes for a milestone in one message within ${T.feedbackDays} business days. Each milestone includes ${T.revisionRoundsPerMilestone} revision rounds.</td></tr>
<tr><td>Changes</td><td>New ideas are welcome. Anything outside the agreed scope gets a written quote first, and nothing is billed without your approval.</td></tr></table>
<h2>What I need from you</h2>
<ul class="check"><li>Logo files (SVG or high-resolution PNG) and brand colours</li><li>Text for each page, or notes I can work from</li><li>Photos and videos you own or have licences for</li><li>Access to your domain, hosting and any existing accounts</li><li>Two or three websites or apps you like, and what you like about them</li><li>The name of the one person who approves the work</li></ul>
<div class="panel"><p>The timeline starts once this content is in. If something takes longer, tell me early and we will adjust the plan together.</p></div>
<h2>Contact</h2>${contactBlock}
`);

// ---------- 5. Kick-off ----------
const KO = cfg.kickoff || {};
const at = (arr, i) => (arr || [])[i];
const kickoff = doc("Kick-off", `
${header("Kick-off document", projectName)}
<h1>Project kick-off</h1>
<p class="lede">The plan we agreed on the kick-off call. Please check it and reply with any corrections within ${T.feedbackDays} business days.</p>
${meta([["Project", projectName], ["Kick-off date", v(P.startDate, "Date")], ["Launch target", v(P.endDate, "Date")], ["Approver", v(C.contactName, "Name")]])}
<h2>Goals and how we measure them</h2>
<table><tr><th>Goal</th><th>How we will know</th></tr>${P.goals.map((g, i) => `<tr><td>${v(g, "Goal")}</td><td>${v(at(KO.metrics, i), "Metric or test")}</td></tr>`).join("")}</table>
<h2>Audience</h2><p>${v(KO.audience, "Who uses this product, what they need to do, and on which devices")}</p>
<h2>Scope recap</h2><div class="cols"><div><h3>Included</h3>${ul(P.inScope, "Feature or page")}</div><div><h3>Not included</h3>${ul(P.outOfScope, "Excluded item")}</div></div>
<h2>Milestones</h2>
<table><tr><th>Milestone</th><th>Target date</th><th>Your action</th></tr>
<tr><td>Content and access received</td><td>${v(at(KO.milestoneDates, 0), "Date")}</td><td>Send items from the welcome pack</td></tr>
<tr><td>Design ready for review</td><td>${v(at(KO.milestoneDates, 1), "Date")}</td><td>Review and send one list of changes</td></tr>
<tr><td>Design approved</td><td>${v(at(KO.milestoneDates, 2), "Date")}</td><td>Approve, mid-project payment due</td></tr>
<tr><td>Preview link ready</td><td>${v(at(KO.milestoneDates, 3), "Date")}</td><td>Test and send one list of changes</td></tr>
<tr><td>Launch</td><td>${v(P.endDate, "Date")}</td><td>Final approval and payment</td></tr></table>
<h2>Roles</h2>
<table><tr><th>Person</th><th>Role</th><th>Responsible for</th></tr>
<tr><td>${v(C.contactName, "Name")}</td><td>Client approver</td><td>Content, feedback, final decisions</td></tr>
<tr><td>${esc(S.name)}</td><td>Lead engineer</td><td>Design, development, testing, launch</td></tr></table>
<h2>Assumptions and risks</h2>
<ul><li>Content arrives by the date above. Late content moves the launch date by the same number of days.</li><li>Third-party services (payment gateways, APIs) work as their documentation describes.</li><li>${v(KO.risk, "Project-specific risk and how we will handle it")}</li></ul>
<h2>Action items</h2>
<table><tr><th>Action</th><th>Owner</th><th>Due</th></tr>${(KO.actions || [{}, {}]).map((a) => `<tr><td>${v(a.action, "Action")}</td><td>${v(a.owner, "Name")}</td><td>${v(a.due, "Date")}</td></tr>`).join("")}</table>
`);

// ---------- 6. Mid-project ----------
const MP = cfg.midProject;
const mid = doc("Mid-project report", `
${header("Mid-project report", projectName)}
<h1>Halfway report</h1>
<p class="lede">Where ${projectName} stands today, what is coming next, and what I need from you to stay on schedule.</p>
${meta([["Report date", v(MP.date, "Date")], ["Status", `<span class="pill">${esc(MP.status)}</span>`], ["Progress", blank(MP.progressPercent) ? '<span class="ph">[%]</span>' : `${MP.progressPercent}%`], ["Launch target", v(P.endDate, "Date")]])}
<div class="cols"><div><h2>Done</h2>${ul(MP.done, "Completed item")}</div><div><h2>In progress</h2>${ul(MP.inProgress, "Current item")}</div></div>
<h2>Coming next</h2>${ul(MP.next, "Next item")}
<h2>Feedback I need</h2>
<div class="panel">${ul(MP.feedbackNeeded, "Question or approval")}<p>Please reply by ${v(MP.feedbackBy, "date")} so the launch date holds.</p></div>
<div class="keep-block"><h2>Change requests</h2>
<table><tr><th>Request</th><th>Requested</th><th class="num">Cost</th><th>Time impact</th><th>Status</th></tr>${MP.changeRequests.map((c) => `<tr><td>${v(c.item, "Change")}</td><td class="nowrap">${v(c.requested, "Date")}</td><td class="num">${money(c.cost, "quote")}</td><td>${v(c.timeImpact, "+ days")}</td><td>${esc(c.status)}</td></tr>`).join("")}</table></div>
<p class="fine">Changes outside the agreed scope are billed as set out in the service agreement and start only after your written approval.</p>
<div class="keep-block"><h2>Budget</h2>
<table><tr><th>Payment</th><th class="num">Amount</th><th>Status</th></tr>${M.milestones.map((m, i) => `<tr><td>${esc(m.name)}</td><td class="num">${money(pct(m.percent))}</td><td>${["Paid", "Due now", "Due before launch"][i] ?? "Upcoming"}</td></tr>`).join("")}</table></div>
`);

// ---------- 7. Final deliverables ----------
const D = cfg.delivery;
const deliverables = doc("Final deliverables", `
${header("Handover", projectName)}
<h1>Final deliverables</h1>
<p class="lede">Everything that makes up ${projectName}, where to find it, and how to look after it.</p>
${meta([["Handover date", v(D.date, "Date")], ["Project", projectName], ["Support until", `${T.supportDays} days after launch`], ["Prepared by", esc(S.name)]])}
<h2>What you receive</h2>
<table><tr><th>Deliverable</th><th>Format</th><th>Where</th></tr>${D.deliverables.map((d) => `<tr><td>${v(d.item, "Item")}</td><td>${v(d.format, "Format")}</td><td>${v(d.where, "Link or location")}</td></tr>`).join("")}</table>
<h2>Technical summary</h2>
<table><tr><th>Area</th><th>Details</th></tr><tr><td>Stack</td><td>${v(D.stack, "Frameworks, languages, database")}</td></tr><tr><td>Hosting</td><td>${v(D.hosting, "Provider and plan")}</td></tr><tr><td>Domain</td><td>${v(D.domain, "Registrar and renewal date")}</td></tr><tr><td>Backups</td><td>${v(D.backups, "What is backed up and how often")}</td></tr></table>
<div class="keep-block"><h2>Access and passwords</h2>
<div class="panel"><p>Passwords are never written in this document. I share them once through a password manager or an encrypted link. After handover, please change every password and turn on two-factor authentication.</p></div>
<ul class="check"><li>Admin account for the product</li><li>Hosting and domain accounts moved to your name</li><li>Code repository ownership transferred</li><li>Third-party services (email, analytics, payments) under your account</li></ul></div>
<h2>Looking after it</h2>
<ul><li>The admin guide explains everyday tasks such as editing content and managing users.</li><li>Renew the domain and hosting before they expire. Expired accounts take the product offline.</li><li>Ask me before installing plugins or letting another developer change the code during the support period, since their changes are not covered.</li></ul>
<h2>Acceptance</h2>
<p>Please check the deliverables and confirm within ${T.acceptanceDays} business days. Once you confirm and the final payment is made, ownership passes to you as agreed.</p>
${signatures("Received by the client", "Delivered by")}
`);

// ---------- 8. Completion ----------
const K = cfg.completion;
const completion = doc("Project completion", `
${header("Project completion", projectName)}
<h1>Project complete</h1>
<p class="lede">${projectName} is live. This report closes the project and confirms what happens from here.</p>
${meta([["Completed", v(K.date, "Date")], ["Planned end", v(K.plannedEnd || P.endDate, "Date")], ["Actual end", v(K.actualEnd, "Date")], ["Final fee", money(total, "total")]])}
<h2>What we delivered</h2>${ul(K.highlights, "Delivered feature and the result it gives the client")}
<h2>Goals check</h2>
<table><tr><th>Goal</th><th>Result</th></tr>${P.goals.map((g, i) => `<tr><td>${v(g, "Goal")}</td><td>${v((K.results || [])[i], "Result or first numbers")}</td></tr>`).join("")}</table>
<h2>Closing confirmations</h2>
<ul class="check"><li>All invoices paid in full</li><li>Ownership of the final work transferred to the client</li><li>Accounts, files and passwords handed over</li><li>Free support runs until ${T.supportDays} days after launch</li></ul>
<h2>After the support period</h2>
<p>I offer monthly maintenance for updates, backups, small changes and priority fixes, or hourly work at ${money(M.hourlyRate, "hourly rate")} per hour when you need it. Reply to this document and I will send the options.</p>
<h2>One favour</h2>
<div class="panel"><p>If you are happy with the result, a short testimonial or a LinkedIn recommendation helps me a lot. Two or three sentences about what changed for your business is perfect.</p><p>${esc(S.linkedin)}</p></div>
<p class="big" style="margin-top:8mm">Thank you for working with me.</p>
${signatures("Confirmed by the client", "Completed by")}
`);

// ---------- render ----------
const docs = [["01-proposal", proposal], ["02-contract", contract], ["02b-terms-and-conditions", terms], ["03-invoice", invoice], ["04-welcome", welcome], ["05-kickoff", kickoff], ["06-mid-project-report", mid], ["07-final-deliverables", deliverables], ["08-project-completion", completion]];
const chrome = process.env.CHROME_PATH || ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => fs.existsSync(p));
if (!chrome) throw new Error("Chrome not found. Set CHROME_PATH to a Chrome or Chromium executable.");
for (const [name, html] of docs) {
  const file = path.join(htmlDir, `${name}.html`);
  fs.writeFileSync(file, html);
  execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--allow-file-access-from-files", `--print-to-pdf=${path.join(outDir, `${name}.pdf`)}`, pathToFileURL(file).href], { stdio: "ignore" });
  console.log("built", `${name}.pdf`);
}
