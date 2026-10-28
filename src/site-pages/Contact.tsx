"use client";

import { Instagram, MapPin, Phone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/sections/Footer";

export function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onBook={() => undefined} />
      <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-36 lg:px-12 lg:pt-44">
        <p className="eyebrow text-gold">Get in touch</p>
        <h1 className="mt-3 max-w-3xl font-display text-[clamp(3rem,7vw,6rem)] leading-none text-cream">
          Contact PNS Nakshatra
        </h1>
        <div className="gold-rule mt-8" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-7 text-base text-foreground">
            <a
              href="tel:+914162222222"
              className="flex items-start gap-4 transition-colors hover:text-gold"
            >
              <Phone className="mt-1 size-5 shrink-0 text-gold" />
              <span>
                <strong className="block text-sm uppercase tracking-[0.16em]">Phone</strong>+91 416
                222 2222
              </span>
            </a>
            <a
              href="https://wa.me/914162222222"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 transition-colors hover:text-gold"
            >
              <span className="mt-1 flex size-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-primary-foreground">
                W
              </span>
              <span>
                <strong className="block text-sm uppercase tracking-[0.16em]">WhatsApp</strong>Chat
                with our team
              </span>
            </a>
            <a
              href="mailto:stay@pnsnakshatra.com"
              className="flex items-start gap-4 transition-colors hover:text-gold"
            >
              <span className="mt-1 text-gold">@</span>
              <span>
                <strong className="block text-sm uppercase tracking-[0.16em]">Email</strong>
                stay@pnsnakshatra.com
              </span>
            </a>
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-gold" />
              <span>
                <strong className="block text-sm uppercase tracking-[0.16em]">Address</strong>
                Katpadi Road, Vellore 632004, Tamil Nadu
              </span>
            </div>
            <div className="flex items-center gap-5 pt-2">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-gold transition-colors hover:text-foreground"
              >
                <Instagram className="size-6" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-lg font-bold text-gold transition-colors hover:text-foreground"
              >
                f
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-lg font-bold text-gold transition-colors hover:text-foreground"
              >
                in
              </a>
            </div>
          </div>
          <div className="min-h-[360px] overflow-hidden border border-border bg-card/30">
            <iframe
              title="PNS Nakshatra location map"
              src="https://www.google.com/maps?q=Katpadi%20Road%2C%20Vellore%20632004&output=embed"
              className="h-full min-h-[360px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </main>
      <Footer onBook={() => undefined} />
    </div>
  );
}
