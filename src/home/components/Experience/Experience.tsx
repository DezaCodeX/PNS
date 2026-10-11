import roomSuite from "@/assets/room-suite.jpg";

const moments = ["Arrival", "Stay", "Dining", "Celebration", "Departure"];
export function Experience() {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-32">
      <img
        src={roomSuite}
        alt=""
        aria-hidden="true"
        width={1200}
        height={800}
        loading="lazy"
        className="pointer-events-none absolute right-0 top-16 hidden h-[70%] w-[24%] object-cover opacity-15 lg:block"
      />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <p className="eyebrow" data-home-reveal>
          05 — Experience
        </p>
        <h2
          className="mt-6 max-w-5xl font-display text-[clamp(3.4rem,10vw,9rem)] leading-[0.82] text-cream"
          data-home-reveal
        >
          Make room for <span className="italic text-gold">the moment.</span>
        </h2>
        <div className="mt-16 grid grid-cols-2 gap-y-8 border-t border-gold/40 pt-8 sm:grid-cols-5">
          {moments.map((moment, index) => (
            <div key={moment} data-home-reveal>
              <span className="eyebrow">0{index + 1}</span>
              <p className="mt-4 font-display text-2xl text-cream">{moment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
