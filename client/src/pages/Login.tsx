import { FormEvent, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Boxes, CalendarCheck, Loader2, LockKeyhole, MessagesSquare } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { safeNextPath } from "@shared/const";
import { trpc } from "@/lib/trpc";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useMagnetic } from "@/hooks/useMagnetic";

const PERKS = [
  { icon: Boxes, label: "Track every project's progress in one dashboard" },
  { icon: MessagesSquare, label: "Message directly and get replies fast" },
  { icon: CalendarCheck, label: "Book meetings and manage deliverables" },
];

/** Client sign-in: the email and phone from an approved project request. Admins use /admin/login. */
export default function Login() {
  const { user, loading, refresh } = useAuth();
  const [form, setForm] = useState({ email: "", phone: "" });
  const login = trpc.auth.clientLogin.useMutation({ onSuccess: () => refresh() });
  const safeNext = safeNextPath(new URLSearchParams(window.location.search).get("next"));

  const panelRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const submitRef = useMagnetic<HTMLButtonElement>(.25);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(panelRef.current, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: .9, ease: "power3.out" });
    gsap.fromTo(cardRef.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .9, ease: "power3.out", delay: .15 });
    gsap.utils.toArray<HTMLElement>(".login-perk").forEach((el, i) => {
      gsap.fromTo(el, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: .6, delay: .5 + i * .12, ease: "power3.out" });
    });
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate(form);
  };

  return (
    <main className="login-page">
      <Link href="/" className="wordmark login-wordmark">ZIAD<span>.</span></Link>
      <div className="login-shell">
        <div className="login-panel" ref={panelRef}>
          <p className="section-kicker">CLIENT PORTAL</p>
          <h1>Everything about your project, <span>in one place.</span></h1>
          <ul className="login-perks">
            {PERKS.map(({ icon: Icon, label }) => (
              <li className="login-perk" key={label}><Icon size={18} /> {label}</li>
            ))}
          </ul>
        </div>

        <div className="login-card" ref={cardRef}>
          <LockKeyhole size={22} className="accent-icon" />
          <p className="section-kicker">CLIENT SIGN-IN</p>
          {loading ? (
            <p>Checking your session…</p>
          ) : user && user.role !== "admin" ? (
            <>
              <h1>Welcome back.</h1>
              <p>You are already signed in.</p>
              <Link href={safeNext ?? "/portal"} className="button button-accent">ENTER CLIENT PORTAL <ArrowUpRight size={17} /></Link>
            </>
          ) : (
            <>
              <h1>Welcome back.</h1>
              <p>Sign in with the email and phone number from your project request. Your portal opens once your project is approved.</p>
              <form onSubmit={submit} className="project-form" style={{ width: "100%" }}>
                <label>
                  EMAIL
                  <input className="form-input" type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
                </label>
                <label>
                  PHONE
                  <input className="form-input" type="tel" required minLength={7} autoComplete="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="The number you gave in your request" />
                </label>
                {login.error && (
                  <div className="form-error" role="alert">
                    <p>{login.error.message}</p>
                  </div>
                )}
                <button ref={submitRef} type="submit" className="button button-accent" disabled={login.isPending} style={{ width: "100%", justifyContent: "center" }}>
                  {login.isPending ? <Loader2 className="spin" size={16} /> : <ArrowUpRight size={17} />}
                  SIGN IN
                </button>
              </form>
              <p className="login-note">No project yet? <Link href="/start-project">Send a project request</Link>. You can sign in here after it is approved.</p>
            </>
          )}
          <Link href="/" className="back-link"><ArrowLeft size={15} /> RETURN TO PUBLIC SITE</Link>
        </div>
      </div>
    </main>
  );
}
