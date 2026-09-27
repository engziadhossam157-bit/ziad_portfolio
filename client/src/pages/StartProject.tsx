import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const fieldClass = "form-input";
const Optional = () => <small className="field-optional">OPTIONAL</small>;

export default function StartProject() {
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({ name: "", email: "", company: "", projectName: "", projectType: "", description: "", requiredFeatures: "", budget: "", deadline: "", referenceUrls: "", phone: "" });
  const [otherProjectType, setOtherProjectType] = useState("");
  const [otherBudget, setOtherBudget] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [requestId, setRequestId] = useState<number>();
  const [uploadStates, setUploadStates] = useState<Record<string, "pending" | "uploaded" | "failed">>({});
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
      <div className="system-wrap">
        <div className="system-intro">
          <p className="section-kicker">START A PROJECT</p>
          <h1>LET'S MAKE<br /><span>IT CLEAR.</span></h1>
          <p>Tell me what you're building, where it needs to go, and what success looks like. The more context you share, the better the first conversation.</p>
        </div>
        <form className="project-form" onSubmit={submit}>
          <div className="form-section-title"><span>01</span><h2>ABOUT YOU</h2></div>
          <div className="form-grid">
            <label>NAME<input className={fieldClass} required autoComplete="name" value={answers.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" /></label>
            <label>EMAIL<input className={fieldClass} type="email" required autoComplete="email" value={answers.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" /></label>
            <label><span>COMPANY <Optional /></span><input className={fieldClass} autoComplete="organization" value={answers.company} onChange={(e) => update("company", e.target.value)} placeholder="Company or brand" /></label>
            <label><span>PHONE <Optional /></span><input className={fieldClass} type="tel" autoComplete="tel" value={answers.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Best number to reach you" /></label>
          </div>
          <div className="form-section-title"><span>02</span><h2>THE PROJECT</h2></div>
          <div className="form-grid">
            <label>PROJECT NAME<input className={fieldClass} required value={answers.projectName} onChange={(e) => update("projectName", e.target.value)} placeholder="What should we call it?" /></label>
            <label>PROJECT TYPE<select className={fieldClass} required value={answers.projectType} onChange={(e) => update("projectType", e.target.value)}><option value="">Select type</option><option>Business Website</option><option>E-commerce</option><option>Web Application</option><option>WordPress</option><option>Custom Development</option><option>Other</option></select>{answers.projectType === "Other" && <input className={fieldClass} required value={otherProjectType} onChange={(e) => setOtherProjectType(e.target.value)} placeholder="What kind of project is it?" aria-label="Other project type" />}</label>
            <label><span>BUDGET <Optional /></span><select className={fieldClass} value={answers.budget} onChange={(e) => update("budget", e.target.value)}><option value="">Select range</option><option>Under $1,000</option><option>$1,000 - $3,000</option><option>$3,000 - $7,000</option><option>$7,000+</option><option>Not sure yet</option><option>Other</option></select>{answers.budget === "Other" && <input className={fieldClass} value={otherBudget} onChange={(e) => setOtherBudget(e.target.value)} placeholder="Your budget" aria-label="Other budget" />}</label>
            <label><span>DEADLINE <Optional /></span><input className={fieldClass} type="date" min={today} value={answers.deadline} onChange={(e) => update("deadline", e.target.value)} /></label>
          </div>
          <label>PROJECT DESCRIPTION<textarea className={`${fieldClass} form-textarea`} required minLength={20} value={answers.description} onChange={(e) => update("description", e.target.value)} placeholder="What are you trying to make, change, or unlock? (20 characters minimum)" /></label>
          <label><span>REQUIRED FEATURES <Optional /></span><textarea className={`${fieldClass} form-textarea`} value={answers.requiredFeatures} onChange={(e) => update("requiredFeatures", e.target.value)} placeholder="Features, integrations, pages, or constraints" /></label>
          <label><span>REFERENCE WEBSITES <Optional /></span><input className={fieldClass} value={answers.referenceUrls} onChange={(e) => update("referenceUrls", e.target.value)} placeholder="Links separated by commas" /></label>
          <div className="file-drop">
            <span>ATTACHMENTS <Optional /></span>
            <p>PDFs, images, docs, and designs are uploaded securely to project storage after you send the request.</p>
            <input type="file" multiple accept="image/*,.pdf,.doc,.docx" disabled={!!requestId} onChange={(e) => setFiles(Array.from(e.target.files ?? []))} aria-label="Attach files" />
            {files.length > 0 && <div className="file-status-list">{files.map((file) => <div key={file.name}><span>{file.name}</span><span className="file-status-actions"><b className={uploadStates[file.name] ?? "pending"}>{uploadStates[file.name] ?? "ready"}</b>{requestId && uploadStates[file.name] === "failed" && <button type="button" className="file-retry" onClick={() => uploadFile(file, requestId)}>RETRY</button>}</span></div>)}</div>}
          </div>
          {create.error && <div className="form-error" role="alert"><p>{create.error.message || "Your request could not be sent. Please check the form and try again."}</p></div>}
          {requestId && uploadsFailed && <div className="form-error" role="alert"><p>Your request was sent, but some files could not be uploaded. Retry the failed files below.</p><button type="button" className="outline-button" onClick={retryFailed} disabled={upload.isPending}>RETRY FAILED UPLOADS</button></div>}
          {!requestId && <button className="button button-accent submit-button" type="submit" disabled={create.isPending}>{create.isPending ? <Loader2 className="spin" size={16} /> : <ArrowUpRight size={18} />} SEND PROJECT REQUEST</button>}
          {requestId && !uploadsFailed && upload.isPending && <p className="form-status" role="status"><Loader2 className="spin" size={16} /> Uploading your files…</p>}
        </form>
      </div>
    </main>
  );
}
