import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAdminLeads } from "@/hooks/useCms";
import type { LeadRow } from "@/lib/firebase.types";

export function AdminLeadsPage() {
  const { leads, loading, error, reload } = useAdminLeads();
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function openLead(lead: LeadRow) {
    setSelected(lead);
    setNotes(lead.notes || "");
  }

  async function markHandled(handled: boolean) {
    if (!selected) return;
    const db = getDb();
    if (!db) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "leads", selected.id), {
        handledAt: handled ? new Date().toISOString() : null,
        notes: notes || null,
      });
      await reload();
      setSelected(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
    setSaving(false);
  }

  async function saveNotes() {
    if (!selected) return;
    const db = getDb();
    if (!db) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "leads", selected.id), { notes: notes || null });
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
    setSaving(false);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Leads</h1>
      <p className="mt-2 text-sm text-ink-soft">Contact form submissions from the website.</p>
      {error ? <p className="mt-4 text-sm text-pink">{error}</p> : null}
      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-paper">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-cream text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">When</th>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Service</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer border-b border-line/70 hover:bg-cream/60"
                  onClick={() => openLead(lead)}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-muted">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="px-3 py-2 text-ink-soft">{lead.serviceInterest || "—"}</td>
                  <td className="px-3 py-2">
                    {lead.handledAt ? (
                      <span className="text-leaf">Handled</span>
                    ) : (
                      <span className="font-semibold text-mustard">Open</span>
                    )}
                  </td>
                </tr>
              ))}
              {!leads.length ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted">
                    No leads yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-line bg-paper p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {selected.firstName} {selected.lastName}
                </h2>
                <p className="text-sm text-muted">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-muted hover:text-ink"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-muted">Email</dt>
                <dd>
                  <a className="text-leaf hover:underline" href={`mailto:${selected.email}`}>
                    {selected.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Phone</dt>
                <dd>
                  <a className="text-leaf hover:underline" href={`tel:${selected.phone}`}>
                    {selected.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Service</dt>
                <dd>{selected.serviceInterest || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Page</dt>
                <dd>{selected.sourcePage}</dd>
              </div>
              <div>
                <dt className="text-muted">Message</dt>
                <dd className="whitespace-pre-wrap text-ink-soft">{selected.message}</dd>
              </div>
            </dl>
            <label className="mt-4 block text-sm font-medium">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full border border-line bg-cream px-3 py-2"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveNotes()}
                className="border border-line bg-cream px-3 py-2 text-sm disabled:opacity-60"
              >
                Save notes
              </button>
              {selected.handledAt ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void markHandled(false)}
                  className="border border-line px-3 py-2 text-sm disabled:opacity-60"
                >
                  Reopen
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void markHandled(true)}
                  className="btn-mustard text-sm disabled:opacity-60"
                >
                  Mark handled
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
