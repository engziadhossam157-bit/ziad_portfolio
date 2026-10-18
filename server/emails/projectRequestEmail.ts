// Owner email for a new project request: an HTML version for mail apps and a plain-text twin.
// Email HTML rules apply here, not the site's: table layout, inline styles, system fonts,
// and every client-supplied string escaped before it touches markup.

export type ProjectRequestEmailInput = {
  requestId: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  projectName: string;
  projectType: string;
  description: string;
  requiredFeatures?: string;
  budget?: string;
  deadline?: Date;
  referenceUrls?: string;
  fileNames?: string[];
};

// Brand tokens from client/src/index.css, flattened to solid colors for mail clients.
const C = {
  page: "#F7E7CE",
  card: "#FFF8EC",
  band: "#F1DFC0",
  navy: "#001F49",
  navyDeep: "#000F24",
  muted: "#4E5F76",
  line: "#E7D5B6",
  link: "#123663",
};
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'DM Mono',ui-monospace,Menlo,Consolas,monospace";

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const paragraphs = (value: string) =>
  value.trim().split(/\n{2,}/).map((p, i, all) => `<p style="margin:0 0 ${i < all.length - 1 ? 14 : 0}px;">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
const present = (value?: string) => (value && value.trim() ? value.trim() : undefined);

/** An Egyptian or international number as a wa.me id, or null when it can't be read reliably. */
function whatsappId(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  if (/^\+\d{8,15}$/.test(digits)) return digits.slice(1);
  if (/^00\d{8,15}$/.test(digits)) return digits.slice(2);
  if (/^01\d{9}$/.test(digits)) return `20${digits.slice(1)}`;
  return null;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Cairo" }).format(date);
const formatReceived = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Cairo" }).format(date);

function referenceLines(raw?: string) {
  return (present(raw) ?? "").split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
}
const isWebUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

export function projectRequestEmail(input: ProjectRequestEmailInput, appUrl: string, receivedAt = new Date()) {
  const base = appUrl.replace(/\/+$/, "");
  const adminUrl = `${base}/admin/requests`;
  const host = base.replace(/^https?:\/\//, "");
  const firstName = input.name.trim().split(/\s+/)[0] ?? input.name;
  const company = present(input.company);
  const budget = present(input.budget);
  const features = present(input.requiredFeatures);
  const references = referenceLines(input.referenceUrls);
  const files = (input.fileNames ?? []).map(f => f.trim()).filter(Boolean);
  const wa = whatsappId(input.phone);
  const replySubject = `Re: ${input.projectName}`;
  const replyHref = `mailto:${encodeURIComponent(input.email)}?subject=${encodeURIComponent(replySubject)}`;

  const subject = `New project request: ${input.projectName} from ${input.name}`;
  const preheader = [input.projectType, budget, input.deadline ? `due ${formatDate(input.deadline)}` : undefined].filter(Boolean).join(", ");

  // ---------- HTML ----------
  const facts: Array<[string, string]> = [
    ["Type", input.projectType],
    ["Budget", budget ?? "Not given"],
    ["Deadline", input.deadline ? formatDate(input.deadline) : "Flexible"],
  ];
  const factCells = facts.map(([label, value], i) => `
              <td class="fact" valign="top" width="33%" style="padding:16px ${i === 2 ? "0" : "16px"} 16px ${i === 0 ? "0" : "16px"};${i < 2 ? `border-right:1px solid ${C.line};` : ""}">
                <div class="muted" style="font:500 11px/1.4 ${MONO};color:${C.muted};letter-spacing:.02em;">${label}</div>
                <div class="ink" style="font:600 15px/1.35 ${SANS};color:${C.navy};margin-top:4px;">${esc(value)}</div>
              </td>`).join("");

  const contactRow = (label: string, valueHtml: string) => `
                <tr>
                  <td width="96" valign="top" class="muted" style="padding:7px 0;font:500 12px/1.5 ${MONO};color:${C.muted};">${label}</td>
                  <td valign="top" class="ink" style="padding:7px 0;font:400 15px/1.5 ${SANS};color:${C.navy};">${valueHtml}</td>
                </tr>`;
  const linkStyle = `color:${C.link};text-decoration:underline;text-underline-offset:2px;`;
  const contactRows = [
    contactRow("Name", esc(input.name)),
    company ? contactRow("Company", esc(company)) : "",
    contactRow("Email", `<a class="lnk" href="mailto:${esc(input.email)}" style="${linkStyle}">${esc(input.email)}</a>`),
    contactRow("Phone", `<a class="lnk" href="tel:${esc(input.phone.replace(/[^\d+]/g, ""))}" style="${linkStyle}">${esc(input.phone)}</a>${wa ? `&nbsp;&nbsp;<a class="lnk" href="https://wa.me/${wa}" style="${linkStyle}">WhatsApp</a>` : ""}`),
  ].join("");

  const section = (title: string, bodyHtml: string) => `
          <tr>
            <td class="pad" style="padding:28px 36px 0;">
              <h2 class="ink" style="margin:0 0 12px;font:600 17px/1.3 ${SANS};color:${C.navy};letter-spacing:-.01em;">${title}</h2>
              ${bodyHtml}
            </td>
          </tr>`;
  const bodyText = `font:400 15px/1.65 ${SANS};color:${C.navy};`;

  const sections = [
    section("Client", `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${contactRows}</table>`),
    section("What they need", `<div class="ink" style="${bodyText}">${paragraphs(input.description)}</div>`),
    features ? section("Required features", `<div class="ink" style="${bodyText}">${paragraphs(features)}</div>`) : "",
    references.length
      ? section("References", references.map(ref => `<div style="padding:3px 0;font:400 15px/1.5 ${SANS};word-break:break-all;">${isWebUrl(ref) ? `<a class="lnk" href="${esc(ref)}" style="${linkStyle}">${esc(ref)}</a>` : `<span class="ink" style="color:${C.navy};">${esc(ref)}</span>`}</div>`).join(""))
      : "",
    files.length
      ? section(`Files (${files.length})`, `${files.map(f => `<div class="ink" style="padding:3px 0;font:400 14px/1.5 ${MONO};color:${C.navy};word-break:break-all;">${esc(f)}</div>`).join("")}<div class="muted" style="margin-top:6px;font:400 13px/1.5 ${SANS};color:${C.muted};">The files are attached to the request in your admin.</div>`)
      : "",
  ].join("");

  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(subject)}</title>
<style>
  a { color: ${C.link}; }
  @media (max-width: 620px) {
    .pad { padding-left: 22px !important; padding-right: 22px !important; }
    .title { font-size: 24px !important; }
    .fact { display: block !important; width: auto !important; border-right: 0 !important; padding: 10px 0 !important; border-bottom: 1px solid ${C.line} !important; }
    .actions { width: 100% !important; }
    .btn-cell { display: block !important; width: 100% !important; }
    .btn-gap { display: none !important; }
    .alt-link { display: block !important; padding: 16px 0 0 !important; text-align: center !important; }
  }
  @media (prefers-color-scheme: dark) {
    .page { background: ${C.navyDeep} !important; }
    .card { background: #071A35 !important; border-color: #1C3557 !important; }
    .band { background: #0C2445 !important; border-color: #1C3557 !important; }
    .ink { color: ${C.page} !important; }
    .muted { color: #A9B4CC !important; }
    .lnk { color: #C9D6F0 !important; }
    .fact { border-color: #1C3557 !important; }
    .btn { background: ${C.page} !important; }
    .btn a { color: ${C.navy} !important; }
  }
</style>
</head>
<body class="page" style="margin:0;padding:0;background:${C.page};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
  <table role="presentation" class="page" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td style="padding:0 4px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle"><a href="${esc(base)}" style="text-decoration:none;"><img src="${esc(base)}/apple-touch-icon.png" width="32" height="32" alt="Z." style="display:inline-block;vertical-align:middle;border:0;border-radius:8px;background:${C.navy};color:${C.page};font:700 14px/32px ${SANS};text-align:center;"><span class="ink" style="display:inline-block;vertical-align:middle;margin-left:10px;font:800 16px/1 ${SANS};color:${C.navy};letter-spacing:-.04em;">ZIAD.</span></a></td>
                  <td valign="middle" align="right" class="muted" style="font:500 12px/1.4 ${MONO};color:${C.muted};">Request #${input.requestId}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="card" style="background:${C.card};border:1px solid ${C.line};border-radius:14px;overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="pad" style="padding:34px 36px 0;">
                    <div class="muted" style="font:400 15px/1.5 ${SANS};color:${C.muted};">New project request from ${esc(firstName)}${company ? ` at ${esc(company)}` : ""}</div>
                    <h1 class="ink title" style="margin:6px 0 0;font:700 28px/1.15 ${SANS};color:${C.navy};letter-spacing:-.03em;">${esc(input.projectName)}</h1>
                  </td>
                </tr>
                <tr>
                  <td class="pad" style="padding:22px 36px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};border-bottom:1px solid ${C.line};">
                      <tr>${factCells}
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="pad" style="padding:24px 36px 4px;">
                    <table role="presentation" class="actions" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="btn-cell">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                            <td class="btn" align="center" bgcolor="${C.navy}" style="background:${C.navy};border-radius:10px;">
                              <a href="${replyHref}" style="display:block;padding:14px 26px;font:600 15px/1.2 ${SANS};color:${C.card};text-decoration:none;">Reply to ${esc(firstName)}</a>
                            </td>
                          </tr></table>
                        </td>
                        <td class="btn-gap" width="22">&nbsp;</td>
                        <td class="alt-link" valign="middle" style="font:600 15px/1.2 ${SANS};"><a class="lnk" href="${esc(adminUrl)}" style="${linkStyle}">Open in admin</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${sections}
                <tr><td style="height:30px;line-height:30px;font-size:0;">&nbsp;</td></tr>
                <tr>
                  <td class="band pad" style="padding:20px 36px;background:${C.band};border-top:1px solid ${C.line};">
                    <div class="muted" style="font:400 13px/1.55 ${SANS};color:${C.muted};">Received ${esc(formatReceived(receivedAt))} (Cairo). Replying to this email goes straight to ${esc(input.email)}.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" class="muted" style="padding:18px 4px 0;font:400 12px/1.5 ${SANS};color:${C.muted};">Sent by the Start a project form on <a class="lnk" href="${esc(base)}" style="${linkStyle}">${esc(host)}</a></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // ---------- Plain text ----------
  const text = [
    `New project request #${input.requestId}`,
    "",
    input.projectName,
    `From ${input.name}${company ? ` at ${company}` : ""}`,
    "",
    `Type: ${input.projectType}`,
    `Budget: ${budget ?? "Not given"}`,
    `Deadline: ${input.deadline ? formatDate(input.deadline) : "Flexible"}`,
    "",
    "CLIENT",
    `Name: ${input.name}`,
    company ? `Company: ${company}` : null,
    `Email: ${input.email}`,
    `Phone: ${input.phone}${wa ? ` (WhatsApp: https://wa.me/${wa})` : ""}`,
    "",
    "WHAT THEY NEED",
    input.description.trim(),
    features ? `\nREQUIRED FEATURES\n${features}` : null,
    references.length ? `\nREFERENCES\n${references.join("\n")}` : null,
    files.length ? `\nFILES (${files.length}, in your admin)\n${files.join("\n")}` : null,
    "",
    `Open in admin: ${adminUrl}`,
    `Received ${formatReceived(receivedAt)} (Cairo). Reply to this email to answer ${firstName} directly.`,
  ].filter(line => line !== null).join("\n");

  return { subject, html, text };
}
