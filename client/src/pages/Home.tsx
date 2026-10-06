import { useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Asterisk, MoveRight, Quote } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMagnetic } from "@/hooks/useMagnetic";
import { portalLink, useAuth } from "@/_core/hooks/useAuth";
import { Reveal, Tilt3D } from "@/components/Motion";
import { SiteFooter, SiteHeader, useHashScroll } from "@/components/SiteChrome";
import { ProjectCard, toCardData } from "@/components/ProjectCard";
import { CertificateCard } from "@/components/CertificateCard";
import { profileImageProps } from "@/lib/profileImage";
import { CONTACT_EMAIL, MARQUEE_ITEMS, parseSocialLinks, resolveServiceIcon } from "@/lib/site";
import { PROJECTS, SERVICES, findProject } from "@shared/portfolio";

const METRICS = [
  { value: "25", label: "Projects shipped" },
  { value: "96%", label: "Client satisfaction" },
  { value: "2", label: "Years building" },
];

function Metric({ value, label }: { value: string; label: string }) {
  const numRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = numRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = value;
      if (cursorRef.current) gsap.set(cursorRef.current, { autoAlpha: 0 });
      return;
    }
    el.textContent = "";
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%" } })
      .to(el, { text: value, duration: .5 + value.length * .12, ease: "none" })
      .to(cursorRef.current, { autoAlpha: 0, duration: .4 }, "+=.4");
  }, { scope: numRef, dependencies: [value] });
  // Value first, label second: the numbers share one baseline no matter how the labels wrap.
  return (
    <Tilt3D className="metric" intensity={8}>
      <strong><span className="sr-only">{value}</span><span aria-hidden="true"><span ref={numRef}>{value}</span><span className="type-cursor" ref={cursorRef}>|</span></span></strong>
      <span className="metric-label">{label}</span>
    </Tilt3D>
  );
}

