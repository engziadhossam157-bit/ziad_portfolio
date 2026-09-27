// Portfolio content shared by the client pages and the server's SEO/sitemap. Plain data only
// (no React, no icon imports) so both bundles can import it.

export type ProjectShot = {
  /** 1600px-wide image; a matching `-800.webp` sits next to it for srcset. */
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type PortfolioProject = {
  slug: string;
  title: string;
  /** Short label for cards and filters. */
  category: "Web App" | "ERP" | "E-commerce" | "Website" | "Desktop App";
  type: string;
  role?: string;
  platform?: string;
  liveUrl?: string;
  summary: string;
  description: string[];
  technologies: string[];
  areas: string[];
  shots: ProjectShot[];
  /** 1200x630 JPEG for link previews (crawlers handle JPEG more reliably than WebP). */
  ogImage?: string;
  /** Panel color behind the card screenshot: sand for dark UIs, navy for light ones. */
  tint?: "navy" | "sand";
  featured?: boolean;
};

export type PortfolioService = {
  slug: string;
  title: string;
  /** Icon key resolved on the client (see resolveServiceIcon). */
  icon: string;
  summary: string;
  includes: string[];
  technologies: string[];
  projects: string[];
};

const trackerShot = (name: string, caption: string): ProjectShot => ({
  src: `/images/projects/monthly-tracker/${name}-1600.webp`,
  width: 1600,
  height: 789,
  alt: `Monthly Tracker ${caption.toLowerCase()} screen`,
  caption,
});

const sadaqahShot = (name: string, caption: string, alt: string): ProjectShot => ({
  src: `/images/projects/sadaqah-quran-academy/${name}-1600.webp`,
  width: 1600,
  height: 1000,
  alt,
  caption,
});

export const PROJECTS: PortfolioProject[] = [
  {
    slug: "sadaqah-quran-academy",
    title: "Sadaqah Quran Academy",
    category: "Web App",
    type: "Educational Web Application",
    role: "Full-Stack Developer",
    liveUrl: "https://sadaqah-quran-academy.onrender.com",
    summary: "An online academy for Quran memorization and Islamic studies, with student registration, sign-in, and academy management.",
    description: [
      "Sadaqah Quran Academy is a web-based educational platform developed to provide an organized digital environment for Quranic education and academy management.",
    ],
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "JavaScript", "HTML/CSS"],
    areas: ["Full-stack web development", "Frontend development", "Backend development", "REST API development", "Database integration", "Authentication and authorization", "User management", "Responsive UI"],
    shots: [
      sadaqahShot("hero", "Home page", "Sadaqah Quran Academy home page in dark mode, with the academy logo and the Arabic headline"),
      sadaqahShot("programs", "Programs and about", "Sadaqah Quran Academy programs cards and the about section"),
      sadaqahShot("join", "How to join", "Sadaqah Quran Academy joining steps and the student registration call to action"),
    ],
    ogImage: "/images/projects/sadaqah-quran-academy/og.jpg",
    tint: "sand",
    featured: true,
  },
  {
    slug: "monthly-tracker",
    title: "Monthly Tracker",
    category: "Desktop App",
    type: "Desktop Application",
    role: "Desktop Application Developer",
    platform: "Electron.js",
    summary: "An offline desktop app for planning and tracking the month, built around one high, three medium, and five low priority tasks a day.",
    description: [
      "Monthly Tracker is a desktop application designed to help users organize and track information on a monthly basis. The application uses Electron.js to provide a desktop experience using web technologies.",
      "It plans each day with the 1-3-5 method and adds habits, weekly challenges and reviews, monthly analytics, and a passphrase lock. All data stays on the device, with export and import for backups.",
    ],
    technologies: ["Electron.js", "Node.js", "JavaScript", "HTML", "CSS"],
    areas: ["Desktop application development", "Electron.js development", "Data management", "Local data storage", "User interface development", "Application architecture", "Desktop application packaging"],
    shots: [
      trackerShot("calendar", "Calendar"),
      trackerShot("dashboard", "Dashboard"),
      trackerShot("today", "Daily view"),
      trackerShot("weekly-review", "Weekly review"),
      trackerShot("analytics", "Analytics"),
      trackerShot("planning", "Planning"),
      trackerShot("habits", "Habits"),
      trackerShot("tasks", "Tasks"),
      trackerShot("challenges", "Weekly challenges"),
      trackerShot("settings", "Settings"),
    ],
    ogImage: "/images/projects/monthly-tracker/og.jpg",
    featured: true,
  },
  {
    slug: "tei-workshop-erp",
    title: "TEI Workshop ERP",
    category: "ERP",
    type: "ERP / Workshop Management System",
    role: "Full-Stack Developer",
    liveUrl: "https://tei-eg.com",
    summary: "An ERP that brings a workshop's operations and business data into one system, with role-based access and dashboards.",
    description: [
      "TEI Workshop ERP is a web-based Enterprise Resource Planning system designed to centralize and organize workshop operations and business data in a single platform.",
    ],
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "JavaScript", "HTML/CSS"],
    areas: ["Full-stack development", "ERP system architecture", "Authentication and authorization", "Role-based access control", "Database design", "REST API development", "Business logic", "Dashboard development", "User and data management"],
    shots: [],
    featured: true,
  },
  {
    slug: "trivalue",
    title: "Trivalue",
    category: "E-commerce",
    type: "E-commerce Website",
    platform: "WordPress / WooCommerce",
    summary: "An online store on WordPress and WooCommerce, with product categories, a shopping cart, and order management.",
    description: [
      "Trivalue is an e-commerce website developed using WordPress and WooCommerce to provide an online shopping platform for the business.",
    ],
    technologies: ["WordPress", "WooCommerce", "PHP", "HTML", "CSS", "JavaScript"],
    areas: ["WordPress development", "WooCommerce development", "Product management", "Product categories", "Shopping cart", "Order management", "Store administration", "Website customization", "Responsive design"],
    shots: [],
    featured: true,
  },
  {
    slug: "rmtrade",
    title: "RMTrade",
    category: "E-commerce",
    type: "E-commerce Website",
    platform: "WordPress / WooCommerce",
    summary: "An online product catalog and store built on WordPress and WooCommerce.",
    description: [
      "RMTrade is an e-commerce platform developed using WordPress and WooCommerce, providing the business with an online product catalog and digital shopping experience.",
    ],
    technologies: ["WordPress", "WooCommerce", "PHP", "HTML", "CSS", "JavaScript"],
    areas: ["WordPress development", "WooCommerce", "Product catalog", "Product management", "Shopping cart", "Order management", "Store management", "Responsive UI", "Website customization"],
    shots: [],
  },
  {
    slug: "thmarble",
    title: "Thmarble",
    category: "Website",
    type: "Business / Corporate Website",
    platform: "WordPress",
    summary: "A company website for a marble business that presents its products and services, with image galleries.",
    description: [
      "Thmarble is a professional business website developed for a marble-related business. The website provides an online presence for the company and presents its products and services through a structured and professional interface.",
    ],
    technologies: ["WordPress", "PHP", "HTML", "CSS", "JavaScript"],
    areas: ["WordPress development", "Business website development", "Website customization", "Product/service presentation", "Image galleries", "Responsive design", "Content management", "UI customization"],
    shots: [],
  },
];

