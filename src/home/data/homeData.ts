import { dining, eventHalls, nearby, rooms } from "@/data/hotel";
import heroHotel from "@/assets/hero-bg/hero-hotel.jpg";
import eventsBanquet from "@/assets/events-banquet.jpg";

export const hotel = {
  name: "PNS Nakshatra",
  place: "Vellore, Tamil Nadu",
  description:
    "A contemporary stay in the heart of Vellore, with rooms, dining, lounge and celebration spaces under one roof.",
  address: "Katpadi Road, Vellore 632004",
  heroImage: heroHotel,
};

export const featuredRooms = rooms;
export const diningExperiences = dining;
export const celebrationSpaces = eventHalls;
export const nearbyPlaces = nearby;

export const facilities = [
  { name: "Rooftop dining", detail: "Cloud 9 above the city" },
  { name: "Lounge & bar", detail: "A calm corner for conversation" },
  { name: "Banquet spaces", detail: "Four spaces for celebrations" },
  { name: "24/7 service", detail: "Care throughout your stay" },
];

export const gallery = [
  { src: heroHotel, label: "The hotel" },
  { src: eventsBanquet, label: "Celebrations" },
];
