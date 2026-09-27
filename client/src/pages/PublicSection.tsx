import { Link, useLocation } from "wouter";
import { ArrowUpRight, Award, ExternalLink, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Reveal } from "@/components/Motion";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ProjectCard } from "@/components/ProjectCard";
import { CAPABILITIES, CONTACT_EMAIL, parseSocialLinks, resolveServiceIcon } from "@/lib/site";

const TITLES: Record<string, string> = { services: "SERVICES", projects: "WORK", certificates: "CERTIFICATES", contact: "CONTACT" };

/** Friendly fallback for a section with nothing published yet: points visitors somewhere useful. */
function NextSteps({ message }: { message: string }) {
  return <div className="public-empty"><p>{message}</p><div className="hero-actions"><Link href="/start-project" className="button button-accent">START A PROJECT <ArrowUpRight size={17} /></Link><Link href="/book-a-meeting" className="text-link">BOOK A MEETING <ArrowUpRight size={16} /></Link></div></div>;
}

export default function PublicSection() {
  const [location] = useLocation();
  const section = location.replace(/^\//, "") || "services";
  const portfolio = trpc.portfolio.public.useQuery();
  const allProjects = trpc.portfolio.allProjects.useQuery();
  const about = trpc.portfolio.about.useQuery();

  const services = portfolio.data?.services ?? [];
  const projects = allProjects.data ?? [];
  const certificates = portfolio.data?.certificates ?? [];
  const contactEmail = about.data?.email || CONTACT_EMAIL;
  const socials = parseSocialLinks(about.data?.socialLinks);
  const loading = portfolio.isPending || allProjects.isPending;

  return (
    <main className="site-shell" id="top">
      <SiteHeader />
      <div className="public-section-page section-grid">
        <h1>{TITLES[section] ?? section.toUpperCase()}<span>.</span></h1>

        {section === "services" && !portfolio.isPending && <div className="capability-grid public-grid">
          {(services.length
            ? services.map((service) => ({ key: `service-${service.id}`, title: service.title, desc: service.shortDescription || service.description, price: service.startingPrice, Icon: resolveServiceIcon(service.icon) }))
            : CAPABILITIES.map((cap) => ({ key: cap.title, title: cap.title, desc: cap.desc, price: null as string | null, Icon: cap.icon }))
          ).map((item, index) => <Reveal key={item.key} delay={index * 60}><article className="capability-card"><item.Icon size={26} strokeWidth={1.4} /><h3>{item.title}</h3><p>{item.desc}</p>{item.price && <span className="price-tag">FROM {item.price}</span>}</article></Reveal>)}
        </div>}

        {section === "projects" && !loading && (projects.length
          ? <div className="project-grid">{projects.map((project, index) => <Reveal key={project.id} delay={index * 70}><ProjectCard project={project} tone={index % 2 ? "soft" : "navy"} /></Reveal>)}</div>
          : <NextSteps message="Projects will be added here soon. In the meantime, tell me about your project or book a time to talk." />)}

        {section === "certificates" && !loading && (certificates.length
          ? <div className="certificate-grid">{certificates.map((cert) => <article className="certificate-card" key={cert.id}><Award size={20} className="accent-icon" /><strong>{cert.title}</strong><span>{cert.issuer}{cert.issueYear ? ` · ${cert.issueYear}` : ""}</span>{cert.description && <p>{cert.description}</p>}{cert.verifyUrl && <a href={cert.verifyUrl} target="_blank" rel="noreferrer">VERIFY <ExternalLink size={12} /></a>}</article>)}</div>
          : <NextSteps message="Certificates will be listed here soon." />)}

        {section === "contact" && <div className="contact-block">
          <p className="public-lead">For new projects and collaborations, the project form is the best place to start. For anything else, send me an email.</p>
          <a className="contact-email" href={`mailto:${contactEmail}`}><Mail size={22} /> {contactEmail}</a>
          <div className="hero-actions">
            <Link href="/start-project" className="button button-accent">START A PROJECT <ArrowUpRight size={17} /></Link>
            <Link href="/book-a-meeting" className="button button-outline">BOOK A MEETING <ArrowUpRight size={17} /></Link>
          </div>
          <div className="social-links">{socials.map((social) => <a key={social.href} href={social.href} target="_blank" rel="noreferrer">{social.label}</a>)}</div>
        </div>}
      </div>
      <SiteFooter />
    </main>
  );
}
