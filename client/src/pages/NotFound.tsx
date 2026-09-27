import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="system-page centered-state not-found">
      <Link href="/" className="wordmark not-found-wordmark">ZIAD<span>.</span></Link>
      <p className="section-kicker">ERROR 404</p>
      <h1>PAGE NOT<br /><span>FOUND.</span></h1>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <div className="hero-actions">
        <Link href="/" className="button button-accent">BACK TO HOME <ArrowUpRight size={17} /></Link>
        <Link href="/start-project" className="text-link">START A PROJECT <ArrowUpRight size={16} /></Link>
      </div>
    </main>
  );
}
