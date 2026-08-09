import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { configured, loading, user, isAdmin } = useAuth();
  const location = useLocation();

  if (!configured) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-sm text-ink-soft">
        <p className="font-semibold text-ink">Admin requires Firebase</p>
        <p className="mt-2">
          Set the <code className="text-ink">VITE_FIREBASE_*</code> env vars, deploy Firestore/Storage
          rules, create Auth users in the Firebase console, then run{" "}
          <code className="text-ink">npm run firebase:set-admin -- you@example.com</code> so the
          custom claim <code className="text-ink">admin: true</code> is set.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Checking session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-sm text-ink-soft">
        <p className="font-semibold text-ink">Not an admin account</p>
        <p className="mt-2">
          You’re signed in, but this user does not have the admin claim. From a machine with a
          Firebase service account:
        </p>
        <pre className="mt-3 overflow-x-auto rounded border border-line bg-cream p-3 text-xs text-ink">
          {`npm run firebase:set-admin -- you@example.com`}
        </pre>
        <p className="mt-3 text-xs">Then sign out and sign back in to refresh the ID token.</p>
      </div>
    );
  }

  return children;
}
