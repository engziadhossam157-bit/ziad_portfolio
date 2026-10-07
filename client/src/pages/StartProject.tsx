import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Code2, Globe, LayoutTemplate, Loader2, Monitor, Paperclip, ShoppingBag, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { CONTACT_EMAIL } from "@/lib/site";

const fieldClass = "form-input";
const Optional = () => <small className="field-optional">OPTIONAL</small>;
const MIN_DESCRIPTION = 20;

// Stored values match what earlier requests saved, so the admin view stays consistent.
const PROJECT_TYPES = [
  { value: "Web Application", label: "Web application", icon: Code2 },
  { value: "E-commerce", label: "E-commerce store", icon: ShoppingBag },
  { value: "Business Website", label: "Business website", icon: Globe },
  { value: "WordPress", label: "WordPress site", icon: LayoutTemplate },
  { value: "Desktop Application", label: "Desktop app", icon: Monitor },
  { value: "Other", label: "Something else", icon: Sparkles },
];
const BUDGETS = ["Under $1,000", "$1,000 - $3,000", "$3,000 - $7,000", "$7,000+", "Not sure yet", "Other"];

const NEXT_STEPS = [
  { title: "I read your brief", body: "Every request comes to me directly, and I note anything that needs clarifying." },
  { title: "We talk it through", body: "I reply by email to go over scope, timeline, and budget before anything starts." },
  { title: "Work starts in your portal", body: "Once we agree, the project opens in your client portal, where you follow milestones and deliverables." },
];

