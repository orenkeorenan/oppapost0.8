
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ShipmentDetail = {
  id: number;
  trackingNumber: string;
  method: string;
  weight: number;
  status: string;
  createdAt: string;
  shippedAt: string | null;
  estimatedArrival: string | null;
  deliveredAt: string | null;
  recipientName: string | null;
  deliveryPhone: string | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryPostalCode: string | null;
  deliveryCountry: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  packages: {
    package: {
      id: number;
      trackingNumber: string;
      source: string;
      status: string;
      weight: number;
      receivedAt: string | null;
    };
  }[];
};

export default function AdminShipmentDetailPage() {
    const params = useParams<{ id: string }>();
    const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const loadShipment = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
        const response = await fetch(`/api/admin/shipments/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load shipment.");
        }

        setShipment(data.shipment);
        } catch (err) {
        setError(
            err instanceof Error ? err.message : "Something went wrong."
        );
        } finally {
        setLoading(false);
        }
    }, [params.id]);

    const markAsDelivered = async () => {
        if (!shipment || updatingStatus) return;

        const confirmed = window.confirm(
            `Mark shipment ${shipment.trackingNumber} as delivered?`
        );

        if (!confirmed) return;

        setUpdatingStatus(true);
        setStatusMessage("");
        setError("");

        try {
            const response = await fetch(
            `/api/admin/shipments/${shipment.id}/status`,
            {
                method: "PATCH",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "DELIVERED" }),
            }
            );

            const data = await response.json();

            if (!response.ok) {
            throw new Error(data.error || "Unable to update shipment status.");
            }

            setStatusMessage("Shipment marked as delivered successfully.");
            await loadShipment();
        } catch (err) {
            setError(
            err instanceof Error ? err.message : "Something went wrong."
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    useEffect(() => {
        loadShipment();
    }, [loadShipment]);

    const formatDate = (value: string | null) => {
        if (!value) return "—";

        return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        });
    };

    const DetailRow = ({
        label,
        value,
    }: {
        label: string;
        value: string | number | null;
    }) => (
        <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
        <div style={{ color: "#777", fontSize: "13px", marginBottom: "5px" }}>
            {label}
        </div>
        <div style={{ fontWeight: 500 }}>{value ?? "—"}</div>
        </div>
    );

    if (loading) {
        return <main style={{ padding: "32px" }}>Loading shipment...</main>;
    }

    if (error || !shipment) {
        return (
        <main style={{ padding: "32px" }}>
            <p role="alert" style={{ color: "#b42318" }}>
            {error || "Shipment not found."}
            </p>
            <Link href="/admin/shipments">← Back to shipments</Link>
        </main>
        );
    }

  return (
    <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <Link
        href="/admin/shipments"
        style={{ display: "inline-block", marginBottom: "20px" }}
      >
        ← Back to shipments
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>
            Shipment Details
          </h1>
          <p style={{ color: "#777", marginTop: "8px" }}>
            {shipment.trackingNumber}
          </p>
        </div>

        <span
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            background:
              shipment.status === "DELIVERED" ? "#e8f7ec" : "#fff4df",
            color: shipment.status === "DELIVERED" ? "#18743a" : "#8a5700",
          }}
        >
          {shipment.status === "SHIPPING" ? "In transit" : shipment.status}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        <section style={{ border: "1px solid #eee", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontSize: "18px", marginTop: 0 }}>Customer</h2>
          <DetailRow label="Name" value={shipment.user.name} />
          <DetailRow label="Email" value={shipment.user.email} />
          <DetailRow label="Account ID" value={shipment.user.id} />
          <DetailRow label="Account phone" value={shipment.user.phone} />
        </section>

        <section style={{ border: "1px solid #eee", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontSize: "18px", marginTop: 0 }}>Delivery Address</h2>
          <DetailRow label="Recipient" value={shipment.recipientName} />
          <DetailRow label="Phone" value={shipment.deliveryPhone} />
          <DetailRow label="Address" value={shipment.deliveryAddress} />
          <DetailRow label="City" value={shipment.deliveryCity} />
          <DetailRow label="State / Province" value={shipment.deliveryState} />
          <DetailRow label="Postal code" value={shipment.deliveryPostalCode} />
          <DetailRow label="Country" value={shipment.deliveryCountry} />
        </section>

        <section style={{ border: "1px solid #eee", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontSize: "18px", marginTop: 0 }}>Shipping Information</h2>
          <DetailRow label="Tracking number" value={shipment.trackingNumber} />
          <DetailRow label="Method" value={shipment.method.replaceAll("_", " ")} />
          <DetailRow label="Total weight" value={`${shipment.weight} kg`} />
          <DetailRow label="Status" value={shipment.status} />
          <DetailRow label="Created" value={formatDate(shipment.createdAt)} />
          <DetailRow label="Shipped" value={formatDate(shipment.shippedAt)} />
          <DetailRow label="Estimated arrival" value={formatDate(shipment.estimatedArrival)} />
          <DetailRow label="Delivered" value={formatDate(shipment.deliveredAt)} />
        </section>
      </div>

      <section
        style={{
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h2 style={{ fontSize: "18px", marginTop: 0 }}>
          Included Packages ({shipment.packages.length})
        </h2>

        {shipment.packages.length === 0 ? (
          <p style={{ color: "#777" }}>No packages linked to this shipment.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8f8f8" }}>
                  {["Package tracking", "Source", "Weight", "Status", "Received"].map(
                    (heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #eee",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {shipment.packages.map(({ package: pkg }) => (
                  <tr key={pkg.id}>
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                      {pkg.trackingNumber}
                    </td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                      {pkg.source.replaceAll("_", " ")}
                    </td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                      {pkg.weight} kg
                    </td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                      {pkg.status.replaceAll("_", " ")}
                    </td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                      {formatDate(pkg.receivedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {shipment.status === "SHIPPING" && (
            <div style={{ marginBottom: "24px" }}>
                <button
                type="button"
                onClick={markAsDelivered}
                disabled={updatingStatus}
                style={{
                    padding: "11px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background: updatingStatus ? "#999" : "#18743a",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: updatingStatus ? "wait" : "pointer",
                }}
                >
                {updatingStatus ? "Updating..." : "Mark as Delivered"}
                </button>
            </div>
            )}

            {statusMessage && (
            <p role="status" style={{ color: "#18743a", marginBottom: "16px" }}>
                {statusMessage}
            </p>
        )}
      </section>
    </main>
  );
}
