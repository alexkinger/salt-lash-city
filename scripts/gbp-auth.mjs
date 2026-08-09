/**
 * One-time Google Business Profile OAuth (Desktop) for review sync.
 *
 * Prerequisites (in Google Cloud Console, same project as Places):
 * 1. Request / enable access to Google Business Profile APIs
 *    https://developers.google.com/my-business/content/basic-setup
 * 2. Enable: My Business Account Management API, Business Profile Business Information API,
 *    and Google My Business API (reviews — may only appear after approval)
 * 3. OAuth consent screen → External → add Blake's Google (profile owner) as Test user
 * 4. Credentials → Create OAuth client ID → Desktop app
 * 5. Put client id/secret in .env.local, then run:
 *      npm run gbp:auth
 *
 * The script prints a refresh token + account/location IDs to paste into .env.local.
 */

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

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

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const SCOPE = "https://www.googleapis.com/auth/business.manage";
const PORT = Number(process.env.GBP_OAUTH_PORT || 8765);
const REDIRECT_URI = `http://127.0.0.1:${PORT}/oauth2callback`;

function openBrowser(url) {
  const platform = process.platform;
  const cmd =
    platform === "win32"
      ? `start "" "${url}"`
      : platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd);
}

async function exchangeCode(code) {
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || JSON.stringify(data));
  }
  return data;
}

async function listAccounts(accessToken) {
  const res = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error?.message ||
        `Account list failed (${res.status}). Is My Business Account Management API enabled / approved?`,
    );
  }
  return data.accounts || [];
}

async function listLocations(accessToken, accountName) {
  // accountName like "accounts/123"
  const url = new URL(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`,
  );
  url.searchParams.set("readMask", "name,title,storefrontAddress,metadata");
  url.searchParams.set("pageSize", "100");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error?.message ||
        `Location list failed (${res.status}). Is Business Profile Business Information API enabled?`,
    );
  }
  return data.locations || [];
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error(
      "Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local first.",
    );
    process.exit(1);
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPE);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  console.log("\nOpening browser for Google Business Profile access…");
  console.log("Sign in as the account that owns / manages Salt Lash City.\n");
  console.log(authUrl.toString(), "\n");

  const tokens = await new Promise((resolvePromise, reject) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
        if (url.pathname !== "/oauth2callback") {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        const err = url.searchParams.get("error");
        if (err) throw new Error(err);
        const code = url.searchParams.get("code");
        if (!code) throw new Error("Missing authorization code");

        const tokenData = await exchangeCode(code);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          "<h1>Salt Lash City — Google connected</h1><p>You can close this tab and return to the terminal.</p>",
        );
        server.close();
        resolvePromise(tokenData);
      } catch (e) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(String(e?.message || e));
        server.close();
        reject(e);
      }
    });

    server.listen(PORT, "127.0.0.1", () => {
      openBrowser(authUrl.toString());
    });
  });

  if (!tokens.refresh_token) {
    console.warn(
      "No refresh_token returned. Revoke app access at https://myaccount.google.com/permissions and re-run with prompt=consent.",
    );
  }

  console.log("\n=== Paste into .env.local ===\n");
  console.log(`GOOGLE_OAUTH_CLIENT_ID=${CLIENT_ID}`);
  console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${CLIENT_SECRET}`);
  if (tokens.refresh_token) {
    console.log(`GOOGLE_GBP_REFRESH_TOKEN=${tokens.refresh_token}`);
  }

  try {
    const accounts = await listAccounts(tokens.access_token);
    if (!accounts.length) {
      console.log(
        "\nNo Business Profile accounts returned. Confirm Blake’s Google account manages the listing.",
      );
      return;
    }

    console.log("\n=== Accounts ===");
    for (const account of accounts) {
      console.log(`- ${account.name}  (${account.accountName || account.type || ""})`);
    }

    const account = accounts[0];
    const locations = await listLocations(tokens.access_token, account.name);
    console.log("\n=== Locations ===");
    if (!locations.length) {
      console.log("(none listed — API access approval may still be pending)");
    }
    for (const loc of locations) {
      const locId = String(loc.name || "").replace(/^locations\//, "");
      const accountId = String(account.name || "").replace(/^accounts\//, "");
      const title = loc.title || "(untitled)";
      const addr = loc.storefrontAddress?.addressLines?.join(", ") || "";
      console.log(`- ${title}`);
      console.log(`  GOOGLE_GBP_ACCOUNT_ID=${accountId}`);
      console.log(`  GOOGLE_GBP_LOCATION_ID=${locId}`);
      if (addr) console.log(`  ${addr}`);
    }
  } catch (e) {
    console.warn("\nCould not list accounts/locations yet:");
    console.warn(String(e?.message || e));
    console.warn(
      "Complete Google’s Business Profile API access request, enable the APIs, then re-run: npm run gbp:auth",
    );
  }

  console.log("\nThen run: npm run sync:reviews\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
