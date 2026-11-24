"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  ShoppingCart,
  Store,
  Truck,
  Users,
  X,
} from "lucide-react";

type AccountLayoutProps = {
  children: ReactNode;
};

const navigationGroups = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/account", icon: LayoutDashboard },
    ],
  },
  {
    label: "SHOPPING",
    items: [
      { label: "Browse Products", href: "/shopper", icon: Store },
      { label: "Shopping Cart", href: "/account/cart", icon: ShoppingCart },
      { label: "My Orders", href: "/account/orders", icon: ClipboardList },
      { label: "Custom Shopper Requests", href: "/account/shopper", icon: Package },
    ],
  },
  {
    label: "WAREHOUSE & SHIPPING",
    items: [
      { label: "My Korean Address", href: "/account/address", icon: MapPin },
      { label: "Warehouse", href: "/account/warehouse", icon: Package },
      { label: "Shipping Groups", href: "/account/shipping-groups", icon: Users },
      { label: "Shipments", href: "/account/shipments", icon: Truck },
    ],
  },
];

export function AccountLayout({ children }: AccountLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
        <div style={brandRow}>
          <Link href="/account" className="account-sidebar__logo" style={{ marginBottom: 0 }}>
            <span style={{ color: "#2563eb" }}>OPPA</span><span style={{ color: "#ea580c" }}>POST</span>
            <small style={tagline}>KOREA TO YOUR WORLD</small>
          </Link>
          <button
            type="button"
            aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen((open) => !open)}
            style={mobileMenuButton}
            className="account-sidebar__menu-button"
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={isMobileNavOpen ? "account-sidebar__navigation is-open" : "account-sidebar__navigation"}>
          {navigationGroups.map((group) => (
            <section key={group.label} style={navGroup}>
              <p style={groupLabel}>{group.label}</p>
              <nav aria-label={group.label}>
                {group.items.map((item) => {
                  const active = pathname === item.href ||
                    (item.href !== "/account" && pathname.startsWith(item.href + "/"));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setIsMobileNavOpen(false)}
                      style={{
                        ...navLink,
                        ...(active ? activeNavLink : {}),
                      }}
                    >
                      <Icon size={17} strokeWidth={2} />
                      <span>{item.label}</span>
                      {item.href === "/account/cart" && (
                        <span style={cartCount} aria-label="Cart item count">0</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </section>
          ))}
        </div>

        <div className="account-sidebar__footer">
          {error && <p role="alert">{error}</p>}
          <button
            type="button"
            className="button button--outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={16} />
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>

      <main className="account-content">{children}</main>
    </div>
  );
}

const brandRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 34,
};
const tagline: React.CSSProperties = {
  display: "block",
  marginTop: 4,
  color: "#64748b",
  fontSize: 8,
  fontWeight: 700,
  letterSpacing: "1.2px",
};
const mobileMenuButton: React.CSSProperties = {
  display: "none",
  width: 38,
  height: 38,
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  background: "#fff",
  color: "#263a5b",
  cursor: "pointer",
};
const navGroup: React.CSSProperties = { marginBottom: 26 };
const groupLabel: React.CSSProperties = {
  margin: "0 0 10px",
  padding: "0 12px",
  color: "#94a3b8",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1px",
};
const navLink: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 11,
  minHeight: 42,
  padding: "10px 12px",
  borderRadius: 10,
  color: "#475569",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 600,
  transition: "background .15s ease, color .15s ease",
};
const activeNavLink: React.CSSProperties = {
  color: "#fff",
  background: "#ea580c",
  boxShadow: "0 5px 14px rgba(234,88,12,.18)",
};
const cartCount: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 20,
  height: 20,
  marginLeft: "auto",
  padding: "0 6px",
  borderRadius: 999,
  background: "#fff1e8",
  color: "#c2410c",
  fontSize: 10,
  fontWeight: 800,
};
