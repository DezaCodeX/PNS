import type { DiningType } from "@/types/roomImages";

export type DiningExperience = {
  id: "vrindavan" | "cloud-9" | "clinq";
  diningType: DiningType;
  name: string;
  category: string;
  heading: string;
  description: string;
  features: string[];
  phone: string;
  phoneHref: string;
  menuLinks: { label: string; href: string }[];
  tone: "warm" | "rooftop" | "lounge";
};

export const diningExperiences: DiningExperience[] = [
  {
    id: "vrindavan",
    diningType: "vrindavan",
    name: "Vrindavan",
    category: "Pure Vegetarian Fine Dining",
    heading: "Vrindavan — Vegetarian Fine Dining in Vellore",
    description:
      "Vrindavan offers a signature vegetarian fine dining experience in an elegant and serene setting. The restaurant presents a wide variety of nutritious and flavorful vegetarian dishes prepared with carefully selected ingredients. Whether you are looking for a wholesome family meal, a business lunch or an intimate dinner, Vrindavan provides a refined dining environment within Hotel PNS Nakshatra.",
    features: [
      "A la carte menu for lunch and dinner",
      "Elegant and serene ambience",
      "Fresh and locally sourced ingredients",
      "Indian and international vegetarian cuisine",
      "Family gatherings, business lunches and intimate dinners",
    ],
    phone: "+91 75984 98603",
    phoneHref: "tel:+917598498603",
    menuLinks: [{ label: "Checkout our menu", href: "#vrindavan-menu" }],
    tone: "warm",
  },
  {
    id: "cloud-9",
    diningType: "cloud9",
    name: "Cloud 9",
    category: "Rooftop Multi-Cuisine Restaurant",
    heading: "Cloud 9 — Rooftop Dining Above Vellore",
    description:
      "Cloud 9 is our rooftop dining destination, offering panoramic views of the surrounding landscape and a distinctive dining experience beneath the open sky. The menu brings together multi-cuisine favourites, from traditional Indian dishes to international selections, creating a relaxed setting for breakfast, lunch, dinner and special occasions.",
    features: [
      "Buffet and a la carte options",
      "Breakfast, lunch and dinner",
      "Spectacular rooftop views",
      "Multi-cuisine menu with Indian, Chinese and Continental cuisine",
      "Family outings, romantic dinners and special celebrations",
    ],
    phone: "+91 75984 98604",
    phoneHref: "tel:+917598498604",
    menuLinks: [{ label: "Checkout our menu", href: "#cloud-9-menu" }],
    tone: "rooftop",
  },
  {
    id: "clinq",
    diningType: "clinq",
    name: "Clinq",
    category: "Lounge & Bar",
    heading: "Clinq — Unwind Into the Evening",
    description:
      "Clinq is a stylish lounge and bar designed for guests who want to unwind in a relaxed, sophisticated atmosphere. With a comfortable lounge setting, a wide selection of beverages and a menu of light bites and snacks, Clinq is suited to casual meetings, social gatherings and leisurely evenings.",
    features: [
      "Open daily from 11:00 AM to 12:00 midnight",
      "Cocktails, mocktails, wines and beers",
      "Casual and inviting lounge atmosphere",
      "Light bites and snacks",
      "Social gatherings, casual meetings and relaxed evenings",
    ],
    phone: "+91 75984 98605",
    phoneHref: "tel:+917598498605",
    menuLinks: [
      { label: "Checkout our beverage menu", href: "#clinq-beverage-menu" },
      { label: "Checkout our bar menu", href: "#clinq-bar-menu" },
    ],
    tone: "lounge",
  },
];
