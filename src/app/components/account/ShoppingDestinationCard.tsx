
"use client";

import { useEffect, useState } from "react";

type Destination = {
  country: string;
  city: string;
  region: string;
};

export function ShoppingDestinationCard() {
  const [destination, setDestination] = useState<Destination>({
    country: "",
    city: "",
    region: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDestination() {
      try {
        const response = await fetch(
          "/api/account/shopping-destination",
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Unable to load shopping destination.");
        }

        const data = await response.json();

        setDestination({
          country: data.destination?.country ?? "",
          city: data.destination?.city ?? "",
          region: data.destination?.region ?? "",
        });
      } catch {
        setMessage("Unable to load your saved destination.");
      } finally {
        setLoading(false);
      }
    }

    void loadDestination();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/account/shopping-destination",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(destination),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save destination."
        );
      }

      setDestination({
        country: data.destination.country ?? "",
        city: data.destination.city ?? "",
        region: data.destination.region ?? "",
      });

      setMessage("Shopping destination saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save destination."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2>Shopping Destination</h2>

      <p>
        Choose where you want your Korean purchases delivered.
        This also determines which shared shipping groups you can join.
      </p>

      {loading ? (
        <p>Loading destination...</p>
      ) : (
        <>
          <div>
            <p>Country</p>
            <input
              value={destination.country}
              onChange={(event) =>
                setDestination((current) => ({
                  ...current,
                  country: event.target.value,
                }))
              }
              placeholder="e.g. Indonesia"
              maxLength={100}
            />

            <p>City</p>
            <input
              value={destination.city}
              onChange={(event) =>
                setDestination((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
              placeholder="e.g. Jakarta"
              maxLength={100}
            />

            <p>Region / State (optional)</p>
            <input
              value={destination.region}
              onChange={(event) =>
                setDestination((current) => ({
                  ...current,
                  region: event.target.value,
                }))
              }
              placeholder="e.g. DKI Jakarta"
              maxLength={100}
            />
          </div>

          <button
            type="button"
            className="button button--brand"
            onClick={handleSave}
            disabled={
              saving ||
              !destination.country.trim() ||
              !destination.city.trim()
            }
          >
            {saving ? "Saving..." : "Save Destination"}
          </button>

          {message && (
            <p role="status">{message}</p>
          )}
        </>
      )}
    </section>
  );
}
