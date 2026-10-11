import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Accessibility,
  AirVent,
  Coffee,
  DoorOpen,
  Facebook,
  Instagram,
  Laptop,
  MapPin,
  Phone,
  Refrigerator,
  ShieldCheck,
  Sparkles,
  Utensils,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { BookingPanel } from "@/components/BookingPanel";
import { Cursor } from "@/components/Cursor";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/sections/Footer";
import heroHotel from "@/assets/hero-bg/hero-hotel.jpg";
import roomPremier from "@/assets/room-premier.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import diningCloud9 from "@/assets/dining-cloud9.jpg";
import diningVrindavan from "@/assets/dining-vrindavan.jpg";
import clinqLounge from "@/assets/clinq-lounge.jpg";
import eventsBanquet from "@/assets/events-banquet.jpg";

const facilities = [
  ["VRINDAVAN", "Fine Vegetarian Restaurant", diningVrindavan],
  ["CLOUD NINE", "Multi Cuisine Rooftop Family Restaurant", diningCloud9],
  ["CLINQ", "Casual Lounge Bar", clinqLounge],
  ["TAVISHA", "Board Room", eventsBanquet],
  ["TVASISTA", "Kitty Party Room", eventsBanquet],
  ["TAMARA", "Pillarless Banquet / Party Hall", eventsBanquet],
  ["TITIKSHA", "Board Room", eventsBanquet],
  ["TRAVEL DESK", "Pickup & Drop, Vehicle on Rent", heroHotel],
] as const;

const amenities = [
  ["24 Centrally Air Conditioned Rooms", AirVent],
  ["32” / 43” LED TV with DTH Connection", Laptop],
  ["Hot Water Kettle (Tea / Coffee Maker)", Coffee],
  ["24 Hours Hot Water Shower", Sparkles],
  ["Electronic Safety Locker", ShieldCheck],
  ["Mini Fridge", Refrigerator],
  ["High Speed Wi-Fi Connectivity", Wifi],
  ["Office Desk & Chair", Accessibility],
  ["Laundry Facility", Utensils],
  ["Iron Board & Iron Box", DoorOpen],
  ["Bath Kit & Self Care Kit", Sparkles],
  ["In-Room Dining", Utensils],
] as const;

const attractions = [
  [
    "VELLORE FORT",
    "Built during the Vijayanagar period, Vellore Fort is known for its massive ramparts, historic architecture and intricate details.",
    heroHotel,
  ],
  [
    "SRI LAXMI NARAYANI GOLDEN TEMPLE",
    "Located at Sripuram, the Golden Temple is a remarkable spiritual destination known for its striking golden architecture and serene surroundings.",
    diningVrindavan,
  ],
  [
    "VELLORE MUSEUM",
    "Discover Vellore's history and cultural heritage through the collections and exhibits preserved at the Government Museum.",
    roomSuite,
  ],
  [
    "AMIRTHI ZOOLOGICAL PARK",
    "Located around 25 kilometres from Vellore, Amirthi Zoological Park offers a refreshing escape into nature.",
    heroHotel,
  ],
  [
    "JALAKANDESWARAR TEMPLE",
    "Situated within the Vellore Fort complex, this temple is an impressive example of traditional Dravidian architecture and craftsmanship.",
    eventsBanquet,
  ],
  [
    "JALAGAMPARAI WATERFALLS",
    "Located in the surrounding hill region, the waterfalls provide a scenic getaway into the natural beauty around Vellore.",
    roomPremier,
  ],
] as const;

