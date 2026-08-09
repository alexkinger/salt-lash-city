import { Outlet } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/Seo";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useCms } from "@/hooks/CmsProvider";
import { buildSiteGraph } from "@/lib/schema";

export function Layout() {
  const { site, reviewsFeed } = useCms();
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <JsonLd
        data={buildSiteGraph({ includeReviews: true, site, reviewsFeed })}
        id="site"
      />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
