export type ReviewSource = "google" | "vagaro";

export type SiteReview = {
  id: string;
  source: ReviewSource;
  author: string;
  rating: number;
  text: string;
  date: string | null;
  url?: string | null;
  authorUrl?: string | null;
};

export type ReviewsFeed = {
  updatedAt: string;
  sources: {
    google: {
      rating: number | null;
      count: number | null;
      url: string | null;
      enabled: boolean;
    };
    vagaro: {
      rating: number | null;
      count: number | null;
      url: string | null;
      enabled: boolean;
    };
  };
  reviews: SiteReview[];
};

import feedJson from "../../public/data/reviews.json";

export const reviewsFeed = feedJson as ReviewsFeed;

export function getCombinedSummary(feed: ReviewsFeed = reviewsFeed) {
  const google = feed.sources.google;
  const vagaro = feed.sources.vagaro;

  const parts: { rating: number; count: number }[] = [];
  if (google.enabled && google.rating != null && google.count != null) {
    parts.push({ rating: google.rating, count: google.count });
  }
  if (vagaro.enabled && vagaro.rating != null && vagaro.count != null) {
    parts.push({ rating: vagaro.rating, count: vagaro.count });
  }

  if (!parts.length) {
    const local = feed.reviews;
    if (!local.length) return { rating: null as number | null, count: 0 };
    const avg = local.reduce((sum, r) => sum + r.rating, 0) / local.length;
    return { rating: Number(avg.toFixed(1)), count: local.length };
  }

  const weighted =
    parts.reduce((sum, p) => sum + p.rating * p.count, 0) /
    parts.reduce((sum, p) => sum + p.count, 0);
  const count = parts.reduce((sum, p) => sum + p.count, 0);
  return { rating: Number(weighted.toFixed(1)), count };
}
