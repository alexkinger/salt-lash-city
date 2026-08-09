/**
 * Seed Firestore from scripts/cms-seed-data.mjs + public/data/reviews.json
 *
 * Requires a Firebase service account:
 *   set GOOGLE_APPLICATION_CREDENTIALS=path\to\serviceAccount.json
 *   OR place serviceAccountKey.json in repo root (gitignored)
 *
 * Usage: node scripts/firebase-seed.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function initAdmin() {
  const localKey = resolve(root, "serviceAccountKey.json");
  const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "salt-lash-city-e8655";
  if (existsSync(localKey)) {
    const sa = JSON.parse(readFileSync(localKey, "utf8"));
    initializeApp({ credential: cert(sa), projectId: sa.project_id || projectId });
    return;
  }
  initializeApp({ credential: applicationDefault(), projectId });
}

initAdmin();
const db = getFirestore();

const { site, servicePages } = await import(
  pathToFileURL(resolve(root, "scripts/cms-seed-data.mjs")).href
);
const reviewsFeed = JSON.parse(
  readFileSync(resolve(root, "public/data/reviews.json"), "utf8"),
);

await db.doc("settings/site").set(
  {
    name: site.name,
    tagline: site.tagline,
    ownerName: site.owner,
    email: site.email,
    phone: site.phone,
    addressLine1: site.address.line1,
    addressLine2: site.address.line2,
    bookingUrl: site.bookingUrl,
    facebookUrl: site.social.facebook,
    instagramUrl: site.social.instagram,
    hours: site.hours,
    seoDescription:
      "Salt Lash City — Master Esthetician Blake in Sandy, UT. Eyelash extensions, lifts, tinting, waxing, and facials.",
    googleRating: reviewsFeed.sources?.google?.rating ?? null,
    googleReviewCount: reviewsFeed.sources?.google?.count ?? null,
    googleReviewsUrl: reviewsFeed.sources?.google?.url ?? null,
    vagaroRating: reviewsFeed.sources?.vagaro?.rating ?? null,
    vagaroReviewCount: reviewsFeed.sources?.vagaro?.count ?? null,
    vagaroReviewsUrl: reviewsFeed.sources?.vagaro?.url ?? null,
    heroImagePath: "/images/brand/lash-extensions-home.png",
    updatedAt: new Date().toISOString(),
  },
  { merge: true },
);
console.log("Seeded settings/site");

let order = 0;
for (const page of servicePages) {
  const id = page.slug;
  await db.doc(`services/${id}`).set(
    {
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel,
      group: page.group,
      shortDescription: page.shortDescription,
      intro: page.intro,
      cardImagePath: null,
      sortOrder: order++,
      published: true,
      sections: (page.sections || []).map((sec) => ({
        heading: sec.heading || null,
        items: (sec.items || []).map((item) => ({
          name: item.name,
          price: item.price,
          note: item.note || null,
        })),
      })),
      faqs: (page.faqs || []).map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
      careTips: [...(page.careTips || [])],
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  console.log(`Seeded services/${id}`);
}

let sortOrder = 0;
for (const review of reviewsFeed.reviews || []) {
  await db.doc(`reviews/${review.id}`).set(
    {
      source: review.source,
      author: review.author,
      rating: review.rating ?? 5,
      body: review.text,
      reviewDate: review.date || null,
      url: review.url || null,
      authorUrl: review.authorUrl || null,
      visible: true,
      featured: false,
      sortOrder: sortOrder++,
    },
    { merge: true },
  );
}
console.log(`Seeded ${(reviewsFeed.reviews || []).length} reviews`);
console.log("Done.");
process.exit(0);
