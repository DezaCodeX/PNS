import heroHotel from "@/assets/hero-bg/hero-hotel.jpg";
import eventsBanquet from "@/assets/events-banquet.jpg";
import type { DiningType, RoomType } from "@/types/roomImages";

export type GalleryCategory = "All" | "Rooms" | "Dining" | "Hotel" | "Events" | "Exterior";

export type GalleryImage = {
  id: string;
  src: string;
  title: string;
  category: Exclude<GalleryCategory, "All">;
  alt: string;
  roomType?: RoomType;
  diningType?: DiningType;
};

export const galleryImages: GalleryImage[] = [
  {
    id: "hotel",
    src: heroHotel.src,
    title: "The hotel at evening",
    category: "Exterior",
    alt: "Hotel PNS Nakshatra illuminated at evening",
  },
  {
    id: "events",
    src: eventsBanquet.src,
    title: "A place to gather",
    category: "Events",
    alt: "Banquet hall at Hotel PNS Nakshatra",
  },
];
