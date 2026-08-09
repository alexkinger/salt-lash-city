import { doc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAdminReviews } from "@/hooks/useCms";

export function AdminReviewsPage() {
  const { reviews, loading, reload } = useAdminReviews();

  async function updateReview(
    id: string,
    patch: { visible?: boolean; featured?: boolean; sortOrder?: number },
  ) {
    const db = getDb();
    if (!db) return;
    try {
      await updateDoc(doc(db, "reviews", id), patch);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Reviews</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Control which reviews appear on the public site. Re-sync from Google/Vagaro still uses the
        CLI; this panel curates visibility.
      </p>
      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="border border-line bg-paper p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {review.author}{" "}
                    <span className="text-xs font-normal uppercase tracking-wide text-muted">
                      {review.source}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-mustard">
                    {"★".repeat(Math.round(Number(review.rating)))}{" "}
                    <span className="text-muted">
                      {review.reviewDate || "No date"} · sort {review.sortOrder}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={review.visible}
                      onChange={(e) =>
                        void updateReview(review.id, { visible: e.target.checked })
                      }
                    />
                    Visible
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={review.featured}
                      onChange={(e) =>
                        void updateReview(review.id, { featured: e.target.checked })
                      }
                    />
                    Featured
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    Order
                    <input
                      type="number"
                      className="w-16 border border-line bg-cream px-2 py-1"
                      value={review.sortOrder}
                      onChange={(e) =>
                        void updateReview(review.id, { sortOrder: Number(e.target.value) })
                      }
                    />
                  </label>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{review.body}</p>
            </article>
          ))}
          {!reviews.length ? (
            <p className="text-sm text-muted">No reviews yet. Run the Firebase seed script.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
