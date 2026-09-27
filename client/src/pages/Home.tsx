import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Asterisk, Award, ExternalLink, MoveRight, Quote } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useAuth } from "@/_core/hooks/useAuth";
import { Reveal, Tilt3D } from "@/components/Motion";
import { SiteFooter, SiteHeader, useHashScroll } from "@/components/SiteChrome";
import { ProjectCard } from "@/components/ProjectCard";
import { profileImageProps } from "@/lib/profileImage";
import { CAPABILITIES, CONTACT_EMAIL, MARQUEE_ITEMS, parseSocialLinks, resolveServiceIcon } from "@/lib/site";

const METRICS = [
  { value: "40+", label: "Projects shipped" },
  { value: "96%", label: "Client satisfaction" },
  { value: "06", label: "Years building" },
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
  const [activeFilter, setActiveFilter] = useState("ALL");
  const portfolio = trpc.portfolio.public.useQuery();
  const about = trpc.portfolio.about.useQuery();
  const { user } = useAuth();

  const services = portfolio.data?.services ?? [];
  const projects = portfolio.data?.projects ?? [];
  const certificates = portfolio.data?.certificates ?? [];
  const featuredTestimonial = portfolio.data?.testimonials[0];

  // Published services win; until any exist, the capability list keeps the section populated.
  const serviceItems = portfolio.isPending ? [] : services.length
    ? services.map((service) => ({ key: `service-${service.id}`, title: service.title, desc: service.shortDescription || service.description, Icon: resolveServiceIcon(service.icon) }))
    : CAPABILITIES.map((cap) => ({ key: cap.title, title: cap.title, desc: cap.desc, Icon: cap.icon }));

  const filters = useMemo(() => ["ALL", ...Array.from(new Set(projects.map((project) => project.category)))], [projects]);
  const visibleProjects = activeFilter === "ALL" ? projects : projects.filter((project) => project.category === activeFilter);
  const contactEmail = about.data?.email || CONTACT_EMAIL;
  const socials = parseSocialLinks(about.data?.socialLinks);
  const bioText = about.data?.bio || `I'm ${about.data?.name || "Ziad Hossam"}, a full-stack developer building websites, web applications, and AI-driven tools.`;
  const portalHref = user ? (user.role === "admin" ? "/admin" : "/portal") : "/login";

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
          <p className="eyebrow" ref={heroEyebrowRef}>{about.data?.careerFocus?.toUpperCase() || "FULL-STACK DEVELOPER"}</p>
          <h1 className="hero-headline" ref={heroHeadingRef}>
            <span className="line"><span className="line-inner">BUILDING</span></span>
            <span className="line"><span className="line-inner"><span>BETTER</span></span></span>
            <span className="line"><span className="line-inner">DIGITAL</span></span>
            <span className="line"><span className="line-inner">WORLDS<span className="accent-dot">.</span></span></span>
          </h1>
          <p className="hero-intro" ref={heroIntroRef}><span className="sr-only">{bioText}</span><span aria-hidden="true"><span ref={typeTextRef}>{bioText}</span><span className="type-cursor" ref={typeCursorRef}>|</span></span></p>
          <div className="hero-actions" ref={heroActionsRef}>
            <Link href="/start-project" className="button button-accent" ref={heroCtaRef}>START A PROJECT <MoveRight size={18} /></Link>
            <Link href={portalHref} className="button button-outline" ref={portalCtaRef}>CLIENT PORTAL <ArrowUpRight size={18} /></Link>
          </div>
        </div>
        <div className="hero-photo-stage" ref={photoStageRef}>
          <div className="photo-panel" ref={photoPanelRef} />
          <Tilt3D className="photo-tilt" intensity={6}>
            <div className="photo-frame-mask" ref={photoFrameRef}>
              <img {...profileImageProps(about.data?.profileImageUrl)} alt={about.data?.name || "Ziad Hossam"} fetchPriority="high" />
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
        <Reveal delay={140} className="metrics">{METRICS.map((metric) => <Metric key={metric.label} {...metric} />)}</Reveal>
      </section>

      <section className="services-section" id="services">
        <Reveal><h2 className="section-title">THE RIGHT<br /><span>TOOLS FOR</span><br />YOUR NEXT MOVE.</h2></Reveal>
        <div className="services-list">
          {serviceItems.map(({ key, title, desc, Icon }, index) => (
            <Reveal key={key} delay={index * 70}>
              <div className="service-row">
                <span className="service-icon-chip"><Icon size={26} strokeWidth={1.4} /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {projects.length > 0 && <section className="work-section" id="work">
        <div className="work-heading">
          <Reveal><p className="section-kicker">SELECTED WORK</p></Reveal>
          <Reveal delay={80}><h2 className="section-title">MADE TO BE<br /><span>REMEMBERED.</span></h2></Reveal>
          {filters.length > 2 && <div className="filter-row" role="group" aria-label="Filter projects by category">{filters.map((filter) => <button key={filter} type="button" className={activeFilter === filter ? "active" : ""} aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>}
        </div>
        <div className="project-grid">{visibleProjects.map((project, index) => <Reveal key={project.id} delay={index * 70}><ProjectCard project={project} tone={index % 2 ? "soft" : "navy"} /></Reveal>)}</div>
      </section>}

      {certificates.length > 0 && <section className="certificates-section section-grid" id="certificates">
        <Reveal className="certificate-strip">
          <div><p className="section-kicker">CERTIFICATES</p><h2>PROOF<br /><span>OF WORK.</span></h2></div>
          <div className="certificate-grid">{certificates.map((cert) => <Tilt3D className="certificate-card" intensity={8} key={cert.id}><Award size={20} className="accent-icon" /><strong>{cert.title}</strong><span>{cert.issuer}{cert.issueYear ? ` · ${cert.issueYear}` : ""}</span>{cert.description && <p>{cert.description}</p>}{cert.verifyUrl && <a href={cert.verifyUrl} target="_blank" rel="noreferrer">VERIFY <ExternalLink size={12} /></a>}</Tilt3D>)}</div>
        </Reveal>
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
