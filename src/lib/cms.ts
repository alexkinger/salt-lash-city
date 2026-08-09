import type { ServicePage } from "@/data/site";
import { site as staticSite, servicePages as staticServices } from "@/data/site";
import type { ReviewsFeed, SiteReview } from "@/data/reviews";
import { reviewsFeed as staticReviews } from "@/data/reviews";
import type {
  HourRow,
  ReviewRow,
  ServiceDoc,
  SiteSettingsDoc,
} from "@/lib/firebase.types";

export type SiteModel = {
  name: string;
  tagline: string;
  owner: string;
  email: string;
  phone: string;
  phoneHref: string;
  address: { line1: string; line2: string };
  bookingUrl: string;
  social: { facebook: string; instagram: string };
  hours: HourRow[];
  seoDescription: string;
  heroImagePath: string;
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

export function settingsToSite(row: SiteSettingsDoc | null | undefined): SiteModel {
  if (!row) {
    return {
      name: staticSite.name,
      tagline: staticSite.tagline,
      owner: staticSite.owner,
      email: staticSite.email,
      phone: staticSite.phone,
      phoneHref: staticSite.phoneHref,
      address: { ...staticSite.address },
      bookingUrl: staticSite.bookingUrl,
      social: { ...staticSite.social },
      hours: [...staticSite.hours],
      seoDescription:
        "Salt Lash City — Master Esthetician Blake in Sandy, UT. Eyelash extensions, lifts, tinting, waxing, and facials.",
      heroImagePath: "/images/brand/lash-extensions-home.png",
      google: {
        rating: staticReviews.sources.google.rating,
        count: staticReviews.sources.google.count,
        url: staticReviews.sources.google.url,
        enabled: staticReviews.sources.google.enabled,
      },
      vagaro: {
        rating: staticReviews.sources.vagaro.rating,
        count: staticReviews.sources.vagaro.count,
        url: staticReviews.sources.vagaro.url,
        enabled: staticReviews.sources.vagaro.enabled,
      },
    };
  }

  const digits = row.phone.replace(/\D/g, "");
  return {
    name: row.name,
    tagline: row.tagline,
    owner: row.ownerName,
    email: row.email,
    phone: row.phone,
    phoneHref: digits ? `tel:+1${digits.replace(/^1/, "")}` : `tel:${row.phone}`,
    address: {
      line1: row.addressLine1,
      line2: row.addressLine2,
    },
    bookingUrl: row.bookingUrl,
    social: {
      facebook: row.facebookUrl || staticSite.social.facebook,
      instagram: row.instagramUrl || staticSite.social.instagram,
    },
    hours: Array.isArray(row.hours) ? row.hours : [...staticSite.hours],
    seoDescription:
      row.seoDescription ||
      "Salt Lash City — Master Esthetician Blake in Sandy, UT. Eyelash extensions, lifts, tinting, waxing, and facials.",
    heroImagePath: row.heroImagePath || "/images/brand/lash-extensions-home.png",
    google: {
      rating: row.googleRating,
      count: row.googleReviewCount,
      url: row.googleReviewsUrl,
      enabled: Boolean(row.googleRating != null && row.googleReviewCount != null),
    },
    vagaro: {
      rating: row.vagaroRating,
      count: row.vagaroReviewCount,
      url: row.vagaroReviewsUrl,
      enabled: Boolean(row.vagaroRating != null && row.vagaroReviewCount != null),
    },
  };
}

export type ServiceDetailModel = ServicePage & {
  id?: string;
  cardImagePath?: string | null;
  published?: boolean;
  sortOrder?: number;
};

export function mapServiceDoc(id: string, service: ServiceDoc): ServiceDetailModel {
  return {
    id,
    slug: service.slug,
    title: service.title,
    navLabel: service.navLabel,
    group: service.group,
    shortDescription: service.shortDescription,
    intro: service.intro,
    cardImagePath: service.cardImagePath,
    published: service.published,
    sortOrder: service.sortOrder,
    sections: (service.sections || []).map((sec) => ({
      heading: sec.heading || undefined,
      items: (sec.items || []).map((item) => ({
        name: item.name,
        price: item.price,
        note: item.note || undefined,
      })),
    })),
    faqs: (service.faqs || []).map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
    careTips: [...(service.careTips || [])],
  };
}

export function staticServiceModels(): ServiceDetailModel[] {
  return staticServices.map((s) => ({ ...s }));
}

export function reviewsToFeed(
  rows: ReviewRow[] | null | undefined,
  siteModel: SiteModel,
): ReviewsFeed {
  if (!rows?.length) {
    return {
      ...staticReviews,
      sources: {
        google: {
          rating: siteModel.google.rating,
          count: siteModel.google.count,
          url: siteModel.google.url,
          enabled: siteModel.google.enabled,
        },
        vagaro: {
          rating: siteModel.vagaro.rating,
          count: siteModel.vagaro.count,
          url: siteModel.vagaro.url,
          enabled: siteModel.vagaro.enabled,
        },
      },
    };
  }

  const reviews: SiteReview[] = rows.map((r) => ({
    id: r.id,
    source: r.source,
    author: r.author,
    rating: Number(r.rating) || 5,
    text: r.body,
    date: r.reviewDate,
    url: r.url,
    authorUrl: r.authorUrl,
  }));

  return {
    updatedAt: new Date().toISOString(),
    sources: {
      google: {
        rating: siteModel.google.rating,
        count: siteModel.google.count,
        url: siteModel.google.url,
        enabled: siteModel.google.enabled,
      },
      vagaro: {
        rating: siteModel.vagaro.rating,
        count: siteModel.vagaro.count,
        url: siteModel.vagaro.url,
        enabled: siteModel.vagaro.enabled,
      },
    },
    reviews,
  };
}
