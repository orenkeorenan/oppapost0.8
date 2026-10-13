
"use client";

import { useState } from "react";

type SelectablePackage = {
  id: number;
  trackingNumber: string;
  weight: number;
  receivedAt: Date | null;
};

type PackageSelectionProps = {
  packages: SelectablePackage[];
};

export function PackageSelection({
  packages,
}: PackageSelectionProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectedPackages = packages.filter((pkg) =>
    selectedIds.includes(pkg.id)
  );

  const totalWeight = selectedPackages.reduce(
    (total, pkg) => total + pkg.weight,
    0
  );

  function togglePackage(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  }

  return (
    <section>
      <h2>Available Packages</h2>

      {packages.length === 0 ? (
        <p>
          No packages are ready to ship. Packages will appear here once
          they are ready for international delivery.
        </p>
      ) : (
        <>
          {packages.map((pkg) => (
            <label
              className="warehouse-package"
              key={pkg.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(pkg.id)}
                onChange={() => togglePackage(pkg.id)}
              />

              <div style={{ flex: 1 }}>
                <strong>{pkg.trackingNumber}</strong>
                <p>
                  {pkg.receivedAt
                    ? `Received · ${new Date(pkg.receivedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        }
                      )}`
                    : "Received at warehouse"}
                </p>
              </div>

              <strong>{pkg.weight.toFixed(1)} kg</strong>
            </label>
          ))}

          <div style={{ marginTop: "24px" }}>
            <p>
              Selected packages: <strong>{selectedPackages.length}</strong>
            </p>
            <p>
              Total weight: <strong>{totalWeight.toFixed(1)} kg</strong>
            </p>

            <button
              type="button"
              className="button button--brand"
              disabled={selectedPackages.length === 0}
              onClick={() => {
                const packageQuery = selectedIds.join(",");
                window.location.href =
                    `/account/shipments/prepare/address?packages=${packageQuery}`;
            }}
            >
              Continue to Delivery Address
            </button>
          </div>
        </>
      )}
    </section>
  );
}
