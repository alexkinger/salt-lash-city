import { useEffect } from "react";
import { absoluteUrl, defaultMeta } from "@/lib/schema";

type JsonLdData = Record<string, unknown> | Array<Record<string, unknown>>;

export function JsonLd({ data, id }: { data: JsonLdData; id?: string }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, index) => (
        <script
          key={id ? `${id}-${index}` : index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  /** Extra JSON-LD graphs for this route (Service, FAQ, WebPage, etc.) */
  jsonLd?: JsonLdData;
  /** When true, also emit og:type=website defaults */
  noIndex?: boolean;
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Per-route title/description/canonical + optional JSON-LD.
 * Sitewide BeautySalon graph lives in Layout + static index.html inject.
 */
export function Seo({
  title = defaultMeta.title,
  description = defaultMeta.description,
  path = "/",
  jsonLd,
  noIndex = false,
}: SeoProps) {
  const fullTitle = title.includes(defaultMeta.title.split(" | ")[0])
    ? title
    : `${title} | Salt Lash City`;
  const canonical = absoluteUrl(path);

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "Salt Lash City");
    upsertMeta("property", "og:locale", "en_US");
    upsertMeta("property", "og:image", absoluteUrl("/images/logo.png"));
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertLink("canonical", canonical);
    if (noIndex) {
      upsertMeta("name", "robots", "noindex, nofollow");
    }
  }, [fullTitle, description, canonical, noIndex]);

  return jsonLd ? <JsonLd data={jsonLd} id={`seo-${path}`} /> : null;
}
