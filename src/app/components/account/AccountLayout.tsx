"use client";

import Link from "next/link";
import type { ReactNode } from "react";

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
      </aside>

      <main className="account-content">{children}</main>
    </div>
  );
}
