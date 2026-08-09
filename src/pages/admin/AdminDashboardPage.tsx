import { Link } from "react-router-dom";
import { useAdminLeads, useAdminReviews, useServices } from "@/hooks/useCms";

export function AdminDashboardPage() {
  const { leads, loading: leadsLoading } = useAdminLeads();
  const { services, loading: servicesLoading } = useServices({ includeUnpublished: true });
  const { reviews, loading: reviewsLoading } = useAdminReviews();

  const openLeads = leads.filter((l) => !l.handledAt).length;
  const visibleReviews = reviews.filter((r) => r.visible).length;

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Manage leads, services, reviews, media, and studio settings.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Open leads"
          value={leadsLoading ? "…" : String(openLeads)}
          to="/admin/leads"
        />
        <Stat
          label="Services"
          value={servicesLoading ? "…" : String(services.length)}
          to="/admin/services"
        />
        <Stat
          label="Visible reviews"
          value={reviewsLoading ? "…" : String(visibleReviews)}
          to="/admin/reviews"
        />
      </div>
    </div>
  );
}

function Stat({ label, value, to }: { label: string; value: string; to: string }) {
  return (
    <Link to={to} className="border border-line bg-paper p-5 transition hover:border-mustard">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}
