import { Link, useLocation } from "wouter";
import { ArrowUpRight, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Reveal } from "@/components/Motion";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { CertificateCard } from "@/components/CertificateCard";
import { CONTACT_EMAIL, parseSocialLinks, resolveServiceIcon } from "@/lib/site";
import { SERVICES, findProject } from "@shared/portfolio";
import { ContactDetails } from "@/components/ContactDetails";

const TITLES: Record<string, string> = { services: "SERVICES", certificates: "CERTIFICATES", contact: "CONTACT" };

/** Friendly fallback for a section with nothing published yet: points visitors somewhere useful. */
function NextSteps({ message }: { message: string }) {
  return <div className="public-empty"><p>{message}</p><div className="hero-actions"><Link href="/start-project" className="button button-accent">START A PROJECT <ArrowUpRight size={17} /></Link><Link href="/book-a-meeting" className="text-link">BOOK A MEETING <ArrowUpRight size={16} /></Link></div></div>;
}

export default function PublicSection() {
  const [location] = useLocation();
  const section = location.replace(/^\//, "") || "services";
  const portfolio = trpc.portfolio.public.useQuery();
  const about = trpc.portfolio.about.useQuery();

  const services = portfolio.data?.services ?? [];
  const certificates = portfolio.data?.certificates ?? [];
  const contactEmail = about.data?.email || CONTACT_EMAIL;
  const socials = parseSocialLinks(about.data?.socialLinks);
  const loading = portfolio.isPending;

  return (
    <main className="site-shell" id="top">
      <SiteHeader />
      <div className="public-section-page section-grid">
        <h1>{TITLES[section] ?? section.toUpperCase()}<span>.</span></h1>

        {section === "services" && !portfolio.isPending && <div className="capability-grid public-grid">
          {(services.length
            ? services.map((service) => ({ key: `service-${service.id}`, title: service.title, desc: service.shortDescription || service.description, price: service.startingPrice, Icon: resolveServiceIcon(service.icon), includes: [] as string[], technologies: [] as string[], projects: [] as string[] }))
            : SERVICES.map((service) => ({ key: service.slug, title: service.title, desc: service.summary, price: null as string | null, Icon: resolveServiceIcon(service.icon), includes: service.includes, technologies: service.technologies, projects: service.projects }))
          ).map((item, index) => <Reveal key={item.key} delay={index * 60}>
            <article className="capability-card service-card">
              <item.Icon size={26} strokeWidth={1.4} />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              {item.includes.length > 0 && <ul className="check-list">{item.includes.map((line) => <li key={line}>{line}</li>)}</ul>}
              {item.technologies.length > 0 && <ul className="tag-list" aria-label="Technologies">{item.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul>}
              {item.projects.length > 0 && <div className="service-projects"><span>RELATED WORK</span>{item.projects.map((slug) => { const project = findProject(slug); return project && <Link key={slug} href={`/projects/${slug}`}>{project.title} <ArrowUpRight size={13} /></Link>; })}</div>}
              {item.price && <span className="price-tag">FROM {item.price}</span>}
            </article>
          </Reveal>)}
        </div>}

        {section === "certificates" && !loading && (certificates.length
          ? <div className="cert-grid">{certificates.map((cert, index) => <CertificateCard key={cert.id} cert={cert} dark={index % 2 === 0} />)}</div>
          : <NextSteps message="Certificates will be listed here soon." />)}

        {section === "contact" && <div className="contact-block">
          <p className="public-lead">For new projects and collaborations, the project form is the best place to start. For anything else, send me an email.</p>
          <a className="contact-email" href={`mailto:${contactEmail}`}><Mail size={22} /> {contactEmail}</a>
          <ContactDetails large />
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
