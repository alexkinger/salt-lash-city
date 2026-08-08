import { Link } from "react-router-dom";
import { BookingBanner } from "@/components/Page";
import { homeServiceHighlights, site } from "@/data/site";
import { testimonials } from "@/data/testimonials";

const gallery = [
  { src: "/images/classic-1.jpg", label: "Classic" },
  { src: "/images/classic-2.jpg", label: "Classic" },
  { src: "/images/hybrid-1.jpg", label: "Hybrid" },
  { src: "/images/volume-1.jpg", label: "Volume" },
  { src: "/images/volume-2.jpg", label: "Volume" },
  { src: "/images/volume-3.jpg", label: "Volume" },
];

export function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero.jpg)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgb(42_36_28/0.78),rgb(42_36_28/0.28))]" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-20">
          <p className="section-kicker !text-gold">Sandy, Utah</p>
          <h1 className="mt-3 max-w-xl font-display text-5xl leading-[0.95] text-cream md:text-7xl">
            Welcome to Salt Lash City
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-cream/90 md:text-lg">
            Master Esthetician Blake — eyelash extensions, lifts, tinting, waxing, and facials that
            enhance your natural beauty with little maintenance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-primary">
              Schedule an Appointment
            </a>
            <Link to="/services" className="btn-secondary">
              View Services
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <p className="section-kicker">What I offer</p>
        <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Signature services</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {homeServiceHighlights.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-line bg-cream p-7 transition hover:border-olive/40"
            >
              <img src={item.icon} alt="" className="h-14 w-14 object-contain" />
              <h3 className="mt-5 font-display text-2xl text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
              <Link to={item.href} className="mt-5 inline-flex text-sm font-semibold text-olive">
                Learn more →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-paper-deep/50 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-[1.1fr_0.9fr] md:px-8">
          <div>
            <p className="section-kicker">Get to know me</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Hi, I’m Blake</h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              I’m a Master Esthetician and I love helping others feel comfortable in their own skin
              by enhancing their natural beauty with little to no maintenance.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted">
              After studying full-time for 9 months at NIMA and graduating in 2017, I built Salt Lash
              City around careful technique, a calming studio, and results that feel like you —
              just brighter.
            </p>
            <Link to="/about" className="btn-outline mt-7">
              About Blake
            </Link>
          </div>
          <div className="rounded-3xl border border-line bg-cream p-8">
            <p className="font-display text-2xl text-ink">Studio hours</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-soft">
              {site.hours.map((row) => (
                <li key={row.day} className="flex justify-between gap-4 border-b border-line/80 py-2">
                  <span>{row.day}</span>
                  <span>{row.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">My work</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Classic · Hybrid · Volume</h2>
          </div>
          <Link to="/eyelash-extensions" className="hidden text-sm font-semibold text-olive sm:inline">
            See lash services →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {gallery.map((shot) => (
            <figure key={shot.src} className="overflow-hidden rounded-2xl">
              <img
                src={shot.src}
                alt={`${shot.label} lashes by Salt Lash City`}
                className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-[1.03]"
              />
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="section-kicker">Kind words</p>
          <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
            What my clients are saying
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {testimonials.slice(0, 4).map((t) => (
              <blockquote
                key={t.name}
                className="rounded-3xl border border-line bg-paper px-6 py-6"
              >
                <p className="text-sm leading-relaxed text-ink-soft">“{t.quote}”</p>
                <footer className="mt-4 flex items-center gap-3">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : null}
                  <cite className="not-italic text-sm font-semibold text-ink">{t.name}</cite>
                </footer>
              </blockquote>
            ))}
          </div>
          <Link to="/testimonials" className="btn-outline mt-8">
            More testimonials
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <BookingBanner />
      </section>
    </div>
  );
}
