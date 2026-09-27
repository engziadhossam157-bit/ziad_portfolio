import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function BookMeeting() {
  const availableSlots = trpc.bookings.availableSlots.useQuery();
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const book = trpc.bookings.book.useMutation({ onSuccess: () => setSubmitted(true) });
  const nameRef = useRef<HTMLInputElement>(null);

  // The server already drops past slots; this guards a tab left open across the slot's start time.
  const slots = (availableSlots.data ?? []).filter((slot) => new Date(slot.startTime).getTime() > Date.now());
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  useEffect(() => {
    if (!selectedSlotId) return;
    nameRef.current?.focus({ preventScroll: true });
    nameRef.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [selectedSlotId]);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedSlotId) return;
    book.mutate({ slotId: selectedSlotId, name: form.name, email: form.email, phone: form.phone || undefined, notes: form.notes || undefined });
  };

  const formatDay = (value: string | Date) => new Date(value).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const formatTime = (value: string | Date) => new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (submitted) return <main className="system-page centered-state">
    <CheckCircle2 size={52} className="accent-icon" />
    <p className="section-kicker">MEETING BOOKED</p>
    <h1>SEE YOU SOON<span>.</span></h1>
    <p>{selectedSlot ? `Your call on ${formatDay(selectedSlot.startTime)} at ${formatTime(selectedSlot.startTime)} is reserved.` : "Your time slot is reserved."} I'll email you at {form.email} with the meeting link before the call.</p>
    <Link href="/" className="button button-accent">BACK TO PORTFOLIO <ArrowUpRight size={17} /></Link>
  </main>;

  return <main className="system-page">
    <header className="system-header">
      <Link href="/" className="wordmark">ZIAD<span>.</span></Link>
      <Link href="/" className="back-link"><ArrowLeft size={15} /> BACK TO SITE</Link>
    </header>
    <div className="system-wrap">
      <div className="system-intro">
        <p className="section-kicker">BOOK A MEETING</p>
        <h1>LET'S<br /><span>TALK.</span></h1>
        <p>Pick an open time and I'll be on the call. No project details needed yet, just your name, your email, and anything you'd like to cover.</p>
      </div>
      <div>
        {availableSlots.isPending ? <div className="slot-grid" aria-busy="true" aria-label="Loading available times">{[0, 1, 2, 3].map((i) => <span key={i} className="slot-skeleton" />)}</div> : slots.length ? <>
          <div className="form-section-title"><span>01</span><h2>PICK A TIME</h2></div>
          <div className="slot-grid" role="group" aria-label="Available times">
            {slots.map((slot) => <button
              key={slot.id}
              type="button"
              className={`slot-button${selectedSlotId === slot.id ? " selected" : ""}`}
              aria-pressed={selectedSlotId === slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
            >
              <strong>{formatDay(slot.startTime)}</strong>
              <span>{formatTime(slot.startTime)}</span>
              <span>{slot.durationMinutes} min</span>
            </button>)}
          </div>
          {selectedSlotId && <form className="project-form booking-form" onSubmit={submit}>
            <div className="form-section-title"><span>02</span><h2>YOUR DETAILS</h2></div>
            <div className="form-grid">
              <label>NAME<input ref={nameRef} className="form-input" required minLength={2} autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" /></label>
              <label>EMAIL<input className="form-input" type="email" required autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" /></label>
              <label><span>PHONE <small className="field-optional">OPTIONAL</small></span><input className="form-input" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Best number to reach you" /></label>
            </div>
            <label><span>NOTES <small className="field-optional">OPTIONAL</small></span><textarea className="form-input form-textarea" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Anything you'd like to cover on the call?" /></label>
            {book.error && <div className="form-error" role="alert"><p>{book.error.message || "That time may no longer be available. Please pick another slot."}</p></div>}
            <button className="button button-accent submit-button" type="submit" disabled={book.isPending}>{book.isPending ? <Loader2 className="spin" size={16} /> : <ArrowUpRight size={18} />} CONFIRM BOOKING</button>
          </form>}
        </> : <div className="empty-panel booking-empty">
          <CalendarDays size={24} />
          <p>There are no open times right now. Send a project request instead and I'll reply by email.</p>
          <Link href="/start-project" className="button button-accent">START A PROJECT <ArrowUpRight size={16} /></Link>
        </div>}
      </div>
    </div>
  </main>;
}
