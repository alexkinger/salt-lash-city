/**
 * Sync Google + Vagaro reviews into public/data/reviews.json
 *
 * Usage:
 *   npm run sync:reviews
 *
 * Env (optional Google):
 *   GOOGLE_PLACES_API_KEY
 *   GOOGLE_PLACE_ID
 *
 * Env (optional Vagaro headless refresh):
 *   VAGARO_SYNC=1   (requires: npm i -D playwright && npx playwright install chromium)
 *
 * VAGARO_BUSINESS_URL defaults to https://www.vagaro.com/saltlashcity
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outPath = resolve(root, "public/data/reviews.json");

const VAGARO_URL = process.env.VAGARO_BUSINESS_URL || "https://www.vagaro.com/saltlashcity";
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || "";

function loadExisting() {
  if (!existsSync(outPath)) {
    return {
      updatedAt: new Date().toISOString(),
      sources: {
        google: { rating: null, count: null, url: null, enabled: false },
        vagaro: { rating: 5, count: 42, url: VAGARO_URL, enabled: true },
      },
      reviews: [],
    };
  }
  return JSON.parse(readFileSync(outPath, "utf8"));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function parseLooseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

async function fetchGoogleReviews() {
  if (!GOOGLE_KEY || !GOOGLE_PLACE_ID) {
    console.log("Google: skipped (set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID)");
    return null;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", GOOGLE_PLACE_ID);
  url.searchParams.set("fields", "name,rating,user_ratings_total,reviews,url");
  url.searchParams.set("reviews_sort", "newest");
  url.searchParams.set("key", GOOGLE_KEY);

  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK") {
    throw new Error(`Google Places error: ${data.status} ${data.error_message || ""}`.trim());
  }

  const result = data.result || {};
  const reviews = (result.reviews || []).map((r, index) => ({
    id: `google-${slugify(r.author_name || "guest")}-${r.time || index}`,
    source: "google",
    author: r.author_name || "Google user",
    rating: Number(r.rating) || 5,
    text: (r.text || "").trim(),
    date: r.time ? new Date(r.time * 1000).toISOString().slice(0, 10) : null,
    authorUrl: r.author_url || null,
    url: result.url || `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`,
  })).filter((r) => r.text.length > 0);

  return {
    sourceMeta: {
      rating: result.rating ?? null,
      count: result.user_ratings_total ?? reviews.length,
      url: result.url || `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`,
      enabled: true,
    },
    reviews,
  };
}

async function fetchVagaroWithPlaywright() {
  if (process.env.VAGARO_SYNC !== "1") {
    console.log("Vagaro: keeping existing reviews (set VAGARO_SYNC=1 to refresh via Playwright)");
    return null;
  }

  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    console.warn("Vagaro: playwright not installed. Run: npm i -D playwright && npx playwright install chromium");
    return null;
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(`${VAGARO_URL.replace(/\/$/, "")}/reviews`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(2500);

    // Expand if possible
    for (let i = 0; i < 5; i++) {
      const clicked = await page.evaluate(() => {
        const btn = [...document.querySelectorAll("a,button")].find((el) =>
          /Show More Reviews/i.test(el.textContent || ""),
        );
        if (!btn) return false;
        btn.click();
        return true;
      });
      if (!clicked) break;
      await page.waitForTimeout(1200);
    }

    const payload = await page.evaluate(() => {
      const body = document.body.innerText || "";
      const summaryMatch =
        body.match(/([0-9.]+)\s*\(\s*(\d+)\s*Reviews\s*\)/i) ||
        body.match(/([0-9.]+)\s*stars?\s*and\s*(\d+)\s*Reviews/i);

      const month =
        "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)";
      const dateRe = new RegExp(`${month}\\s+\\d{1,2},\\s+\\d{4}`, "g");

      const blocks = [...document.querySelectorAll("div")].filter((el) => {
        const t = (el.innerText || "").trim();
        if (t.length < 40 || t.length > 900) return false;
        if (!/Verified/i.test(t)) return false;
        const dates = t.match(dateRe) || [];
        return dates.length === 1;
      });

      const seen = new Set();
      const reviews = [];
      for (const el of blocks) {
        const t = el.innerText.trim();
        const key = t.slice(0, 140);
        if (seen.has(key)) continue;
        seen.add(key);

        const lines = t
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        const date = (t.match(dateRe) || [])[0];
        if (!date) continue;

        // Prefer a human name line (not initials, not the date)
        let author = "Guest";
        for (const line of lines) {
          if (line === date) continue;
          if (/^Verified$/i.test(line)) continue;
          if (/^Venue$/i.test(line)) continue;
          if (/^Blake Longhurst$/i.test(line)) continue;
          if (/^[A-Z]{1,3}$/.test(line)) continue; // initials avatar
          if (line.length >= 3 && line.length <= 48 && /[A-Za-z]/.test(line)) {
            author = line;
            break;
          }
        }

        const verifiedIdx = lines.findIndex((l) => /Verified/i.test(l));
        const bodyLines = lines
          .slice(verifiedIdx >= 0 ? verifiedIdx + 1 : 0)
          .filter(
            (l) =>
              l !== date &&
              !/^Verified$/i.test(l) &&
              !/^Venue$/i.test(l) &&
              !/^Blake Longhurst$/i.test(l) &&
              !/^[A-Z]{1,3}$/.test(l) &&
              l !== author,
          );
        const text = bodyLines.join(" ").replace(/\s+/g, " ").trim();
        if (text.length < 12) continue;

        reviews.push({
          author,
          date,
          rating: 5,
          text,
        });
      }

      return {
        summary: summaryMatch
          ? { rating: Number(summaryMatch[1]), count: Number(summaryMatch[2]) }
          : { rating: 5, count: reviews.length },
        reviews,
      };
    });

    const reviews = payload.reviews.map((r, index) => ({
      id: `vagaro-${slugify(r.author)}-${parseLooseDate(r.date) || index}`,
      source: "vagaro",
      author: r.author,
      rating: Number(r.rating) || 5,
      text: r.text,
      date: parseLooseDate(r.date),
      url: `${VAGARO_URL.replace(/\/$/, "")}/reviews`,
    }));

    return {
      sourceMeta: {
        rating: payload.summary?.rating ?? 5,
        count: payload.summary?.count ?? reviews.length,
        url: VAGARO_URL,
        enabled: true,
      },
      reviews,
    };
  } finally {
    await browser.close();
  }
}

function mergeReviews(existing, googleBundle, vagaroBundle) {
  const byId = new Map();

  const prefer = (review) => {
    if (!review?.id || !review?.text) return;
    const prev = byId.get(review.id);
    if (!prev || (review.text?.length || 0) >= (prev.text?.length || 0)) {
      byId.set(review.id, review);
    }
  };

  // Keep existing per source unless that source was refreshed
  for (const review of existing.reviews || []) {
    if (googleBundle && review.source === "google") continue;
    if (vagaroBundle && review.source === "vagaro") continue;
    prefer(review);
  }

  for (const review of googleBundle?.reviews || []) prefer(review);
  for (const review of vagaroBundle?.reviews || []) prefer(review);

  return [...byId.values()].sort((a, b) => {
    const da = a.date || "";
    const db = b.date || "";
    return db.localeCompare(da);
  });
}

async function main() {
  const existing = loadExisting();
  const googleBundle = await fetchGoogleReviews();
  const vagaroBundle = await fetchVagaroWithPlaywright();

  const next = {
    updatedAt: new Date().toISOString(),
    sources: {
      google: googleBundle?.sourceMeta || existing.sources.google,
      vagaro: vagaroBundle?.sourceMeta || existing.sources.vagaro,
    },
    reviews: mergeReviews(existing, googleBundle, vagaroBundle),
  };

  writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${outPath} (${next.reviews.length} reviews; google=${next.reviews.filter((r) => r.source === "google").length}, vagaro=${next.reviews.filter((r) => r.source === "vagaro").length})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
