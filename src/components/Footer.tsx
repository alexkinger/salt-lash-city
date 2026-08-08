import { NavLink } from "react-router-dom";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-[#2a241c] text-[#f7f2ea]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-2xl">Salt Lash City</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Master Esthetician Blake helping you feel comfortable in your own skin — lashes, brows,
            waxing, and facials in Sandy, UT.
          </p>
          <div className="mt-5 flex gap-4 text-sm text-white/80">
            <a href={site.social.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
              Instagram
            </a>
            <a href={site.social.facebook} target="_blank" rel="noreferrer" className="hover:text-white">
              Facebook
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Hours</p>
          <ul className="mt-3 space-y-1.5 text-sm text-white/75">
            {site.hours.map((row) => (
              <li key={row.day} className="flex justify-between gap-4">
                <span>{row.day}</span>
                <span>{row.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Get in touch</p>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>
              {site.address.line1}
              <br />
              {site.address.line2}
            </li>
            <li>
              <a href={site.phoneHref} className="hover:text-white">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="pt-2">
              <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-primary">
                Schedule an Appointment
              </a>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/60">
            <NavLink to="/services" className="hover:text-white">
              Services
            </NavLink>
            <NavLink to="/about" className="hover:text-white">
              About
            </NavLink>
            <NavLink to="/testimonials" className="hover:text-white">
              Testimonials
            </NavLink>
            <NavLink to="/contact" className="hover:text-white">
              Contact
            </NavLink>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-white/45 md:px-8">
        © {new Date().getFullYear()} Salt Lash City · saltlashcity.com
      </div>
    </footer>
  );
}
