export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
}

export const categories: Category[] = [
  {
    id: "all-sim-offer",
    name: "All Sim Offer",
    icon: "sim-offer.png",
    subcategories: [
      "Grammeen Phone",
      "Teletalk",
      "BanglaLink",
      "Robi",
      "Airtel"
    ]
  },
  {
    id: "social-media-services",
    name: "Social Media Services",
    icon: "social-media.png",
    subcategories: [
      "Facebook",
      "Instagram",
      "Tiktok",
      "Youtube",
      "Telegram",
      "X-Twitter",
      "Linkedin",
      "Snapchat",
      "Pinterest"
    ]
  },
  {
    id: "website-services",
    name: "Website Services",
    icon: "website-services.png"
  },
  {
    id: "smart-cv-make",
    name: "Smart CV Make",
    icon: "smart-cv.png"
  },
  {
    id: "digital-services",
    name: "Digital Services",
    icon: "digital-services.png"
  },
  {
    id: "pdf-to-image",
    name: "PDF To Image",
    icon: "digital-services.png"
  },
  {
    id: "ai-photo-enhancer",
    name: "AI Photo Enhancer",
    icon: "digital-services.png"
  }
];
