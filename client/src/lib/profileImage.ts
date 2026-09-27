// Portrait crop of profile-ziad-about.jpg (subject centered, dark ceiling band removed).
// Regenerate all three files together if the source photo changes.
const PROFILE_IMAGE = "/images/profile-ziad-portrait.jpg";
const PROFILE_SRCSET = "/images/profile-ziad-portrait-720.webp 720w, /images/profile-ziad-portrait-1200.webp 1200w";

/** img props for the profile photo; a CMS-provided URL wins and skips the local srcset. */
export function profileImageProps(customUrl?: string | null) {
  if (customUrl) return { src: customUrl };
  return { src: PROFILE_IMAGE, srcSet: PROFILE_SRCSET, sizes: "(max-width: 850px) 78vw, 440px", width: 1200, height: 1463 };
}
