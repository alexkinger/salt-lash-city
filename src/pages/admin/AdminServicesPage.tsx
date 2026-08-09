import { Link } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useServices } from "@/hooks/useCms";

export function AdminServicesPage() {
  const { services, loading, reload } = useServices({ includeUnpublished: true });

  async function togglePublished(id: string | undefined, published: boolean) {
    if (!id) return;
    const db = getDb();
    if (!db) return;
    try {
      await updateDoc(doc(db, "services", id), { published });
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Services</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Edit pricing, descriptions, FAQs, and publish state for each service page.
      </p>
      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-paper">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-cream text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Order</th>
                <th className="px-3 py-2 font-semibold">Title</th>
                <th className="px-3 py-2 font-semibold">Group</th>
                <th className="px-3 py-2 font-semibold">Published</th>
                <th className="px-3 py-2 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.slug} className="border-b border-line/70">
                  <td className="px-3 py-2 text-muted">{service.sortOrder ?? "—"}</td>
                  <td className="px-3 py-2 font-medium">{service.title}</td>
                  <td className="px-3 py-2 capitalize text-ink-soft">{service.group}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={service.published !== false}
                        disabled={!service.id}
                        onChange={(e) => void togglePublished(service.id, e.target.checked)}
                      />
                      {service.published !== false ? "Yes" : "No"}
                    </label>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {service.id ? (
                      <Link
                        to={`/admin/services/${service.id}`}
                        className="font-semibold text-leaf hover:underline"
                      >
                        Edit
                      </Link>
                    ) : (
                      <span className="text-xs text-muted">Static fallback</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
