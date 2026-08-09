import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCombinedSummary,
  type ReviewSource,
  type SiteReview,
} from "@/data/reviews";
import { useCms } from "@/hooks/CmsProvider";

type Filter = "all" | ReviewSource;

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5 text-mustard"
      aria-label={`${rating} out of 5 stars`}
    >
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
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
        source === "google"
          ? "bg-sky-soft/50 text-ink"
          : "bg-sage-soft/60 text-leaf"
      }`}
    >
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

type ReviewsWidgetProps = {
  showHeader?: boolean;
  title?: string;
  compact?: boolean;
  /** Shorter scroll area (home). Full page uses taller panel. */
  scrollHeight?: "sm" | "lg";
  showTestimonialsLink?: boolean;
};

export function ReviewsWidget({
  showHeader = true,
  title = "Reviews",
  compact = false,
  scrollHeight = "lg",
  showTestimonialsLink = false,
}: ReviewsWidgetProps) {
  const { reviewsFeed: feed } = useCms();
  const summary = getCombinedSummary(feed);
  const [filter, setFilter] = useState<Filter>("all");
  const listId = useId();
  const tablistId = useId();

  const filtered = useMemo(() => {
    if (filter === "all") return feed.reviews;
    return feed.reviews.filter((r) => r.source === filter);
  }, [feed.reviews, filter]);

  const panelMax =
    scrollHeight === "sm" ? "max-h-[28rem]" : "max-h-[min(40rem,70vh)]";

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "google", label: "Google" },
    { id: "vagaro", label: "Vagaro" },
  ];

  return (
    <section
      className={compact ? "" : "relative overflow-hidden bg-cream py-16 md:py-20"}
      aria-labelledby="reviews-heading"
    >
      {!compact ? (
        <div
          className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-mustard/25 blur-2xl"
          aria-hidden="true"
        />
      ) : null}
      {!compact ? (
        <div
          className="pointer-events-none absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-pink-soft/40 blur-2xl"
          aria-hidden="true"
        />
      ) : null}

      <div className={compact ? "" : "relative mx-auto max-w-6xl px-5 md:px-8"}>
        {showHeader ? (
          <div className="text-center">
            <p className="font-script text-2xl text-leaf animate-reviews-rise">
              Loved by clients
            </p>
            <h2
              id="reviews-heading"
              className="mt-2 text-4xl font-bold text-ink animate-reviews-rise"
              style={{ animationDelay: "60ms" }}
            >
              {title}
            </h2>
          </div>
        ) : (
          <h2 id="reviews-heading" className="sr-only">
            {title}
          </h2>
        )}

        {summary.rating != null ? (
          <div
            className={`grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end ${showHeader ? "mt-10" : ""} animate-reviews-rise`}
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-end gap-3 border-b-4 border-mustard pb-3">
              <p className="font-display text-[4.5rem] leading-none font-bold tracking-tight text-ink md:text-[5.5rem]">
                {summary.count}
              </p>
              <div className="mb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  total reviews
                </p>
                <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-ink">
                  <Stars rating={summary.rating} />
                  <span>{summary.rating.toFixed(1)}</span>
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {feed.sources.google.enabled ? (
                <a
                  href={feed.sources.google.url || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between border border-line bg-paper/80 px-4 py-3 transition hover:border-sky-soft"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      Google
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {feed.sources.google.rating?.toFixed(1) ?? "—"} ·{" "}
                      {feed.sources.google.count ?? "—"} reviews
                    </p>
                  </div>
                  <span className="text-sm text-leaf opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </a>
              ) : null}
              {feed.sources.vagaro.enabled ? (
                <a
                  href={feed.sources.vagaro.url || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between border border-line bg-paper/80 px-4 py-3 transition hover:border-sage-soft"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      Vagaro
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {feed.sources.vagaro.rating?.toFixed(1) ?? "—"} ·{" "}
                      {feed.sources.vagaro.count ?? "—"} reviews
                    </p>
                  </div>
                  <span className="text-sm text-leaf opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-reviews-rise"
          style={{ animationDelay: "180ms" }}
        >
          <div
            id={tablistId}
            role="tablist"
            aria-label="Filter reviews by source"
            className="inline-flex flex-wrap gap-1 border border-line bg-paper p-1"
          >
            {filters.map((item) => {
              const selected = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={listId}
                  id={`${tablistId}-${item.id}`}
                  onClick={() => setFilter(item.id)}
                  className={`px-3.5 py-2 text-sm font-medium transition ${
                    selected
                      ? "bg-mustard text-ink"
                      : "text-ink-soft hover:bg-cream"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted">
            Latest reviews · scroll for more
          </p>
        </div>

        <div className="relative mt-5">
          <div
            key={filter}
            id={listId}
            role="tabpanel"
            aria-labelledby={`${tablistId}-${filter}`}
            className={`reviews-scroll space-y-0 overflow-y-auto border border-line bg-paper ${panelMax}`}
            tabIndex={0}
          >
            {filtered.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted">
                No reviews in this filter yet.
              </p>
            ) : (
              filtered.map((review, index) => (
                <article
                  key={review.id}
                  className="reviews-item border-b border-line px-5 py-6 last:border-b-0 md:px-7"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars rating={review.rating} />
                    <SourceBadge source={review.source} />
                  </div>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                    “{review.text}”
                  </p>
                  <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <cite className="not-italic font-semibold text-ink">
                      {review.authorUrl ? (
                        <a
                          href={review.authorUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {review.author}
                        </a>
                      ) : (
                        review.author
                      )}
                    </cite>
                    {review.date ? (
                      <time className="text-muted" dateTime={review.date}>
                        {formatDate(review.date)}
                      </time>
                    ) : null}
                    {review.url ? (
                      <a
                        href={review.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-leaf hover:underline"
                      >
                        View original
                      </a>
                    ) : null}
                  </footer>
                </article>
              ))
            )}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-paper to-transparent"
            aria-hidden="true"
          />
        </div>

        {showTestimonialsLink ? (
          <div className="mt-8 text-center">
            <Link to="/testimonials" className="btn-pink">
              Full reviews page
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
