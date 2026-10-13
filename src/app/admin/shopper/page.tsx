
"use client";

import { useCallback, useEffect, useState } from "react";

type ShopperRequest = {
  id: number;
  productName: string;
  productUrl: string | null;
  status: string;
  quotedPrice: string | number | null;
  serviceFee: string | number | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  package: {
    id: number;
    trackingNumber: string;
    status: string;
    weight: number;
  } | null;
};

const statuses = [
  "ALL",
  "REQUESTED",
  "QUOTED",
  "AWAITING_PAYMENT",
  "PURCHASED",
  "PACKAGE_INCOMING",
  "COMPLETED",
  "CANCELLED",
];

const allowedNextStatuses: Record<string, string[]> = {
  REQUESTED: ["QUOTED", "CANCELLED"],
  QUOTED: ["AWAITING_PAYMENT", "CANCELLED"],
  AWAITING_PAYMENT: ["PURCHASED", "CANCELLED"],
  PURCHASED: ["PACKAGE_INCOMING"],
  PACKAGE_INCOMING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export default function AdminShopperPage() {
    const [requests, setRequests] = useState<ShopperRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQuotedPrice, setEditQuotedPrice] = useState("");
    const [editServiceFee, setEditServiceFee] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
        const response = await fetch("/api/admin/shopper");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load requests.");
        }

        setRequests(data.requests);
        } catch (err) {
        setError(
            err instanceof Error ? err.message : "Something went wrong."
        );
        } finally {
        setLoading(false);
        }
    }, []);

    const startEditing = (request: ShopperRequest) => {
        setEditingId(request.id);
        setEditQuotedPrice(
            request.quotedPrice === null ? "" : String(request.quotedPrice)
        );
        setEditServiceFee(
            request.serviceFee === null ? "" : String(request.serviceFee)
        );
        setEditStatus(request.status);
        setSaveMessage("");
        };

        const cancelEditing = () => {
        setEditingId(null);
        setEditQuotedPrice("");
        setEditServiceFee("");
        setEditStatus("");
        setSaveMessage("");
        };

        const saveRequest = async (id: number) => {
        const quotedPrice = Number(editQuotedPrice);
        const serviceFee = Number(editServiceFee);

        if (
            editQuotedPrice.trim() === "" ||
            editServiceFee.trim() === "" ||
            !Number.isFinite(quotedPrice) ||
            !Number.isFinite(serviceFee) ||
            quotedPrice < 0 ||
            serviceFee < 0
        ) {
            setSaveMessage("Enter valid, non-negative prices for both fields.");
            return;
        }

        setSaving(true);
        setSaveMessage("");
        setError("");

        try {
            const response = await fetch(`/api/admin/shopper/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quotedPrice,
                serviceFee,
                status: editStatus,
            }),
            });

            const responseText = await response.text();

                let data: { error?: string };

                try {
                data = JSON.parse(responseText);
                } catch {
                console.error("Expected JSON but received:", responseText);
                throw new Error(
                    `Server returned HTML instead of JSON (HTTP ${response.status}). Check the API route and server terminal.`
                );
                }

                if (!response.ok) {
                throw new Error(data.error || "Unable to save the request.");
            }

            if (!response.ok) {
            throw new Error(data.error || "Unable to save the request.");
            }

            await loadRequests();
            setEditingId(null);
            setSaveMessage(`Request #${id} saved successfully.`);
        } catch (err) {
            setSaveMessage(
            err instanceof Error ? err.message : "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const filteredRequests = requests.filter((request) => {
        const matchesStatus =
        statusFilter === "ALL" || request.status === statusFilter;

        const searchText = search.toLowerCase().trim();

        const matchesSearch =
        !searchText ||
        request.productName.toLowerCase().includes(searchText) ||
        request.user.name.toLowerCase().includes(searchText) ||
        request.user.email.toLowerCase().includes(searchText) ||
        String(request.id).includes(searchText);

        return matchesStatus && matchesSearch;
    });

    const formatPrice = (value: string | number | null) => {
        if (value === null) return "—";

        return `₩${Number(value).toLocaleString("en-US")}`;
    };

    const formatDate = (value: string) =>
        new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        });

    const editingRequest = requests.find(
        (request) => request.id === editingId
        );

        const availableStatuses = editingRequest
        ? [
            editingRequest.status,
            ...(allowedNextStatuses[editingRequest.status] ?? []),
            ]
    : [];

  return (
    <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>
            Personal Shopper
          </h1>
          <p style={{ color: "#777", marginTop: "8px" }}>
            Manage customer product requests.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          disabled={loading}
          style={{
            padding: "10px 16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search product, customer, email, or request ID..."
          style={{
            flex: "1 1 280px",
            minWidth: 0,
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
            {availableStatuses.map((status) => (
                <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                </option>
            ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Total requests", value: requests.length },
          {
            label: "New requests",
            value: requests.filter((item) => item.status === "REQUESTED").length,
          },
          {
            label: "Awaiting payment",
            value: requests.filter(
              (item) => item.status === "AWAITING_PAYMENT"
            ).length,
          },
          {
            label: "Completed",
            value: requests.filter((item) => item.status === "COMPLETED").length,
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: "16px",
              border: "1px solid #eee",
              borderRadius: "10px",
              minWidth: "150px",
            }}
          >
            <p style={{ color: "#777", margin: 0 }}>{card.label}</p>
            <strong style={{ fontSize: "24px" }}>{card.value}</strong>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading requests...</p>
      ) : filteredRequests.length === 0 ? (
        <p style={{ color: "#777" }}>
          {requests.length === 0
            ? "No personal shopper requests yet."
            : "No requests match your search or status filter."}
        </p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #eee",
            borderRadius: "10px",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "1000px",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#f8f8f8" }}>
                {[
                  "Request",
                  "Customer",
                  "Product",
                  "Quoted price",
                  "Service fee",
                  "Status",
                  "Package",
                  "Created",
                  "Actions",
                ].map((heading) => (
                    
                  <th
                    key={heading}
                    style={{
                      padding: "14px",
                      borderBottom: "1px solid #eee",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td style={{ padding: "14px", borderBottom: "1px solid #eee" }}>
                    #{request.id}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid #eee" }}>
                    <div>{request.user.name}</div>
                    <small style={{ color: "#777" }}>
                      {request.user.email}
                    </small>
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid #eee" }}>
                    <div style={{ fontWeight: 600 }}>{request.productName}</div>
                    {request.productUrl && (
                      <a
                        href={request.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#d97706", fontSize: "13px" }}
                      >
                        Open product link ↗
                      </a>
                    )}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid #eee" }}>
                    {formatPrice(request.quotedPrice)}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid #eee" }}>
                    {formatPrice(request.serviceFee)}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid #eee" }}>
                    {request.status.replaceAll("_", " ")}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid #eee" }}>
                    {request.package ? (
                      <div>
                        <div>{request.package.trackingNumber}</div>
                        <small style={{ color: "#777" }}>
                          {request.package.status.replaceAll("_", " ")}
                        </small>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>
                    {formatDate(request.createdAt)}
                  </td>
                  <td
                    style={{
                        padding: "14px",
                        borderBottom: "1px solid #eee",
                        whiteSpace: "nowrap",
                    }}
                    >
                    <button
                        type="button"
                        onClick={() => startEditing(request)}
                        disabled={saving}
                        style={{
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        background: "#fff",
                        cursor: saving ? "not-allowed" : "pointer",
                        }}
                    >
                        Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      )}
      {editingId !== null && (
  <div
    style={{
      marginTop: "24px",
      padding: "24px",
      border: "1px solid #eee",
      borderRadius: "10px",
      background: "#fff",
    }}
  >
    <h2 style={{ fontSize: "20px", marginTop: 0 }}>
      Edit Request #{editingId}
    </h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
      }}
    >
      <label>
        <span style={{ display: "block", marginBottom: "8px" }}>
          Quoted product price (₩)
        </span>
        <input
          type="number"
          min="0"
          step="1"
          value={editQuotedPrice}
          onChange={(event) => setEditQuotedPrice(event.target.value)}
          disabled={saving}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        />
      </label>

      <label>
        <span style={{ display: "block", marginBottom: "8px" }}>
          Service fee (₩)
        </span>
        <input
          type="number"
          min="0"
          step="1"
          value={editServiceFee}
          onChange={(event) => setEditServiceFee(event.target.value)}
          disabled={saving}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        />
      </label>

      <label>
        <span style={{ display: "block", marginBottom: "8px" }}>
          Request status
        </span>
        <select
          value={editStatus}
          onChange={(event) => setEditStatus(event.target.value)}
          disabled={saving}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            background: "#fff",
          }}
        >
          {statuses
            .filter((status) => status !== "ALL")
            .map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
        </select>
      </label>
    </div>

        {saveMessage && (
            <p
                role="status"
                style={{
                marginTop: "16px",
                color: saveMessage.includes("saved successfully")
                    ? "#067647"
                    : "#b42318",
                }}
            >
                {saveMessage}
            </p>
        )}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                    type="button"
                    onClick={() => saveRequest(editingId)}
                    disabled={saving}
                    style={{
                    padding: "10px 16px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#d97706",
                    color: "#fff",
                    cursor: saving ? "wait" : "pointer",
                    }}
                >
                    {saving ? "Saving..." : "Save changes"}
                </button>

                <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    style={{
                    padding: "10px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    background: "#fff",
                    cursor: saving ? "not-allowed" : "pointer",
                    }}
                >
                    Cancel
                </button>
                </div>
            </div>
        )}
    </main>
  );
}
