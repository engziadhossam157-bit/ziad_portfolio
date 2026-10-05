import { ArrowUpRight } from "lucide-react";
import { Tilt3D } from "@/components/Motion";

type Certificate = { title: string; issuer: string; issueYear?: number | null; credentialId?: string | null; description?: string | null; imageUrl?: string | null; verifyUrl?: string | null };

/** Issuer logos keyed by seal initials. Issuers without one keep the lettered seal. */
const ISSUER_LOGOS: Record<string, string> = {
  ITI: "/images/certificates/iti-logo.png",
  YAT: "/images/certificates/yat-logo.png",
};

/** Seal initials: an acronym in parentheses wins ("Information Technology Institute (ITI)" -> ITI). */
function issuerMark(issuer: string) {
  const acronym = issuer.match(/\(([A-Z0-9]{2,5})\)/)?.[1];
  if (acronym) return acronym;
  const words = issuer.split(/\s+/).filter((word) => word && !/^(of|and|the|for|&)$/i.test(word));
  return (words.length > 1 ? words.slice(0, 3).map((word) => word[0]).join("") : (words[0] ?? "").slice(0, 3)).toUpperCase();
}

/** A certificate as a document: the real scan on top, issuer logo, big title. */
export function CertificateCard({ cert, dark = false }: { cert: Certificate; dark?: boolean }) {
  const mark = issuerMark(cert.issuer);
  const logo = ISSUER_LOGOS[mark];
  return (
    <Tilt3D className={`cert-card${dark ? " is-dark" : ""}${cert.imageUrl ? " has-scan" : ""}`} intensity={5}>
      {cert.imageUrl && <a className="cert-scan" href={cert.imageUrl} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">
        <img src={cert.imageUrl} alt="" loading="lazy" decoding="async" />
      </a>}
      <div className="cert-top">
        <span className="cert-kicker">CERTIFICATE{cert.issueYear ? ` · ${cert.issueYear}` : ""}{cert.credentialId && <><br />NO. {cert.credentialId}</>}</span>
        {logo
          ? <span className="cert-logo"><img src={logo} alt={cert.issuer} loading="lazy" /></span>
          : <span className="cert-seal" aria-hidden="true">{mark}</span>}
      </div>
      <h3>{cert.title}</h3>
      <p className="cert-issuer">{cert.issuer}</p>
      {cert.description && <p className="cert-desc">{cert.description}</p>}
      {(cert.imageUrl || cert.verifyUrl) && <div className="cert-links">
        {cert.imageUrl && <a className="cert-verify" href={cert.imageUrl} target="_blank" rel="noreferrer">VIEW CERTIFICATE <ArrowUpRight size={14} /></a>}
        {cert.verifyUrl && <a className="cert-verify" href={cert.verifyUrl} target="_blank" rel="noreferrer">VERIFY CREDENTIAL <ArrowUpRight size={14} /></a>}
      </div>}
    </Tilt3D>
  );
}
