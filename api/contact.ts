import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";

const bodySchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email().max(200),
  phone: z.string().trim().min(7).max(40),
  message: z.string().trim().min(5).max(4000),
  serviceInterest: z.string().trim().max(120).optional().nullable(),
  website: z.string().optional().nullable(), // honeypot
  turnstileToken: z.string().optional().nullable(),
  startedAt: z.number().optional().nullable(),
  sourcePage: z.string().trim().max(300).optional().nullable(),
  landingUrl: z.string().trim().max(2000).optional().nullable(),
  referrerUrl: z.string().trim().max(2000).optional().nullable(),
});

async function verifyTurnstile(token: string, ip: string | undefined) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is not configured");
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });

  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid form data" });
  }

  const data = parsed.data;

  // Silent drop for bots (honeypot filled or submitted too quickly).
  if (data.website) {
    return res.status(200).json({ ok: true });
  }
  if (data.startedAt && Date.now() - data.startedAt < 3000) {
    return res.status(200).json({ ok: true });
  }

  const turnstileConfigured = Boolean(process.env.TURNSTILE_SECRET_KEY);
  if (turnstileConfigured) {
    if (!data.turnstileToken) {
      return res.status(400).json({ error: "Verification required" });
    }
    const ipHeader = req.headers["x-forwarded-for"];
    const ip = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader?.split(",")[0]?.trim();
    const ok = await verifyTurnstile(data.turnstileToken, ip);
    if (!ok) {
      return res.status(400).json({ error: "Verification failed" });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: "Database is not configured" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: insertError } = await supabase.from("leads").insert({
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    message: data.message,
    service_interest: data.serviceInterest || null,
    source_page: data.sourcePage || "/",
    landing_url: data.landingUrl || null,
    referrer_url: data.referrerUrl || null,
  });

  if (insertError) {
    console.error("lead insert failed", insertError);
    return res.status(500).json({ error: "Could not save your request" });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL;
  const fromAddress =
    process.env.LEAD_FROM_EMAIL || "Salt Lash City <onboarding@resend.dev>";

  if (resendKey && notifyTo) {
    const resend = new Resend(resendKey);
    try {
      await resend.emails.send({
        from: fromAddress,
        to: notifyTo.split(",").map((s) => s.trim()).filter(Boolean),
        replyTo: data.email,
        subject: `New inquiry from ${data.firstName} ${data.lastName}`,
        text: [
          `Name: ${data.firstName} ${data.lastName}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone}`,
          `Service: ${data.serviceInterest || "n/a"}`,
          `Page: ${data.sourcePage || "/"}`,
          "",
          data.message,
        ].join("\n"),
      });

      await resend.emails.send({
        from: fromAddress,
        to: data.email,
        subject: "We received your Salt Lash City request",
        text: [
          `Hi ${data.firstName},`,
          "",
          "Thanks for reaching out to Salt Lash City. We received your message and will follow up soon.",
          "",
          "— Salt Lash City",
        ].join("\n"),
      });
    } catch (emailError) {
      // Lead is already saved; don't fail the request on email issues.
      console.error("email send failed", emailError);
    }
  }

  return res.status(200).json({ ok: true });
}
