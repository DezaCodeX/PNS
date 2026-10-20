const legalContent = {
  "/privacy-policy": {
    title: "Privacy Policy",
    text: "Hotel PNS Nakshatra respects your privacy. Information shared through this website is used only to respond to enquiries, reservations and hospitality requests.",
  },
  "/terms-and-conditions": {
    title: "Terms and Conditions",
    text: "Website content, availability and reservation details are subject to confirmation by Hotel PNS Nakshatra. Please contact our reservations team for current terms.",
  },
  "/refund-cancellation-policy": {
    title: "Refund & Cancellation Policy",
    text: "Cancellation and refund terms depend on the reservation channel and selected rate. Please contact the reservations team for the policy attached to your booking.",
  },
} as const;

export function Legal({ path }: { path: keyof typeof legalContent }) {
  const content = legalContent[path];
  return (
    <main className="min-h-screen bg-background px-6 pb-24 pt-40 lg:px-12 lg:pt-52">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-gold">Hotel PNS Nakshatra</p>
        <h1 className="mt-5 font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.85] text-ink">{content.title}</h1>
        <div className="gold-rule mt-8" />
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">{content.text}</p>
        <a href="/" className="text-link mt-10">Return home</a>
      </div>
    </main>
  );
}
