import { useState } from "react";
import { CalendarDays, CircleDot, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Shell from "@/components/DashboardShell";

export default function PortalBookings() {
  const { user } = useAuth();
  const myBookings = trpc.portal.myBookings.useQuery();
  const availableSlots = trpc.bookings.availableSlots.useQuery();
  const [pendingSlotId, setPendingSlotId] = useState<number | null>(null);
  const book = trpc.bookings.book.useMutation({
    onSuccess: () => { myBookings.refetch(); availableSlots.refetch(); setPendingSlotId(null); },
    onError: () => setPendingSlotId(null),
  });

  const handleBook = (slotId: number) => {
    if (!user) return;
    setPendingSlotId(slotId);
    book.mutate({ slotId, name: user.name ?? "", email: user.email });
  };

  return <Shell>
    <div className="dashboard-heading"><div><p className="section-kicker">/ BOOKINGS</p><h1>YOUR<br /><span>MEETINGS.</span></h1></div></div>
    <div className="dashboard-grid">
      <section className="dashboard-panel wide">
        <div className="panel-heading"><h2>UPCOMING</h2><CalendarDays size={18} /></div>
        {myBookings.data?.length ? myBookings.data.map((meeting) => <div className="meeting-row" key={meeting.id}>
          <CircleDot size={14} color="#EAFF00" />
          <div>
            <strong>{meeting.title}</strong>
            <span>{new Date(meeting.scheduledAt).toLocaleString()} · {meeting.durationMinutes} min · {meeting.status}</span>
          </div>
        </div>) : <div className="empty-panel"><CalendarDays size={24} /><p>No meetings scheduled yet.</p></div>}
      </section>
      <section className="dashboard-panel wide">
        <div className="panel-heading"><h2>BOOK A NEW MEETING</h2></div>
        {availableSlots.data?.length ? <div className="slot-grid">
          {availableSlots.data.map((slot) => <button
            key={slot.id}
            type="button"
            className="slot-button"
            disabled={book.isPending}
            onClick={() => handleBook(slot.id)}
          >
            <span>{new Date(slot.startTime).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
            <span>{new Date(slot.startTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
            <span>{slot.durationMinutes} min{pendingSlotId === slot.id && book.isPending ? <> <Loader2 className="spin" size={12} style={{ display: "inline" }} /></> : null}</span>
          </button>)}
        </div> : <div className="empty-panel"><CalendarDays size={24} /><p>No open time slots right now. Check back soon.</p></div>}
      </section>
    </div>
  </Shell>;
}