export default function Home() {
  const portfolio = trpc.portfolio.public.useQuery();
  const about = trpc.portfolio.about.useQuery();
  const { user } = useAuth();

  const services = portfolio.data?.services ?? [];
  const certificates = portfolio.data?.certificates ?? [];
  const featuredTestimonial = portfolio.data?.testimonials[0];

  // Services published from the admin workspace win; otherwise the list in shared/portfolio.ts,
  // where each service links to the projects that back it up.
  const serviceItems = portfolio.isPending ? [] : services.length
    ? services.map((service) => ({ key: `service-${service.id}`, title: service.title, desc: service.shortDescription || service.description, Icon: resolveServiceIcon(service.icon), projects: [] as string[] }))
    : SERVICES.map((service) => ({ key: service.slug, title: service.title, desc: service.summary, Icon: resolveServiceIcon(service.icon), projects: service.projects }));
  const featuredProjects = PROJECTS.filter((project) => project.featured);
  const contactEmail = about.data?.email || CONTACT_EMAIL;
  const socials = parseSocialLinks(about.data?.socialLinks);
  const bioText = about.data?.bio || `I'm ${about.data?.name || "Ziad Hossam"}, a full-stack developer building websites, web applications, and AI-driven tools.`;
  const portal = portalLink(user);

  useHashScroll(portfolio.isSuccess);

  const heroEyebrowRef = useRef<HTMLParagraphElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroIntroRef = useRef<HTMLParagraphElement>(null);
  const heroActionsRef = useRef<HTMLDivElement>(null);
  const photoStageRef = useRef<HTMLDivElement>(null);
  const photoPanelRef = useRef<HTMLDivElement>(null);
  const photoFrameRef = useRef<HTMLDivElement>(null);
  const typeTextRef = useRef<HTMLSpanElement>(null);
  const typeCursorRef = useRef<HTMLSpanElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  const heroCtaRef = useMagnetic<HTMLAnchorElement>(.3);
  const portalCtaRef = useMagnetic<HTMLAnchorElement>(.3);
  const aboutCtaRef = useMagnetic<HTMLAnchorElement>(.45);
  const finalCtaRef = useMagnetic<HTMLAnchorElement>(.3);

  // One-time entrance choreography for the above-the-fold hero — plays on load, not on scroll.
  useGSAP(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      if (typeTextRef.current) typeTextRef.current.textContent = bioText;
      if (typeCursorRef.current) gsap.set(typeCursorRef.current, { autoAlpha: 0 });
      return;
    }
    if (typeTextRef.current) typeTextRef.current.textContent = "";
    const typingDuration = Math.min(2.4, .3 + bioText.length * .016);
    // Drive the typing effect by slicing bioText ourselves (rather than GSAP's TextPlugin,
    // whose diffing heuristic can shorten a string from the front instead of the end) so it
    // always grows from the start, like a real caret.
    const typeState = { len: 0 };
    const renderType = () => { if (typeTextRef.current) typeTextRef.current.textContent = bioText.slice(0, Math.round(typeState.len)); };
    gsap.set(".hero-headline .line-inner", { yPercent: 110 });
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(heroEyebrowRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .6 })
      .to(".hero-headline .line-inner", { yPercent: 0, duration: .9, ease: "power4.out", stagger: .09 }, "-=.25")
      .addLabel("headingDone")
      .fromTo(heroIntroRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .5 }, "-=.5")
      .addLabel("typingStart")
      .to(typeState, { len: bioText.length, duration: typingDuration, ease: "none", onUpdate: renderType })
      .to(typeCursorRef.current, { autoAlpha: 0, duration: .5 }, "+=.4")
      .fromTo(heroActionsRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .7 }, "typingStart+=0.9")
      .fromTo(photoPanelRef.current, { autoAlpha: 0, x: 26, y: 26 }, { autoAlpha: 1, x: 0, y: 0, duration: .9 }, "headingDone-=.15")
      .fromTo(photoFrameRef.current, { clipPath: "inset(0 100% 0 0 round 20px)" }, { clipPath: "inset(0 0% 0 0 round 20px)", duration: 1, ease: "power4.out" }, "<0.15");

    // A slow idle drift keeps the photo stage feeling alive at rest, replacing a busier
    // always-spinning ring motif with one quiet, easy-to-ignore ambient move.
    gsap.to(photoStageRef.current, { y: -10, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
  }, { scope: heroSectionRef, dependencies: [bioText] });

  // Infinite marquee that speeds up with scroll velocity. The track holds four copies of the
  // list and travels one copy's width per loop, so even ultra-wide screens never see its end.
  useGSAP(() => {
    const track = marqueeTrackRef.current;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const loop = gsap.to(track, { xPercent: -25, duration: 24, ease: "none", repeat: -1 });
    const trigger = ScrollTrigger.create({
      onUpdate: (self) => loop.timeScale(gsap.utils.clamp(.4, 3, 1 + Math.abs(self.getVelocity() / 1000))),
    });
    return () => trigger.kill();
  }, { scope: marqueeTrackRef });

  return (
    <main className="site-shell" id="top">
      <SiteHeader />

      <section className="hero section-grid" ref={heroSectionRef}>
        <div className="hero-copy">
          <p className="eyebrow" ref={heroEyebrowRef}>{about.data?.careerFocus?.toUpperCase() || "SOFTWARE ENGINEER"}</p>
          <h1 className="hero-headline" ref={heroHeadingRef}>
            <span className="line"><span className="line-inner">BUILDING</span></span>
            <span className="line"><span className="line-inner"><span>BETTER</span></span></span>
            <span className="line"><span className="line-inner">DIGITAL</span></span>
            <span className="line"><span className="line-inner">WORLDS<span className="accent-dot">.</span></span></span>
          </h1>
          <p className="hero-intro" ref={heroIntroRef}><span className="sr-only">{bioText}</span><span aria-hidden="true"><span ref={typeTextRef}>{bioText}</span><span className="type-cursor" ref={typeCursorRef}>|</span></span></p>
          <div className="hero-actions" ref={heroActionsRef}>
            <Link href="/start-project" className="button button-accent" ref={heroCtaRef}>START A PROJECT <MoveRight size={18} /></Link>
            <Link href={portal.href} className="button button-outline" ref={portalCtaRef}>{portal.label} <ArrowUpRight size={18} /></Link>
          </div>
        </div>
        <div className="hero-photo-stage" ref={photoStageRef}>
          <div className="photo-panel" ref={photoPanelRef} />
          <Tilt3D className="photo-tilt" intensity={6}>
            <div className={`photo-frame-mask${about.data?.profileImageUrl ? "" : " is-cutout"}`} ref={photoFrameRef}>
              {!about.data?.profileImageUrl && <svg className="photo-blobs" viewBox="0 0 100 122" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <path className="blob-blue" d="M41.5 92C39.9 97.1 28.2 105 20.4 107.3C12.6 109.7 0.6 109.3 -5.3 106.3C-11.2 103.3 -17 95.1 -15.2 89.4C-13.4 83.8 -1.9 74.6 5.7 72.4C13.2 70.3 23.9 73.4 29.9 76.7C35.9 79.9 43.1 86.9 41.5 92Z" />
                <path className="blob-main" d="M82.3 44C81.2 51.7 72.5 62.2 64.4 66.8C56.4 71.4 41.7 73.9 34 71.5C26.4 69.1 20 60.1 18.6 52.6C17.1 45.1 21 34 25.4 26.6C29.7 19.3 37.2 9.6 44.7 8.6C52.3 7.5 64.5 14.5 70.8 20.4C77 26.3 83.4 36.3 82.3 44Z" />
                <path className="blob-outline" d="M91.7 41C90.6 49.2 72.2 65.2 63.7 70.1C55.3 75 48.8 73.4 41.2 70.5C33.6 67.6 19.7 60.5 18.1 52.6C16.5 44.7 26.4 29.5 31.4 23C36.4 16.6 41.6 14.4 48 14C54.5 13.6 63 16.3 70.3 20.8C77.5 25.3 92.8 32.8 91.7 41Z" />
                <path className="blob-small" d="M96.7 16C95.9 18.1 91.9 22.1 89.8 22.9C87.6 23.6 85.3 21.7 83.8 20.5C82.2 19.3 80.3 17.5 80.5 15.4C80.7 13.3 82.4 8.7 84.7 7.9C87 7 92.3 9 94.3 10.4C96.3 11.8 97.5 13.9 96.7 16Z" />
                <g className="blob-dots"><circle cx="86" cy="58" r="1.6" /><circle cx="90.5" cy="52" r="1" /><circle cx="15" cy="20" r="1.3" /><circle cx="10.5" cy="25" r=".8" /><circle cx="30" cy="80" r="1" /></g>
              </svg>}
              <img {...profileImageProps(about.data?.profileImageUrl, "home")} alt={about.data?.name || "Ziad Hossam"} fetchPriority="high" />
            </div>
          </Tilt3D>
        </div>
      </section>

      <section className="marquee" aria-hidden="true">
        <div className="marquee-track" ref={marqueeTrackRef}>
          {[0, 1, 2, 3].flatMap((copy) => MARQUEE_ITEMS.map((item) => <span className="marquee-item" key={`${copy}-${item}`}>{item}<Asterisk size={18} strokeWidth={2.4} /></span>))}
        </div>
      </section>

      <section className="intro section-grid" id="about">
        <Reveal className="intro-statement">
          <h2>Digital work with <em>clarity</em>, character, and a little bit of tension.</h2>
          <div className="intro-statement-footer">
            <p>Good design should feel obvious in hindsight. My job is to make complicated things feel simple, connecting strategy, design, and technology into products people want to use.</p>
            <Link href="/about" className="about-cta" ref={aboutCtaRef}>MORE ABOUT ME <ArrowUpRight size={17} /></Link>
          </div>
        </Reveal>
        <div className="intro-side">
          <Reveal delay={140} className="metrics">{METRICS.map((metric) => <Metric key={metric.label} {...metric} />)}</Reveal>
          <Reveal delay={220} className="now-learning">
            <img src="/images/depi-logo.webp" alt="Digital Egypt Pioneers Initiative (DEPI) logo" width="174" height="160" />
            <div><span>NOW LEARNING</span><strong>Data Science, DEPI Round 5</strong><p>A 9-month track with Digital Egypt Pioneers.</p></div>
          </Reveal>
        </div>
      </section>

      <section className="services-section" id="services">
        <Reveal><h2 className="section-title">THE RIGHT<br /><span>TOOLS FOR</span><br />YOUR NEXT MOVE.</h2></Reveal>
        <div className="services-list">
          {serviceItems.map(({ key, title, desc, Icon, projects }, index) => (
            <Reveal key={key} delay={index * 70}>
              <div className="service-row">
                <span className="service-icon-chip"><Icon size={26} strokeWidth={1.4} /></span>
                <h3>{title}</h3>
                <div className="service-detail">
                  <p>{desc}</p>
                  {projects.length > 0 && <div className="service-projects"><span>RELATED WORK</span>{projects.map((slug) => { const project = findProject(slug); return project && <Link key={slug} href={`/projects/${slug}`}>{project.title} <ArrowUpRight size={13} /></Link>; })}</div>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="work-heading">
          <Reveal><p className="section-kicker">SELECTED WORK</p></Reveal>
          <Reveal delay={80}><h2 className="section-title">MADE TO BE<br /><span>REMEMBERED.</span></h2></Reveal>
        </div>
        <div className="project-grid">{featuredProjects.map((project, index) => <Reveal key={project.slug} delay={index * 70}><ProjectCard project={toCardData(project)} tone={index % 2 ? "soft" : "navy"} /></Reveal>)}</div>
        <Reveal className="work-more"><Link href="/projects" className="button button-outline">VIEW ALL {PROJECTS.length} PROJECTS <ArrowUpRight size={18} /></Link></Reveal>
      </section>

      {certificates.length > 0 && <section className="certificates-section section-grid" id="certificates">
        <Reveal><p className="section-kicker">CERTIFICATES</p><h2 className="section-title">PROOF<br /><span>OF WORK.</span></h2></Reveal>
        <div className="cert-grid">{certificates.map((cert, index) => <Reveal key={cert.id} delay={index * 90}><CertificateCard cert={cert} dark={index % 2 === 0} /></Reveal>)}</div>
      </section>}

      {featuredTestimonial && <section className="testimonial-section">
        <Reveal>
          <figure className="testimonial-card">
            <Quote size={28} className="accent-icon" aria-hidden="true" />
            <blockquote><p>{featuredTestimonial.quote}</p></blockquote>
            <figcaption className="testimonial-note">{featuredTestimonial.clientName}{featuredTestimonial.clientRole ? `, ${featuredTestimonial.clientRole}` : ""}{featuredTestimonial.company ? `, ${featuredTestimonial.company}` : ""}</figcaption>
          </figure>
        </Reveal>
      </section>}

      <section className="cta-section section-grid" id="contact">
        <Reveal className="cta-copy"><h2>HAVE A GOOD<br /><span>PROBLEM?</span></h2><Link href="/start-project" className="button button-accent" ref={finalCtaRef}>START A PROJECT <ArrowUpRight size={18} /></Link></Reveal>
        <Reveal delay={120} className="cta-aside">
          <p>For new projects, collaborations, or just a hello.</p>
          <a className="cta-email" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          <div className="social-links"><Link href="/book-a-meeting">BOOK A MEETING</Link>{socials.map((social) => <a key={social.href} href={social.href} target="_blank" rel="noreferrer">{social.label}</a>)}</div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
