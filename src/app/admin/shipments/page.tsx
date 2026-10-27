
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ShipmentRecord = {
  id: number;
  trackingNumber: string;
  method: "EMS" | "AIR_CARGO" | "SEA_CARGO";
  weight: number;
  status: "PENDING_DISPATCH" | "SHIPPING" | "DELIVERED";
  createdAt: string;
  shippedAt: string | null;
  estimatedArrival: string | null;
  deliveredAt: string | null;
  deliveryCountry: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
  packages: {
    package: {
      trackingNumber: string;
      weight: number;
      status: string;
    };
  }[];
};

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/shipments");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load shipments.");
      }

      setShipments(data.shipments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const filteredShipments = shipments.filter((shipment) => {
    const matchesStatus =
      statusFilter === "ALL" || shipment.status === statusFilter;

    const searchText = search.toLowerCase().trim();
    const matchesSearch =
      !searchText ||
      shipment.trackingNumber.toLowerCase().includes(searchText) ||
      shipment.user.name.toLowerCase().includes(searchText) ||
      shipment.user.email.toLowerCase().includes(searchText) ||
      (shipment.deliveryCountry ?? "").toLowerCase().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  const formatDate = (value: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status: ShipmentRecord["status"]) => {
    switch (status) {
      case "PENDING_DISPATCH":
        return "Pending dispatch";
      case "SHIPPING":
        return "In transit";
      case "DELIVERED":
        return "Delivered";
    }
  };

  const getStatusStyle = (status: ShipmentRecord["status"]) => {
    switch (status) {
      case "PENDING_DISPATCH":
        return { background: "#fff4df", color: "#8a5700" };
      case "SHIPPING":
        return { background: "#e8f0ff", color: "#2457a7" };
      case "DELIVERED":
        return { background: "#e8f7ec", color: "#18743a" };
    }
  };

  return (
    <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>
            Shipment Management
          </h1>
          <p style={{ color: "#777", marginTop: "8px" }}>
            View and track customer shipments.
          </p>
        </div>

        <button
          type="button"
          onClick={loadShipments}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            background: "#fff",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tracking, customer, email, or country..."
          style={{
            flex: "1 1 280px",
            minWidth: 0,
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING_DISPATCH">Pending dispatch</option>
          <option value="SHIPPING">In transit</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            padding: "16px",
            border: "1px solid #eee",
            borderRadius: "10px",
            minWidth: "150px",
          }}
        >
          <p style={{ color: "#777", margin: 0 }}>Total shipments</p>
          <strong style={{ fontSize: "24px" }}>{shipments.length}</strong>
        </div>

        <div
          style={{
            padding: "16px",
            border: "1px solid #eee",
            borderRadius: "10px",
            minWidth: "150px",
          }}
        >
          <p style={{ color: "#777", margin: 0 }}>Pending dispatch</p>
          <strong style={{ fontSize: "24px" }}>
            {
              shipments.filter(
                (shipment) => shipment.status === "PENDING_DISPATCH"
              ).length
            }
          </strong>
        </div>

        <div
          style={{
            padding: "16px",
            border: "1px solid #eee",
            borderRadius: "10px",
            minWidth: "150px",
          }}
        >
          <p style={{ color: "#777", margin: 0 }}>In transit</p>
          <strong style={{ fontSize: "24px" }}>
            {
              shipments.filter(
                (shipment) => shipment.status === "SHIPPING"
              ).length
            }
          </strong>
        </div>

        <div
          style={{
            padding: "16px",
            border: "1px solid #eee",
            borderRadius: "10px",
            minWidth: "150px",
          }}
        >
          <p style={{ color: "#777", margin: 0 }}>Delivered</p>
          <strong style={{ fontSize: "24px" }}>
            {
              shipments.filter(
                (shipment) => shipment.status === "DELIVERED"
              ).length
            }
          </strong>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "#fff1f0",
            color: "#b42318",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading shipments...</p>
      ) : filteredShipments.length === 0 ? (
        <p style={{ color: "#777" }}>
          {shipments.length === 0
            ? "No shipments have been created yet."
            : "No shipments match your search or status filter."}
        </p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #eee",
            borderRadius: "10px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1000px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#f8f8f8" }}>
                {[
                  "Tracking number",
                  "Customer",
                  "Destination",
                  "Method",
                  "Weight",
                  "Packages",
                  "Status",
                  "Created",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                      fontWeight: 600,
                    }}
                  >
                    <Link
                      href={`/admin/shipments/${shipment.id}`}
                      style={{
                        color: "#d97706",
                        textDecoration: "none",
                      }}
                    >
                      {shipment.trackingNumber}
                    </Link>
                  </td>

                  <td
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div>{shipment.user.name}</div>
                    <small style={{ color: "#777" }}>
                      {shipment.user.email}
                    </small>
                  </td>

                  <td
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {shipment.deliveryCountry || "—"}
                  </td>

                  <td
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {shipment.method.replaceAll("_", " ")}
                  </td>

                  <td
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {shipment.weight} kg
                  </td>

                  <td
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {shipment.packages.length}
                  </td>

                  <td
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "5px 9px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        ...getStatusStyle(shipment.status),
                      }}
                    >
                      {getStatusLabel(shipment.status)}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(shipment.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
