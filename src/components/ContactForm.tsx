import { useCallback, useState, type FormEvent } from "react";
import { z } from "zod";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  message: z.string().trim().min(5, "Tell us a bit more about what you’re looking for"),
  serviceInterest: z.string().optional(),
  website: z.string().optional(), // honeypot
});

type FormState = z.infer<typeof formSchema>;

const initial: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  serviceInterest: "",
  website: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !turnstileToken) {
      setStatus("error");
      setErrorMessage("Please complete the verification challenge.");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          turnstileToken,
          startedAt,
          sourcePage: window.location.pathname,
          landingUrl: window.sessionStorage.getItem("slc_landing_url") ?? window.location.href,
          referrerUrl: window.sessionStorage.getItem("slc_referrer") ?? document.referrer,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setForm(initial);
      setTurnstileToken(null);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-line bg-paper px-6 py-8">
        <h3 className="font-bold text-2xl text-ink">Request received</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Thanks — we’ll follow up soon. You can also reach out again if your plans change.
        </p>
        <button
          type="button"
          className="mt-6 text-sm text-leaf underline-offset-4 hover:underline"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          error={errors.firstName}
          value={form.firstName}
          onChange={(v) => update("firstName", v)}
          autoComplete="given-name"
        />
        <Field
          label="Last name"
          error={errors.lastName}
          value={form.lastName}
          onChange={(v) => update("lastName", v)}
          autoComplete="family-name"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          type="email"
          error={errors.email}
          value={form.email}
          onChange={(v) => update("email", v)}
          autoComplete="email"
        />
        <Field
          label="Phone"
          type="tel"
          error={errors.phone}
          value={form.phone}
          onChange={(v) => update("phone", v)}
          autoComplete="tel"
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm text-ink-soft">Service interest</span>
        <select
          className="w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-lime"
          value={form.serviceInterest}
          onChange={(e) => update("serviceInterest", e.target.value)}
        >
          <option value="">Not sure yet</option>
          <option value="eyelash-extensions">Eyelash Extensions</option>
          <option value="eyelash-lifts">Eyelash Lifts</option>
          <option value="eyelash-tinting">Eyelash Tinting</option>
          <option value="eyebrow-tinting">Eyebrow Tinting</option>
          <option value="waxing">Waxing</option>
          <option value="facial">Facial</option>
          <option value="other">Other / question</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm text-ink-soft">Message</span>
        <textarea
          className="min-h-28 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-lime"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />
        {errors.message ? <span className="mt-1 block text-xs text-pink">{errors.message}</span> : null}
      </label>

      {/* Honeypot — leave empty */}
      <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </label>
      </div>

      <TurnstileWidget onToken={onToken} />

      {errorMessage ? <p className="text-sm text-pink">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-mustard disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
};

function Field({ label, value, onChange, error, type = "text", autoComplete }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-ink-soft">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        className="w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-lime"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <span className="mt-1 block text-xs text-pink">{error}</span> : null}
    </label>
  );
}
