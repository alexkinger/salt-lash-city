import { Link } from "react-router-dom";
import {
  getCombinedSummary,
  reviewsFeed,
  type SiteReview,
} from "@/data/reviews";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-mustard" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true">
          {i < full ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

function SourceBadge({ source }: { source: SiteReview["source"] }) {
  const label = source === "google" ? "Google" : "Vagaro";
  return (
    <span className="inline-flex items-center border border-line bg-cream px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
      {label}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildJsonLd(reviews: SiteReview[], rating: number | null, count: number) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Salt Lash City",
    url: "https://saltlashcity.com",
    ...(rating != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount: count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    review: reviews.slice(0, 12).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewBody: r.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      ...(r.date ? { datePublished: r.date } : {}),
    })),
  };
}

type ReviewsWidgetProps = {
  limit?: number;
  showHeader?: boolean;
  title?: string;
  compact?: boolean;
};

export function ReviewsWidget({
  limit = 6,
  showHeader = true,
  title = "Reviews",
  compact = false,
}: ReviewsWidgetProps) {
  const feed = reviewsFeed;
  const summary = getCombinedSummary(feed);
  const reviews = feed.reviews.slice(0, limit);
  const jsonLd = buildJsonLd(feed.reviews, summary.rating, summary.count);

  return (
    <section className={compact ? "" : "bg-cream py-16 md:py-20"} aria-labelledby="reviews-heading">
      <div className={compact ? "" : "mx-auto max-w-6xl px-5 md:px-8"}>
        {showHeader ? (
          <div className="text-center">
            <p className="font-script text-2xl text-leaf">Loved by clients</p>
            <h2 id="reviews-heading" className="mt-2 text-4xl font-bold text-ink">
              {title}
            </h2>
            {summary.rating != null ? (
              <p className="mt-3 text-sm text-ink-soft">
                <Stars rating={summary.rating} />{" "}
                <strong className="text-ink">{summary.rating.toFixed(1)}</strong> average from{" "}
                <strong className="text-ink">{summary.count}</strong> reviews
                {feed.sources.google.enabled || feed.sources.vagaro.enabled ? (
                  <>
                    {" "}
                    across{" "}
                    {[
                      feed.sources.google.enabled ? "Google" : null,
                      feed.sources.vagaro.enabled ? "Vagaro" : null,
                    ]
                      .filter(Boolean)
                      .join(" + ")}
                  </>
                ) : null}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
              {feed.sources.vagaro.url ? (
                <a
                  href={feed.sources.vagaro.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-lime-outline"
                >
                  Vagaro reviews
                </a>
              ) : null}
              {feed.sources.google.url ? (
                <a
                  href={feed.sources.google.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-lime-outline"
                >
                  Google reviews
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <h2 id="reviews-heading" className="sr-only">
            {title}
          </h2>
        )}

        <div className={`grid gap-5 md:grid-cols-2 ${showHeader ? "mt-10" : ""}`}>
          {reviews.map((review) => (
            <article
              key={review.id}
              className="border border-line bg-paper p-6"
              itemScope
              itemType="https://schema.org/Review"
            >
              <meta itemProp="itemReviewed" content="Salt Lash City" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars rating={review.rating} />
                <SourceBadge source={review.source} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft" itemProp="reviewBody">
                “{review.text}”
              </p>
              <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <cite className="not-italic font-semibold text-ink" itemProp="author">
                  {review.authorUrl ? (
                    <a href={review.authorUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      {review.author}
                    </a>
                  ) : (
                    review.author
                  )}
                </cite>
                {review.date ? (
                  <time className="text-muted" dateTime={review.date} itemProp="datePublished">
                    {formatDate(review.date)}
                  </time>
                ) : null}
              </footer>
            </article>
          ))}
        </div>

        {!compact ? (
          <div className="mt-8 text-center">
            <Link to="/testimonials" className="btn-pink">
              More reviews
            </Link>
          </div>
        ) : null}
      </div>

      <script
        type="application/ld+json"
        // Crawlable structured data for search engines that execute JS
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
