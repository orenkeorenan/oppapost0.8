
"use client";

import { useState } from "react";

export function KoreanAddressCard() {
  const [copied, setCopied] = useState(false);

  const warehouseAddress = [
    "Oppapost",
    "용소로19번길 78-1",
    "부산광역시 남구 대연동 32-14",
    "48511",
    "주택 1층",
  ].join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(warehouseAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section>
      <h2>Oppapost Korean Warehouse</h2>
      <p>
        Use this address when ordering products from Korean online stores.
      </p>

      <div>
        <p>Recipient / Warehouse Name</p>
        <strong>Oppapost</strong>

        <p>Street Address</p>
        <strong>용소로19번길 78-1</strong>

        <p>District Address</p>
        <strong>부산광역시 남구 대연동 32-14</strong>

        <p>Postal Code</p>
        <strong>48511</strong>

        <p>Building Details</p>
        <strong>주택 1층</strong>
      </div>

      <button
        type="button"
        className="button button--brand"
        onClick={handleCopy}
      >
        {copied ? "Address Copied!" : "Copy Warehouse Address"}
      </button>
    </section>
  );
}
