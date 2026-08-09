import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { ServiceDoc, ServiceFaqDoc, ServiceSectionDoc } from "@/lib/firebase.types";

type ServiceDraft = ServiceDoc & { id: string };

export function AdminServiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const [draft, setDraft] = useState<ServiceDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const db = getDb();
      if (!db || !id) return;
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "services", id));
        if (!snap.exists()) {
          setMessage("Service not found");
          setLoading(false);
          return;
        }
        setDraft({ id: snap.id, ...(snap.data() as ServiceDoc) });
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Load failed");
      }
      setLoading(false);
    }
    void load();
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const db = getDb();
    if (!db) return;
    setSaving(true);
    setMessage(null);
    const { id: serviceId, ...data } = draft;
    try {
      await setDoc(doc(db, "services", serviceId), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      setMessage("Saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-muted">Loading service…</p>;
  if (!draft) {
    return (
      <div>
        <p className="text-sm text-pink">{message || "Not found"}</p>
        <Link to="/admin/services" className="mt-4 inline-block text-sm text-leaf">
          Back
        </Link>
      </div>
    );
  }

  const sections: ServiceSectionDoc[] = draft.sections || [];
  const faqs: ServiceFaqDoc[] = draft.faqs || [];
  const tips: string[] = draft.careTips || [];

  return (
    <div>
      <Link to="/admin/services" className="text-sm text-leaf hover:underline">
        ← Services
      </Link>
      <h1 className="mt-2 text-3xl font-bold">Edit {draft.title}</h1>
      <form onSubmit={onSubmit} className="mt-6 max-w-3xl space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Title
            <input
              className="mt-1 w-full border border-line bg-cream px-3 py-2"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </label>
          <label className="text-sm font-medium">
            Nav label
            <input
              className="mt-1 w-full border border-line bg-cream px-3 py-2"
              value={draft.navLabel}
              onChange={(e) => setDraft({ ...draft, navLabel: e.target.value })}
              required
            />
          </label>
          <label className="text-sm font-medium">
            Slug
            <input
              className="mt-1 w-full border border-line bg-cream px-3 py-2"
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              required
            />
          </label>
          <label className="text-sm font-medium">
            Group
            <select
              className="mt-1 w-full border border-line bg-cream px-3 py-2"
              value={draft.group}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  group: e.target.value as ServiceDoc["group"],
                })
              }
            >
              <option value="eyelashes">Eyelashes</option>
              <option value="eyebrows">Eyebrows</option>
              <option value="body">Body</option>
              <option value="skin">Skin</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Sort order
            <input
              type="number"
              className="mt-1 w-full border border-line bg-cream px-3 py-2"
              value={draft.sortOrder}
              onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
            />
            Published
          </label>
        </div>
        <label className="block text-sm font-medium">
          Short description
          <textarea
            className="mt-1 w-full border border-line bg-cream px-3 py-2"
            rows={2}
            value={draft.shortDescription}
            onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Intro
          <textarea
            className="mt-1 w-full border border-line bg-cream px-3 py-2"
            rows={3}
            value={draft.intro}
            onChange={(e) => setDraft({ ...draft, intro: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Card image path / URL
          <input
            className="mt-1 w-full border border-line bg-cream px-3 py-2"
            value={draft.cardImagePath || ""}
            onChange={(e) => setDraft({ ...draft, cardImagePath: e.target.value || null })}
          />
        </label>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Price sections</h2>
            <button
              type="button"
              className="border border-line bg-cream px-3 py-1.5 text-sm"
              onClick={() =>
                setDraft({
                  ...draft,
                  sections: [...sections, { heading: "", items: [] }],
                })
              }
            >
              Add section
            </button>
          </div>
          {sections.map((sec, si) => (
            <div key={si} className="border border-line bg-paper p-4">
              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-[12rem] flex-1 text-sm font-medium">
                  Heading (optional)
                  <input
                    className="mt-1 w-full border border-line bg-cream px-3 py-2"
                    value={sec.heading || ""}
                    onChange={(e) => {
                      const next = [...sections];
                      next[si] = { ...sec, heading: e.target.value };
                      setDraft({ ...draft, sections: next });
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="text-sm text-pink"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      sections: sections.filter((_, i) => i !== si),
                    })
                  }
                >
                  Remove section
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {(sec.items || []).map((item, ii) => (
                  <li key={ii} className="grid gap-2 border-t border-line pt-2 sm:grid-cols-3">
                    <input
                      placeholder="Name"
                      className="border border-line bg-cream px-2 py-1.5 text-sm"
                      value={item.name}
                      onChange={(e) => {
                        const next = [...sections];
                        const items = [...(sec.items || [])];
                        items[ii] = { ...item, name: e.target.value };
                        next[si] = { ...sec, items };
                        setDraft({ ...draft, sections: next });
                      }}
                    />
                    <input
                      placeholder="Price"
                      className="border border-line bg-cream px-2 py-1.5 text-sm"
                      value={item.price}
                      onChange={(e) => {
                        const next = [...sections];
                        const items = [...(sec.items || [])];
                        items[ii] = { ...item, price: e.target.value };
                        next[si] = { ...sec, items };
                        setDraft({ ...draft, sections: next });
                      }}
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="Note"
                        className="min-w-0 flex-1 border border-line bg-cream px-2 py-1.5 text-sm"
                        value={item.note || ""}
                        onChange={(e) => {
                          const next = [...sections];
                          const items = [...(sec.items || [])];
                          items[ii] = { ...item, note: e.target.value };
                          next[si] = { ...sec, items };
                          setDraft({ ...draft, sections: next });
                        }}
                      />
                      <button
                        type="button"
                        className="text-xs text-pink"
                        onClick={() => {
                          const next = [...sections];
                          next[si] = {
                            ...sec,
                            items: (sec.items || []).filter((_, j) => j !== ii),
                          };
                          setDraft({ ...draft, sections: next });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-3 text-sm font-semibold text-leaf"
                onClick={() => {
                  const next = [...sections];
                  next[si] = {
                    ...sec,
                    items: [...(sec.items || []), { name: "", price: "", note: "" }],
                  };
                  setDraft({ ...draft, sections: next });
                }}
              >
                + Add item
              </button>
            </div>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">FAQs</h2>
            <button
              type="button"
              className="border border-line bg-cream px-3 py-1.5 text-sm"
              onClick={() =>
                setDraft({
                  ...draft,
                  faqs: [...faqs, { question: "", answer: "" }],
                })
              }
            >
              Add FAQ
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-line p-3">
                <input
                  className="w-full border border-line bg-cream px-2 py-1.5 text-sm"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[i] = { ...faq, question: e.target.value };
                    setDraft({ ...draft, faqs: next });
                  }}
                />
                <textarea
                  className="mt-2 w-full border border-line bg-cream px-2 py-1.5 text-sm"
                  rows={2}
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[i] = { ...faq, answer: e.target.value };
                    setDraft({ ...draft, faqs: next });
                  }}
                />
                <button
                  type="button"
                  className="mt-2 text-xs text-pink"
                  onClick={() =>
                    setDraft({ ...draft, faqs: faqs.filter((_, j) => j !== i) })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Care tips</h2>
            <button
              type="button"
              className="border border-line bg-cream px-3 py-1.5 text-sm"
              onClick={() => setDraft({ ...draft, careTips: [...tips, ""] })}
            >
              Add tip
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 border border-line bg-cream px-2 py-1.5 text-sm"
                  value={tip}
                  onChange={(e) => {
                    const next = [...tips];
                    next[i] = e.target.value;
                    setDraft({ ...draft, careTips: next });
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-pink"
                  onClick={() =>
                    setDraft({ ...draft, careTips: tips.filter((_, j) => j !== i) })
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {message ? <p className="text-sm text-leaf">{message}</p> : null}
        <button type="submit" disabled={saving} className="btn-mustard disabled:opacity-60">
          {saving ? "Saving…" : "Save service"}
        </button>
      </form>
    </div>
  );
}
