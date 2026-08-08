import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ContactForm } from "@/components/ContactForm";
import { faqs } from "@/data/faqs";
import { services } from "@/data/services";

function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
      <h1 className="font-display text-4xl text-ink md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base text-muted">{intro}</p>
      <div className="mt-12">{children}</div>
    </div>
  );
}

export function Services() {
  return (
    <PageShell
      title="Services"
      intro="Placeholder menu. We’ll replace titles, descriptions, and pricing from your final content."
    >
      <div className="grid gap-8">
        {services.map((service) => (
          <article key={service.slug} className="border-b border-line pb-8">
            <h2 className="font-display text-3xl text-ink">{service.title}</h2>
            <p className="mt-3 max-w-2xl text-muted">{service.shortDescription}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function About() {
  return (
    <PageShell
      title="About"
      intro="Studio story goes here — founder intro, values, and the Salt Lash City point of view."
    >
      <p className="max-w-2xl text-base leading-relaxed text-ink-soft">
        Design and photography will drive this page. For now this route exists so navigation, SEO
        scaffolding, and layout remain stable while content is finalized.
      </p>
    </PageShell>
  );
}

export function Gallery() {
  return (
    <PageShell title="Gallery" intro="Lookbook grid will live here. Drop in approved photos when ready.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] rounded-sm bg-paper-deep"
            aria-label={`Gallery placeholder ${i + 1}`}
          />
        ))}
      </div>
    </PageShell>
  );
}

export function Contact() {
  return (
    <PageShell
      title="Contact"
      intro="Tell us what you’re looking for and we’ll follow up about availability."
    >
      <div className="relative max-w-xl">
        <ContactForm />
      </div>
    </PageShell>
  );
}

export function FAQs() {
  return (
    <PageShell title="FAQs" intro="Common questions — replace with salon-approved answers.">
      <div className="max-w-2xl space-y-6">
        {faqs.map((faq) => (
          <details key={faq.question} className="group border-b border-line pb-4">
            <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
              <span className="flex items-start justify-between gap-4">
                {faq.question}
                <span className="text-muted transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}

export function Privacy() {
  return (
    <PageShell title="Privacy Policy" intro="Placeholder legal page.">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Draft privacy policy will be added before launch. This route is reserved so footer links and
        sitemap stay consistent.
      </p>
    </PageShell>
  );
}

export function Terms() {
  return (
    <PageShell title="Terms of Use" intro="Placeholder legal page.">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Draft terms will be added before launch.
      </p>
    </PageShell>
  );
}

export function NotFound() {
  return (
    <PageShell title="Page not found" intro="That page doesn’t exist (yet).">
      <Link to="/" className="text-sm text-blush-deep underline-offset-4 hover:underline">
        Back home
      </Link>
    </PageShell>
  );
}
