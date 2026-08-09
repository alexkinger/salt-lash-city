import { Link } from "react-router-dom";
import { BookingBanner, FaqList, PageShell } from "@/components/Page";
import { ContactForm } from "@/components/ContactForm";
import { ReviewsWidget } from "@/components/ReviewsWidget";
import { useCms } from "@/hooks/CmsProvider";
import { buildServiceGraph, buildWebPageGraph } from "@/lib/schema";

export function Services() {
  const { services } = useCms();
  return (
    <PageShell
      eyebrow="Menu"
      title="Services"
      path="/services"
      intro="Eyelash extensions, lifts, tinting, brows, waxing, and facials — priced clearly so you know what to expect."
      description="Browse Salt Lash City services in Sandy, UT: eyelash extensions, lifts, tinting, eyebrow tinting, waxing, and facials."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {services.map((service, index) => {
          const pastel = ["bg-pink-soft", "bg-sage-soft", "bg-sky-soft"][index % 3];
          return (
            <article
              key={service.slug}
              className={`rounded-2xl ${pastel} p-6 shadow-[0_8px_24px_rgb(54_54_54/0.06)]`}
            >
              <h2 className="text-2xl font-bold text-ink">{service.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {service.shortDescription}
              </p>
              <Link to={`/${service.slug}`} className="btn-pink mt-5">
                Learn More
              </Link>
            </article>
          );
        })}
      </div>
      <div className="mt-14">
        <BookingBanner />
      </div>
    </PageShell>
  );
}

export function ServiceDetail({ slug }: { slug: string }) {
  const { services, loading } = useCms();
  const service = services.find((s) => s.slug === slug) || null;

  if (loading && !service) {
    return (
      <PageShell title="Loading…" path="/services">
        <p className="text-sm text-muted">Loading service…</p>
      </PageShell>
    );
  }

  if (!service) {
    return (
      <PageShell
        title="Service not found"
        intro="That service page doesn’t exist."
        path="/services"
        noIndex
      >
        <Link to="/services" className="text-sm font-semibold text-leaf">
          Back to services
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Service"
      title={service.title}
      intro={service.intro}
      path={`/${service.slug}`}
      description={service.shortDescription}
      jsonLd={buildServiceGraph(service)}
    >
      <div className="space-y-10">
        {service.sections.map((section) => (
          <section key={section.heading ?? "items"}>
            {section.heading ? (
              <h2 className="font-bold text-2xl text-ink md:text-3xl">{section.heading}</h2>
            ) : null}
            <ul className={section.heading ? "mt-5 space-y-4" : "space-y-4"}>
              {section.items.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col gap-1 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <div>
                    <p className="font-medium text-ink">{item.name}</p>
                    {item.note ? (
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{item.note}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-bold text-xl text-leaf">{item.price}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {service.careTips?.length ? (
          <section>
            <h2 className="font-bold text-2xl text-ink">Aftercare tips</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {service.careTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {service.faqs?.length ? (
          <section>
            <h2 className="font-bold text-2xl text-ink">FAQs</h2>
            <div className="mt-5">
              <FaqList faqs={service.faqs} />
            </div>
          </section>
        ) : null}

        <BookingBanner
          title={`Book ${service.navLabel.toLowerCase()}`}
          body="Appointments are scheduled through Vagaro. Prefer a question first? Use the contact form."
        />
      </div>
    </PageShell>
  );
}

export function About() {
  const { site } = useCms();
  return (
    <PageShell
      eyebrow="About"
      title="About Blake"
      path="/about"
      intro="Master Esthetician. NIMA graduate. Founder of Salt Lash City in Sandy, UT."
      description="Meet Blake, Master Esthetician and founder of Salt Lash City in Sandy, UT — NIMA graduate offering lashes, waxing, and facials."
      jsonLd={buildWebPageGraph({
        name: "About Blake",
        description:
          "Meet Blake, Master Esthetician and founder of Salt Lash City in Sandy, UT.",
        path: "/about",
        crumbs: [
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ],
      })}
    >
      <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5 text-base leading-relaxed text-ink-soft">
          <p>
            I became a Master Esthetician after studying full-time for 9 months at the National
            Institute of Medical Aesthetics (NIMA). I graduated in July 2017 after completing their
            1,200-hour Master Aesthetics program.
          </p>
          <p>
            I use Lashbomb for all of my lash extension material because of their synthetic mink —
            rather than authentic mink hair.
          </p>
          <p>
            I started this career hoping to help others feel more comfortable in their own skin by
            enhancing their natural beauty with little to no maintenance.
          </p>
          <div>
            <h2 className="font-bold text-2xl text-ink">Certified in</h2>
            <ul className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
              {[
                "Lash lifting and tinting",
                "Classic, hybrid, and volume lash extensions",
                "Speed waxing",
                "Permanent cosmetics",
                "Microblading",
                "Microneedling",
              ].map((item) => (
                <li key={item} className="rounded-full border border-line bg-cream px-4 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="rounded-3xl border border-line bg-cream p-6">
          <p className="font-bold text-2xl text-ink">Visit the studio</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {site.address.line1}
            <br />
            {site.address.line2}
          </p>
          <p className="mt-4 text-sm">
            <a href={site.phoneHref} className="font-semibold text-leaf">
              {site.phone}
            </a>
          </p>
          <p className="mt-2 text-sm">
            <a href={`mailto:${site.email}`} className="font-semibold text-leaf">
              {site.email}
            </a>
          </p>
          <a
            href={site.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-mustard mt-6"
          >
            Schedule an Appointment
          </a>
        </aside>
      </div>
    </PageShell>
  );
}

export function Testimonials() {
  return (
    <PageShell
      eyebrow="Love notes"
      title="Client Reviews"
      path="/testimonials"
      intro="Google and Vagaro reviews, synced into the site so guests (and search engines) can read them."
      description="Read Google and Vagaro client reviews for Salt Lash City in Sandy, UT."
    >
      <ReviewsWidget
        showHeader={false}
        compact
        scrollHeight="lg"
        title="Client Reviews"
      />
      <div className="mt-14">
        <BookingBanner />
      </div>
    </PageShell>
  );
}

export function Contact() {
  const { site } = useCms();
  return (
    <PageShell
      eyebrow="Contact"
      title="Get in touch"
      path="/contact"
      intro="Book online anytime, or send a note about services, fills, or first-visit questions."
      description="Contact Salt Lash City in Sandy, UT or book an appointment online through Vagaro."
      jsonLd={buildWebPageGraph({
        name: "Contact Salt Lash City",
        description:
          "Contact Salt Lash City in Sandy, UT or book an appointment online through Vagaro.",
        path: "/contact",
        crumbs: [
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ],
      })}
    >
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-line bg-cream p-6">
            <p className="font-bold text-2xl text-ink">Studio</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {site.address.line1}
              <br />
              {site.address.line2}
            </p>
            <p className="mt-4 text-sm">
              <a href={site.phoneHref} className="font-semibold text-leaf">
                {site.phone}
              </a>
            </p>
            <p className="mt-2 text-sm">
              <a href={`mailto:${site.email}`} className="font-semibold text-leaf">
                {site.email}
              </a>
            </p>
            <a
              href={site.bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-mustard mt-6"
            >
              Schedule on Vagaro
            </a>
          </div>
          <div className="rounded-3xl border border-line bg-cream p-6">
            <p className="font-bold text-2xl text-ink">Hours</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {site.hours.map((row) => (
                <li key={row.day} className="flex justify-between gap-4">
                  <span>{row.day}</span>
                  <span>{row.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative rounded-3xl border border-line bg-cream p-6 md:p-8">
          <h2 className="font-bold text-2xl text-ink">Send a message</h2>
          <p className="mt-2 text-sm text-muted">
            Prefer email first? This form notifies Blake and stores your request securely.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function NotFound() {
  return (
    <PageShell title="Page not found" intro="That page doesn’t exist (yet)." path="/" noIndex>
      <Link to="/" className="text-sm font-semibold text-leaf">
        Back home
      </Link>
    </PageShell>
  );
}
