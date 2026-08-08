export type Service = {
  slug: string;
  title: string;
  shortDescription: string;
};

/** Placeholder service list — replace with real offerings from Figma/content. */
export const services: Service[] = [
  {
    slug: "classic-lashes",
    title: "Classic Lashes",
    shortDescription: "Natural definition, one extension per lash.",
  },
  {
    slug: "hybrid-lashes",
    title: "Hybrid Lashes",
    shortDescription: "Soft texture with a fuller finish.",
  },
  {
    slug: "volume-lashes",
    title: "Volume Lashes",
    shortDescription: "Lightweight fans for dramatic density.",
  },
  {
    slug: "lash-lifts",
    title: "Lash Lift & Tint",
    shortDescription: "Lift and tint for low-maintenance glam.",
  },
];
