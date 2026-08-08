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
      {eyebrow ? <p className="font-script text-xl text-leaf md:text-2xl">{eyebrow}</p> : null}
      <h1 className="mt-2 text-4xl font-bold text-ink md:text-5xl">{title}</h1>
      {intro ? <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{intro}</p> : null}
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
    <section className="border border-line bg-cream px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ink">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-mustard">
            Schedule an Appointment
          </a>
          <Link to="/contact" className="btn-pink">
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
              <span className="text-pink transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
