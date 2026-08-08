import { NavLink } from "react-router-dom";
import { services } from "@/data/services";

export function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgb(26_20_16/0.55),rgb(26_20_16/0.2)),url('https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-20">
          <p className="font-display text-5xl leading-[0.95] text-paper md:text-7xl">
            Salt Lash City
          </p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-paper/90 md:text-lg">
            Placeholder hero. Final photography, headline, and CTA come from your Figma.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <NavLink
              to="/contact"
              className="rounded-sm bg-paper px-5 py-3 text-sm font-medium text-ink"
            >
              Request an appointment
            </NavLink>
            <NavLink
              to="/services"
              className="rounded-sm border border-paper/40 px-5 py-3 text-sm text-paper"
            >
              View services
            </NavLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <h2 className="font-display text-3xl text-ink md:text-4xl">Services</h2>
        <p className="mt-3 max-w-xl text-muted">
          Temporary service cards so the site structure is ready before designs land.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <article key={service.slug} className="border-t border-line pt-5">
              <h3 className="font-display text-2xl text-ink">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{service.shortDescription}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
