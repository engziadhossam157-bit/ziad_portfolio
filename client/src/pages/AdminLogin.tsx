import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowUpRight, Loader2, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startGoogleLogin } from "@/const";
import { trpc } from "@/lib/trpc";

/** Admin sign-in. The first visit, before any admin password exists, sets it up for OWNER_EMAIL. */
export default function AdminLogin() {
  const { user, loading, refresh } = useAuth();
  const setupNeeded = trpc.auth.adminSetupNeeded.useQuery();
  const googleEnabled = trpc.auth.googleEnabled.useQuery();
  const login = trpc.auth.adminLogin.useMutation({ onSuccess: () => refresh() });
  const setup = trpc.auth.adminSetup.useMutation({ onSuccess: () => { refresh(); setupNeeded.refetch(); } });
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const isSetup = setupNeeded.data === true;
  const error = (isSetup ? setup.error : login.error)?.message
    ?? (new URLSearchParams(window.location.search).get("error") === "google" ? "That Google account does not have admin access." : null);
  const pending = login.isPending || setup.isPending;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isSetup) setup.mutate(form);
    else login.mutate({ email: form.email, password: form.password });
  };

  return (
    <main className="login-page">
      <Link href="/" className="wordmark login-wordmark">ZIAD<span>.</span></Link>
      <div className="login-shell is-single">
        <div className="login-card">
          <ShieldCheck size={22} className="accent-icon" />
          <p className="section-kicker">ADMIN SIGN-IN</p>
          {loading || setupNeeded.isLoading ? (
            <p>Checking your session…</p>
          ) : user?.role === "admin" ? (
            <>
              <h1>Welcome back.</h1>
              <p>You are signed in as the admin.</p>
              <Link href="/admin" className="button button-accent">OPEN ADMIN DASHBOARD <ArrowUpRight size={17} /></Link>
            </>
          ) : (
            <>
              <h1>{isSetup ? "Set up the admin account." : "Admin dashboard."}</h1>
              <p>{isSetup ? "This runs once. Use the site owner's email and choose a password of at least 8 characters." : "Sign in with the admin email and password."}</p>
              {user && <p className="login-note">You are signed in as a client. Signing in here switches to the admin account.</p>}
              <form onSubmit={submit} className="project-form" style={{ width: "100%" }}>
                {isSetup && (
                  <label>
                    NAME
                    <input className="form-input" required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  </label>
                )}
                <label>
                  EMAIL
                  <input className="form-input" type="email" required autoComplete="username" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </label>
                <label>
                  PASSWORD
                  <input className="form-input" type="password" required minLength={isSetup ? 8 : 1} autoComplete={isSetup ? "new-password" : "current-password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </label>
                {error && <div className="form-error" role="alert"><p>{error}</p></div>}
                <button type="submit" className="button button-accent" disabled={pending} style={{ width: "100%", justifyContent: "center" }}>
                  {pending ? <Loader2 className="spin" size={16} /> : <ArrowUpRight size={17} />}
                  {isSetup ? "CREATE ADMIN ACCOUNT" : "SIGN IN"}
                </button>
              </form>
              {googleEnabled.data && !isSetup && (
                <>
                  <div className="login-divider"><span>OR</span></div>
                  <button onClick={() => startGoogleLogin()} className="google-button">CONTINUE WITH GOOGLE</button>
                </>
              )}
            </>
          )}
          <Link href="/" className="back-link"><ArrowLeft size={15} /> RETURN TO PUBLIC SITE</Link>
        </div>
      </div>
    </main>
  );
}
