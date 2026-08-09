export type HourRow = { day: string; time: string };

export type SiteSettingsDoc = {
  name: string;
  tagline: string;
  ownerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  bookingUrl: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  hours: HourRow[];
  seoDescription: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  googleReviewsUrl: string | null;
  vagaroRating: number | null;
  vagaroReviewCount: number | null;
  vagaroReviewsUrl: string | null;
  heroImagePath: string | null;
  updatedAt?: string;
};

export type ServiceItemDoc = {
  name: string;
  price: string;
  note?: string | null;
};

export type ServiceSectionDoc = {
  heading?: string | null;
  items: ServiceItemDoc[];
};

export type ServiceFaqDoc = {
  question: string;
  answer: string;
};

export type ServiceDoc = {
  slug: string;
  title: string;
  navLabel: string;
  group: "eyelashes" | "eyebrows" | "body" | "skin";
  shortDescription: string;
  intro: string;
  cardImagePath: string | null;
  sortOrder: number;
  published: boolean;
  sections: ServiceSectionDoc[];
  faqs: ServiceFaqDoc[];
  careTips: string[];
  updatedAt?: string;
};

export type ReviewDoc = {
  source: "google" | "vagaro";
  author: string;
  rating: number;
  body: string;
  reviewDate: string | null;
  url: string | null;
  authorUrl: string | null;
  visible: boolean;
  featured: boolean;
  sortOrder: number;
};

export type LeadDoc = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  serviceInterest: string | null;
  sourcePage: string;
  landingUrl: string | null;
  referrerUrl: string | null;
  createdAt: string;
  handledAt: string | null;
  notes: string | null;
};

export type MediaDoc = {
  storagePath: string;
  publicUrl: string;
  alt: string;
  usedAs: string | null;
  createdAt: string;
};

export type LeadRow = LeadDoc & { id: string };
export type ReviewRow = ReviewDoc & { id: string };
export type MediaRow = MediaDoc & { id: string };
export type ServiceRow = ServiceDoc & { id: string };
