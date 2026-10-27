
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ConfirmShipmentButtonProps = {
  packageIds: number[];
  method: "EMS" | "AIR_CARGO";
};

export function ConfirmShipmentButton({
  packageIds,
  method,
}: ConfirmShipmentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  
  async function handleConfirm() {
    if (loading) return;

    const confirmed = window.confirm(
      "Create this shipment using the selected packages and shipping method? Please make sure your delivery address and package details are correct."
    );

    if (!confirmed) return;

    setLoading(true);

    setError("");

    try {
      const response = await fetch("/api/shipments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageIds, method }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to create shipment.");
        return;
      }

      router.push("/account/shipments");
      router.refresh();
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="button button--brand"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? "Creating Shipment..." : "Confirm Shipment"}
      </button>

      {error && (
        <p role="alert" style={{ marginTop: "12px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
