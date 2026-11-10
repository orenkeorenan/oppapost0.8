"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WarehousePackageForm() {
  const router = useRouter();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [productName, setProductName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch("/api/account/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingNumber,
          productName,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(data.error ?? "Unable to register package.");
        return;
      }

      setTrackingNumber("");
      setProductName("");
      setNotes("");
      setMessage("Package registered successfully.");

      router.refresh();
    } catch {
      setError(true);
      setMessage("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Register Incoming Package</h2>

      <p>
        Purchased something from a Korean store? Register your tracking
        number so Oppapost knows to expect your package.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 16,
          maxWidth: 600,
        }}
      >
        <label style={{ display: "grid", gap: 8 }}>
          Tracking Number
          <input
            required
            maxLength={200}
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="Enter your Korean store tracking number"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Product Name
          <input
            required
            maxLength={200}
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
            placeholder="What did you purchase?"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Notes
          <textarea
            maxLength={5000}
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Quantity, store name, purchase details, or special instructions..."
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          style={buttonStyle}
        >
          {submitting ? "Submitting..." : "Submit Package"}
        </button>
      </form>

      {message && (
        <p
          role="status"
          style={{
            marginTop: 12,
            color: error ? "#dc2626" : "#16a34a",
          }}
        >
          {message}
        </p>
      )}
    </section>
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
