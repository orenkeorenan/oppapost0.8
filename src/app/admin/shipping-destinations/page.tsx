
"use client";

import { useCallback, useEffect, useState } from "react";

type Destination = {
  id: number;
  country: string;
  city: string | null;
  groupTargetWeightGrams: number;
  minimumBillableGrams: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ShippingDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [targetWeight, setTargetWeight] = useState("5000");
  const [minimumWeight, setMinimumWeight] = useState("500");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadDestinations = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/shipping-destinations");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load destinations.");
      }

      setDestinations(data.destinations);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load destinations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDestinations();
  }, [loadDestinations]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const target = Number(targetWeight);
    const minimum = Number(minimumWeight);

    if (
      !country.trim() ||
      !Number.isSafeInteger(target) ||
      target <= 0 ||
      !Number.isSafeInteger(minimum) ||
      minimum <= 0
    ) {
      setMessage("Enter a country and valid positive weights in grams.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/shipping-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: country.trim(),
          city: city.trim() || null,
          groupTargetWeightGrams: target,
          minimumBillableGrams: minimum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create destination.");
      }

      setCountry("");
      setCity("");
      setTargetWeight("5000");
      setMinimumWeight("500");
      setMessage("Destination created successfully.");
      await loadDestinations();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create destination."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleDestination(destination: Destination) {
    setMessage("");

    try {
      const response = await fetch("/api/admin/shipping-destinations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: destination.id,
          isActive: !destination.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update destination.");
      }

      setMessage(
        `${destination.country} destination ${
          !destination.isActive ? "activated" : "deactivated"
        }.`
      );

      await loadDestinations();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update destination."
      );
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
    color: "#111827",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 7,
    color: "#374151",
  };

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "40px auto",
        padding: "0 24px 48px",
        color: "#111827",
      }}
    >
      <a
        href="/admin"
        style={{
          color: "#ea580c",
          textDecoration: "none",
          fontSize: 14,
        }}
      >
        ← Back to Admin
      </a>

      <h1 style={{ fontSize: 32, margin: "22px 0 8px" }}>
        Shipping Destinations
      </h1>

      <p style={{ color: "#6b7280", marginBottom: 28 }}>
        Configure destinations and weight targets for shared shipping groups.
      </p>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 21, marginTop: 0 }}>
          Add a destination
        </h2>

        <p style={{ color: "#6b7280", fontSize: 14 }}>
          All weights are in grams. For example, 5,000 g is 5 kg.
        </p>

        <form onSubmit={handleCreate}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
              marginTop: 20,
            }}
          >
            <div>
              <label style={labelStyle} htmlFor="country">
                Country *
              </label>
              <input
                id="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="e.g. Indonesia"
                maxLength={100}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="city">
                City (optional)
              </label>
              <input
                id="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="e.g. Jakarta"
                maxLength={100}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="targetWeight">
                Group target weight (g) *
              </label>
              <input
                id="targetWeight"
                type="number"
                min="1"
                step="1"
                value={targetWeight}
                onChange={(event) => setTargetWeight(event.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="minimumWeight">
                Minimum billable weight (g) *
              </label>
              <input
                id="minimumWeight"
                type="number"
                min="1"
                step="1"
                value={minimumWeight}
                onChange={(event) => setMinimumWeight(event.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 22,
              padding: "11px 18px",
              border: "none",
              borderRadius: 8,
              background: saving ? "#9ca3af" : "#ea580c",
              color: "#fff",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Add destination"}
          </button>
        </form>
      </section>

      {message && (
        <p
          role="status"
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#fff7ed",
            color: "#9a3412",
            fontSize: 14,
          }}
        >
          {message}
        </p>
      )}

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 21, marginTop: 0 }}>
          Saved destinations
        </h2>

        {loading ? (
          <p>Loading destinations...</p>
        ) : destinations.length === 0 ? (
          <p style={{ color: "#6b7280" }}>
            No destinations yet. Add your first destination above.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Destination",
                    "Group target",
                    "Minimum billable",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #e5e7eb",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {destinations.map((destination) => (
                  <tr key={destination.id}>
                    <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>
                      <strong>{destination.country}</strong>
                      <div style={{ color: "#6b7280", marginTop: 4 }}>
                        {destination.city || "All cities"}
                      </div>
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>
                      {destination.groupTargetWeightGrams.toLocaleString()} g
                      <div style={{ color: "#6b7280", marginTop: 4 }}>
                        {(destination.groupTargetWeightGrams / 1000).toFixed(2)} kg
                      </div>
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>
                      {destination.minimumBillableGrams.toLocaleString()} g
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>
                      <span
                        style={{
                          color: destination.isActive ? "#15803d" : "#6b7280",
                          fontWeight: 600,
                        }}
                      >
                        {destination.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>
                      <button
                        type="button"
                        onClick={() => toggleDestination(destination)}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: 7,
                          background: "#fff",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {destination.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="button"
          onClick={() => void loadDestinations()}
          disabled={loading}
          style={{
            marginTop: 18,
            padding: "9px 13px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Refresh destinations
        </button>
      </section>
    </main>
  );
}
