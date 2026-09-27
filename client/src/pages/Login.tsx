import { FormEvent, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Boxes, CalendarCheck, Loader2, LockKeyhole, MessagesSquare } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startGoogleLogin } from "@/const";
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

export default function Login() {
  const { user, loading, refresh } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const googleEnabled = trpc.auth.googleEnabled.useQuery();
  const login = trpc.auth.login.useMutation({ onSuccess: () => refresh() });
  const register = trpc.auth.register.useMutation({ onSuccess: () => refresh() });
  const pending = login.isPending || register.isPending;
  // Where to go after sign-in: the page that sent the visitor here, otherwise the workspace for the account's role.
  const safeNext = safeNextPath(new URLSearchParams(window.location.search).get("next"));
  const error = login.error ?? register.error;

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

  const update = (key: keyof typeof form, value: string) =>
    setForm(current => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "login") {
      login.mutate({ email: form.email, password: form.password });
    } else {
      register.mutate({ name: form.name, email: form.email, password: form.password });
    }
  };

  return (
    <main className="login-page">
      <Link href="/" className="wordmark login-wordmark">ZIAD<span>.</span></Link>
      <div className="login-shell">
        <div className="login-panel" ref={panelRef}>
          <p className="section-kicker">CLIENT WORKSPACE</p>
          <h1>Everything about your project, <span>in one place.</span></h1>
          <ul className="login-perks">
            {PERKS.map(({ icon: Icon, label }) => (
              <li className="login-perk" key={label}><Icon size={18} /> {label}</li>
            ))}
          </ul>
        </div>

        <div className="login-card" ref={cardRef}>
          <LockKeyhole size={22} className="accent-icon" />
          <p className="section-kicker">SECURE SIGN-IN</p>
          {loading ? (
            <p>Checking your session…</p>
          ) : user ? (
            <>
              <h1>Welcome back.</h1>
              <p>You’re already signed in. Continue to your workspace.</p>
              <Link href={safeNext ?? (user.role === "admin" ? "/admin" : "/portal")} className="button button-accent">
                ENTER WORKSPACE <ArrowUpRight size={17} />
              </Link>
            </>
          ) : (
            <>
              <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
              <p>{mode === "login" ? "Sign in to access project progress, requests, messages, and meetings." : "Set up access to your client workspace."}</p>
              <form onSubmit={submit} className="project-form" style={{ width: "100%" }}>
                {mode === "register" && (
                  <label>
                    NAME
                    <input className="form-input" required autoComplete="name" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name" />
                  </label>
                )}
                <label>
                  EMAIL
                  <input className="form-input" type="email" required autoComplete="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@company.com" />
                </label>
                <label>
                  PASSWORD
                  <input className="form-input" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={e => update("password", e.target.value)} placeholder={mode === "register" ? "At least 8 characters" : "Your password"} />
                </label>
                {error && (
                  <div className="form-error" role="alert">
                    <p>{error.message}</p>
                  </div>
                )}
                <button ref={submitRef} type="submit" className="button button-accent" disabled={pending} style={{ width: "100%", justifyContent: "center" }}>
                  {pending ? <Loader2 className="spin" size={16} /> : <ArrowUpRight size={17} />}
                  {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
                </button>
              </form>
              {googleEnabled.data && (
                <>
                  <div className="login-divider"><span>OR</span></div>
                  <button onClick={() => startGoogleLogin()} className="google-button">
                    CONTINUE WITH GOOGLE
                  </button>
                </>
              )}
              <button
                type="button"
                className="back-link mode-switch"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}
              </button>
            </>
          )}
          <Link href="/" className="back-link"><ArrowLeft size={15} /> RETURN TO PUBLIC SITE</Link>
        </div>
      </div>
    </main>
  );
}
