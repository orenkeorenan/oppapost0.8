import { Globe } from "lucide-react";
import { Logo } from "../landing/Logo";

export function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer__main">
          <Logo light />

          <nav
            className="footer__nav"
            aria-label="Footer navigation"
          >
            {["Shipping", "Personal Shopper", "Contact"].map((l) => (
              <a
                key={l}
                href="#top"
                className="footer__link"
              >
                {l}
              </a>
            ))}
          </nav>

          <div className="footer__tools">
            <button
              type="button"
              className="footer__language"
            >
              <Globe
                className="icon icon--sm"
                aria-hidden="true"
              />
              English
            </button>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Oppapost. All rights reserved.</p>
          <p>Korean Products. Global Possibilities.</p>
        </div>
      </div>
    </footer>
  );
}
