import { NavLink } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { servicePages, site } from "@/data/site";

const topLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/testimonials", label: "Testimonials" },
];

const eyelashLinks = servicePages.filter((s) => s.group === "eyelashes");
const otherServiceLinks = servicePages.filter((s) => s.group !== "eyelashes");

export function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    if (!open) setServicesOpen(false);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src="/images/logo.png"
            alt="Salt Lash City"
            className="h-11 w-11 rounded-full object-cover md:h-12 md:w-12"
          />
          <span className="font-display text-xl tracking-tight text-ink md:text-2xl">
            Salt Lash City
          </span>
        </NavLink>

        <nav className="hidden items-center gap-6 lg:flex">
          {topLinks.slice(0, 1).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "text-sm tracking-wide text-muted transition-colors hover:text-ink",
                  isActive && "text-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="group relative">
            <NavLink
              to="/services"
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-1 text-sm tracking-wide text-muted transition-colors hover:text-ink",
                  isActive && "text-ink",
                )
              }
            >
              Services <ChevronDown size={14} />
            </NavLink>
            <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-2xl border border-line bg-cream p-3 shadow-lg shadow-ink/5">
                <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-olive">
                  Eyelashes
                </p>
                {eyelashLinks.map((service) => (
                  <NavLink
                    key={service.slug}
                    to={`/${service.slug}`}
                    className="block rounded-lg px-2 py-1.5 text-sm text-ink-soft hover:bg-paper-deep"
                  >
                    {service.navLabel}
                  </NavLink>
                ))}
                <div className="my-2 border-t border-line" />
                {otherServiceLinks.map((service) => (
                  <NavLink
                    key={service.slug}
                    to={`/${service.slug}`}
                    className="block rounded-lg px-2 py-1.5 text-sm text-ink-soft hover:bg-paper-deep"
                  >
                    {service.navLabel}
                  </NavLink>
                ))}
                <NavLink
                  to="/services"
                  className="mt-1 block rounded-lg px-2 py-1.5 text-sm font-semibold text-olive"
                >
                  All services
                </NavLink>
              </div>
            </div>
          </div>

          {topLinks.slice(1).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "text-sm tracking-wide text-muted transition-colors hover:text-ink",
                  isActive && "text-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Book
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-line p-2 text-ink lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-line px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            <li>
              <NavLink to="/" className="block py-2 text-base text-ink" onClick={() => setOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center justify-between py-2 text-base text-ink"
                onClick={() => setServicesOpen((v) => !v)}
              >
                Services <ChevronDown size={16} className={cn(servicesOpen && "rotate-180")} />
              </button>
              {servicesOpen ? (
                <ul className="mb-2 ml-3 border-l border-line pl-3">
                  <li>
                    <NavLink
                      to="/services"
                      className="block py-1.5 text-sm text-ink-soft"
                      onClick={() => setOpen(false)}
                    >
                      All services
                    </NavLink>
                  </li>
                  {servicePages.map((service) => (
                    <li key={service.slug}>
                      <NavLink
                        to={`/${service.slug}`}
                        className="block py-1.5 text-sm text-ink-soft"
                        onClick={() => setOpen(false)}
                      >
                        {service.navLabel}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
            <li>
              <NavLink
                to="/about"
                className="block py-2 text-base text-ink"
                onClick={() => setOpen(false)}
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/testimonials"
                className="block py-2 text-base text-ink"
                onClick={() => setOpen(false)}
              >
                Testimonials
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className="block py-2 text-base text-ink"
                onClick={() => setOpen(false)}
              >
                Contact
              </NavLink>
            </li>
            <li className="pt-2">
              <a
                href={site.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                onClick={() => setOpen(false)}
              >
                Schedule an Appointment
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
