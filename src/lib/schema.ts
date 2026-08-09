import type { ServicePage } from "@/data/site";
import { site as staticSite } from "@/data/site";
import {
  getCombinedSummary,
  reviewsFeed as staticReviewsFeed,
  type ReviewsFeed,
  type SiteReview,
} from "@/data/reviews";
import type { SiteModel } from "@/lib/cms";
import { settingsToSite } from "@/lib/cms";

export const SITE_URL = "https://saltlashcity.com";
export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const DEFAULT_DESCRIPTION =
  "Salt Lash City — Master Esthetician Blake in Sandy, UT. Eyelash extensions, lifts, tinting, waxing, and facials.";

type JsonLd = Record<string, unknown>;

export type SchemaContext = {
  site?: SiteModel;
  reviewsFeed?: ReviewsFeed;
  includeReviews?: boolean;
};

function resolveSite(ctx?: SchemaContext): SiteModel {
  return ctx?.site ?? settingsToSite(null);
}

function resolveFeed(ctx?: SchemaContext): ReviewsFeed {
  return ctx?.reviewsFeed ?? staticReviewsFeed;
}

function dayNameToSchema(day: string): string {
  return day;
}

function parseHoursRange(time: string): { opens: string; closes: string } | null {
  if (/closed/i.test(time)) return null;
  const parts = time.split(/\s*[–—-]\s*/);
  if (parts.length !== 2) return null;
  const to24 = (raw: string) => {
    const m = raw.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = Number(m[1]);
    const min = m[2];
    const ap = m[3].toUpperCase();
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  };
  const opens = to24(parts[0]);
  const closes = to24(parts[1]);
  if (!opens || !closes) return null;
  return { opens, closes };
}

export function buildOpeningHours(ctx?: SchemaContext): JsonLd[] {
  const site = resolveSite(ctx);
  return site.hours
    .map((row) => {
      const range = parseHoursRange(row.time);
      if (!range) return null;
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayNameToSchema(row.day),
        opens: range.opens,
        closes: range.closes,
      };
    })
    .filter(Boolean) as JsonLd[];
}

export function buildReviewNodes(
  reviews?: SiteReview[],
  ctx?: SchemaContext,
): JsonLd[] {
  const list = reviews ?? resolveFeed(ctx).reviews;
  return list.map((r) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: r.author,
      ...(r.authorUrl ? { url: r.authorUrl } : {}),
    },
    reviewBody: r.text,
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    ...(r.date ? { datePublished: r.date } : {}),
    ...(r.url ? { url: r.url } : {}),
    itemReviewed: { "@id": BUSINESS_ID },
  }));
}

export function buildAggregateRating(ctx?: SchemaContext): JsonLd | null {
  const summary = getCombinedSummary(resolveFeed(ctx));
  if (summary.rating == null || summary.count <= 0) return null;
  return {
    "@type": "AggregateRating",
    ratingValue: summary.rating,
    reviewCount: summary.count,
    bestRating: 5,
    worstRating: 1,
  };
}

/** Core BeautySalon / LocalBusiness entity (referenced by @id across the site). */
export function buildBusinessNode(options?: SchemaContext): JsonLd {
  const site = resolveSite(options);
  const feed = resolveFeed(options);
  const includeReviews = options?.includeReviews !== false;
  const aggregateRating = buildAggregateRating(options);
  const reviews = includeReviews ? buildReviewNodes(undefined, options) : [];
  const description = site.seoDescription || DEFAULT_DESCRIPTION;

  return {
    "@type": ["BeautySalon", "LocalBusiness"],
    "@id": BUSINESS_ID,
    name: site.name,
    alternateName: "Salt Lash City Sandy",
    description,
    url: SITE_URL,
    image: `${SITE_URL}/images/logo.png`,
    logo: `${SITE_URL}/images/logo.png`,
    telephone: site.phoneHref?.replace("tel:", "") || staticSite.phoneHref.replace("tel:", ""),
    email: site.email,
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Credit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: "Sandy",
      addressRegion: "UT",
      postalCode: "84094",
      addressCountry: "US",
    },
    hasMap: feed.sources.google.url || undefined,
    areaServed: [
      { "@type": "City", name: "Sandy", containedInPlace: { "@type": "State", name: "Utah" } },
      { "@type": "City", name: "Draper" },
      { "@type": "City", name: "Midvale" },
      { "@type": "AdministrativeArea", name: "Salt Lake County" },
    ],
    openingHoursSpecification: buildOpeningHours(options),
    sameAs: [site.social.instagram, site.social.facebook, site.bookingUrl].filter(Boolean),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(reviews.length ? { review: reviews } : {}),
  };
}

export function buildWebsiteNode(ctx?: SchemaContext): JsonLd {
  const site = resolveSite(ctx);
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: site.name,
    description: site.seoDescription || DEFAULT_DESCRIPTION,
    publisher: { "@id": BUSINESS_ID },
    inLanguage: "en-US",
  };
}

export function buildSiteGraph(options?: SchemaContext): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [buildBusinessNode(options), buildWebsiteNode(options)],
  };
}

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildBreadcrumbList(
  items: { name: string; path: string }[],
): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function parsePrice(price: string): number | null {
  const m = price.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

export function buildServiceGraph(service: ServicePage): JsonLd {
  const pagePath = `/${service.slug}`;
  const offers = service.sections.flatMap((section) =>
    section.items.map((item) => {
      const amount = parsePrice(item.price);
      return {
        "@type": "Offer",
        name: item.name,
        description: item.note || service.shortDescription,
        priceCurrency: "USD",
        ...(amount != null ? { price: amount } : {}),
        url: absoluteUrl(pagePath),
        availability: "https://schema.org/InStock",
      };
    }),
  );

  const nodes: JsonLd[] = [
    buildBreadcrumbList([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: service.title, path: pagePath },
    ]),
    {
      "@type": "Service",
      "@id": absoluteUrl(`${pagePath}#service`),
      name: service.title,
      description: service.intro || service.shortDescription,
      url: absoluteUrl(pagePath),
      provider: { "@id": BUSINESS_ID },
      areaServed: { "@type": "City", name: "Sandy" },
      serviceType: service.title,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `${service.title} menu`,
        itemListElement: offers,
      },
    },
  ];

  if (service.faqs?.length) {
    nodes.push({
      "@type": "FAQPage",
      "@id": absoluteUrl(`${pagePath}#faq`),
      mainEntity: service.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function buildWebPageGraph(options: {
  name: string;
  description: string;
  path: string;
  crumbs?: { name: string; path: string }[];
}): JsonLd {
  const nodes: JsonLd[] = [
    {
      "@type": "WebPage",
      "@id": absoluteUrl(`${options.path === "/" ? "" : options.path}#webpage`),
      url: absoluteUrl(options.path),
      name: options.name,
      description: options.description,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": BUSINESS_ID },
      inLanguage: "en-US",
    },
  ];
  if (options.crumbs?.length) {
    nodes.unshift(buildBreadcrumbList(options.crumbs));
  }
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function getDefaultMeta(site?: SiteModel) {
  const s = site ?? settingsToSite(null);
  return {
    title: `${s.name} | ${s.tagline}`,
    description: s.seoDescription || DEFAULT_DESCRIPTION,
  };
}

/** @deprecated Prefer getDefaultMeta(site) with live CMS data */
export const defaultMeta = getDefaultMeta();
