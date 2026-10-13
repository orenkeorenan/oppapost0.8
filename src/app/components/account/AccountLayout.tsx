
"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AccountLayoutProps = {
  children: ReactNode;
};

const navigation = [
  { label: "Dashboard", href: "/account" },
  { label: "My Address", href: "/account/address" },
  { label: "Warehouse", href: "/account/warehouse" },
  { label: "Shipments", href: "/account/shipments" },
  { label: "Personal Shopper", href: "/account/shopper" },
];

export function AccountLayout({ children }: AccountLayoutProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setIsLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <Link href="/account" className="account-sidebar__logo">
          OPPAPOST
        </Link>

        <nav aria-label="Account navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="account-sidebar__footer">
          {error && <p role="alert">{error}</p>}

          <button
            type="button"
            className="button button--outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>

      <main className="account-content">{children}</main>
    </div>
  );
}
