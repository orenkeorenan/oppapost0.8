import { Globe } from "lucide-react";
import { Logo } from "../landing/Logo";

const footerLinks = [
  { label: "Shipping", href: "#shipping" },
  { label: "Personal Shopper", href: "#personal-shopper" },
  { label: "Contact", href: "#contact" },
];

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
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="footer__link"
              >
                {link.label}
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
