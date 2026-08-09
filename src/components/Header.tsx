import { NavLink } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCms } from "@/hooks/CmsProvider";

const topLinks = [
  { to: "/about", label: "About" },
  { to: "/testimonials", label: "Testimonials" },
];

export function Header() {
  const { site, services } = useCms();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    if (!open) setServicesOpen(false);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src="/images/brand/logo.png"
            alt="Salt Lash City"
            className="h-12 w-12 object-contain md:h-14 md:w-14"
          />
        </NavLink>

        <nav className="hidden items-center gap-7 lg:flex">
          <div className="group relative">
            <NavLink
              to="/services"
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-1 text-[15px] text-ink transition-colors hover:text-leaf",
                  isActive && "text-leaf",
                )
              }
            >
              Services <ChevronDown size={14} />
            </NavLink>
            <div className="invisible absolute left-0 top-full z-50 w-60 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="border border-line bg-paper p-2 shadow-md">
                {services.map((service) => (
                  <NavLink
                    key={service.slug}
                    to={`/${service.slug}`}
                    className="block px-3 py-2 text-sm text-ink-soft hover:bg-cream hover:text-ink"
                  >
                    {service.navLabel}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          {topLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "text-[15px] text-ink transition-colors hover:text-leaf",
                  isActive && "text-leaf",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="btn-lime-outline">
            Schedule an Appointment
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center border border-line p-2 text-ink lg:hidden"
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
              <button
                type="button"
                className="flex w-full items-center justify-between py-2 text-base text-ink"
                onClick={() => setServicesOpen((v) => !v)}
              >
                Services <ChevronDown size={16} className={cn(servicesOpen && "rotate-180")} />
              </button>
              {servicesOpen ? (
                <ul className="mb-2 ml-3 border-l border-line pl-3">
                  {services.map((service) => (
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
            {topLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className="block py-2 text-base text-ink"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <a
                href={site.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-mustard"
                onClick={() => setOpen(false)}
              >
                Book an Appointment
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
