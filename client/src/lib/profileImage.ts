// "about": portrait crop of profile-ziad-about.jpg (subject centered, dark ceiling band removed).
// "home": transparent cutout of the studio portrait (black backdrop keyed out), trimmed to the subject; it sits on the navy
// hero card. Regenerate a variant's files together if its source photo changes.
const VARIANTS = {
  about: { src: "/images/profile-ziad-portrait.jpg", srcSet: "/images/profile-ziad-portrait-720.webp 720w, /images/profile-ziad-portrait-1200.webp 1200w", width: 1200, height: 1463 },
  home: { src: "/images/profile-ziad-cutout-900.webp", srcSet: "/images/profile-ziad-cutout-600.webp 600w, /images/profile-ziad-cutout-900.webp 900w", width: 900, height: 844 },
};

/** img props for the profile photo; a CMS-provided URL wins and skips the local srcset. */
export function profileImageProps(customUrl?: string | null, variant: keyof typeof VARIANTS = "about") {
  if (customUrl) return { src: customUrl };
  return { ...VARIANTS[variant], sizes: "(max-width: 850px) 78vw, 440px" };
}
