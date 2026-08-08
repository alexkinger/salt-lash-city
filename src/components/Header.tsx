import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <NavLink to="/" className="font-display text-xl tracking-tight text-ink md:text-2xl">
          Salt Lash City
        </NavLink>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
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
          <NavLink
            to="/contact"
            className="rounded-sm bg-ink px-4 py-2 text-sm text-paper transition-colors hover:bg-ink-soft"
          >
            Book
          </NavLink>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm border border-line p-2 text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-line px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className="block py-1 text-base text-ink-soft"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/contact"
                className="mt-2 inline-flex rounded-sm bg-ink px-4 py-2 text-sm text-paper"
                onClick={() => setOpen(false)}
              >
                Book
              </NavLink>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
