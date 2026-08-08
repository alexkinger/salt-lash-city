import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

function reviewsSeoPlugin(): Plugin {
  return {
    name: 'reviews-seo',
    transformIndexHtml(html) {
      try {
        const feed = JSON.parse(
          readFileSync(new URL('./public/data/reviews.json', import.meta.url), 'utf8'),
        ) as {
          sources: {
            google: { rating: number | null; count: number | null; enabled: boolean }
            vagaro: { rating: number | null; count: number | null; enabled: boolean }
          }
          reviews: Array<{
            author: string
            rating: number
            text: string
            date: string | null
          }>
        }

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

        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Salt Lash City',
          url: 'https://saltlashcity.com',
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
          review: feed.reviews.slice(0, 12).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author },
            reviewBody: r.text,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            ...(r.date ? { datePublished: r.date } : {}),
          })),
        }

        const noscript = feed.reviews
          .slice(0, 8)
          .map(
            (r) =>
              `<p><strong>${r.author}</strong>${r.date ? ` (${r.date})` : ''}: ${r.text}</p>`,
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
      } catch {
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
