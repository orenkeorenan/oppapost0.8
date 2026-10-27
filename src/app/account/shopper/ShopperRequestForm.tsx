
"use client";

import { useState, type FormEvent } from "react";

export function ShopperRequestForm() {
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/shopper/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: productName.trim(),
          productUrl: productUrl.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to submit your request."
        );
      }

      setProductName("");
      setProductUrl("");
      setMessage(
        "Your request was submitted successfully. Refresh the page to see it in your request list."
      );
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="shopper-product-name"
          style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
        >
          Product name *
        </label>

        <input
          id="shopper-product-name"
          type="text"
          value={productName}
          onChange={(event) => setProductName(event.target.value)}
          placeholder="e.g. Korean skincare product"
          maxLength={200}
          required
          disabled={submitting}
          style={{
            boxSizing: "border-box",
            width: "100%",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="shopper-product-url"
          style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
        >
          Product URL (optional)
        </label>

        <input
          id="shopper-product-url"
          type="url"
          value={productUrl}
          onChange={(event) => setProductUrl(event.target.value)}
          placeholder="https://..."
          maxLength={1000}
          disabled={submitting}
          style={{
            boxSizing: "border-box",
            width: "100%",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />

        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
          Use the product page from a Korean online store. If you don't have
          a link, just enter the product name.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          background: submitting ? "#9ca3af" : "#f97316",
          color: "#fff",
          fontWeight: 600,
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Submitting..." : "Submit Product Request"}
      </button>

      {message && (
        <p
          role="status"
          style={{
            marginTop: "12px",
            color: isError ? "#dc2626" : "#15803d",
          }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
