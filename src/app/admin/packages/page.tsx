
"use client";

import { useCallback, useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  email: string;
};

type PackageRecord = {
  id: number;
  trackingNumber: string;
  source: "STORE" | "PERSONAL_SHOPPER";
  status: string;
  weight: number;
  createdAt: string;
  user: {
    id?: number;
    name: string;
    email: string;
  };
};

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<PackageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const [trackingNumber, setTrackingNumber] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const [weight, setWeight] = useState("");
    const [source, setSource] = useState<"STORE" | "PERSONAL_SHOPPER">("STORE");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredPackages =
        statusFilter === "ALL"
            ? packages
            : packages.filter((pkg) => pkg.status === statusFilter);

    const searchCustomers = useCallback(async (search: string) => {
    try {
        const response = await fetch(
        `/api/admin/customers?search=${encodeURIComponent(search)}`
        );

        const data = await response.json();

        if (response.ok) {
        setCustomers(data.customers);
        } else {
        setMessage(data.error ?? "Unable to search customers.");
        }
    } catch {
        setMessage("Unable to connect to the server.");
    }
    }, []);


    const loadPackages = useCallback(async () => {
        setLoading(true);

    try {
      const response = await fetch("/api/admin/packages");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Unable to load packages.");
        return;
      }

      setPackages(data.packages);
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);

  useEffect(() => {
  if (!customerDropdownOpen) return;

  const timer = setTimeout(() => {
    void searchCustomers(customerSearch);
  }, 250);

  return () => clearTimeout(timer);
}, [customerSearch, customerDropdownOpen, searchCustomers]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        trackingNumber,
        userId: Number(selectedCustomerId),
        weight: Number(weight),
        source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Unable to register package.");
        return;
      }

        setMessage("Package registered successfully.");
        setTrackingNumber("");
        setSelectedCustomerId("");
        setCustomerSearch("");
        setCustomerDropdownOpen(false);
        setWeight("");
        setSource("STORE");

      await loadPackages();
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }
  
