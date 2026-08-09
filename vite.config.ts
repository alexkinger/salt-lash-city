import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const SITE_URL = 'https://saltlashcity.com'

type ReviewsFeed = {
  sources: {
    google: { rating: number | null; count: number | null; enabled: boolean; url: string | null }
    vagaro: { rating: number | null; count: number | null; enabled: boolean; url: string | null }
  }
  reviews: Array<{
    author: string
    rating: number
    text: string
    date: string | null
    url?: string | null
    authorUrl?: string | null
  }>
}

function buildStaticSiteJsonLd(feed: ReviewsFeed) {
  const parts: Array<{ rating: number; count: number }> = []
  if (feed.sources.google.enabled && feed.sources.google.rating != null && feed.sources.google.count != null) {
    parts.push({ rating: feed.sources.google.rating, count: feed.sources.google.count })
  }
  if (feed.sources.vagaro.enabled && feed.sources.vagaro.rating != null && feed.sources.vagaro.count != null) {
    parts.push({ rating: feed.sources.vagaro.rating, count: feed.sources.vagaro.count })
  }

  const rating = parts.length
    ? Number(
        (
          parts.reduce((s, p) => s + p.rating * p.count, 0) /
          parts.reduce((s, p) => s + p.count, 0)
        ).toFixed(1),
      )
    : null
  const count = parts.length ? parts.reduce((s, p) => s + p.count, 0) : feed.reviews.length

  const businessId = `${SITE_URL}/#business`
  const websiteId = `${SITE_URL}/#website`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['BeautySalon', 'LocalBusiness'],
        '@id': businessId,
        name: 'Salt Lash City',
        alternateName: 'Salt Lash City Sandy',
        description:
          'Salt Lash City — Master Esthetician Blake in Sandy, UT. Eyelash extensions, lifts, tinting, waxing, and facials.',
        url: SITE_URL,
        image: `${SITE_URL}/images/logo.png`,
        logo: `${SITE_URL}/images/logo.png`,
        telephone: '+1-801-946-4595',
        email: 'Blake@SaltLashCity.com',
        priceRange: '$$',
        currenciesAccepted: 'USD',
        paymentAccepted: 'Cash, Credit Card',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '9295 S 1300 E',
          addressLocality: 'Sandy',
          addressRegion: 'UT',
          postalCode: '84094',
          addressCountry: 'US',
        },
        hasMap: feed.sources.google.url || undefined,
        areaServed: [
          { '@type': 'City', name: 'Sandy' },
          { '@type': 'City', name: 'Draper' },
          { '@type': 'City', name: 'Midvale' },
          { '@type': 'AdministrativeArea', name: 'Salt Lake County' },
        ],
        openingHoursSpecification: [
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '10:00', closes: '19:00' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: '10:00', closes: '19:00' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '10:00', closes: '19:00' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: '10:00', closes: '19:00' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '10:00', closes: '19:00' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '15:00' },
        ],
        sameAs: [
          'https://www.instagram.com/saltlashcity/',
          'https://www.facebook.com/Salt-lash-city-903840756420638/',
          'https://www.vagaro.com/saltlashcity',
        ],
        ...(rating != null
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: rating,
                reviewCount: count,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
        review: feed.reviews.map((r) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: r.author,
            ...(r.authorUrl ? { url: r.authorUrl } : {}),
          },
          reviewBody: r.text,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
          ...(r.date ? { datePublished: r.date } : {}),
          ...(r.url ? { url: r.url } : {}),
          itemReviewed: { '@id': businessId },
        })),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: SITE_URL,
        name: 'Salt Lash City',
        publisher: { '@id': businessId },
        inLanguage: 'en-US',
      },
    ],
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Inject crawlable business + review schema into index.html at build time. */
function reviewsSeoPlugin(): Plugin {
  return {
    name: 'reviews-seo',
    transformIndexHtml(html) {
      try {
        const feed = JSON.parse(
          readFileSync(new URL('./public/data/reviews.json', import.meta.url), 'utf8'),
        ) as ReviewsFeed

        const jsonLd = buildStaticSiteJsonLd(feed)
        const noscript = feed.reviews
          .map(
            (r) =>
              `<p><strong>${escapeHtml(r.author)}</strong>${r.date ? ` (${r.date})` : ''}: ${escapeHtml(r.text)}</p>`,
          )
          .join('')

        return html
          .replace(
            '</head>',
            `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`,
          )
          .replace(
            '<div id="root"></div>',
            `<div id="root"></div>\n    <noscript><section aria-label="Customer reviews">${noscript}</section></noscript>`,
          )
      } catch (err) {
        console.warn('[reviews-seo] skipped:', err)
        return html
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), reviewsSeoPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
})
