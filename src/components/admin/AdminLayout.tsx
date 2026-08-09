import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/media", label: "Media" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Salt Lash City
            </p>
            <p className="font-semibold">Admin</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">{user?.email}</span>
            <a href="/" className="text-leaf hover:underline">
              View site
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="border border-line bg-cream px-3 py-1.5 hover:bg-paper"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap px-3 py-2 text-sm font-medium",
                  isActive ? "bg-mustard text-ink" : "text-ink-soft hover:bg-cream",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
