/**
 * Sync Google + Vagaro reviews into public/data/reviews.json
 *
 * Usage:
 *   npm run sync:reviews
 *
 * Google — preferred (ALL reviews):
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 *   GOOGLE_GBP_REFRESH_TOKEN
 *   GOOGLE_GBP_ACCOUNT_ID
 *   GOOGLE_GBP_LOCATION_ID
 *   (one-time: npm run gbp:auth)
 *
 * Google — fallback (max 5 reviews):
 *   GOOGLE_PLACES_API_KEY / GOOGLE_PLACES_LEGACY_API_KEY
 *   GOOGLE_PLACE_ID
 *
 * Vagaro (scrape public reviews page):
 *   VAGARO_BUSINESS_URL
 *   VAGARO_SYNC=1   (requires playwright)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outPath = resolve(root, "public/data/reviews.json");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(root, ".env.local"));
loadEnvFile(resolve(root, ".env"));

const VAGARO_URL = process.env.VAGARO_BUSINESS_URL || "https://www.vagaro.com/saltlashcity";
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
const GOOGLE_LEGACY_KEY =
  process.env.GOOGLE_PLACES_LEGACY_API_KEY || GOOGLE_KEY || "";
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || "";
const GBP_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const GBP_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const GBP_REFRESH_TOKEN = process.env.GOOGLE_GBP_REFRESH_TOKEN || "";
const GBP_ACCOUNT_ID = process.env.GOOGLE_GBP_ACCOUNT_ID || "";
const GBP_LOCATION_ID = process.env.GOOGLE_GBP_LOCATION_ID || "";

const STAR_MAP = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

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

async function refreshGbpAccessToken() {
  const body = new URLSearchParams({
    client_id: GBP_CLIENT_ID,
    client_secret: GBP_CLIENT_SECRET,
    refresh_token: GBP_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error_description || data.error || `token refresh failed (${res.status})`,
    );
  }
  return data.access_token;
}

async function fetchGoogleReviewsGbp() {
  if (
    !GBP_CLIENT_ID ||
    !GBP_CLIENT_SECRET ||
    !GBP_REFRESH_TOKEN ||
    !GBP_ACCOUNT_ID ||
    !GBP_LOCATION_ID
  ) {
    return null;
  }

  console.log("Google Business Profile: fetching all reviews…");
  const accessToken = await refreshGbpAccessToken();
  const parent = `accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}`;
  const placeId = GOOGLE_PLACE_ID.replace(/^places\//, "");
  const mapsUrl = placeId
    ? `https://search.google.com/local/reviews?placeid=${placeId}`
    : "https://www.google.com/maps";

  const all = [];
  let pageToken = "";
  let averageRating = null;
  let totalReviewCount = null;

  do {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${parent}/reviews`);
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data?.error?.message ||
          `GBP reviews.list failed (${res.status}). Is Google My Business API enabled / access approved?`,
      );
    }

    if (data.averageRating != null) averageRating = data.averageRating;
    if (data.totalReviewCount != null) totalReviewCount = data.totalReviewCount;

    for (const r of data.reviews || []) {
      const author = r.reviewer?.displayName || "Google user";
      const text = (r.comment || "").trim();
      if (!text) continue;
      const rating = STAR_MAP[r.starRating] || Number(r.starRating) || 5;
      const createMs = r.createTime ? Date.parse(r.createTime) : NaN;
      const reviewId =
        r.reviewId || r.name || `${slugify(author)}-${createMs || all.length}`;
      all.push({
        id: `google-${slugify(String(reviewId)).slice(0, 48)}`,
        source: "google",
        author,
        rating,
        text,
        date: Number.isNaN(createMs)
          ? null
          : new Date(createMs).toISOString().slice(0, 10),
        authorUrl: null,
        url: mapsUrl,
      });
    }

    pageToken = data.nextPageToken || "";
  } while (pageToken);

  console.log(
    `Google GBP: ${all.length} review(s) with text (reported total=${totalReviewCount ?? "n/a"})`,
  );

  return {
    sourceMeta: {
      rating: averageRating ?? null,
      count: totalReviewCount ?? all.length,
      url: mapsUrl,
      enabled: true,
    },
    reviews: all,
  };
}

function mapNewApiReviews(reviews, mapsUrl) {
  return (reviews || [])
    .map((r, index) => {
      const author = r.authorAttribution?.displayName || "Google user";
      const text = (r.text?.text || r.originalText?.text || "").trim();
      const publishTime = r.publishTime ? Date.parse(r.publishTime) : NaN;
      return {
        id: `google-${slugify(author)}-${Number.isNaN(publishTime) ? index : publishTime}`,
        source: "google",
        author,
        rating: Number(r.rating) || 5,
        text,
        date: Number.isNaN(publishTime)
          ? null
          : new Date(publishTime).toISOString().slice(0, 10),
        authorUrl: r.authorAttribution?.uri || null,
        url: mapsUrl,
      };
    })
    .filter((r) => r.text.length > 0);
}

function mapLegacyApiReviews(reviews, mapsUrl) {
  return (reviews || [])
    .map((r, index) => {
      const author = r.author_name || "Google user";
      const text = (r.text || "").trim();
      const epoch = Number(r.time);
      return {
        id: `google-${slugify(author)}-${Number.isFinite(epoch) ? epoch : index}`,
        source: "google",
        author,
        rating: Number(r.rating) || 5,
        text,
        date: Number.isFinite(epoch)
          ? new Date(epoch * 1000).toISOString().slice(0, 10)
          : null,
        authorUrl: r.author_url || null,
        url: mapsUrl,
      };
    })
    .filter((r) => r.text.length > 0);
}

async function fetchGoogleReviewsLegacy(placeId) {
  if (!GOOGLE_LEGACY_KEY) {
    console.log(
      "Google Legacy: skipped (set GOOGLE_PLACES_LEGACY_API_KEY — or reuse GOOGLE_PLACES_API_KEY if Legacy is enabled on that key)",
    );
    return null;
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,rating,user_ratings_total,reviews,url",
    key: GOOGLE_LEGACY_KEY,
  });
  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    console.warn(
      `Google Legacy: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}`,
    );
    return null;
  }

  const mapsUrl =
    data.result?.url ||
    `https://search.google.com/local/reviews?placeid=${placeId}`;
  const reviews = mapLegacyApiReviews(data.result?.reviews, mapsUrl);
  console.log(`Google Legacy: ${reviews.length} review(s) with text`);

  return {
    sourceMeta: {
      rating: data.result?.rating ?? null,
      count: data.result?.user_ratings_total ?? reviews.length,
      url: mapsUrl,
      enabled: true,
    },
    reviews,
  };
}

async function fetchGoogleReviewsPlaces(placeId) {
  let bundle = null;

  if (GOOGLE_KEY) {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": GOOGLE_KEY,
        "X-Goog-FieldMask":
          "id,displayName,rating,userRatingCount,googleMapsUri,reviews",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      const msg =
        data?.error?.message ||
        data?.message ||
        JSON.stringify(data?.error || data).slice(0, 300);
      console.warn(`Google Places (New) error: ${res.status} ${msg}`);
    } else {
      const mapsUrl =
        data.googleMapsUri ||
        `https://search.google.com/local/reviews?placeid=${placeId}`;
      const reviews = mapNewApiReviews(data.reviews, mapsUrl);
      console.log(
        `Google New: rating=${data.rating ?? "n/a"} count=${data.userRatingCount ?? "n/a"} reviews=${reviews.length}`,
      );
      bundle = {
        sourceMeta: {
          rating: data.rating ?? null,
          count: data.userRatingCount ?? reviews.length,
          url: mapsUrl,
          enabled: true,
        },
        reviews,
      };
    }
  } else {
    console.log("Google New: skipped (set GOOGLE_PLACES_API_KEY)");
  }

  if (bundle?.reviews?.length) return bundle;

  console.log("Google New returned no review text; trying Places API (Legacy)…");
  const legacy = await fetchGoogleReviewsLegacy(placeId);
  if (!legacy) return bundle;

  if (bundle?.sourceMeta) {
    return {
      sourceMeta: {
        ...legacy.sourceMeta,
        rating: bundle.sourceMeta.rating ?? legacy.sourceMeta.rating,
        count: bundle.sourceMeta.count ?? legacy.sourceMeta.count,
        url: bundle.sourceMeta.url || legacy.sourceMeta.url,
        enabled: true,
      },
      reviews: legacy.reviews,
    };
  }

  return legacy;
}

async function fetchGoogleReviews() {
  try {
    const gbp = await fetchGoogleReviewsGbp();
    if (gbp) return gbp;
  } catch (err) {
    console.warn(`Google GBP failed: ${err.message}`);
  }

  if (!GOOGLE_PLACE_ID) {
    console.log(
      "Google: skipped (configure GBP via npm run gbp:auth, or set GOOGLE_PLACE_ID)",
    );
    return null;
  }

  console.log(
    "Google: Places fallback (max 5 review texts). Use GBP OAuth for ALL reviews.",
  );
  return fetchGoogleReviewsPlaces(GOOGLE_PLACE_ID.replace(/^places\//, ""));
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
    await page.waitForTimeout(3000);

    // Keep expanding / scrolling until Vagaro stops offering more
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 2400);
      const clicked = await page.evaluate(() => {
        const btn = [...document.querySelectorAll("a,button,span,div")].find(
          (el) => /show more reviews|load more|see more/i.test(el.textContent || ""),
        );
        if (!btn) return false;
        btn.click();
        return true;
      });
      if (!clicked && i > 3) break;
      await page.waitForTimeout(900);
    }

    const payload = await page.evaluate(() => {
      const body = document.body.innerText || "";
      const summaryMatch =
        body.match(/([0-9.]+)\s*\(\s*(\d+)\s*Reviews\s*\)/i) ||
        body.match(/([0-9.]+)\s*stars?\s*and\s*(\d+)\s*Reviews/i) ||
        body.match(/(\d+)\s*Reviews/i);

      const month =
        "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)";
      const dateRe = new RegExp(`${month}\\s+\\d{1,2},\\s+\\d{4}`, "g");
      const singleDateRe = new RegExp(`${month}\\s+\\d{1,2},\\s+\\d{4}`);

      // Parse linear page text: Author / Date / optional Venue blurb / Blake / review text
      const lines = body
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const reviews = [];
      const seen = new Set();
      for (let i = 0; i < lines.length - 2; i++) {
        const author = lines[i];
        const dateLine = lines[i + 1];
        if (!singleDateRe.test(dateLine)) continue;
        if (author.length < 2 || author.length > 48) continue;
        if (/^venue$/i.test(author)) continue;
        if (/^blake longhurst$/i.test(author)) continue;
        if (/^verified$/i.test(author)) continue;
        if (/reviews?$/i.test(author)) continue;
        if (!/[A-Za-z]/.test(author)) continue;

        const chunks = [];
        for (let j = i + 2; j < Math.min(i + 12, lines.length); j++) {
          const line = lines[j];
          if (singleDateRe.test(line)) break;
          // Next reviewer pattern: Name then Date
          if (
            j + 1 < lines.length &&
            singleDateRe.test(lines[j + 1]) &&
            line.length <= 48 &&
            /[A-Za-z]/.test(line) &&
            !/^venue$/i.test(line) &&
            !/^blake longhurst$/i.test(line)
          ) {
            break;
          }
          if (/^venue$/i.test(line)) continue;
          if (/^blake longhurst$/i.test(line)) continue;
          if (/^verified$/i.test(line)) continue;
          if (/^[A-Z]{1,3}$/.test(line)) continue;
          chunks.push(line);
        }

        const text = chunks
          .join(" ")
          .replace(/^.*?Verified\s+/i, "")
          .replace(/\s*For businesses[\s\S]*$/i, "")
          .replace(/\s+/g, " ")
          .trim();
        if (text.length < 12) continue;
        const key = `${author}|${dateLine}|${text.slice(0, 80)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        reviews.push({ author, date: dateLine, rating: 5, text });
      }

      let rating = 5;
      let count = reviews.length;
      if (summaryMatch) {
        if (summaryMatch[2]) {
          rating = Number(summaryMatch[1]) || 5;
          count = Number(summaryMatch[2]) || reviews.length;
        } else if (/reviews/i.test(summaryMatch[0]) && !summaryMatch[2]) {
          count = Number(summaryMatch[1]) || reviews.length;
        }
      }

      return { summary: { rating, count }, reviews };
    });

    const reviews = payload.reviews
      .map((r, index) => ({
        id: `vagaro-${slugify(r.author)}-${parseLooseDate(r.date) || index}`,
        source: "vagaro",
        author: r.author,
        rating: Number(r.rating) || 5,
        text: r.text,
        date: parseLooseDate(r.date),
        url: `${VAGARO_URL.replace(/\/$/, "")}/reviews`,
      }))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 5);

    console.log(`Vagaro: kept ${reviews.length} most recent review(s)`);

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

function takeLatestPerSource(reviews, limit = 5) {
  const buckets = { google: [], vagaro: [] };
  for (const review of reviews || []) {
    if (review.source === "google" || review.source === "vagaro") {
      buckets[review.source].push(review);
    }
  }
  const byDateDesc = (a, b) => (b.date || "").localeCompare(a.date || "");
  return [...buckets.google.sort(byDateDesc).slice(0, limit), ...buckets.vagaro.sort(byDateDesc).slice(0, limit)].sort(
    byDateDesc,
  );
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

  return takeLatestPerSource([...byId.values()], 5);
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
