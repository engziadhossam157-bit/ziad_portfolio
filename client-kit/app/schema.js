// Every editable field, grouped into sections. `path` points into kit.config.json.
// Field types: text, textarea, number, money, percent, date, select, chips (multi-select),
// list (one text per row) and table (rows of named columns).

const CURRENCIES = ["EGP", "USD", "EUR", "SAR", "AED", "GBP"];
const range = (from, to, step = 1) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => String(from + i * step));

export const SECTIONS = {
  client: {
    title: "Client", icon: "user-round",
    fields: [
      { path: "client.company", label: "Company", type: "text", placeholder: "TH Marble & Granite" },
      { path: "client.contactName", label: "Contact person", type: "text", placeholder: "Who approves the work" },
      { path: "client.email", label: "Email or contact", type: "text" },
      { path: "client.phone", label: "Phone", type: "text" },
      { path: "client.address", label: "Address", type: "text" },
    ],
  },
  project: {
    title: "Project", icon: "briefcase",
    fields: [
      { path: "project.name", label: "Project name", type: "text" },
      { path: "project.type", label: "Project type", type: "select", options: ["Company website", "E-commerce store", "Web application", "Mobile app", "Desktop app", "ERP system", "Other"] },
      { path: "project.summary", label: "Where the client is now", type: "textarea", hint: "Two or three sentences in the client's words: the business, the problem, why now." },
      { path: "project.goals", label: "Goals", type: "list", add: "Add goal" },
      { path: "project.inScope", label: "Included", type: "list", add: "Add included item" },
      { path: "project.outOfScope", label: "Not included", type: "list", add: "Add excluded item" },
    ],
  },
  dates: {
    title: "Dates", icon: "chart-gantt",
    fields: [
      { path: "project.proposalDate", label: "Proposal date", type: "date", half: true },
      { path: "project.proposalValidDays", label: "Proposal valid for", type: "select", options: ["7", "14", "21", "30"], suffix: "days", number: true, half: true },
      { path: "project.contractDate", label: "Contract date", type: "date", half: true },
      { path: "project.startDate", label: "Start", type: "date", half: true },
      { path: "project.endDate", label: "Launch", type: "date", half: true },
    ],
  },
  price: {
    title: "Price", icon: "receipt",
    fields: [
      { path: "money.currency", label: "Currency", type: "select", options: CURRENCIES, half: true },
      { path: "money.discount", label: "Discount", type: "money", half: true },
      { path: "money.items", label: "Line items", type: "table", add: "Add line item", columns: [
        { key: "label", label: "Item", type: "text", grow: 3 }, { key: "detail", label: "Detail", type: "text", grow: 4 }, { key: "amount", label: "Amount", type: "money", grow: 2 }] },
      { path: "money.milestones", label: "Payment schedule", type: "table", add: "Add payment", columns: [
        { key: "name", label: "Payment", type: "text", grow: 3 }, { key: "trigger", label: "When", type: "text", grow: 4 }, { key: "percent", label: "%", type: "percent", grow: 1 }] },
    ],
  },
  payment: {
    title: "Getting paid", icon: "download",
    fields: [
      { path: "money.paymentMethods", label: "Payment methods", type: "chips", options: ["Bank transfer", "InstaPay", "Vodafone Cash", "PayPal", "Payoneer", "Cash"] },
      { path: "money.bankDetails", label: "Account details", type: "textarea", hint: "Account name, bank, account number or IBAN, InstaPay address." },
      { path: "money.paymentDueDays", label: "Invoices due in", type: "select", options: ["7", "14", "30"], suffix: "days", number: true, half: true },
      { path: "money.lateFeePercentPerMonth", label: "Late fee per month", type: "select", options: ["0", "1", "1.5", "2", "3"], suffix: "%", number: true, half: true },
      { path: "money.hourlyRate", label: "Hourly rate", type: "money", half: true },
      { path: "money.minorEditFee", label: "Small edit fee", type: "money", half: true, hint: "Flat fee for a change under 30 minutes." },
    ],
  },
  terms: {
    title: "Rules", icon: "scroll-text",
    fields: [
      { path: "terms.revisionRoundsPerMilestone", label: "Revision rounds per milestone", type: "select", options: range(1, 5), number: true, half: true },
      { path: "terms.feedbackDays", label: "Client feedback within", type: "select", options: range(2, 10), suffix: "business days", number: true, half: true },
      { path: "terms.acceptanceDays", label: "Auto-approval after", type: "select", options: range(2, 10), suffix: "business days", number: true, half: true },
      { path: "terms.supportDays", label: "Free support", type: "select", options: ["14", "30", "60", "90"], suffix: "days", number: true, half: true },
      { path: "terms.pauseAfterDays", label: "Pause project after silence of", type: "select", options: ["14", "21", "30", "45", "60"], suffix: "days", number: true, half: true },
      { path: "terms.restartFeePercent", label: "Restart fee", type: "select", options: range(0, 30, 5), suffix: "%", number: true, half: true },
      { path: "terms.killFeePercent", label: "Cancellation fee", type: "select", options: range(0, 50, 5), suffix: "%", number: true, half: true },
      { path: "terms.rushSurchargePercent", label: "Rush surcharge", type: "select", options: range(0, 100, 10), suffix: "%", number: true, half: true },
      { path: "terms.noticeDays", label: "Termination notice", type: "select", options: ["7", "14", "30"], suffix: "days", number: true, half: true },
    ],
  },
  invoice: {
    title: "Invoice", icon: "receipt",
    fields: [
      { path: "invoice.number", label: "Invoice number", type: "text", half: true },
      { path: "invoice.amountPaid", label: "Already paid", type: "money", half: true },
      { path: "invoice.issueDate", label: "Issued", type: "date", half: true },
      { path: "invoice.dueDate", label: "Due", type: "date", half: true },
      { path: "invoice.lines", label: "Invoice lines", type: "table", add: "Add line", columns: [
        { key: "label", label: "Item", type: "text", grow: 3 }, { key: "detail", label: "Detail", type: "text", grow: 4 }, { key: "amount", label: "Amount", type: "money", grow: 2 }] },
    ],
  },
  kickoff: {
    title: "Kick-off", icon: "rocket",
    fields: [
      { path: "kickoff.audience", label: "Audience", type: "textarea", hint: "Who uses the product, what they need to do, on which devices." },
      { path: "kickoff.metrics", label: "How we measure each goal", type: "list", add: "Add measure", hint: "One line per goal, in the same order as the goals." },
      { path: "kickoff.milestoneDates", label: "Milestone dates", type: "list", fixed: ["Content received", "Design ready", "Design approved", "Preview ready"], itemType: "date" },
      { path: "kickoff.risk", label: "Main risk and how we handle it", type: "textarea" },
      { path: "kickoff.actions", label: "Action items", type: "table", add: "Add action", columns: [
        { key: "action", label: "Action", type: "text", grow: 5 }, { key: "owner", label: "Owner", type: "text", grow: 2 }, { key: "due", label: "Due", type: "date", grow: 2 }] },
    ],
  },
  midProject: {
    title: "Progress", icon: "chart-gantt",
    fields: [
      { path: "midProject.date", label: "Report date", type: "date", half: true },
      { path: "midProject.status", label: "Status", type: "select", options: ["On track", "At risk", "Delayed", "Ahead of schedule"], half: true },
      { path: "midProject.progressPercent", label: "Progress", type: "range", half: true },
      { path: "midProject.feedbackBy", label: "Feedback needed by", type: "date", half: true },
      { path: "midProject.done", label: "Done", type: "list", add: "Add item" },
      { path: "midProject.inProgress", label: "In progress", type: "list", add: "Add item" },
      { path: "midProject.next", label: "Coming next", type: "list", add: "Add item" },
      { path: "midProject.feedbackNeeded", label: "Feedback needed", type: "list", add: "Add question" },
      { path: "midProject.changeRequests", label: "Change requests", type: "table", add: "Add change request", columns: [
        { key: "item", label: "Request", type: "text", grow: 4 }, { key: "requested", label: "Requested", type: "date", grow: 2 },
        { key: "cost", label: "Cost", type: "money", grow: 2 }, { key: "timeImpact", label: "Time", type: "text", grow: 1.4 },
        { key: "status", label: "Status", type: "select", options: ["Awaiting approval", "Approved", "Declined", "Done"], grow: 2.4 }] },
    ],
  },
  delivery: {
    title: "Handover", icon: "package-check",
    fields: [
      { path: "delivery.date", label: "Handover date", type: "date", half: true },
      { path: "delivery.hosting", label: "Hosting", type: "text", half: true },
      { path: "delivery.stack", label: "Stack", type: "text" },
      { path: "delivery.domain", label: "Domain", type: "text" },
      { path: "delivery.backups", label: "Backups", type: "text" },
      { path: "delivery.deliverables", label: "Deliverables", type: "table", add: "Add deliverable", columns: [
        { key: "item", label: "Deliverable", type: "text", grow: 3 },
        { key: "format", label: "Format", type: "combo", options: ["URL", "Git repository", "Figma", "PDF", "PDF and video", "MP4", "ZIP archive", "App store listing"], grow: 2 },
        { key: "where", label: "Where", type: "text", grow: 3 }] },
    ],
  },
  completion: {
    title: "Wrap-up", icon: "badge-check",
    fields: [
      { path: "completion.date", label: "Report date", type: "date", half: true },
      { path: "completion.plannedEnd", label: "Planned end", type: "date", half: true },
      { path: "completion.actualEnd", label: "Actual end", type: "date", half: true },
      { path: "completion.highlights", label: "What we delivered", type: "list", add: "Add item" },
      { path: "completion.results", label: "Result for each goal", type: "list", add: "Add result", hint: "One line per goal, in the same order as the goals." },
    ],
  },
  email: {
    title: "Email text", icon: "mail",
    fields: [{ path: "$email", label: "Proposal email", type: "markdown", hint: "**bold**, - for bullets, --- for a divider, ## starts the follow-up page." }],
  },
  studio: {
    title: "Your details", icon: "settings-2",
    fields: [
      { path: "studio.name", label: "Name", type: "text", half: true },
      { path: "studio.legalName", label: "Legal name", type: "text", half: true },
      { path: "studio.title", label: "Title", type: "text", half: true },
      { path: "studio.city", label: "City", type: "text", half: true },
      { path: "studio.email", label: "Email", type: "text" },
      { path: "studio.phone", label: "Phone", type: "text", half: true },
      { path: "studio.linkedin", label: "LinkedIn", type: "text", half: true },
      { path: "studio.website", label: "Website", type: "text" },
    ],
  },
};

/** The sections each document draws from, most important first. */
export const DOC_SECTIONS = {
  "01-proposal": ["client", "project", "dates", "price", "terms"],
  "02-contract": ["client", "project", "dates", "price", "payment", "terms"],
  "02b-terms-and-conditions": ["terms", "payment", "price", "dates"],
  "03-invoice": ["invoice", "client", "payment"],
  "04-welcome": ["client", "project", "dates", "terms"],
  "05-kickoff": ["kickoff", "project", "dates", "client"],
  "06-mid-project-report": ["midProject", "price", "dates"],
  "07-final-deliverables": ["delivery", "terms"],
  "08-project-completion": ["completion", "project", "price"],
  "09-proposal-email": ["email"],
};

export const DOC_ICONS = {
  "01-proposal": "file-text", "02-contract": "file-signature", "02b-terms-and-conditions": "scroll-text", "03-invoice": "receipt",
  "04-welcome": "hand-heart", "05-kickoff": "rocket", "06-mid-project-report": "chart-gantt", "07-final-deliverables": "package-check",
  "08-project-completion": "badge-check", "09-proposal-email": "mail",
};
