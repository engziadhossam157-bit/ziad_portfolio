import { ArrowUpRight } from "lucide-react";
import { Tilt3D } from "@/components/Motion";

type Certificate = { title: string; issuer: string; issueYear?: number | null; description?: string | null; verifyUrl?: string | null };

/** Seal initials: an acronym in parentheses wins ("Information Technology Institute (ITI)" -> ITI). */
function issuerMark(issuer: string) {
  const acronym = issuer.match(/\(([A-Z0-9]{2,5})\)/)?.[1];
  if (acronym) return acronym;
  const words = issuer.split(/\s+/).filter((word) => word && !/^(of|and|the|for|&)$/i.test(word));
  return (words.length > 1 ? words.slice(0, 3).map((word) => word[0]).join("") : (words[0] ?? "").slice(0, 3)).toUpperCase();
}

/** A certificate as a landscape document: double-rule frame, issuer seal, big title. */
export function CertificateCard({ cert, dark = false }: { cert: Certificate; dark?: boolean }) {
  return (
    <Tilt3D className={`cert-card${dark ? " is-dark" : ""}`} intensity={5}>
      <div className="cert-top">
        <span className="cert-kicker">CERTIFICATE{cert.issueYear ? ` · ${cert.issueYear}` : ""}</span>
        <span className="cert-seal" aria-hidden="true">{issuerMark(cert.issuer)}</span>
      </div>
      <h3>{cert.title}</h3>
      <p className="cert-issuer">{cert.issuer}</p>
      {cert.description && <p className="cert-desc">{cert.description}</p>}
      {cert.verifyUrl && <a className="cert-verify" href={cert.verifyUrl} target="_blank" rel="noreferrer">VERIFY CREDENTIAL <ArrowUpRight size={14} /></a>}
    </Tilt3D>
  );
}
