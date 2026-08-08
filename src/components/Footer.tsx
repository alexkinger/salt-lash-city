import { NavLink } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-deep/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-2xl text-ink">Salt Lash City</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Placeholder brand copy. Final studio story, address, and hours will come from your
            content and Figma.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <NavLink to="/services">Services</NavLink>
            </li>
            <li>
              <NavLink to="/gallery">Gallery</NavLink>
            </li>
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <NavLink to="/privacy">Privacy</NavLink>
            </li>
            <li>
              <NavLink to="/terms">Terms</NavLink>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4 text-center text-xs text-muted md:px-8">
        © {new Date().getFullYear()} Salt Lash City · saltlashcity.com
      </div>
    </footer>
  );
}
