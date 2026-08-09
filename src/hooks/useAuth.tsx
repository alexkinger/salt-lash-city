import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

type AuthState = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  refreshClaims: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = getFirebaseAuth();
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [claimsReady, setClaimsReady] = useState(!isFirebaseConfigured);

  const refreshClaims = useCallback(async () => {
    if (!auth?.currentUser) {
      setIsAdmin(false);
      setClaimsReady(true);
      return;
    }
    const token = await auth.currentUser.getIdTokenResult(true);
    setIsAdmin(token.claims.admin === true);
    setClaimsReady(true);
  }, [auth]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setClaimsReady(true);
      return;
    }

    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
      if (!next) {
        setIsAdmin(false);
        setClaimsReady(true);
      } else {
        setClaimsReady(false);
        void next.getIdTokenResult().then((token) => {
          setIsAdmin(token.claims.admin === true);
          setClaimsReady(true);
        });
      }
    });

    return () => unsub();
  }, [auth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!auth) return { error: "Firebase is not configured" };
      setClaimsReady(false);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        await refreshClaims();
        return { error: null };
      } catch (err) {
        setClaimsReady(true);
        const message = err instanceof Error ? err.message : "Sign in failed";
        return { error: message };
      }
    },
    [auth, refreshClaims],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!auth) return { error: "Firebase is not configured" };
    setClaimsReady(false);
    try {
      await signInWithPopup(auth, googleProvider);
      await refreshClaims();
      return { error: null };
    } catch (err) {
      setClaimsReady(true);
      const message = err instanceof Error ? err.message : "Google sign in failed";
      return { error: message };
    }
  }, [auth, refreshClaims]);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setIsAdmin(false);
    setClaimsReady(true);
  }, [auth]);

  const value = useMemo<AuthState>(
    () => ({
      configured: isFirebaseConfigured,
      loading: loading || (Boolean(user) && !claimsReady),
      user,
      isAdmin,
      refreshClaims,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [loading, claimsReady, user, isAdmin, refreshClaims, signIn, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
