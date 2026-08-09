import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { doc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useSiteSettings } from "@/hooks/useCms";
import type { HourRow, SiteSettingsDoc } from "@/lib/firebase.types";

const emptyHours: HourRow[] = [
  { day: "Monday", time: "" },
  { day: "Tuesday", time: "" },
  { day: "Wednesday", time: "" },
  { day: "Thursday", time: "" },
  { day: "Friday", time: "" },
  { day: "Saturday", time: "" },
  { day: "Sunday", time: "" },
];

export function AdminSettingsPage() {
  const { raw, loading, reload } = useSiteSettings();
  const [form, setForm] = useState<SiteSettingsDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (raw) {
      setForm({ ...raw, hours: raw.hours?.length ? raw.hours : emptyHours });
      return;
    }
    setForm({
      name: "Salt Lash City",
      tagline: "Master Esthetician in Sandy, UT",
      ownerName: "Blake",
      email: "Blake@SaltLashCity.com",
      phone: "(801) 946-4595",
      addressLine1: "9295 S 1300 E",
      addressLine2: "Sandy, UT 84094",
      bookingUrl: "https://www.vagaro.com/saltlashcity",
      facebookUrl: "https://www.facebook.com/Salt-lash-city-903840756420638/",
      instagramUrl: "https://www.instagram.com/saltlashcity/",
      hours: emptyHours.map((h) => ({ ...h })),
      seoDescription: null,
      googleRating: null,
      googleReviewCount: null,
      googleReviewsUrl: null,
      vagaroRating: null,
      vagaroReviewCount: null,
      vagaroReviewsUrl: null,
      heroImagePath: "/images/brand/lash-extensions-home.png",
    });
  }, [raw, loading]);

  function update<K extends keyof SiteSettingsDoc>(key: K, value: SiteSettingsDoc[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function updateHour(index: number, time: string) {
    setForm((prev) => {
      if (!prev) return prev;
      const hours = [...(prev.hours || emptyHours)];
      hours[index] = { ...hours[index], time };
      return { ...prev, hours };
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const db = getDb();
    if (!db) return;
    setSaving(true);
    setMessage(null);
    try {
      await setDoc(
        doc(db, "settings", "site"),
        { ...form, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      setMessage("Saved.");
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
    setSaving(false);
  }

  if (loading || !form) {
    return <p className="text-sm text-muted">Loading settings…</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Studio contact info, booking link, hours, and review badges shown on the public site.
      </p>
      <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-4">
        <Field label="Business name">
          <input
            className="field"
            value={form.name || ""}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </Field>
        <Field label="Tagline">
          <input
            className="field"
            value={form.tagline || ""}
            onChange={(e) => update("tagline", e.target.value)}
          />
        </Field>
        <Field label="Owner name">
          <input
            className="field"
            value={form.ownerName || ""}
            onChange={(e) => update("ownerName", e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              type="email"
              className="field"
              value={form.email || ""}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </Field>
          <Field label="Phone">
            <input
              className="field"
              value={form.phone || ""}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
          </Field>
        </div>
        <Field label="Address line 1">
          <input
            className="field"
            value={form.addressLine1 || ""}
            onChange={(e) => update("addressLine1", e.target.value)}
            required
          />
        </Field>
        <Field label="Address line 2">
          <input
            className="field"
            value={form.addressLine2 || ""}
            onChange={(e) => update("addressLine2", e.target.value)}
            required
          />
        </Field>
        <Field label="Booking URL">
          <input
            className="field"
            value={form.bookingUrl || ""}
            onChange={(e) => update("bookingUrl", e.target.value)}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram URL">
            <input
              className="field"
              value={form.instagramUrl || ""}
              onChange={(e) => update("instagramUrl", e.target.value)}
            />
          </Field>
          <Field label="Facebook URL">
            <input
              className="field"
              value={form.facebookUrl || ""}
              onChange={(e) => update("facebookUrl", e.target.value)}
            />
          </Field>
        </div>
        <Field label="SEO description">
          <textarea
            className="field"
            rows={3}
            value={form.seoDescription || ""}
            onChange={(e) => update("seoDescription", e.target.value)}
          />
        </Field>
        <Field label="Hero image path">
          <input
            className="field"
            value={form.heroImagePath || ""}
            onChange={(e) => update("heroImagePath", e.target.value)}
            placeholder="/images/brand/lash-extensions-home.png"
          />
        </Field>

        <fieldset className="border border-line p-4">
          <legend className="px-1 text-sm font-semibold">Hours</legend>
          <div className="space-y-2">
            {(form.hours || emptyHours).map((row, i) => (
              <div key={row.day} className="grid grid-cols-[7rem_1fr] items-center gap-2">
                <span className="text-sm">{row.day}</span>
                <input
                  className="field"
                  value={row.time}
                  onChange={(e) => updateHour(i, e.target.value)}
                  placeholder="10:00 AM – 7:00 PM or Closed"
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="border border-line p-4">
          <legend className="px-1 text-sm font-semibold">Google reviews badge</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                className="field"
                value={form.googleRating ?? ""}
                onChange={(e) =>
                  update("googleRating", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </Field>
            <Field label="Count">
              <input
                type="number"
                className="field"
                value={form.googleReviewCount ?? ""}
                onChange={(e) =>
                  update(
                    "googleReviewCount",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              />
            </Field>
            <Field label="URL">
              <input
                className="field"
                value={form.googleReviewsUrl || ""}
                onChange={(e) => update("googleReviewsUrl", e.target.value || null)}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="border border-line p-4">
          <legend className="px-1 text-sm font-semibold">Vagaro reviews badge</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                className="field"
                value={form.vagaroRating ?? ""}
                onChange={(e) =>
                  update("vagaroRating", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </Field>
            <Field label="Count">
              <input
                type="number"
                className="field"
                value={form.vagaroReviewCount ?? ""}
                onChange={(e) =>
                  update(
                    "vagaroReviewCount",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              />
            </Field>
            <Field label="URL">
              <input
                className="field"
                value={form.vagaroReviewsUrl || ""}
                onChange={(e) => update("vagaroReviewsUrl", e.target.value || null)}
              />
            </Field>
          </div>
        </fieldset>

        {message ? <p className="text-sm text-leaf">{message}</p> : null}
        <button type="submit" disabled={saving} className="btn-mustard disabled:opacity-60">
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
      <style>{`.field{margin-top:0.25rem;width:100%;border:1px solid var(--color-line,#d6d2c8);background:#f8f6f1;padding:0.5rem 0.75rem}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
