import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i);
    const v = t.slice(i + 1);
    if (!(k in process.env) || !process.env[k]) process.env[k] = v;
  }
}

loadEnv(resolve(".env.local"));

const body = new URLSearchParams({
  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  refresh_token: process.env.GOOGLE_GBP_REFRESH_TOKEN,
  grant_type: "refresh_token",
});

const tokRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body,
});
const tok = await tokRes.json();
if (!tokRes.ok) {
  console.error("token failed", tok);
  process.exit(1);
}

const accRes = await fetch(
  "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
  { headers: { Authorization: `Bearer ${tok.access_token}` } },
);
const acc = await accRes.json();
console.log("accounts status", accRes.status);
if (!accRes.ok) {
  console.log(JSON.stringify(acc, null, 2).slice(0, 1000));
  process.exit(1);
}

const accounts = acc.accounts || [];
console.log("account count", accounts.length);

let chosenAccountId = "";
let chosenLocationId = "";
let chosenTitle = "";

for (const a of accounts) {
  console.log("ACCOUNT", a.name, a.accountName || a.type || "");
  const url = new URL(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${a.name}/locations`,
  );
  url.searchParams.set("readMask", "name,title,storefrontAddress");
  url.searchParams.set("pageSize", "100");
  const locRes = await fetch(url, {
    headers: { Authorization: `Bearer ${tok.access_token}` },
  });
  const loc = await locRes.json();
  console.log("  locations status", locRes.status);
  if (!locRes.ok) {
    console.log(" ", JSON.stringify(loc).slice(0, 500));
    continue;
  }
  for (const l of loc.locations || []) {
    const locId = String(l.name || "").replace(/^locations\//, "");
    const accountId = String(a.name || "").replace(/^accounts\//, "");
    console.log("  LOCATION", l.title);
    console.log("  GOOGLE_GBP_ACCOUNT_ID=" + accountId);
    console.log("  GOOGLE_GBP_LOCATION_ID=" + locId);
    console.log(" ", l.storefrontAddress?.addressLines?.join(", ") || "");
    if (!chosenAccountId) {
      chosenAccountId = accountId;
      chosenLocationId = locId;
      chosenTitle = l.title || "";
    }
    if (/salt lash/i.test(l.title || "")) {
      chosenAccountId = accountId;
      chosenLocationId = locId;
      chosenTitle = l.title || "";
    }
  }
}

if (chosenAccountId && chosenLocationId) {
  let env = readFileSync(".env.local", "utf8");
  const set = (key, value) => {
    if (new RegExp(`^${key}=`, "m").test(env)) {
      env = env.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${value}`);
    } else {
      env += `\n${key}=${value}\n`;
    }
  };
  set("GOOGLE_GBP_ACCOUNT_ID", chosenAccountId);
  set("GOOGLE_GBP_LOCATION_ID", chosenLocationId);
  writeFileSync(".env.local", env);
  console.log(`\nSaved IDs for: ${chosenTitle || "(first location)"}`);
} else {
  console.log("\nNo location IDs found to save.");
  process.exit(2);
}
