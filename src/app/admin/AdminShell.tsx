"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PackageCheck,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Product Catalog", href: "/admin/products", icon: ShoppingBag },
  { label: "Packages", href: "/admin/packages", icon: Package },
  { label: "Shipments", href: "/admin/shipments", icon: PackageCheck },
  { label: "Customers", href: "/admin/customers", icon: Users },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <span className="admin-brand__mark">O</span>
          <span>
            <strong>OPPAPOST</strong>
            <small>ADMIN WORKSPACE</small>
          </span>
        </Link>

        <div className="admin-sidebar__label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav__link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.9} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__status" />
          Admin workspace
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar__eyebrow">OPPAPOST OPERATIONS</span>
            <span className="admin-topbar__title">Management</span>
          </div>
        </header>

        <div className="admin-subnav" aria-label="Section navigation" />

        <div className="admin-page-content">{children}</div>
      </div>

      <style jsx global>{`
        .admin-shell {
          display: grid;
          grid-template-columns: 248px minmax(0, 1fr);
          min-height: 100vh;
          color: #172033;
          background: #f7f8fa;
        }
        .admin-sidebar {
          position: sticky;
          top: 0;
          display: flex;
          height: 100vh;
          flex-direction: column;
          padding: 26px 18px 18px;
          color: #e8edf5;
          background: #172235;
          border-right: 1px solid #26354b;
        }
        .admin-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 2px 8px 30px;
          color: inherit;
          text-decoration: none;
        }
        .admin-brand__mark {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border-radius: 11px;
          color: #fff;
          background: #f26b38;
          font-size: 20px;
          font-weight: 800;
        }
        .admin-brand strong, .admin-brand small { display: block; }
        .admin-brand strong { font-size: 14px; letter-spacing: .08em; }
        .admin-brand small {
          margin-top: 4px;
          color: #8f9db1;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .13em;
        }
        .admin-sidebar__label {
          padding: 0 12px 10px;
          color: #8492a8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
        }
        .admin-nav { display: grid; gap: 5px; }
        .admin-nav__link {
          display: flex;
          min-height: 44px;
          align-items: center;
          gap: 12px;
          padding: 0 12px;
          border: 1px solid transparent;
          border-radius: 10px;
          color: #b7c2d2;
          font-size: 13px;
          font-weight: 550;
          text-decoration: none;
          transition: background 150ms ease, color 150ms ease;
        }
        .admin-nav__link:hover { color: #fff; background: #223149; }
        .admin-nav__link.is-active {
          color: #fff;
          background: #2b3b52;
          border-color: #3a4a60;
          box-shadow: inset 3px 0 0 #f26b38;
        }
        .admin-nav__link.is-active svg { color: #ff986f; }
        .admin-sidebar__footer {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: auto;
          padding: 16px 10px 4px;
          border-top: 1px solid #2b394d;
          color: #8f9db1;
          font-size: 11px;
        }
        .admin-sidebar__status {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #42c58a;
        }
        .admin-main { min-width: 0; }
        .admin-topbar {
          display: flex;
          min-height: 68px;
          align-items: center;
          justify-content: space-between;
          padding: 12px 32px;
          border-bottom: 1px solid #e8ebf0;
          background: #fff;
        }
        .admin-topbar__eyebrow, .admin-topbar__title { display: block; }
        .admin-topbar__eyebrow {
          color: #929bab;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .14em;
        }
        .admin-topbar__title {
          margin-top: 3px;
          color: #263449;
          font-size: 14px;
          font-weight: 650;
        }
        .admin-subnav {
          height: 48px;
          border-bottom: 1px solid #e8ebf0;
          background: #fff;
        }
        .admin-page-content { min-width: 0; }
        @media (max-width: 760px) {
          .admin-shell { grid-template-columns: minmax(0, 1fr); }
          .admin-sidebar { position: relative; height: auto; padding: 14px 14px 12px; }
          .admin-brand { padding: 0 4px 14px; }
          .admin-sidebar__label, .admin-sidebar__footer { display: none; }
          .admin-nav {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 2px;
          }
          .admin-nav__link {
            min-height: 40px;
            flex: 0 0 auto;
            padding: 0 11px;
            font-size: 12px;
          }
          .admin-topbar { min-height: 58px; padding: 10px 18px; }
          .admin-subnav { height: 40px; }
        }
      `}</style>
    </div>
  );
}
