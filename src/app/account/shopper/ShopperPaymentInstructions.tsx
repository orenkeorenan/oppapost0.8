
"use client";

import { useEffect, useState } from "react";

type PaymentInfo = {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  instructions: string;
};

export function ShopperPaymentInstructions({
  total,
}: {
  total: number;
}) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPaymentInfo() {
      try {
        const response = await fetch("/api/shopper/payment-info");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load payment instructions."
          );
        }

        if (active) {
          setPaymentInfo(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load payment instructions."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPaymentInfo();

    return () => {
      active = false;
    };
  }, []);

  const formatPrice = (amount: number) =>
    `₩${amount.toLocaleString("en-US")}`;

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#fffaf5",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Korean Bank Transfer</h3>

      <p>
        <strong>Amount to transfer: {formatPrice(total)}</strong>
      </p>

      {loading ? (
        <p>Loading bank details...</p>
      ) : error ? (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      ) : paymentInfo ? (
        <>
          <p>
            <strong>Bank:</strong> {paymentInfo.bankName}
          </p>
          <p>
            <strong>Account holder:</strong> {paymentInfo.accountHolder}
          </p>
          <p>
            <strong>Account number:</strong> {paymentInfo.accountNumber}
          </p>
          <p>{paymentInfo.instructions}</p>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            Your request will be processed after the transfer is received
            and manually confirmed by Oppapost.
          </p>
        </>
      ) : null}
    </div>
  );
}
