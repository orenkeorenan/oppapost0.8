
"use client";

import { useCallback, useEffect, useState } from "react";

type DestinationConfig = {
  id: number;
  country: string;
  city: string | null;
  groupTargetWeightGrams: number;
  minimumBillableGrams: number;
};

type ShippingGroup = {
  id: number;
  destinationCountry: string;
  destinationCity: string | null;
  targetWeightGrams: number;
  minimumBillableGrams: number;
  status: string;
  createdAt: string;
};

export default function AdminShippingGroupsPage() {
  const [configs, setConfigs] = useState<DestinationConfig[]>([]);
  const [groups, setGroups] = useState<ShippingGroup[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/shipping-groups");
      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.error ?? "Unable to load shipping groups.");
        return;
      }

      setConfigs(data.configs);
      setGroups(data.groups);
      setSelectedConfigId((current: string) =>
        current && data.configs.some(
          (config: DestinationConfig) => String(config.id) === current
        )
          ? current
          : data.configs.length
            ? String(data.configs[0].id)
            : ""
      );
    } catch {
      setIsError(true);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCreateGroup() {
    if (!selectedConfigId) {
      setIsError(true);
      setMessage("Create or activate a destination configuration first.");
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/shipping-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configId: Number(selectedConfigId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.error ?? "Unable to create shipping group.");
        return;
      }

      setIsError(false);
      setMessage(`Shipping group #${data.group.id} created successfully.`);
      await loadData();
    } catch {
      setIsError(true);
      setMessage("Unable to connect to the server.");
    } finally {
      setCreating(false);
    }
  }

  const selectedConfig = configs.find(
    (config) => String(config.id) === selectedConfigId
  );

  return (
    <main style={styles.page}>
      <a href="/admin" style={styles.backLink}>
        ← Back to Admin
      </a>

      <header style={styles.header}>
        <h1 style={styles.title}>Shipping Groups</h1>
        <p style={styles.subtitle}>
          Create and manage shared shipments by destination.
        </p>
      </header>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Create a shipping group</h2>
        <p style={styles.muted}>
          Choose an active destination configuration. The group will save
          that configuration’s weight settings when it is created.
        </p>

        {configs.length === 0 ? (
          <p style={styles.notice}>
            No active destination configurations found. Add or activate one
            before creating a group.
          </p>
        ) : (
          <>
            <label style={styles.label}>
              Destination configuration
              <select
                value={selectedConfigId}
                onChange={(event) => setSelectedConfigId(event.target.value)}
                style={styles.input}
                disabled={creating}
              >
                {configs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.country}
                    {config.city ? ` — ${config.city}` : " — All cities"}
                  </option>
                ))}
              </select>
            </label>

            {selectedConfig && (
              <div style={styles.preview}>
                <div>
                  <span style={styles.previewLabel}>Group target</span>
                  <strong>
                    {selectedConfig.groupTargetWeightGrams.toLocaleString()} g
                  </strong>
                </div>
                <div>
                  <span style={styles.previewLabel}>Minimum billable weight</span>
                  <strong>
                    {selectedConfig.minimumBillableGrams.toLocaleString()} g
                  </strong>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateGroup}
              disabled={creating || !selectedConfigId}
              style={{
                ...styles.button,
                opacity: creating ? 0.65 : 1,
              }}
            >
              {creating ? "Creating..." : "Create shipping group"}
            </button>
          </>
        )}

        {message && (
          <p
            role="status"
            style={{
              ...styles.message,
              color: isError ? "#b91c1c" : "#15803d",
            }}
          >
            {message}
          </p>
        )}
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Existing groups</h2>

        {loading ? (
          <p style={styles.muted}>Loading groups...</p>
        ) : groups.length === 0 ? (
          <p style={styles.muted}>No shipping groups created yet.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.cell}>Group</th>
                  <th style={styles.cell}>Destination</th>
                  <th style={styles.cell}>Target</th>
                  <th style={styles.cell}>Min. billable</th>
                  <th style={styles.cell}>Status</th>
                  <th style={styles.cell}>Created</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td style={styles.cell}>#{group.id}</td>
                    <td style={styles.cell}>
                      {group.destinationCountry}
                      {group.destinationCity
                        ? `, ${group.destinationCity}`
                        : ""}
                    </td>
                    <td style={styles.cell}>
                      {group.targetWeightGrams.toLocaleString()} g
                    </td>
                    <td style={styles.cell}>
                      {group.minimumBillableGrams.toLocaleString()} g
                    </td>
                    <td style={styles.cell}>
                      <span style={styles.status}>{group.status}</span>
                    </td>
                    <td style={styles.cell}>
                      {new Date(group.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <button
            type="button"
            onClick={() => void loadData()}
            style={styles.secondaryButton}
          >
            Refresh groups
          </button>
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "40px 24px",
    color: "#171717",
  },
  backLink: {
    color: "#f97316",
    textDecoration: "none",
    fontWeight: 600,
  },
  header: { margin: "28px 0" },
  title: { fontSize: 32, margin: "0 0 8px" },
  subtitle: { color: "#737373", margin: 0 },
  card: {
    padding: 24,
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    marginBottom: 24,
    background: "#fff",
  },
  sectionTitle: { fontSize: 20, margin: "0 0 12px" },
  muted: { color: "#737373", lineHeight: 1.6 },
  notice: {
    padding: 12,
    borderRadius: 8,
    background: "#fff7ed",
    color: "#9a3412",
  },
  label: {
    display: "grid",
    gap: 8,
    marginTop: 20,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    maxWidth: 520,
    padding: 12,
    border: "1px solid #d4d4d4",
    borderRadius: 8,
    background: "#fff",
    fontSize: 15,
  },
  preview: {
    display: "flex",
    flexWrap: "wrap",
    gap: 32,
    margin: "20px 0",
    padding: 16,
    background: "#fafafa",
    borderRadius: 8,
  },
  previewLabel: {
    display: "block",
    color: "#737373",
    fontSize: 13,
    marginBottom: 6,
  },
  button: {
    padding: "12px 18px",
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    marginTop: 16,
    padding: "10px 14px",
    background: "#fff",
    border: "1px solid #d4d4d4",
    borderRadius: 8,
    cursor: "pointer",
  },
  message: { marginTop: 16, fontWeight: 500 },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 14,
  },
  cell: {
    padding: "12px 10px",
    borderBottom: "1px solid #e5e5e5",
    whiteSpace: "nowrap",
  },
  status: {
    display: "inline-block",
    padding: "4px 8px",
    background: "#f5f5f5",
    borderRadius: 6,
    fontSize: 12,
  },
};
