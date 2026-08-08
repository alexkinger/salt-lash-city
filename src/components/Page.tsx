import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { site } from "@/data/site";

export function PageShell({
  title,
  intro,
  children,
  eyebrow,
}: {
  title: string;
  intro?: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">{title}</h1>
      {intro ? <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{intro}</p> : null}
      <div className="mt-10 md:mt-12">{children}</div>
    </div>
  );
}

export function BookingBanner({
  title = "Ready to book?",
  body = "Schedule online through Vagaro, or send a message and Blake will follow up.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="rounded-3xl bg-olive px-6 py-8 text-white md:px-10 md:py-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-3xl">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={site.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-cream px-5 py-3 text-sm font-semibold text-ink"
          >
            Schedule an Appointment
          </a>
          <Link to="/contact" className="rounded-full border border-white/35 px-5 py-3 text-sm font-semibold">
            Contact Blake
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FaqList({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  if (!faqs.length) return null;
  return (
    <div className="max-w-2xl space-y-4">
      {faqs.map((faq) => (
        <details key={faq.question} className="group border-b border-line pb-4">
          <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
            <span className="flex items-start justify-between gap-4">
              {faq.question}
              <span className="text-olive transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
