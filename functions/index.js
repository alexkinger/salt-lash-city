const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();
setGlobalOptions({ region: "us-west1" });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(res, status, body) {
  res.set(corsHeaders);
  res.status(status).json(body);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyTurnstile(token, ip, secret) {
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not configured");
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const result = await response.json();
  return Boolean(result.success);
}

exports.contact = onRequest(
  {
    cors: true,
    invoker: "public",
    serviceAccount:
      "firebase-adminsdk-fbsvc@salt-lash-city-e8655.iam.gserviceaccount.com",
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      return res.status(204).send("");
    }
    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed" });
    }

    const data = req.body || {};
    const firstName = String(data.firstName || "").trim();
    const lastName = String(data.lastName || "").trim();
    const email = String(data.email || "").trim();
    const phone = String(data.phone || "").trim();
    const message = String(data.message || "").trim();
    const serviceInterest = data.serviceInterest
      ? String(data.serviceInterest).trim()
      : null;

    if (
      !firstName ||
      firstName.length > 80 ||
      !lastName ||
      lastName.length > 80 ||
      !validEmail(email) ||
      email.length > 200 ||
      phone.length < 7 ||
      phone.length > 40 ||
      message.length < 5 ||
      message.length > 4000
    ) {
      return json(res, 400, { error: "Invalid form data" });
    }

    if (data.website) {
      return json(res, 200, { ok: true });
    }
    if (data.startedAt && Date.now() - Number(data.startedAt) < 3000) {
      return json(res, 200, { ok: true });
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || "";
    if (turnstileSecret) {
      if (!data.turnstileToken) {
        return json(res, 400, { error: "Verification required" });
      }
      const ip =
        (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
        req.ip;
      const ok = await verifyTurnstile(String(data.turnstileToken), ip, turnstileSecret);
      if (!ok) {
        return json(res, 400, { error: "Verification failed" });
      }
    }

    const db = getFirestore();
    try {
      await db.collection("leads").add({
        firstName,
        lastName,
        email,
        phone,
        message,
        serviceInterest,
        sourcePage: data.sourcePage || "/",
        landingUrl: data.landingUrl || null,
        referrerUrl: data.referrerUrl || null,
        createdAt: new Date().toISOString(),
        handledAt: null,
        notes: null,
        createdAtServer: FieldValue.serverTimestamp(),
      });
    } catch (insertError) {
      console.error("lead insert failed", insertError);
      return json(res, 500, { error: "Could not save your request" });
    }

    const resendKey = process.env.RESEND_API_KEY || "";
    const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL || "";
    const fromAddress =
      process.env.LEAD_FROM_EMAIL || "Salt Lash City <onboarding@resend.dev>";

    if (resendKey && notifyTo) {
      try {
        const recipients = notifyTo
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: recipients,
            reply_to: email,
            subject: `New inquiry from ${firstName} ${lastName}`,
            text: [
              `Name: ${firstName} ${lastName}`,
              `Email: ${email}`,
              `Phone: ${phone}`,
              `Service: ${serviceInterest || "n/a"}`,
              `Page: ${data.sourcePage || "/"}`,
              "",
              message,
            ].join("\n"),
          }),
        });

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [email],
            subject: "We received your Salt Lash City request",
            text: [
              `Hi ${firstName},`,
              "",
              "Thanks for reaching out to Salt Lash City. We received your message and will follow up soon.",
              "",
              "— Salt Lash City",
            ].join("\n"),
          }),
        });
      } catch (emailError) {
        console.error("email send failed", emailError);
      }
    }

    return json(res, 200, { ok: true });
  },
);
