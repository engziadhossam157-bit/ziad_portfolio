import { Linkedin, Phone } from "lucide-react";
import { CONTACT_PHONE, LINKEDIN } from "@/lib/site";

/** Phone and LinkedIn, listed under the contact email wherever it appears. */
export function ContactDetails({ large = false }: { large?: boolean }) {
  return (
    <ul className={`contact-details${large ? " is-large" : ""}`}>
      <li><a href={CONTACT_PHONE.href}><Phone size={large ? 18 : 15} aria-hidden="true" /> {CONTACT_PHONE.display}</a></li>
      <li><a href={LINKEDIN.href} target="_blank" rel="noreferrer"><Linkedin size={large ? 18 : 15} aria-hidden="true" /> {LINKEDIN.display}</a></li>
    </ul>
  );
}