const nearby = [
  ["CMC Vellore Campus", "2.4 km"],
  ["CMC Ranipet Campus", "6.4 km"],
  ["VIT Campus", "8.1 km"],
  ["Vellore Fort", "6.9 km"],
  ["Golden Temple", "11.2 km"],
  ["Jalagamparai Waterfalls", "3.8 km"],
  ["Jalakandeswarar Temple", "3.9 km"],
  ["Sri Selva Vinayagar Temple", "5.5 km"],
];
const services = [
  [
    "24-HOUR FRONT DESK",
    "Need something anytime? Our friendly staff is always available to assist with requests or local recommendations.",
  ],
  [
    "HOUSEKEEPING SERVICES",
    "Relax and unwind knowing your space is kept clean and tidy with our daily housekeeping service.",
  ],
  [
    "WIFI & INTERNET",
    "Stay connected with loved ones or catch up on work with high-speed Wi-Fi throughout the premises.",
  ],
  [
    "LAUNDRY SERVICES",
    "Full-service laundry for convenience, with self-service options where applicable.",
  ],
  [
    "BREAKFAST IN BED",
    "Start your morning right with a delicious breakfast available at an additional charge.",
  ],
  ["PRIVATE PARKING", "Enjoy the convenience of private parking during your stay."],
  [
    "DOCTOR ON CALL",
    "For your peace of mind, doctor-on-call assistance is available when required.",
  ],
  [
    "AIR CONDITIONING",
    "Enjoy a comfortable climate with individually controlled air conditioning.",
  ],
  ["BATH KIT", "Enjoy a complimentary bath kit with essential premium toiletries."],
];

function ArchitecturalScene() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((state, delta) => {
    const current = group.current;
    if (!current) return;
    const scrollDepth = (window.scrollY / Math.max(window.innerHeight, 1)) * 0.06;
    const ease = 1 - Math.exp(-2 * Math.min(delta, 0.05));
    current.rotation.y += (pointer.x * 0.08 + scrollDepth - current.rotation.y) * ease;
    current.rotation.x += (-pointer.y * 0.025 - current.rotation.x) * ease;
    current.position.z +=
      (Math.sin(state.clock.elapsedTime * 0.16) * 0.08 - current.position.z) * ease;
  });
  return (
    <group ref={group} position={[0, -1.6, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#b9cbd5" roughness={0.35} metalness={0.12} />
      </mesh>
      {[-4.3, 4.3].map((x) => (
        <group key={x} position={[x, 2, -2]}>
          <mesh>
            <boxGeometry args={[0.48, 7, 0.48]} />
            <meshStandardMaterial color="#f3f8fa" roughness={0.28} metalness={0.18} />
          </mesh>
          <mesh position={[0, 0.5, 0.25]}>
            <boxGeometry args={[1.2, 2.3, 0.07]} />
            <meshStandardMaterial color="#cf8c55" emissive="#6a4024" emissiveIntensity={0.22} />
          </mesh>
        </group>
      ))}
      {[2.5, 4.4, 6.2].map((z, index) => (
        <mesh key={z} position={[0, 3.9 - index * 0.25, -z]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[9.5 - index * 0.7, 0.22, 0.48]} />
          <meshStandardMaterial
            color={index === 0 ? "#cf8c55" : "#f3f8fa"}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      ))}
      <mesh position={[0, 4.9, -3.3]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f6e2b4" emissive="#cf8c55" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 4.7, -3]} color="#cf8c55" intensity={12} distance={9} />
    </group>
  );
}

function AboutScene() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <Canvas
      dpr={reduced ? 1 : [1, 1.5]}
      camera={{ position: [0, 1.1, 9], fov: 48 }}
      gl={{ antialias: !reduced, alpha: true, powerPreference: "high-performance" }}
      fallback={<div className="absolute inset-0 bg-[var(--hero-overlay)]" />}
    >
      <ambientLight intensity={1.2} color="#f3f8fa" />
      <directionalLight position={[3, 6, 4]} intensity={2.4} color="#f6e2b4" />
      <ArchitecturalScene />
    </Canvas>
  );
}