export default function StartProject() {
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({ name: "", email: "", company: "", projectName: "", projectType: "", description: "", requiredFeatures: "", budget: "", deadline: "", referenceUrls: "", phone: "" });
  const [otherProjectType, setOtherProjectType] = useState("");
  const [otherBudget, setOtherBudget] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [requestId, setRequestId] = useState<number>();
  const [uploadStates, setUploadStates] = useState<Record<string, "pending" | "uploaded" | "failed">>({});
  const errorRef = useRef<HTMLDivElement>(null);
  const upload = trpc.requests.uploadPublicAttachment.useMutation();
  const uploadFile = async (file: File, id: number) => {
    setUploadStates((current) => ({ ...current, [file.name]: "pending" }));
    try {
      const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      await upload.mutateAsync({ requestId: id, filename: file.name, mimeType: file.type || "application/octet-stream", base64 });
      setUploadStates((current) => ({ ...current, [file.name]: "uploaded" }));
      return true;
    } catch {
      setUploadStates((current) => ({ ...current, [file.name]: "failed" }));
      return false;
    }
  };
  const create = trpc.requests.create.useMutation({ onSuccess: async (result) => { const id = Number(result.requestId); setRequestId(id); const results = await Promise.all(files.map((file) => uploadFile(file, id))); if (results.every(Boolean)) setSubmitted(true); } });
  const update = (key: keyof typeof answers, value: string) => setAnswers((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    // The request already exists once requestId is set; only failed uploads may be retried from here.
    if (requestId) return;
    const projectType = answers.projectType === "Other" ? otherProjectType.trim() : answers.projectType;
    const budget = answers.budget === "Other" ? otherBudget.trim() : answers.budget;
    create.mutate({ ...answers, projectType, budget, deadline: answers.deadline ? new Date(answers.deadline) : undefined });
  };
  const retryFailed = async () => {
    if (!requestId) return;
    const failed = files.filter((file) => uploadStates[file.name] === "failed");
    const results = await Promise.all(failed.map((file) => uploadFile(file, requestId)));
    if (results.every(Boolean)) setSubmitted(true);
  };
  const uploadsFailed = Object.values(uploadStates).includes("failed");
  const today = new Date().toISOString().slice(0, 10);
  const descriptionLeft = Math.max(0, MIN_DESCRIPTION - answers.description.trim().length);

  // Send keyboard and screen-reader users straight to the problem when a request fails.
  useEffect(() => { if (create.error || (requestId && uploadsFailed)) errorRef.current?.focus(); }, [create.error, requestId, uploadsFailed]);

  if (submitted) return (
    <main className="system-page centered-state">
      <CheckCircle2 size={52} className="accent-icon" />
      <p className="section-kicker">REQUEST RECEIVED</p>
      <h1>THANK YOU<span>.</span></h1>
      <p>Your project request is in. I'll review the brief and email you at {answers.email} with the next step.</p>
      <Link href="/" className="button button-accent">BACK TO PORTFOLIO <ArrowUpRight size={17} /></Link>
    </main>
  );

  return (
    <main className="system-page">
      <header className="system-header"><Link href="/" className="wordmark">ZIAD<span>.</span></Link><Link href="/" className="back-link"><ArrowLeft size={15} /> BACK TO SITE</Link></header>
      <div className="request-layout section-grid">
        <aside className="request-aside">
          <p className="section-kicker">START A PROJECT</p>
          <h1>LET'S MAKE<br /><span>IT CLEAR.</span></h1>
          <p className="request-intro">Tell me what you're building, where it needs to go, and what success looks like. The more context you share, the better the first conversation.</p>
          <h2 className="request-steps-title">What happens next</h2>
          <ol className="request-steps">{NEXT_STEPS.map((step) => <li key={step.title}><strong>{step.title}</strong><span>{step.body}</span></li>)}</ol>
          <p className="request-alt">Prefer to talk first? <Link href="/book-a-meeting">Book a meeting</Link> or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
        </aside>

        <form className="project-form request-form" onSubmit={submit}>
          <div className="form-section-title"><span>01</span><h2>ABOUT YOU</h2></div>
          <div className="form-grid">
            <label>NAME<input className={fieldClass} required autoComplete="name" value={answers.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" /></label>
            <label>EMAIL<input className={fieldClass} type="email" required autoComplete="email" value={answers.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" /></label>
            <label><span>COMPANY <Optional /></span><input className={fieldClass} autoComplete="organization" value={answers.company} onChange={(e) => update("company", e.target.value)} placeholder="Company or brand" /></label>
            <label><span>PHONE</span><input className={fieldClass} type="tel" required minLength={7} autoComplete="tel" value={answers.phone} onChange={(e) => update("phone", e.target.value)} placeholder="You will sign in to your portal with this number" /></label>
          </div>

          <div className="form-section-title"><span>02</span><h2>THE PROJECT</h2></div>
          <label>PROJECT NAME<input className={fieldClass} required value={answers.projectName} onChange={(e) => update("projectName", e.target.value)} placeholder="What should we call it?" /></label>
          <fieldset className="choice-group">
            <legend>WHAT ARE WE BUILDING?</legend>
            <div className="type-grid">
              {PROJECT_TYPES.map(({ value, label, icon: Icon }) => (
                <label key={value} className="type-tile">
                  <input type="radio" name="projectType" value={value} required checked={answers.projectType === value} onChange={() => update("projectType", value)} />
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {answers.projectType === "Other" && <input className={fieldClass} required value={otherProjectType} onChange={(e) => setOtherProjectType(e.target.value)} placeholder="What kind of project is it?" aria-label="Describe the project type" />}
          </fieldset>
          <fieldset className="choice-group">
            <legend><span>BUDGET <Optional /></span></legend>
            <div className="chip-row">
              {BUDGETS.map((value) => (
                <label key={value} className="chip">
                  <input type="radio" name="budget" value={value} checked={answers.budget === value} onChange={() => update("budget", value)} />
                  <span>{value}</span>
                </label>
              ))}
            </div>
            {answers.budget === "Other" && <input className={fieldClass} value={otherBudget} onChange={(e) => setOtherBudget(e.target.value)} placeholder="Your budget" aria-label="Your budget" />}
          </fieldset>
          <label className="deadline-field"><span>DEADLINE <Optional /></span><input className={fieldClass} type="date" min={today} value={answers.deadline} onChange={(e) => update("deadline", e.target.value)} /></label>

          <div className="form-section-title"><span>03</span><h2>THE DETAILS</h2></div>
          <label>
            <span>PROJECT DESCRIPTION <small className={`field-count${descriptionLeft ? "" : " is-done"}`} aria-live="polite">{descriptionLeft ? `${descriptionLeft} MORE CHARACTERS` : "LOOKS GOOD"}</small></span>
            <textarea className={`${fieldClass} form-textarea`} required minLength={MIN_DESCRIPTION} value={answers.description} onChange={(e) => update("description", e.target.value)} placeholder="What are you trying to make, change, or unlock?" />
          </label>
          <label><span>REQUIRED FEATURES <Optional /></span><textarea className={`${fieldClass} form-textarea`} value={answers.requiredFeatures} onChange={(e) => update("requiredFeatures", e.target.value)} placeholder="Features, integrations, pages, or constraints" /></label>
          <label><span>REFERENCE WEBSITES <Optional /></span><input className={fieldClass} value={answers.referenceUrls} onChange={(e) => update("referenceUrls", e.target.value)} placeholder="Links separated by commas" /></label>

          <div className={`file-drop${files.length ? " has-files" : ""}`}>
            {/* The native file input covers the whole zone, so drag-and-drop works without extra code. */}
            <input type="file" multiple accept="image/*,.pdf,.doc,.docx" disabled={!!requestId} onChange={(e) => setFiles(Array.from(e.target.files ?? []))} aria-label="Attach files" />
            <Paperclip size={22} aria-hidden="true" />
            <strong>Drop files here or click to browse</strong>
            <p>PDFs, images, docs, and designs. They upload securely after you send the request.</p>
            {files.length > 0 && <div className="file-status-list">{files.map((file) => <div key={file.name}><span>{file.name}</span><span className="file-status-actions"><b className={uploadStates[file.name] ?? "pending"}>{uploadStates[file.name] ?? "ready"}</b>{requestId && uploadStates[file.name] === "failed" && <button type="button" className="file-retry" onClick={() => uploadFile(file, requestId)}>RETRY</button>}</span></div>)}</div>}
          </div>

          {create.error && <div className="form-error" role="alert" tabIndex={-1} ref={errorRef}><p>{create.error.message || "Your request could not be sent. Please check the form and try again."}</p></div>}
          {requestId && uploadsFailed && <div className="form-error" role="alert" tabIndex={-1} ref={errorRef}><p>Your request was sent, but some files could not be uploaded. Retry the failed files below.</p><button type="button" className="outline-button" onClick={retryFailed} disabled={upload.isPending}>RETRY FAILED UPLOADS</button></div>}
          <div className="request-submit">
            {!requestId && <button className="button button-accent submit-button" type="submit" disabled={create.isPending}>{create.isPending ? <Loader2 className="spin" size={16} /> : <ArrowUpRight size={18} />} SEND PROJECT REQUEST</button>}
            {requestId && !uploadsFailed && upload.isPending && <p className="form-status" role="status"><Loader2 className="spin" size={16} /> Uploading your files…</p>}
            {!requestId && <p className="request-note">I'll reply by email with the next step.</p>}
          </div>
        </form>
      </div>
    </main>
  );
}