async function updatePackageStatus(
  packageId: number,
  status: string
) {
  setMessage("");

  try {
    const response = await fetch(`/api/admin/packages/${packageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Unable to update package status.");
      return;
    }

    setPackages((current) =>
      current.map((pkg) =>
        pkg.id === packageId ? data.package : pkg
      )
    );

    setMessage("Package status updated successfully.");
  } catch {
    setMessage("Unable to connect to the server.");
  }
}


    
  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <a href="/admin" style={{ color: "#f97316", textDecoration: "none" }}>
          ← Admin Dashboard
        </a>

        <h1 style={{ fontSize: 32, margin: "16px 0 8px" }}>
          Package Management
        </h1>

        <p style={{ color: "#737373", margin: 0 }}>
          Register warehouse arrivals and view customer packages.
        </p>
      </header>

      <section
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 20, marginTop: 0 }}>
          Register Received Package
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
        <label style={{ display: "grid", gap: 8, position: "relative" }}>
            Customer

            <input
                type="text"
                required
                value={customerSearch}
                placeholder="Search by name or email..."
                autoComplete="off"
                onFocus={() => {
                setCustomerDropdownOpen(true);
                }}
                onChange={(event) => {
                setCustomerSearch(event.target.value);
                setSelectedCustomerId("");
                setCustomerDropdownOpen(true);
                }}
                style={inputStyle}
            />

            {customerDropdownOpen && (
                <div
                style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    marginTop: 4,
                    background: "#ffffff",
                    border: "1px solid #d4d4d4",
                    borderRadius: 8,
                    maxHeight: 220,
                    overflowY: "auto",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
                >
                {customers.length === 0 ? (
                    <p style={{ padding: 12, margin: 0, color: "#737373" }}>
                    No customers found.
                    </p>
                ) : (
                    customers.map((customer) => (
                    <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                        setSelectedCustomerId(String(customer.id));
                        setCustomerSearch(
                          `${customer.name} (#${customer.id}) — ${customer.email}`
                        );
                        setCustomerDropdownOpen(false);
                        }}
                        style={{
                        display: "block",
                        width: "100%",
                        padding: 12,
                        border: "none",
                        background:
                            selectedCustomerId === String(customer.id)
                            ? "#fff7ed"
                            : "#ffffff",
                        textAlign: "left",
                        cursor: "pointer",
                        }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong>{customer.name}</strong>
                        <span
                          style={{
                            color: "#737373",
                            fontSize: 12,
                            fontWeight: 400,
                          }}
                        >
                          #{customer.id}
                        </span>
                      </div>

                      <span style={{ color: "#737373", fontSize: 13 }}>
                        {customer.email}
                      </span>
                    </button>
                    ))
                )}
                </div>
            )}
            </label>

          <label style={{ display: "grid", gap: 8 }}>
            Tracking number
            <input
              required
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="Enter tracking number"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            Weight (kg)
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="e.g. 1.25"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            Package source
            <select
              value={source}
              onChange={(event) =>
                setSource(event.target.value as "STORE" | "PERSONAL_SHOPPER")
              }
              style={inputStyle}
            >
              <option value="STORE">Customer purchase</option>
              <option value="PERSONAL_SHOPPER">Personal Shopper</option>
            </select>
          </label>

          <div style={{ alignSelf: "end" }}>
            <button type="submit" disabled={submitting} style={buttonStyle}>
              {submitting ? "Registering..." : "Register Package"}
            </button>
          </div>
        </form>

        {message && (
          <p role="status" style={{ marginBottom: 0 }}>
            {message}
          </p>
        )}
      </section>

      
        <section>
            <div
                style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
                }}
            >
                <h2 style={{ fontSize: 20, margin: 0 }}>
                Packages ({filteredPackages.length})
                </h2>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    style={{ ...inputStyle, width: "auto" }}
                >
                    <option value="ALL">All statuses</option>
                    <option value="INCOMING">Incoming</option>
                    <option value="RECEIVED">Received</option>
                    <option value="READY_TO_SHIP">Ready to ship</option>
                    <option value="SHIPPED">Shipped</option>
                </select>

                <button
                    type="button"
                    onClick={() => void loadPackages()}
                    disabled={loading}
                    style={secondaryButtonStyle}
                >
                    Refresh
                </button>
                </div>
            </div>

        {loading ? (

            <p>Loading packages...</p>
            ) : filteredPackages.length === 0 ? (
            <p style={{ color: "#737373" }}>
                {statusFilter === "ALL"
                ? "No packages registered yet."
                : "No packages match this status."}
            </p>
        ) : (

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                minWidth: 700,
              }}
            >
              <thead>
                <tr>
                  {["Tracking Number", "Customer", "Source", "Weight", "Status"].map(
                    (heading) => (
                      <th key={heading} style={cellStyle}>
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td style={cellStyle}>{pkg.trackingNumber}</td>
                    <td style={cellStyle}>
                      <div>{pkg.user.name}</div>
                      <small style={{ color: "#737373" }}>
                        {pkg.user.email}
                      </small>
                    </td>
                    <td style={cellStyle}>
                      {pkg.source === "STORE" ? "Customer purchase" : "Personal Shopper"}
                    </td>
                    <td style={cellStyle}>{pkg.weight.toFixed(2)} kg</td>
                    
                    <td style={cellStyle}>
                    {pkg.status === "SHIPPED" ? (
                        <span>SHIPPED</span>
                    ) : (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <select
                            id={`status-${pkg.id}`}
                            defaultValue={pkg.status}
                            style={{
                            ...inputStyle,
                            minWidth: 150,
                            padding: "8px",
                            }}
                        >
                            {(
                            pkg.status === "INCOMING"
                                ? ["INCOMING", "RECEIVED"]
                                : pkg.status === "RECEIVED"
                                ? ["RECEIVED", "READY_TO_SHIP"]
                                : ["READY_TO_SHIP", "RECEIVED"]
                            ).map((status) => (
                            <option key={status} value={status}>
                                {status.replaceAll("_", " ")}
                            </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => {
                            const select = document.getElementById(
                                `status-${pkg.id}`
                            ) as HTMLSelectElement | null;

                            if (select && select.value !== pkg.status) {
                                void updatePackageStatus(pkg.id, select.value);
                            }
                            }}
                            style={secondaryButtonStyle}
                        >
                            Save
                        </button>
                        </div>
                    )}
                    </td>

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

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #d4d4d4",
  borderRadius: 8,
  font: "inherit",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 18px",
  background: "#f97316",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "transparent",
  border: "1px solid #d4d4d4",
  borderRadius: 8,
  cursor: "pointer",
};

const cellStyle: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #e5e5e5",
};
