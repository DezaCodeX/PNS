import type { BookingDetails } from "@/home/components/Booking/BookingWidget";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";

export function BookingPanel({
  open,
  details,
  onClose,
}: {
  open: boolean;
  details: BookingDetails;
  onClose: () => void;
}) {
  const dialogRef = useDialogAccessibility(open, onClose);

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-500 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
      inert={!open}
    >
      <button
        aria-label="Close booking"
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "#4169E1", opacity: 0.72 }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        tabIndex={-1}
        className={`glass-panel absolute left-1/2 top-1/2 w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 p-8 transition-transform duration-500 sm:p-12 ${
          open ? "scale-100" : "scale-95"
        }`}
      >
        <p className="eyebrow">Reserve</p>
        <h2 id="booking-title" className="mt-3 font-display text-4xl text-cream">
          Reserve your stay
        </h2>
        <div className="gold-rule mt-6" />

        <form
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <label className="block">
            <span className="eyebrow">Check in</span>
            <input
              type="date"
              required
              value={details.checkIn}
              readOnly
              className="mt-3 w-full border-b border-input bg-transparent pb-2 text-[length:var(--type-body-small)] text-cream outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="eyebrow">Check out</span>
            <input
              type="date"
              required
              value={details.checkOut}
              readOnly
              className="mt-3 w-full border-b border-input bg-transparent pb-2 text-[length:var(--type-body-small)] text-cream outline-none focus:border-gold"
            />
          </label>
          {[
            { label: "Rooms", options: ["1", "2", "3", "4+"] },
            { label: "Guests", options: ["1", "2", "3", "4", "5+"] },
          ].map((f) => (
            <label key={f.label} className="block">
              <span className="eyebrow">{f.label}</span>
              <select
                value={details[f.label.toLowerCase() as "rooms" | "guests"]}
                disabled
                className="mt-3 w-full border-b border-input bg-transparent pb-2 text-[length:var(--type-body-small)] text-cream outline-none focus:border-gold"
              >
                {f.options.map((o) => (
                  <option key={o} value={o} className="bg-card">
                    {o}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            type="submit"
            className="luxury-button luxury-button-hover sm:col-span-2 mt-2 px-8 py-4"
          >
            Check availability
          </button>
        </form>

        <button onClick={onClose} className="eyebrow mt-6 block hover:text-gold">
          Close
        </button>
      </div>
    </div>
  );
}
