import heroHotel from "@/assets/hero-bg/hero-hotel.jpg";
import diningVrindavan from "@/assets/dining-vrindavan.jpg";
import diningCloud9 from "@/assets/dining-cloud9.jpg";
import clinqLounge from "@/assets/clinq-lounge.jpg";
import eventsBanquet from "@/assets/events-banquet.jpg";
import type { RoomType } from "@/types/roomImages";

export type GalleryCategory = "All" | "Rooms" | "Dining" | "Hotel" | "Events" | "Exterior";

export type GalleryImage = {
  id: string;
  src: string;
  title: string;
  category: Exclude<GalleryCategory, "All">;
  alt: string;
  roomType?: RoomType;
};

export const galleryImages: GalleryImage[] = [
  {
    id: "hotel",
    src: heroHotel,
    title: "The hotel at evening",
    category: "Exterior",
    alt: "Hotel PNS Nakshatra illuminated at evening",
  },
  {
    id: "vrindavan",
    src: diningVrindavan,
    title: "Vrindavan",
    category: "Dining",
    alt: "Vrindavan vegetarian restaurant",
  },
  {
    id: "cloud9",
    src: diningCloud9,
    title: "Cloud 9",
    category: "Dining",
    alt: "Cloud 9 rooftop dining",
  },
  {
    id: "clinq",
    src: clinqLounge,
    title: "Clinq lounge",
    category: "Dining",
    alt: "Clinq lounge and bar",
  },
  {
    id: "events",
    src: eventsBanquet,
    title: "A place to gather",
    category: "Events",
    alt: "Banquet hall at Hotel PNS Nakshatra",
  },
];
