"use client"

import { useState } from "react";
import { ArrowRight, Menu, User, X } from "lucide-react";
import { Logo } from "../landing/Logo";
import { Popup } from './../ui/popup/Popup';

type NavbarProps = {
  onAddress: () => void;
};

export function Navbar({ onAddress }: NavbarProps) {

const links = [
  { label: "Shipping", href: "#shipping" },
  { label: "Personal Shopper", href: "#personal-shopper" },
  { label: "Help Center", href: "#contact" },
];

  const [open, setOpen] = useState(false);
  const [isLoginOpen,setIsLoginOpen] = useState(false);

  return (
    <>
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
              className="button button--outline navbar__login navbar__desktop-action"
              onClick={() => setIsLoginOpen(true)}

            >
              <User className="icon icon--sm" aria-hidden="true" /> Login
            </button>
            <button
              type="button"
              className="button button--brand navbar__address navbar__desktop-action"
              onClick={onAddress}
            >
              Get Yours Korean Address
              <ArrowRight className="icon icon--sm" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
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
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </button>
              <button
                type="button"
                className="button button--brand"
                onClick={() => {
                  onAddress();
                  setOpen(false);
                }}
              >
                Get Korean Address
              </button>
            </div>
          </div>
        ) : null}
      </header>
      <Popup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      >
        <div>
          <h2>Login</h2>
          <p>
            Account login is coming soon. You’ll be able to manage
            your Korean address, shipments, and requests here.
          </p>

          <button
            type="button"
            className="button button--brand"
            onClick={() => setIsLoginOpen(false)}
          >
            Got It
          </button>
        </div>
      </Popup>
    </>
  );
}
