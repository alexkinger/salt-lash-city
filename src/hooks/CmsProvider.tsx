import { createContext, useContext, type ReactNode } from "react";
import { useSiteSettings, useServices, useReviewsFeed } from "@/hooks/useCms";
import type { SiteModel, ServiceDetailModel } from "@/lib/cms";
import type { ReviewsFeed } from "@/data/reviews";
import { settingsToSite, staticServiceModels, reviewsToFeed } from "@/lib/cms";

type CmsContextValue = {
  site: SiteModel;
  services: ServiceDetailModel[];
  reviewsFeed: ReviewsFeed;
  loading: boolean;
  reloadAll: () => Promise<void>;
};

const CmsContext = createContext<CmsContextValue>({
  site: settingsToSite(null),
  services: staticServiceModels(),
  reviewsFeed: reviewsToFeed(null, settingsToSite(null)),
  loading: false,
  reloadAll: async () => {},
});

export function CmsProvider({ children }: { children: ReactNode }) {
  const settings = useSiteSettings();
  const services = useServices();
  const reviews = useReviewsFeed();

  return (
    <CmsContext.Provider
      value={{
        site: settings.site,
        services: services.services,
        reviewsFeed: reviews.feed,
        loading: settings.loading || services.loading || reviews.loading,
        reloadAll: async () => {
          await Promise.all([settings.reload(), services.reload(), reviews.reload()]);
        },
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  return useContext(CmsContext);
}
