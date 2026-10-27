
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReadyPackage = {
  id: number;
  trackingNumber: string;
  weight: number;
};

type Props = {
  packages: ReadyPackage[];
};

export default function CreateShipmentForm({ packages }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [method, setMethod] = useState<"EMS" | "AIR_CARGO">("EMS");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedWeight = packages
    .filter((pkg) => selectedIds.includes(pkg.id))
    .reduce((total, pkg) => total + pkg.weight, 0);

  function togglePackage(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedIds.length === 0 || submitting) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/shipments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageIds: selectedIds,
          method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create shipment.");
      }

      setSuccess("Shipment created successfully.");
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (packages.length === 0) {
    return (
      <p>No packages are currently ready to ship.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gap: "12px" }}>
        {packages.map((pkg) => (
          <label
            key={pkg.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(pkg.id)}
              onChange={() => togglePackage(pkg.id)}
            />

            <span style={{ flex: 1 }}>
              <strong>{pkg.trackingNumber}</strong>
              <br />
              <small>Package ID: {pkg.id}</small>
            </span>

            <strong>{pkg.weight.toFixed(1)} kg</strong>
          </label>
        ))}
      </div>

      <p>
        Selected packages: {selectedIds.length} · Total weight:{" "}
        {selectedWeight.toFixed(1)} kg
      </p>

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="shipping-method">
          Shipping method
        </label>

        <select
          id="shipping-method"
          value={method}
          onChange={(event) =>
            setMethod(event.target.value as "EMS" | "AIR_CARGO")
          }
          style={{
            display: "block",
            width: "100%",
            maxWidth: "320px",
            padding: "10px",
            marginTop: "8px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <option value="EMS">EMS</option>
          <option value="AIR_CARGO">Air Cargo</option>
        </select>
      </div>

      {error && (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      {success && (
        <p role="status" style={{ color: "#18743a" }}>
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={selectedIds.length === 0 || submitting}
        style={{
          padding: "12px 18px",
          border: "none",
          borderRadius: "8px",
          background:
            selectedIds.length === 0 || submitting
              ? "#999"
              : "#d97706",
          color: "#fff",
          fontWeight: 600,
          cursor:
            selectedIds.length === 0 || submitting
              ? "not-allowed"
              : "pointer",
        }}
      >
        {submitting ? "Creating shipment..." : "Create Shipment"}
      </button>
    </form>
  );
}