export const SERVICES: PortfolioService[] = [
  {
    slug: "full-stack-web-apps",
    title: "Custom Full-Stack Web Applications",
    icon: "code2",
    summary: "Custom web applications built with modern JavaScript, from the interface to the API and the database.",
    includes: ["Custom web applications", "Frontend and backend development", "REST API development", "Database design and integration", "Authentication and authorization", "Admin dashboards", "Role-based access control", "Business logic", "Responsive interfaces"],
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "JavaScript"],
    projects: ["sadaqah-quran-academy", "tei-workshop-erp"],
  },
  {
    slug: "ecommerce-stores",
    title: "E-commerce Stores",
    icon: "shoppingBag",
    summary: "Online stores on WordPress and WooCommerce, with product catalogs, a shopping cart, and order management.",
    includes: ["Product catalog and categories", "Shopping cart", "Order management", "Store administration", "Website customization", "Responsive design"],
    technologies: ["WordPress", "WooCommerce", "PHP"],
    projects: ["trivalue", "rmtrade"],
  },
  {
    slug: "business-websites",
    title: "Business Websites",
    icon: "globe",
    summary: "Company websites on WordPress that present products and services clearly and stay easy to update.",
    includes: ["Business website development", "Product and service presentation", "Image galleries", "Content management", "Responsive design"],
    technologies: ["WordPress", "PHP", "HTML", "CSS"],
    projects: ["thmarble"],
  },
  {
    slug: "desktop-apps",
    title: "Desktop Applications",
    icon: "monitor",
    summary: "Desktop apps built with Electron and Node.js, with local data storage and installable builds.",
    includes: ["Electron.js development", "Local data storage", "User interface development", "Application packaging"],
    technologies: ["Electron.js", "Node.js", "JavaScript"],
    projects: ["monthly-tracker"],
  },
];

export const findProject = (slug: string) => PROJECTS.find((project) => project.slug === slug);

/** The 800px sibling of a 1600px shot, for srcset. */
export const smallShot = (src: string) => src.replace(/-1600\.webp$/, "-800.webp");
