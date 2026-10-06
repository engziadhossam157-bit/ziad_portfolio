import { Link } from "wouter";
import { ArrowUpRight, ClipboardList, Compass, FlaskConical, Hammer, Quote, Rocket } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Reveal, Tilt3D } from "@/components/Motion";
import { useMagnetic } from "@/hooks/useMagnetic";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ProjectCard, toCardData } from "@/components/ProjectCard";
import { CertificateCard } from "@/components/CertificateCard";
import { profileImageProps } from "@/lib/profileImage";
import { CAPABILITIES, CONTACT_EMAIL, LOCATION, parseSocialLinks } from "@/lib/site";
import { PROJECTS } from "@shared/portfolio";
import { ContactDetails } from "@/components/ContactDetails";

const PROCESS = [
  { icon: Compass, title: "Understand", desc: "Get to the real problem before touching a solution." },
  { icon: ClipboardList, title: "Plan", desc: "Map the approach, the risks, and the shortest honest path." },
  { icon: Hammer, title: "Build", desc: "Write clean, scalable software instead of a prototype in disguise." },
  { icon: FlaskConical, title: "Test", desc: "Verify it works the way it's supposed to, every time." },
  { icon: Rocket, title: "Deliver", desc: "Ship it, then stay around to support what happens next." },
];

