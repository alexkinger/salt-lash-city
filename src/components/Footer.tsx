import { NavLink } from "react-router-dom";
import { useCms } from "@/hooks/CmsProvider";

export function Footer() {
  const { site } = useCms();
  return (
    <footer className="mt-auto bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <img src="/images/brand/logo.png" alt="Salt Lash City" className="h-16 w-16 object-contain" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            Your go-to spot for gorgeous lashes, smooth skin, and a peaceful moment to yourself in
            Sandy, UT.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">Hours</p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
            {site.hours.map((row) => (
              <li key={row.day} className="flex justify-between gap-4">
                <span>{row.day}</span>
                <span>{row.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">Get in touch</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              {site.address.line1}
              <br />
              {site.address.line2}
            </li>
            <li>
              <a href={site.phoneHref} className="hover:text-ink">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-ink">
                {site.email}
              </a>
            </li>
            <li className="flex gap-4 pt-1">
              <a href={site.social.instagram} target="_blank" rel="noreferrer" className="hover:text-ink">
                Instagram
              </a>
              <a href={site.social.facebook} target="_blank" rel="noreferrer" className="hover:text-ink">
                Facebook
              </a>
            </li>
            <li className="pt-2">
              <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-mustard">
                Schedule an Appointment
              </a>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
            <NavLink to="/services" className="hover:text-ink">
              Services
            </NavLink>
            <NavLink to="/about" className="hover:text-ink">
              About
            </NavLink>
            <NavLink to="/testimonials" className="hover:text-ink">
              Testimonials
            </NavLink>
            <NavLink to="/contact" className="hover:text-ink">
              Contact
            </NavLink>
          </div>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4 text-center text-xs text-muted md:px-8">
        © {new Date().getFullYear()} Salt Lash City · saltlashcity.com
      </div>
    </footer>
  );
}