export function AboutUs() {
  const [booking, setBooking] = useState(false);
  const openBooking = () => setBooking(true);
  return (
    <>
      <Cursor />
      <Navbar onBook={openBooking} />
      <main className="about-page readable-content">
        <section className="about-hero dark-surface" id="top">
          <div className="about-hero-scene" aria-hidden="true">
            <AboutScene />
          </div>
          <div className="about-hero-shade" />
          <div className="about-hero-copy">
            <p className="eyebrow text-gold">Premier luxury in Vellore</p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(4rem,11vw,10rem)] leading-[0.82] tracking-[-0.03em] text-white">
              About the <i className="text-gold">hotel.</i>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-[var(--color-ivory)]">
              Experience the ultimate in comfort and luxury, shaped by thoughtful spaces and the
              warmth of Vellore.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={openBooking} className="luxury-button luxury-button-hover px-6 py-3">
                Book your stay
              </button>
              <a href="#welcome" className="luxury-button-ghost px-6 py-3 text-cream">
                Explore the hotel
              </a>
            </div>
          </div>
          <p className="about-hero-index eyebrow text-cream">
            01 <span /> 12
          </p>
        </section>
        <section className="about-section about-story" id="welcome">
          <div className="about-kicker">
            <span>01</span>
            <p className="eyebrow">Welcome to PNS Nakshatra</p>
          </div>
          <div className="about-story-grid">
            <div>
              <h2 className="about-title">
                A considered stay,
                <br />
                <i>made personal.</i>
              </h2>
            </div>
            <div className="space-y-5 text-lg text-muted-foreground">
              <p>
                Hotel PNS Nakshatra is a contemporary 3-star luxury hotel situated in the vibrant
                city of Vellore. Established with a vision to provide an unparalleled hospitality
                experience, our journey began with a dream to create a haven of comfort and luxury
                for travelers.
              </p>
              <p>
                Located on the bustling Chennai–Bangalore Highway, the hotel offers a serene escape
                amidst the scenic foothills, providing guests with an oasis of tranquillity while
                keeping the city&apos;s important destinations within easy reach.
              </p>
              <a href="#contact" className="text-link">
                Discover our address
              </a>
            </div>
          </div>
          <div className="about-image-strip">
            <img src={heroHotel} alt="Hotel PNS Nakshatra illuminated facade" loading="lazy" />
            <div>
              <span className="eyebrow">Vellore · Tamil Nadu</span>
              <p className="mt-2 font-display text-3xl text-cream">
                A quiet landmark on the highway.
              </p>
            </div>
          </div>
        </section>
        <section className="about-section about-experience">
          <div className="about-kicker">
            <span>02</span>
            <p className="eyebrow">Great stay experience at PNS Nakshatra</p>
          </div>
          <div className="about-feature-grid">
            <img src={roomPremier} alt="Vajra Premium Room at Hotel PNS Nakshatra" loading="lazy" />
            <div className="about-feature-copy">
              <p className="eyebrow text-gold">Vajra Premium Rooms</p>
              <h2 className="about-title">
                Naturally comfortable
                <br />
                <i>private spaces.</i>
              </h2>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">
                Our Vajra Premium Rooms are designed to provide a serene and sophisticated
                environment. Elegantly furnished and equipped with modern amenities, they make room
                for both rest and focus.
              </p>
              <button
                onClick={openBooking}
                className="luxury-button luxury-button-hover mt-8 px-6 py-3"
              >
                Book your stay
              </button>
            </div>
          </div>
        </section>
        <section className="about-section about-accommodation">
          <div className="about-kicker">
            <span>03</span>
            <p className="eyebrow">Experience luxury and comfort</p>
          </div>
          <div className="about-story-grid">
            <h2 className="about-title">
              Elegant accommodations
              <br />
              <i>for every traveler.</i>
            </h2>
            <div>
              <p className="text-lg text-muted-foreground">
                At Hotel PNS Nakshatra, we take pride in offering a diverse range of luxurious rooms
                and suites designed to meet the needs of every traveler. Each room is thoughtfully
                furnished with modern amenities and exudes a sense of comfort and elegance.
              </p>
              <div className="about-room-images mt-8">
                <img src={roomSuite} alt="Nakshatra Suite living space" loading="lazy" />
                <img src={roomPremier} alt="Premium room details" loading="lazy" />
              </div>
              <button
                onClick={openBooking}
                className="luxury-button luxury-button-hover mt-8 px-6 py-3"
              >
                Book your stay
              </button>
            </div>
          </div>
        </section>
        <section className="about-section about-dark dark-surface" id="facilities">
          <div className="about-kicker">
            <span>04</span>
            <p className="eyebrow text-gold">Hotel facilities</p>
          </div>
          <h2 className="about-title text-gold">
            <span style={{ color: "#FFFFFF" }}>Spaces with a</span>
            <br />
            <i className="text-gold">sense of occasion.</i>
          </h2>
          <div className="facility-grid">
            {facilities.map(([name, detail, image]) => (
              <article className="facility-item" key={name}>
                <img src={image} alt="" loading="lazy" />
                <div>
                  <p className="eyebrow text-gold">{name}</p>
                  <p className="mt-2 text-sm text-[var(--color-ivory)]">{detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="about-section about-amenities">
          <div className="about-kicker">
            <span>05</span>
            <p className="eyebrow">Room amenities</p>
          </div>
          <div className="about-story-grid">
            <h2 className="about-title">
              Everything in its
              <br />
              <i>right place.</i>
            </h2>
            <div className="amenities-grid">
              {amenities.map(([label, Icon]) => (
                <div className="amenity-item" key={label}>
                  <Icon size={18} strokeWidth={1.4} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="about-section about-services about-dark dark-surface">
          <div className="about-kicker">
            <span>06</span>
            <p className="eyebrow text-gold">Discover our services & facilities</p>
          </div>
          <h2 className="about-title text-cream">
            <span style={{ color: "#FFFFFF" }}>Care that arrives</span>
            <br />
            <i className="text-gold">before you ask.</i>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-[var(--color-ivory)]">
            At Hotel PNS Nakshatra, we are dedicated to providing our guests with a luxurious and
            comfortable stay, ensuring every need is met with impeccable service.
          </p>
          <div className="services-grid">
            {services.map(([name, detail]) => (
              <article key={name}>
                <p className="eyebrow text-gold">{name}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ivory)]">{detail}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="about-section about-vellore">
          <div className="about-kicker">
            <span>07</span>
            <p className="eyebrow">Explore Vellore</p>
          </div>
          <div className="about-story-grid">
            <div>
              <h2 className="about-title">
                Discover the places
                <br />
                <i>around PNS Nakshatra.</i>
              </h2>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">
                Vellore blends history, spirituality, architecture and natural beauty. During your
                stay, explore some of the city&apos;s most distinctive attractions and nearby
                escapes.
              </p>
            </div>
            <div className="attraction-grid">
              {attractions.map(([name, detail, image]) => (
                <article className="attraction-item" key={name}>
                  <img src={image} alt="" loading="lazy" />
                  <div>
                    <p className="eyebrow text-gold">{name}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="about-section about-nearby">
          <div className="about-kicker">
            <span>08</span>
            <p className="eyebrow">Nearby attractions</p>
          </div>
          <div className="nearby-layout">
            <div>
              <h2 className="about-title">
                Close to the
                <br />
                <i>city&apos;s pulse.</i>
              </h2>
              <div className="nearby-pin">
                <MapPin size={20} />
                <span>PNS NAKSHATRA</span>
              </div>
            </div>
            <div className="nearby-list">
              {nearby.map(([place, distance], index) => (
                <div key={place}>
                  <span className="eyebrow text-gold">0{index + 1}</span>
                  <span>{place}</span>
                  <strong>{distance}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
       
      </main>
      <Footer onBook={openBooking} />
      <BookingPanel
        open={booking}
        details={{ checkIn: "", checkOut: "", rooms: "1", guests: "1" }}
        onClose={() => setBooking(false)}
      />
    </>
  );
}
