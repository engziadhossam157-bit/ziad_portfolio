import { useState, FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Shell from "@/components/DashboardShell";

type ProfileForm = { name: string; phone: string; company: string; address: string };

function ProfileFormFields({ initial }: { initial: ProfileForm }) {
  const [form, setForm] = useState<ProfileForm>(initial);
  const mutation = trpc.portal.updateProfile.useMutation();
  const update = (key: keyof ProfileForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate({ name: form.name, phone: form.phone, company: form.company, address: form.address });
  };
  return <form className="admin-form" onSubmit={submit}>
    <div className="form-grid">
      <label>NAME<input className="form-input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" /></label>
      <label>PHONE<input className="form-input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone number" /></label>
      <label>COMPANY<input className="form-input" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Company or brand" /></label>
      <label>ADDRESS<input className="form-input" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Mailing address" /></label>
    </div>
    <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1.5rem" }}>
      <button className="button button-accent" type="submit" disabled={mutation.isPending}>{mutation.isPending ? "SAVING…" : "SAVE CHANGES"}</button>
      {mutation.isSuccess && <span style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: ".4rem", fontSize: ".72rem", fontWeight: 600 }}><CheckCircle2 size={15} /> SAVED</span>}
    </div>
  </form>;
}

export default function PortalProfile() {
  const { user, loading } = useAuth();
  return <Shell>
    <div className="dashboard-heading"><div><p className="section-kicker">/ PROFILE</p><h1>YOUR<br /><span>PROFILE.</span></h1></div></div>
    <div className="admin-form">
      <label style={{ display: "flex", flexDirection: "column", gap: ".55rem", color: "var(--muted)", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".03em", marginBottom: "1.5rem" }}>
        EMAIL (ACCOUNT IDENTIFIER)
        <input className="form-input" value={user?.email ?? ""} disabled readOnly />
      </label>
    </div>
    {!loading && user && <ProfileFormFields
      key={user.id}
      initial={{ name: user.name ?? "", phone: user.phone ?? "", company: user.company ?? "", address: user.address ?? "" }}
    />}
  </Shell>;
}