export default function About() {
  const about = trpc.portfolio.about.useQuery();
  const experience = trpc.portfolio.experience.useQuery();
  const portfolio = trpc.portfolio.public.useQuery();

  const heroCtaRef = useMagnetic<HTMLAnchorElement>(.3);
  const finalCtaRef = useMagnetic<HTMLAnchorElement>(.3);

  const name = about.data?.name || "Ziad Hossam";
  const bio = about.data?.bio || "I'm Ziad Hossam, a full-stack developer studying AI engineering and building websites, web applications, and AI-driven tools.";
  const journey = experience.data ?? [];
  const certificates = portfolio.data?.certificates ?? [];
  const featuredProjects = PROJECTS.filter((project) => project.featured);
  const contactEmail = about.data?.email || CONTACT_EMAIL;
  const socials = parseSocialLinks(about.data?.socialLinks);
  const [flagship, ...capabilities] = CAPABILITIES;

  return (
    <main className="site-shell about-page" id="top">
      <SiteHeader />

      <section className="about-hero section-grid">
        <div className="about-hero-copy">
          <p className="eyebrow">ABOUT ME</p>
          <h1>BUILDING<br />INTELLIGENT<br /><span>SYSTEMS.</span><br />TURNING IDEAS<br />INTO SOFTWARE.</h1>
          <p className="about-hero-intro">{bio}</p>
          <div className="hero-actions"><Link href="/start-project" className="button button-accent" ref={heroCtaRef}>START A PROJECT <ArrowUpRight size={18} /></Link></div>
        </div>
        <div className="about-photo-frame">
          <Tilt3D className={`about-photo-card${about.data?.profileImageUrl ? "" : " is-cutout"}`} intensity={10}>
            {!about.data?.profileImageUrl && <svg className="photo-swiss" viewBox="0 0 100 122" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <g className="swiss-grid">{[20, 40, 60, 80].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="122" />)}</g>
              <path className="swiss-quarter" d="M0 122V68A54 54 0 0 1 54 122Z" />
              <circle className="swiss-circle" cx="56" cy="50" r="31" />
              <circle className="swiss-ring" cx="62" cy="45" r="37" />
              <rect className="swiss-square" x="11" y="22" width="9" height="9" />
            </svg>}
            <img {...profileImageProps(about.data?.profileImageUrl, about.data?.profileImageUrl ? "about" : "home")} alt={name} fetchPriority="high" />
          </Tilt3D>
        </div>
      </section>

      <section className="who-section section-grid" id="who-i-am">
        <div className="who-grid">
          <Reveal><h2>A builder who thinks in <em>business</em>, not just screens.</h2></Reveal>
          <Reveal delay={100} className="who-copy">
            <p>{bio}</p>
            <p>I don't chase every new framework. I look for the version of a problem that is worth solving, then build toward it deliberately: web development first, full-stack engineering next, and now AI engineering as the thread connecting all of it.</p>
          </Reveal>
        </div>
        <Reveal delay={160} className="quick-facts">
          <div><span>FOCUS</span><strong>{about.data?.careerFocus || "Software Engineer"}</strong></div>
          <div><span>BASED IN</span><strong>{about.data?.location || LOCATION}</strong></div>
          <div><span>CURRENTLY</span><strong>Studying AI Engineering</strong></div>
        </Reveal>
      </section>

      {journey.length > 0 && <section className="journey-section section-grid" id="journey">
        <Reveal><h2 className="about-section-title">HOW I GOT<br /><span>HERE.</span></h2></Reveal>
        <ol className="journey-track">
          {journey.map((item, index) => (
            <li key={item.id}>
              <Reveal delay={index * 70} className="journey-item">
                <div className="journey-marker" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
                <div className="journey-body">
                  <h3>{item.title}{item.isCurrent && <b className="journey-now">NOW</b>}</h3>
                  <span className="journey-org">{item.organization}</span>
                  {item.description && <p>{item.description}</p>}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>}

      <section className="capability-section section-grid" id="what-i-do">
        <Reveal><h2 className="about-section-title">WHERE I<br /><span>ADD VALUE.</span></h2></Reveal>
        <div className="capability-grid">
          <Reveal className="capability-flagship">
            <Tilt3D className="capability-card" intensity={4}>
              <flagship.icon size={30} strokeWidth={1.4} />
              <div><h3>{flagship.title}</h3><p>{flagship.desc}</p></div>
            </Tilt3D>
          </Reveal>
          {capabilities.map((cap, index) => (
            <Reveal key={cap.title} delay={(index + 1) * 70}>
              <Tilt3D className="capability-card" intensity={6}>
                <cap.icon size={26} strokeWidth={1.4} />
                <h3>{cap.title}</h3>
                <p>{cap.desc}</p>
              </Tilt3D>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="process-section section-grid" id="how-i-work">
        <Reveal><h2 className="about-section-title">THE PROCESS<br /><span>BEHIND IT.</span></h2></Reveal>
        <ol className="process-row">
          {PROCESS.map((step, index) => (
            <li key={step.title} className="process-step-wrap">
              <Reveal delay={index * 80} className="process-step">
                <span className="process-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <step.icon size={22} strokeWidth={1.4} />
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {certificates.length > 0 && <section className="about-certificates section-grid" id="certificates">
        <Reveal><p className="section-kicker">CERTIFICATES &amp; TRAINING</p></Reveal>
        <Reveal delay={80}><h2 className="about-section-title">PROOF<br /><span>OF WORK.</span></h2></Reveal>
        <div className="cert-grid">{certificates.map((cert, index) => <Reveal key={cert.id} delay={index * 90}><CertificateCard cert={cert} dark={index % 2 === 0} /></Reveal>)}</div>
      </section>}

      <section className="work-section section-grid" id="selected-work">
        <Reveal><p className="section-kicker">SELECTED WORK</p></Reveal>
        <Reveal delay={80}><h2 className="about-section-title">MADE TO BE<br /><span>REMEMBERED.</span></h2></Reveal>
        <div className="project-grid">{featuredProjects.map((project, index) => <Reveal key={project.slug} delay={index * 70}><ProjectCard project={toCardData(project)} tone={index % 2 ? "soft" : "navy"} /></Reveal>)}</div>
        <Reveal className="work-more"><Link href="/projects" className="button button-outline">VIEW ALL {PROJECTS.length} PROJECTS <ArrowUpRight size={18} /></Link></Reveal>
      </section>

      <section className="philosophy-section section-grid">
        <Reveal>
          <figure>
            <Quote className="accent-icon philosophy-mark" size={32} aria-hidden="true" />
            <blockquote className="philosophy-quote"><p>I don't just want to write code. I want to understand the problem, design the right solution, and build software that creates real value for the businesses I work with.</p></blockquote>
            <figcaption className="philosophy-attr">{name.toUpperCase()}</figcaption>
          </figure>
        </Reveal>
      </section>

      <section className="cta-section section-grid" id="about-contact">
        <Reveal className="cta-copy"><h2>HAVE AN IDEA?<br /><span>LET'S BUILD IT.</span></h2><Link href="/start-project" className="button button-accent" ref={finalCtaRef}>START A PROJECT <ArrowUpRight size={18} /></Link></Reveal>
        <Reveal delay={120} className="cta-aside">
          <p>For new projects, collaborations, or just a hello.</p>
          <a className="cta-email" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          <ContactDetails />
          <div className="social-links"><Link href="/book-a-meeting">BOOK A MEETING</Link>{socials.map((social) => <a key={social.href} href={social.href} target="_blank" rel="noreferrer">{social.label}</a>)}</div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
