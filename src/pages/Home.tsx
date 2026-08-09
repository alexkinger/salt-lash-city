import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ReviewsWidget } from "@/components/ReviewsWidget";
import { Seo } from "@/components/Seo";
import { useCms } from "@/hooks/CmsProvider";
import { buildWebPageGraph, getDefaultMeta } from "@/lib/schema";

const serviceCards = [
  {
    title: "Extensions & Lifts",
    href: "/eyelash-extensions",
    image: "/images/brand/extensions-lifts.png",
    bg: "bg-pink-soft",
  },
  {
    title: "Lash & Brow Tint",
    href: "/eyelash-tinting",
    image: "/images/brand/service-tint.png",
    bg: "bg-sage-soft",
  },
  {
    title: "Body Waxing",
    href: "/waxing",
    image: "/images/brand/service-wax.png",
    bg: "bg-sky-soft",
  },
];

const benefits = [
  "Longer-Lasting Lashes",
  "Wake Up Mascara-Free",
  "Reduced Ingrown Hair",
  "Custom Curl & Lift",
  "Smudge-Proof Definition",
  "Low-Maintenance Beauty",
];

function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
    </svg>
  );
}

export function Home() {
  const { site } = useCms();
  const defaultMeta = getDefaultMeta(site);
  const heroSrc = site.heroImagePath || "/images/brand/lash-extensions-home.png";
  return (
    <div>
      <Seo
        title={defaultMeta.title}
        description={defaultMeta.description}
        path="/"
        jsonLd={buildWebPageGraph({
          name: defaultMeta.title,
          description: defaultMeta.description,
          path: "/",
        })}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
          <div>
            <p className="font-script text-2xl text-ink md:text-[1.65rem]">Welcome to</p>
            <h1 className="mt-1 text-5xl font-bold tracking-tight text-ink md:text-6xl">
              {site.name}
            </h1>
            <p className="mt-4 text-lg font-medium text-ink">
              <span aria-hidden="true">👁️ </span>
              Lashes that fit your lifestyle
            </p>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
              Your go-to spot for gorgeous lashes, smooth skin, and a peaceful moment to yourself. I
              focus on enhancing your natural beauty through professional lash extensions and
              precision waxing — in a calm, relaxing, judgment-free space.
            </p>
            <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-mustard mt-7">
              Book an Appointment
            </a>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <div className="blob-teal absolute inset-[8%] rounded-[42%_58%_55%_45%/48%_42%_58%_52%] opacity-80" />
            <div className="absolute inset-[14%] overflow-hidden rounded-[48%_52%_45%_55%/55%_45%_55%_45%] bg-cream shadow-sm">
              <img
                src={heroSrc}
                alt="Lash extensions"
                className="h-full w-full object-cover"
              />
            </div>
            <Sparkle className="sparkle left-[8%] top-[18%] h-5 w-5 animate-pulse" />
            <Sparkle className="sparkle right-[10%] top-[12%] h-7 w-7" />
            <Sparkle className="sparkle bottom-[18%] left-[18%] h-4 w-4" />
            <Sparkle className="sparkle bottom-[22%] right-[14%] h-6 w-6 animate-pulse" />
          </div>
        </div>
      </section>

      {/* What I Do */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage: "url(/images/brand/bg-tools.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="text-center text-4xl font-bold text-ink md:text-5xl">What I Do</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {serviceCards.map((card) => (
              <Link
                key={card.title}
                to={card.href}
                className={`group overflow-hidden rounded-2xl ${card.bg} p-5 shadow-[0_10px_30px_rgb(54_54_54/0.08)] transition hover:-translate-y-0.5`}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white/30">
                  <img
                    src={card.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <h3 className="mt-4 text-xl font-bold text-ink">{card.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-ink-soft">
                  Learn More <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="relative overflow-hidden bg-cream py-16 md:py-22">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] md:px-8">
          <div className="relative mx-auto w-full max-w-[340px]">
            <div className="absolute inset-[-6%] rounded-[42%_58%_60%_40%/48%_40%_60%_52%] bg-ink" />
            <img
              src="/images/brand/blake.png"
              alt="Blake, Master Esthetician"
              className="relative z-[1] mx-auto aspect-square w-[86%] rounded-full object-cover object-top"
            />
          </div>

          <div className="relative">
            <img
              src="/images/brand/eye-line.png"
              alt=""
              className="pointer-events-none absolute -right-2 -top-8 hidden w-28 opacity-80 md:block"
            />
            <p className="font-script text-2xl text-leaf md:text-[1.7rem]">Hi, I&apos;m Blake</p>
            <p className="mt-1 text-sm text-muted">
              Master Esthetician + Lash Artist + Brow Enthusiast
            </p>
            <h2 className="mt-4 text-3xl font-bold text-ink md:text-4xl">About Salt Lash City</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              I created Salt Lash City to be a place where clients feel comfortable, cared for, and
              confident. I specialize in natural-looking lash extensions, precise waxing, and
              results-driven techniques that enhance — not overwhelm — your features.
            </p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              I believe beauty should feel effortless, comfortable, and fun… and yes, you&apos;re
              absolutely allowed to fall asleep during your lash nap.
            </p>
            <Link to="/about" className="btn-pink mt-6">
              Learn More <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits marquee */}
      <section className="overflow-hidden border-y border-line bg-paper py-4">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 px-4 text-sm font-medium tracking-wide text-ink-soft uppercase">
          {[...benefits, ...benefits, ...benefits].map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center gap-10">
              {item}
              <Sparkle className="h-3.5 w-3.5 text-ink" />
            </span>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="text-center text-3xl font-bold text-ink md:text-4xl">
            What Service Is Right for You?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-relaxed text-ink-soft">
            Not sure whether you want classic vs hybrid lashes? Curious about what to expect from
            your first Brazilian wax? These simple guides help you prepare and pick what fits your
            lifestyle.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Lash Extension Guide",
                body: "What to expect, how to prep, how to care for your lashes, and examples of each lash style.",
                href: "/eyelash-extensions",
              },
              {
                title: "Waxing Prep Guide",
                body: "Everything you need to know before and after your wax: exfoliation, hair length, aftercare, and FAQs.",
                href: "/waxing",
              },
              {
                title: "Brow Care Guide",
                body: "Tips for maintaining your shape, how tinting works, and when to schedule touch-ups.",
                href: "/eyebrow-tinting",
              },
            ].map((guide) => (
              <article key={guide.title} className="border border-line bg-cream p-6">
                <h3 className="text-xl font-bold text-ink">{guide.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{guide.body}</p>
                <Link to={guide.href} className="btn-pink mt-5">
                  Learn More <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsWidget
        title="Reviews"
        scrollHeight="sm"
        showTestimonialsLink
      />

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="border border-line bg-cream px-6 py-10 text-center md:px-12">
            <h2 className="text-3xl font-bold text-ink md:text-4xl">Stay Updated</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-ink-soft">
              Ready for your next set, fill, or wax? Book online anytime — or send a note if you
              have questions first.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-mustard">
                Schedule an Appointment
              </a>
              <Link to="/contact" className="btn-pink">
                Contact Blake
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
