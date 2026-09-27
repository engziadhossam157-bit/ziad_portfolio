import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(el, { autoAlpha: 0, y: 28 }, {
      autoAlpha: 1, y: 0, duration: .9, delay: delay / 1000, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  }, { scope: ref, dependencies: [delay] });
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

// Tilts an element toward the cursor for a tactile, physical 3D feel on hover.
export function Tilt3D({ children, className = "", style, intensity = 14 }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const setRotateX = gsap.quickTo(el, "rotationX", { duration: .6, ease: "power3.out" });
    const setRotateY = gsap.quickTo(el, "rotationY", { duration: .6, ease: "power3.out" });
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setRotateY(((e.clientX - rect.left) / rect.width - .5) * intensity);
      setRotateX(((e.clientY - rect.top) / rect.height - .5) * -intensity);
    };
    const onLeave = () => { setRotateX(0); setRotateY(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, { scope: ref });
  return <div ref={ref} className={className} style={{ ...style, transformStyle: "preserve-3d", perspective: 800 }}>{children}</div>;
}
