
"use client";

import { useCallback, useEffect, useState } from "react";

type ShippingGroup = {
  id: number;
  destinationCountry: string;
  destinationCity: string | null;
  targetWeightGrams: number;
  minimumBillableGrams: number;
  currentWeightGrams: number;
  remainingWeightGrams: number;
  progressPercent: number;
  status: string;
  createdAt: string;
  participants: string[];
};

type CustomerPackage = {
  id: number;
  trackingNumber: string;
  weight: number;
  status: string;
};

export default function AccountShippingGroupsPage() {
  const [groups, setGroups] = useState<ShippingGroup[]>([]);
  const [packages, setPackages] = useState<CustomerPackage[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [workingGroupId, setWorkingGroupId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const [groupsResponse, packagesResponse] = await Promise.all([
        fetch("/api/shipping-groups"),
        fetch("/api/account/shipping-group-packages"),
      ]);

      const groupsData = await groupsResponse.json();

      if (!groupsResponse.ok) {
        throw new Error(
          groupsData.error || "Unable to load shipping groups."
        );
      }

      setGroups(groupsData.groups ?? []);

      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        const customerPackages = Array.isArray(packagesData.packages)
          ? packagesData.packages
          : [];

        setPackages(
          customerPackages.filter(
            (pkg: CustomerPackage) => pkg.status === "READY_TO_SHIP"
          )
        );
      } else {
        setPackages([]);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load shipping groups."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function joinGroup(groupId: number) {
    const packageId = Number(selectedPackages[groupId]);

    if (!Number.isSafeInteger(packageId) || packageId <= 0) {
      setMessage("Please select a package first.");
      return;
    }

    setWorkingGroupId(groupId);
    setMessage("");

    try {
      const response = await fetch(
        `/api/shipping-groups/${groupId}/packages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to join shipping group.");
      }

      setMessage(`Package added to shipping group #${groupId}.`);
      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to join group."
      );
    } finally {
      setWorkingGroupId(null);
    }
  }

  async function leaveGroup(groupId: number, packageId: number) {
    setWorkingGroupId(groupId);
    setMessage("");

    try {
      const response = await fetch(
        `/api/shipping-groups/${groupId}/packages?packageId=${packageId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to leave shipping group.");
      }

      setMessage(`Package removed from shipping group #${groupId}.`);
      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to leave group."
      );
    } finally {
      setWorkingGroupId(null);
    }
  }

  const cardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 22,
    marginBottom: 18,
    background: "#fff",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 15px",
    border: "none",
    borderRadius: 8,
    background: "#ea580c",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: "0 24px 48px",
        color: "#111827",
      }}
    >
      <a
        href="/account"
        style={{
          color: "#ea580c",
          textDecoration: "none",
          fontSize: 14,
        }}
      >
        ← Back to Account
      </a>

      <h1 style={{ fontSize: 32, margin: "22px 0 8px" }}>
        Shared Shipping Groups
      </h1>

      <p style={{ color: "#6b7280", marginBottom: 28 }}>
        Join other shipments going to the same destination and track progress
        toward the group weight target.
      </p>

      {message && (
        <p
          role="status"
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#fff7ed",
            color: "#9a3412",
            marginBottom: 20,
          }}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p>Loading shipping groups...</p>
      ) : groups.length === 0 ? (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>No open groups available</h2>
          <p style={{ color: "#6b7280" }}>
            There are currently no open shipping groups for your saved
            destination. Please check again later.
          </p>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => void loadData()}
          >
            Refresh groups
          </button>
        </section>
      ) : (
        <>
          {groups.map((group) => {
            const percent = Math.min(100, group.progressPercent);

            return (
              <section key={group.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: 21, margin: "0 0 6px" }}>
                      Group #{group.id}
                    </h2>
                    <p style={{ margin: 0, color: "#6b7280" }}>
                      {group.destinationCountry}
                      {group.destinationCity
                        ? ` · ${group.destinationCity}`
                        : " · All cities"}
                    </p>
                  </div>

                  <span
                    style={{
                      padding: "5px 10px",
                      background: "#f3f4f6",
                      borderRadius: 7,
                      fontSize: 13,
                    }}
                  >
                    {group.status}
                  </span>
                </div>

                <div style={{ marginTop: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 14,
                      marginBottom: 9,
                    }}
                  >
                    <strong>
                      {(group.currentWeightGrams / 1000).toFixed(2)} kg
                    </strong>
                    <span style={{ color: "#6b7280" }}>
                      Target: {(group.targetWeightGrams / 1000).toFixed(2)} kg
                    </span>
                  </div>

                  <div
                    style={{
                      height: 10,
                      background: "#e5e7eb",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: "100%",
                        background: "#ea580c",
                        borderRadius: 99,
                        transition: "width 200ms ease",
                      }}
                    />
                  </div>

                  <p style={{ color: "#6b7280", fontSize: 14 }}>
                    {group.remainingWeightGrams > 0
                      ? `${(group.remainingWeightGrams / 1000).toFixed(2)} kg needed to reach the target.`
                      : "The target weight has been reached."}
                  </p>
                </div>

                {group.status === "OPEN" && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 18,
                    }}
                  >
                    <select
                      aria-label={`Choose package for group ${group.id}`}
                      value={selectedPackages[group.id] ?? ""}
                      onChange={(event) =>
                        setSelectedPackages((current) => ({
                          ...current,
                          [group.id]: event.target.value,
                        }))
                      }
                      style={{
                        flex: "1 1 240px",
                        minWidth: 0,
                        padding: 10,
                        border: "1px solid #d1d5db",
                        borderRadius: 8,
                        background: "#fff",
                      }}
                    >
                      <option value="">Select a ready-to-ship package</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.trackingNumber} · {pkg.weight.toFixed(2)} kg
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={workingGroupId === group.id || packages.length === 0}
                      onClick={() => void joinGroup(group.id)}
                      style={{
                        ...buttonStyle,
                        opacity:
                          workingGroupId === group.id || packages.length === 0
                            ? 0.6
                            : 1,
                      }}
                    >
                      {workingGroupId === group.id ? "Please wait..." : "Join group"}
                    </button>
                  </div>
                )}

                <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 0 }}>
                  Minimum billable weight: {group.minimumBillableGrams} g.
                  
                    {group.participants.length > 0 ? (
                    <span>
                        Participants: {group.participants.join(", ")}
                    </span>
                    ) : (
                    <span>
                        Participant names are hidden unless customers consent to sharing them.
                    </span>
                    )}

                </p>
              </section>
            );
          })}

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            style={{
              ...buttonStyle,
              background: "#fff",
              color: "#111827",
              border: "1px solid #d1d5db",
            }}
          >
            Refresh groups
          </button>
        </>
      )}
    </main>
  );
}
