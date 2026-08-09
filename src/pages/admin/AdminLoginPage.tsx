import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AdminLoginPage() {
  const { configured, user, isAdmin, loading, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  if (!loading && user && isAdmin) {
    return <Navigate to={from} replace />;
  }

  async function onGoogle() {
    setSubmitting(true);
    setError(null);
    const result = await signInWithGoogle();
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate(from, { replace: true });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f4] px-4">
      <div className="w-full max-w-md border border-line bg-paper p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Salt Lash City
        </p>
        <h1 className="mt-1 text-2xl font-bold">Admin login</h1>
        {!configured ? (
          <p className="mt-4 text-sm text-ink-soft">
            Configure <code>VITE_FIREBASE_*</code> env vars to enable login.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-ink-soft">
              Sign in with the Google account you’ll grant admin access. Public signup is off —
              only invited admins can use the dashboard.
            </p>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void onGoogle()}
              className="btn-mustard mt-6 w-full disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Continue with Google"}
            </button>

            <button
              type="button"
              className="mt-4 text-sm text-leaf hover:underline"
              onClick={() => setShowEmail((v) => !v)}
            >
              {showEmail ? "Hide email sign-in" : "Use email instead"}
            </button>

            {showEmail ? (
              <form onSubmit={onSubmit} className="mt-4 space-y-4 border-t border-line pt-4">
                <label className="block text-sm font-medium">
                  Email
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full border border-line bg-cream px-3 py-2"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Password
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full border border-line bg-cream px-3 py-2"
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full border border-line bg-cream px-3 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  Sign in with email
                </button>
              </form>
            ) : null}

            {error ? <p className="mt-3 text-sm text-pink">{error}</p> : null}
            {user && !isAdmin && !loading ? (
              <p className="mt-3 text-sm text-ink-soft">
                Signed in as {user.email}, but this account is not an admin yet. After you sign in
                once, we’ll grant the admin claim.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
