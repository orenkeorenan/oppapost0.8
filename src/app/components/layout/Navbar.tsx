"use client"

import { useState } from "react";
import { ArrowRight, Menu, User, X } from "lucide-react";
import { Logo } from "../landing/Logo";

const links = [
  { label: "Shipping", href: "#shipping" },
  { label: "Personal Shopper", href: "#personal-shopper" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand-group">
          <a href="#top" className="navbar__logo-link">
            <Logo />
          </a>
          <nav className="navbar__desktop-nav" aria-label="Main">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="navbar__link"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="navbar__actions">
          <button
            type="button"
            className="button button--outline navbar__login"
          >
            <User className="icon icon--sm" aria-hidden="true" /> Login
          </button>
          <button
            type="button"
            className="button button--brand navbar__address"
          >
            Get Korean Address <ArrowRight className="icon icon--sm" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="navbar__menu-button"
          >
            {open ? <X className="icon" /> : <Menu className="icon" />}
          </button>


        </div>
      </div>

      {open ? (
        <div className="navbar__mobile-panel">
          <nav className="navbar__mobile-nav" aria-label="Mobile">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="navbar__mobile-link"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="navbar__mobile-actions">
            <button
              type="button"
              className="button button--outline"
            >
              Login
            </button>
            <button
              type="button"
              className="button button--brand"
            >
              Get Korean Address
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
