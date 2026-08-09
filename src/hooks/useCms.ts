import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import {
  mapServiceDoc,
  reviewsToFeed,
  settingsToSite,
  staticServiceModels,
  type ServiceDetailModel,
  type SiteModel,
} from "@/lib/cms";
import type { ReviewsFeed } from "@/data/reviews";
import type {
  LeadRow,
  MediaRow,
  ReviewDoc,
  ReviewRow,
  ServiceDoc,
  SiteSettingsDoc,
} from "@/lib/firebase.types";

export function useSiteSettings() {
  const [site, setSite] = useState<SiteModel>(() => settingsToSite(null));
  const [raw, setRaw] = useState<SiteSettingsDoc | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const db = getDb();
    if (!db) {
      setSite(settingsToSite(null));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "settings", "site"));
      const data = snap.exists() ? (snap.data() as SiteSettingsDoc) : null;
      setRaw(data);
      setSite(settingsToSite(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
      setSite(settingsToSite(null));
    }
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  return { site, raw, loading, error, reload };
}

export function useServices(options?: { includeUnpublished?: boolean }) {
  const [services, setServices] = useState<ServiceDetailModel[]>(() => staticServiceModels());
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const db = getDb();
    if (!db) {
      setServices(staticServiceModels());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "services"));
      let list = snap.docs.map((d) => mapServiceDoc(d.id, d.data() as ServiceDoc));
      if (!options?.includeUnpublished) {
        list = list.filter((s) => s.published !== false);
      }
      list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      if (!list.length) {
        setServices(staticServiceModels());
      } else {
        setServices(list);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
      setServices(staticServiceModels());
    }
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, [options?.includeUnpublished]);

  return { services, loading, error, reload };
}

export function useServiceBySlug(slug: string) {
  const { services, loading, error, reload } = useServices();
  return {
    service: services.find((s) => s.slug === slug) || null,
    loading,
    error,
    reload,
  };
}

export function useReviewsFeed() {
  const { site } = useSiteSettings();
  const [feed, setFeed] = useState<ReviewsFeed>(() => reviewsToFeed(null, settingsToSite(null)));
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  const reload = async () => {
    const db = getDb();
    if (!db) {
      setFeed(reviewsToFeed(null, site));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "reviews"));
      const list: ReviewRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as ReviewDoc),
      }));
      list.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return (b.reviewDate || "").localeCompare(a.reviewDate || "");
      });
      setRows(list);
      setFeed(reviewsToFeed(list, site));
    } catch {
      setFeed(reviewsToFeed(null, site));
    }
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, [site.google.count, site.vagaro.count]);

  return { feed, rows, loading, reload };
}

export function useAdminLeads() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const db = getDb();
    if (!db) return;
    setLoading(true);
    try {
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setLeads(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LeadRow, "id">),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    }
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  return { leads, loading, error, reload };
}

export function useAdminReviews() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const db = getDb();
    if (!db) return;
    setLoading(true);
    const q = query(collection(db, "reviews"));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as ReviewDoc),
    }));
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return (b.reviewDate || "").localeCompare(a.reviewDate || "");
    });
    setReviews(list);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  return { reviews, loading, reload };
}

export function useMediaLibrary() {
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const db = getDb();
    if (!db) return;
    setLoading(true);
    const q = query(collection(db, "media"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setMedia(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MediaRow, "id">),
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  return { media, loading, reload };
}
