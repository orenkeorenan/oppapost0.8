
"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Menu, User, X } from "lucide-react";
import { Logo } from "../landing/Logo";
import { Popup } from "./../ui/popup/Popup";

type NavbarProps = {
  onAddress: () => void;
};

type AuthMode = "login" | "register";

export function Navbar({ onAddress }: NavbarProps) {
  const links = [
    { label: "Shipping", href: "#shipping" },
    { label: "Personal Shopper", href: "#personal-shopper" },
    { label: "Help Center", href: "#contact" },
  ];

  const [open, setOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const openLogin = () => {
    setMode("login");
    setError("");
    setSuccess("");
    setIsLoginOpen(true);
    setOpen(false);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Unable to log in. Please try again.");
        return;
      }

      setIsLoginOpen(false);
      window.location.href = "/account";
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Unable to create your account.");
        return;
      }

      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setSuccess("Account created successfully. You can now log in.");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar__inner">
          <div className="navbar__brand-group">
            <a href="#top" className="navbar__logo-link">
              <Logo />
            </a>

            <nav className="navbar__desktop-nav" aria-label="Main">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="navbar__link"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="navbar__actions">
            <button
              type="button"
              className="button button--outline navbar__login navbar__desktop-action"
              onClick={openLogin}
            >
              <User className="icon icon--sm" aria-hidden="true" />
              Login
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
              onClick={() => setOpen((value) => !value)}
              className="navbar__menu-button"
            >
              {open ? <X className="icon" /> : <Menu className="icon" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="navbar__mobile-panel">
            <nav className="navbar__mobile-nav" aria-label="Mobile">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="navbar__mobile-link"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="navbar__mobile-actions">
              <button
                type="button"
                className="button button--outline"
                onClick={openLogin}
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
        )}
      </header>

      <Popup
        isOpen={isLoginOpen}
        onClose={() => {
          if (!isLoading) setIsLoginOpen(false);
        }}
      >
        <div>
          <h2>{mode === "login" ? "Welcome Back" : "Create Your Account"}</h2>
          <p>
            {mode === "login"
              ? "Log in to manage your Korean address, packages, and shipments."
              : "Create an Oppapost account to manage your packages and shipments."}
          </p>

          {success && (
            <p role="status" aria-live="polite">
              {success}
            </p>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin}>
              <div>
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && <p role="alert">{error}</p>}

              <button
                type="submit"
                className="button button--brand"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  disabled={isLoading}
                >
                  Create Account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div>
                <label htmlFor="register-name">Full Name</label>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={72}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={isLoading}
                />
                <small>Use 12–72 characters.</small>
              </div>

              <div>
                <label htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={72}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && <p role="alert">{error}</p>}

              <button
                type="submit"
                className="button button--brand"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>

              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  disabled={isLoading}
                >
                  Log In
                </button>
              </p>
            </form>
          )}
        </div>
      </Popup>
    </>
  );
}
