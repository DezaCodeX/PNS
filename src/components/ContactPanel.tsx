import { useState } from "react";
import { Instagram, MapPin, Phone, X } from "lucide-react";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";

export function ContactPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useDialogAccessibility(open, onClose);
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <div
      className={`fixed inset-0 z-[85] transition-opacity duration-500 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
      inert={!open}
    >
      <button
        aria-label="Dismiss contact panel"
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(65, 105, 225, 0.35)" }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        tabIndex={-1}
        className={`glass-panel absolute left-1/2 top-1/2 max-h-[90vh] w-[min(94vw,900px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6 transition-transform duration-500 sm:p-10 ${
          open ? "scale-100" : "scale-95"
        }`}
      >
        <button
          aria-label="Close contact details"
          onClick={onClose}
          className="absolute right-5 top-5 text-cream/70 transition-colors hover:text-gold"
        >
          <X className="size-5" />
        </button>
        <p className="eyebrow text-gold">Get in touch</p>
        <h2 id="contact-title" className="mt-2 font-display text-4xl text-cream sm:text-5xl">
          Contact PNS Nakshatra
        </h2>
        <div className="gold-rule mt-5" />

        <div className="mt-7 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5 text-sm text-foreground">
            <a
              href="tel:+914162222222"
              className="flex items-start gap-3 transition-colors hover:text-gold"
            >
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>
                <strong className="block text-xs uppercase tracking-[0.16em] text-foreground">
                  Phone
                </strong>
                +91 416 222 2222
              </span>
            </a>
            <a
              href="https://wa.me/914162222222"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 transition-colors hover:text-gold"
            >
              <span className="mt-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[0.55rem] font-bold text-primary-foreground">
                W
              </span>
              <span>
                <strong className="block text-xs uppercase tracking-[0.16em] text-foreground">
                  WhatsApp
                </strong>
                Chat with our team
              </span>
            </a>
            <a
              href="mailto:stay@pnsnakshatra.com"
              className="flex items-start gap-3 transition-colors hover:text-gold"
            >
              <span className="mt-0.5 text-gold">@</span>
              <span>
                <strong className="block text-xs uppercase tracking-[0.16em] text-foreground">
                  Email
                </strong>
                stay@pnsnakshatra.com
              </span>
            </a>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>
                <strong className="block text-xs uppercase tracking-[0.16em] text-foreground">
                  Address
                </strong>
                Katpadi Road, Vellore 632004, Tamil Nadu
              </span>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-gold transition-colors hover:text-foreground"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-sm font-bold text-gold transition-colors hover:text-foreground"
              >
                f
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-sm font-bold text-gold transition-colors hover:text-foreground"
              >
                in
              </a>
            </div>
          </div>

          <div className="min-h-[260px] overflow-hidden border border-border bg-card/30">
            {mapLoaded ? (
              <iframe
                title="PNS Nakshatra location map"
                src="https://www.google.com/maps?q=Katpadi%20Road%2C%20Vellore%20632004&output=embed"
                className="h-full min-h-[260px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-6 text-center">
                <MapPin className="size-6 text-gold" aria-hidden="true" />
                <p className="text-sm text-foreground">Katpadi Road, Vellore 632004, Tamil Nadu</p>
                <button
                  type="button"
                  onClick={() => setMapLoaded(true)}
                  className="luxury-button-ghost min-h-11 px-4 py-2"
                >
                  Load interactive map
                </button>
                <a
                  href="https://www.google.com/maps?q=Katpadi%20Road%2C%20Vellore%20632004"
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Open in Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
