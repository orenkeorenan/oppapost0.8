
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type WarehousePackage = {
  id: number;
  trackingNumber: string;
  weight: number;
  source: "STORE" | "PERSONAL_SHOPPER";
};

type Props = {
  packages: WarehousePackage[];
};

export default function WarehousePackageList({ packages }: Props) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<number[]>(
    () => packages.map((pkg) => pkg.id)
  );

  const [navigating, setNavigating] = useState(false);

  const selectedPackages = useMemo(
    () => packages.filter((pkg) => selectedIds.includes(pkg.id)),
    [packages, selectedIds]
  );

  const selectedWeight = selectedPackages.reduce(
    (total, pkg) => total + pkg.weight,
    0
  );

  const allSelected =
    packages.length > 0 && selectedIds.length === packages.length;

  function togglePackage(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : packages.map((pkg) => pkg.id));
  }

  function prepareShipment() {
    if (selectedIds.length === 0 || navigating) return;

    setNavigating(true);

    const params = new URLSearchParams({
      packages: selectedIds.join(","),
    });

    router.push(
        `/account/shipments/prepare/address?${params.toString()}`
    );
  }

  if (packages.length === 0) {
    return <p>No packages are currently ready to ship.</p>;
  }

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <p>
          {selectedIds.length} of {packages.length} packages selected
        </p>

        <button type="button" onClick={toggleAll}>
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div
        style={{
            display: "grid",
            gap: "12px",
            maxHeight: "440px",
            overflowY: "auto",
            paddingRight: "6px",
        }}
      >
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
              <small>
                Package #{pkg.id} ·{" "}
                {pkg.source === "PERSONAL_SHOPPER"
                  ? "Oppapost Personal Shopper"
                  : "Personal Purchase"}
              </small>
            </span>

            <strong>{pkg.weight.toFixed(1)} kg</strong>
          </label>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        <div>
          <strong>{selectedIds.length} packages</strong>
          <p style={{ margin: "4px 0 0", color: "#666" }}>
            Total weight: {selectedWeight.toFixed(1)} kg
          </p>
        </div>

        <button
          type="button"
          disabled={selectedIds.length === 0 || navigating}
          onClick={prepareShipment}
          style={{
            padding: "12px 18px",
            border: "none",
            borderRadius: "8px",
            background:
              selectedIds.length === 0 || navigating
                ? "#999"
                : "#d97706",
            color: "#fff",
            fontWeight: 600,
            cursor:
              selectedIds.length === 0 || navigating
                ? "not-allowed"
                : "pointer",
          }}
        >
          {navigating ? "Preparing..." : "Prepare Shipment"}
        </button>
      </div>
    </section>
  );
}
