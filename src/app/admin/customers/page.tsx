"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Users } from "lucide-react";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: {
    packages: number;
    shipments: number;
    personalShopperRequests: number;
  };
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async (query: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/customers?search=${encodeURIComponent(query)}`,
        { cache: "no-store" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load customers.");
      }

      setCustomers(data.customers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCustomers(search.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, loadCustomers]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "34px 28px 60px" }}>
      <header style={{ marginBottom: 26 }}>
        <p style={{ margin: "0 0 8px", color: "#f26b38", fontSize: 11, fontWeight: 700, letterSpacing: ".12em" }}>
          CUSTOMER RELATIONSHIPS
        </p>
        <h1 style={{ margin: 0, color: "#172033", fontSize: 30 }}>Customers</h1>
        <p style={{ margin: "8px 0 0", color: "#778195", fontSize: 14 }}>
          Search customer accounts and review their activity across Oppapost.
        </p>
      </header>

      <section style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: 18, border: "1px solid #e7eaf0", borderRadius: 14, background: "#fff" }}>
        <div style={{ display: "grid", width: 42, height: 42, placeItems: "center", borderRadius: 12, color: "#e96837", background: "#fff1eb" }}>
          <Users size={20} />
        </div>
        <div>
          <strong style={{ display: "block", color: "#263449", fontSize: 14 }}>Customer directory</strong>
          <span style={{ color: "#8490a2", fontSize: 12 }}>Showing up to 20 matching customer accounts</span>
        </div>
        <strong style={{ marginLeft: "auto", color: "#263449", fontSize: 22 }}>{customers.length}</strong>
      </section>

      <section style={{ padding: 18, border: "1px solid #e7eaf0", borderRadius: 14, background: "#fff" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Search size={17} style={{ position: "absolute", left: 12, top: 13, color: "#929bab" }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer name or email..."
              aria-label="Search customers"
              style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px 11px 38px", border: "1px solid #dfe4eb", borderRadius: 9, font: "inherit", fontSize: 13, outlineColor: "#f26b38" }}
            />
          </div>
          <button
            type="button"
            onClick={() => void loadCustomers(search.trim())}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid #dfe4eb", borderRadius: 9, color: "#435067", background: "#fff", cursor: "pointer" }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {error && <p role="alert" style={{ padding: 12, borderRadius: 8, color: "#b42318", background: "#fff1f0" }}>{error}</p>}
        {loading ? (
          <p style={{ padding: 24, color: "#778195", textAlign: "center" }}>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p style={{ padding: 24, color: "#778195", textAlign: "center" }}>
            {search ? "No customers match this search." : "No customer accounts found."}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr>
                  {["Customer", "Phone", "Packages", "Shipments", "Shopper requests", "Joined"].map((heading) => (
                    <th key={heading} style={{ padding: "12px 14px", borderBottom: "1px solid #e9edf2", color: "#8993a4", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ padding: "15px 14px", borderBottom: "1px solid #f0f2f5" }}>
                      <strong style={{ display: "block", color: "#263449", fontSize: 13 }}>{customer.name}</strong>
                      <span style={{ color: "#8490a2", fontSize: 12 }}>{customer.email}</span>
                      <small style={{ display: "block", marginTop: 3, color: "#a0a8b5" }}>ID #{customer.id}</small>
                    </td>
                    <td style={{ padding: "15px 14px", borderBottom: "1px solid #f0f2f5", color: "#596579", fontSize: 13 }}>{customer.phone || "—"}</td>
                    <td style={{ padding: "15px 14px", borderBottom: "1px solid #f0f2f5", color: "#263449", fontSize: 13 }}>{customer._count.packages}</td>
                    <td style={{ padding: "15px 14px", borderBottom: "1px solid #f0f2f5", color: "#263449", fontSize: 13 }}>{customer._count.shipments}</td>
                    <td style={{ padding: "15px 14px", borderBottom: "1px solid #f0f2f5", color: "#263449", fontSize: 13 }}>{customer._count.personalShopperRequests}</td>
                    <td style={{ padding: "15px 14px", borderBottom: "1px solid #f0f2f5", color: "#596579", fontSize: 13, whiteSpace: "nowrap" }}>{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
