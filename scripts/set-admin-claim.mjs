/**
 * Set Firebase Auth custom claim admin: true for a user email.
 *
 * Requires service account (see firebase-seed.mjs).
 *
 * Usage: node scripts/set-admin-claim.mjs you@example.com
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/set-admin-claim.mjs email@example.com");
  process.exit(1);
}

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
const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { admin: true });
console.log(`Set admin: true for ${email} (${user.uid})`);
console.log("User must sign out and sign back in to refresh the ID token.");
process.exit(0);
