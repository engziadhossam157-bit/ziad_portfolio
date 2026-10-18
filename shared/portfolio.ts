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

const teiShot = (name: string, height: number, caption: string, alt: string): ProjectShot => ({
  src: `/images/projects/tei-workshop-erp/${name}-1600.webp`,
  width: 1600,
  height,
  alt,
  caption,
});

const gymproShot = (name: string, caption: string, alt: string): ProjectShot => ({
  src: `/images/projects/gympro/${name}-1600.webp`,
  width: 1600,
  height: 1000,
  alt,
  caption,
});

const clinicShot = (name: string, caption: string, alt: string): ProjectShot => ({
  src: `/images/projects/clinic-erp/${name}-1600.webp`,
  width: 1600,
  height: 1000,
  alt,
  caption,
});

const pharmaShot = (name: string, caption: string, alt: string): ProjectShot => ({
  src: `/images/projects/pharmacare/${name}-1600.webp`,
  width: 1600,
  height: 1000,
  alt,
  caption,
});

const thmarbleShot = (name: string, caption: string, alt: string): ProjectShot => ({
  src: `/images/projects/thmarble/${name}-1600.webp`,
  width: 1600,
  height: 1000,
  alt,
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
    slug: "gympro",
    title: "GymPro",
    category: "ERP",
    type: "Gym Management System",
    role: "Desktop Application Developer",
    platform: "Electron.js",
    summary: "An offline desktop system for running a gym front desk: member registration, subscriptions, check-in at the door, and a cafeteria point of sale.",
    description: [
      "GymPro is an Arabic, right-to-left desktop application that runs a gym's front desk from one screen. It is built with Electron.js and React, and keeps all its data in a local SQLite database, so it works without an internet connection.",
      "Staff register members with a webcam photo and an auto-generated member code, sell subscription plans with partial payments, and check members in by code or phone number. The gate flags expired subscriptions and unpaid balances before entry. A cafeteria point of sale tracks stock, and the dashboard shows today's attendance, active subscriptions, and sales.",
    ],
    technologies: ["Electron.js", "React.js", "Node.js", "SQLite", "Tailwind CSS", "JavaScript"],
    areas: ["Desktop application development", "Electron.js development", "Local database design", "Member and subscription management", "Attendance tracking", "Point of sale and stock", "Webcam integration", "Right-to-left Arabic UI", "Desktop application packaging"],
    shots: [
      gymproShot("dashboard", "Dashboard", "GymPro dashboard with today's check-ins, active subscriptions, weekly renewals and cafeteria sales, above today's attendance log"),
      gymproShot("checkin", "Check-in gate", "Check-in gate after searching a member code, showing an active subscription and the button to record entry, beside the live attendance log"),
      gymproShot("checkin-due", "Balance due at the gate", "Check-in gate warning that the member still owes part of the subscription fee"),
      gymproShot("register", "New member", "New member form with name, phone, emergency contact and gender, the generated member code, and the live camera panel for the member photo"),
      gymproShot("members", "Members directory", "Members directory with filters for active, expired and members with balances due, and actions to view, edit and renew"),
      gymproShot("member-profile", "Member profile", "Member profile with phone, plan, end date, remaining balance and notes"),
      gymproShot("renew", "Renew subscription", "Renewal dialog with the chosen plan's duration and price, the amount paid and the remaining balance"),
      gymproShot("cafeteria", "Cafeteria point of sale", "Cafeteria point of sale with product cards, stock counts and a cart totaling 135 EGP"),
    ],
    ogImage: "/images/projects/gympro/og.jpg",
    tint: "sand",
    featured: true,
  },
  {
    slug: "pharmacare",
    title: "PharmaCare Pro",
    category: "ERP",
    type: "Pharmacy Management System (Demo)",
    role: "Desktop Application Developer",
    platform: "Electron.js",
    summary: "A desktop demo of a pharmacy management system: medicine catalog, point of sale with VAT receipts, expiry and low-stock alerts, and staff shifts.",
    description: [
      "PharmaCare Pro is a desktop demo of a pharmacy management system, built with React and Tailwind CSS and packaged for Windows with Electron. It runs offline and keeps its data on the device.",
      "Pharmacists browse the medicine catalog as cards or a table, filter by category and stock level, and restock in one click. The point of sale builds a bill with discounts and 14% VAT and prints a tax receipt. An alerts center flags expired batches, batches expiring within 30 days, and low stock, and the settings hold the branch details, tax rate, and a JSON backup.",
    ],
    technologies: ["Electron.js", "React.js", "Tailwind CSS", "JavaScript", "Local storage"],
    areas: ["Desktop application development", "Electron.js development", "Frontend development", "Point of sale", "Inventory and expiry tracking", "Receipt generation", "Offline data storage", "Desktop application packaging"],
    shots: [
      pharmaShot("dashboard", "Dashboard", "PharmaCare dashboard with active units, low stock, expiring batches and today's revenue, stock by therapeutic class and recent sales"),
      pharmaShot("pos", "Point of sale", "Point of sale with medicine cards and a bill of five items with customer details, credit card payment, VAT and grand total"),
      pharmaShot("receipt", "Tax receipt", "Printed tax receipt with invoice number, customer, items, VAT and a barcode"),
      pharmaShot("inventory", "Medicine catalog", "Medicine catalog as cards with category, stock status, shelf, price and expiry date"),
      pharmaShot("inventory-table", "Catalog table", "Medicine catalog as a table with stock units, shelf, price, expiry and restock actions"),
      pharmaShot("expiry", "Expiry and stock alerts", "Alerts center listing an expired batch, batches expiring soon and low stock items with reorder actions"),
      pharmaShot("settings", "Settings and backup", "Settings for branch name, address, VAT rate and license, with storage diagnostics and a JSON backup"),
    ],
    ogImage: "/images/projects/pharmacare/og.jpg",
    tint: "sand",
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
    shots: [
      teiShot("dashboard", 1000, "Dashboard", "TEI Workshop ERP dashboard with counts of studies under review, open work orders, late tasks and open quotations, and a feed of recent updates"),
      teiShot("cost-study", 1867, "Cost study", "Cost study for a conveyor roller with drawing revisions, cost lines for material, turning, milling, heat treatment and QC, and the final price with waste, risk and profit"),
      teiShot("work-order", 1922, "Work order", "Work order tracking each operation's planned and actual dates and cost, the variance, WhatsApp updates per task, and the quality, delivery and invoicing steps"),
      teiShot("quotations", 1000, "Quotations", "Quotations list with status, totals and actions, above the quotation entry form"),
      teiShot("quotation-pdf", 2265, "Quotation PDF", "Generated quotation document with client details, commercial offer table, VAT totals in words, technical offer and terms"),
      teiShot("tasks", 1000, "Standalone tasks", "Standalone tasks with owner, due date, days late, status, WhatsApp notification and attachments"),
      teiShot("master-data", 1000, "Master data", "Master data for employees, clients, suppliers, cost categories, units and quotation terms"),
      teiShot("settings", 1000, "Settings", "Company settings for quotations, default technical offer and WhatsApp notifications"),
    ],
    ogImage: "/images/projects/tei-workshop-erp/og.jpg",
    featured: true,
  },
  {
    slug: "clinic-erp",
    title: "Clinic ERP",
    category: "ERP",
    type: "Clinic Accounting & Operations System",
    role: "Full-Stack Developer",
    platform: "Electron.js / Node.js",
    summary: "An offline ERP for a multi-clinic medical center: patient receipts and installments, doctor fees, expenses, stock, a daily treasury close, and profit per clinic and doctor.",
    description: [
      "Clinic ERP runs the money side of a multi-clinic medical center from one PC. It is an Express and SQLite application packaged as a Windows desktop app with Electron, with an Arabic, right-to-left interface that works fully offline.",
      "Receptionists create a receipt for every visit, take partial payments, and find patients by phone. Managers record expenses (direct to a clinic, or general and shared by each clinic's collection), doctor fixed fees, and stock issues that book themselves as expenses. They close the treasury each day and read net profit per clinic, per doctor, and per partner. Every rule that protects the totals runs on the server, and every change is written to an audit log.",
    ],
    technologies: ["Node.js", "Express.js", "SQLite", "Electron.js", "JavaScript", "HTML/CSS"],
    areas: ["Full-stack development", "ERP system architecture", "Accounting and business logic", "Authentication and role-based access", "REST API development", "Database design", "Reports and dashboards", "Audit logging", "Right-to-left Arabic UI", "Desktop application packaging"],
    shots: [
      clinicShot("dashboard", "Dashboard", "Clinic ERP dashboard with collected, expenses, net profit and patient balances for the period, and a breakdown per clinic"),
      clinicShot("new-receipt", "New receipt", "New receipt form for a dental visit with total, discount, amount paid now, and the net and remaining balance"),
      clinicShot("receipts-log", "Receipts log", "Receipts log with patient, clinic, net, paid and remaining amounts, and actions for WhatsApp, payments, edit and delete"),
      clinicShot("payments", "Receipt payments", "Payments drawer for one receipt showing two installments and the remaining balance"),
      clinicShot("patients", "Patients", "Patients list with phone, number of receipts and the amount each patient still owes"),
      clinicShot("treasury", "Treasury", "Daily treasury with today's collections, expenses and net, collections by payment method and by employee, and the log of closed days"),
      clinicShot("stock", "Stock", "Stock screen with new item and stock move forms, and item balances with reorder warnings"),
      clinicShot("reports", "Period report", "Period report with income, expenses, doctor fixed fees and net, above the detailed income list"),
      clinicShot("dashboard-dark", "Dark mode", "Clinic ERP dashboard in dark mode"),
    ],
    ogImage: "/images/projects/clinic-erp/og.jpg",
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
    liveUrl: "https://thmarbleegypt.com",
    summary: "A company website for a marble business that presents its products and services, with image galleries.",
    description: [
      "Thmarble is a professional business website developed for a marble-related business. The website provides an online presence for the company and presents its products and services through a structured and professional interface.",
    ],
    technologies: ["WordPress", "PHP", "HTML", "CSS", "JavaScript"],
    areas: ["WordPress development", "Business website development", "Website customization", "Product/service presentation", "Image galleries", "Responsive design", "Content management", "UI customization"],
    shots: [
      thmarbleShot("home", "Home page", "TH Marble & Granite home page, with a polished marble floor photo behind the headline"),
      thmarbleShot("collection", "The collection", "The collection section listing marble and granite types beside a large stone preview"),
      thmarbleShot("stones", "Stone gallery", "Gallery of fourteen Egyptian marble and granite tiles, each labeled with its name"),
      thmarbleShot("projects", "Projects", "Projects page with photos of finished marble floors and a staircase"),
      thmarbleShot("marble", "Marble page", "Marble page header over a textured marble wall"),
      thmarbleShot("contact", "Contact and quote form", "Contact page with phone numbers, address and the request a quote form"),
    ],
    ogImage: "/images/projects/thmarble/og.jpg",
    tint: "sand",
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
    projects: ["monthly-tracker", "gympro", "pharmacare", "clinic-erp"],
  },
];

export const findProject = (slug: string) => PROJECTS.find((project) => project.slug === slug);

/** The 800px sibling of a 1600px shot, for srcset. */
export const smallShot = (src: string) => src.replace(/-1600\.webp$/, "-800.webp");
