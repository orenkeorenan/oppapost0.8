import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const cardStyle = {
  padding: "22px",
  border: "1px solid #e6e9ef",
  borderRadius: "14px",
  background: "#fff",
};

const mutedStyle = { color: "#7b8494", fontSize: "13px" };

function formatDate(date: Date) {
  return date.toLocaleDateString("en-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [
    customerCount,
    packageCount,
    shipmentCount,
    shopperRequestCount,
    incomingPackages,
    pendingShipments,
    activeShopperRequests,
    recentPackages,
    recentShipments,
    recentShopperRequests,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.package.count(),
    prisma.shipment.count(),
    prisma.personalShopperRequest.count(),
    prisma.package.count({
      where: { status: { in: ["INCOMING", "RECEIVED"] } },
    }),
    prisma.shipment.count({
      where: { status: "PENDING_DISPATCH" },
    }),
    prisma.personalShopperRequest.count({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
    }),
    prisma.package.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.shipment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.personalShopperRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productName: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  const totals = [
    { label: "Customers", value: customerCount, href: "/admin/customers" },
    { label: "All packages", value: packageCount, href: "/admin/packages" },
    { label: "All shipments", value: shipmentCount, href: "/admin/shipments" },
    {
      label: "Shopper requests",
      value: shopperRequestCount,
      href: "/admin/shopper",
    },
  ];

  const attentionItems = [
    {
      label: "Packages awaiting warehouse processing",
      value: incomingPackages,
      href: "/admin/packages",
      note: "Incoming or legacy received status",
    },
    {
      label: "Shipments pending dispatch",
      value: pendingShipments,
      href: "/admin/shipments",
      note: "Ready for the dispatch step",
    },
    {
      label: "Active Personal Shopper requests",
      value: activeShopperRequests,
      href: "/admin/shopper",
      note: "Excludes completed and cancelled requests",
    },
  ];

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "36px 28px 56px",
      }}
    >
      <header style={{ marginBottom: 30 }}>
        <p
          style={{
            color: "#e96b3a",
            fontSize: 11,
            fontWeight: 750,
            letterSpacing: "0.13em",
            margin: "0 0 8px",
          }}
        >
          OPERATIONS OVERVIEW
        </p>
        <h1 style={{ fontSize: 30, letterSpacing: "-0.03em", margin: 0 }}>
          Good day, {admin.name}
        </h1>
        <p style={{ ...mutedStyle, margin: "9px 0 0" }}>
          Here is the latest activity across your Oppapost workspace.
        </p>
      </header>

      <section
        aria-label="Business totals"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
          marginBottom: 30,
        }}
      >
        {totals.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              ...cardStyle,
              color: "inherit",
              textDecoration: "none",
              transition: "border-color 150ms ease",
            }}
          >
            <p style={{ ...mutedStyle, margin: "0 0 12px" }}>{item.label}</p>
            <p
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.1,
                fontWeight: 750,
                letterSpacing: "-0.04em",
              }}
            >
              {item.value.toLocaleString()}
            </p>
          </Link>
        ))}
      </section>

      <section style={{ marginBottom: 34 }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Needs attention</h2>
          <p style={{ ...mutedStyle, margin: "5px 0 0" }}>
            Operational queues that may need your next action.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {attentionItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{
                ...cardStyle,
                display: "block",
                color: "inherit",
                textDecoration: "none",
                borderLeft: "3px solid #f08a58",
              }}
            >
              <p style={{ ...mutedStyle, margin: "0 0 10px" }}>
                {item.label}
              </p>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 28,
                  fontWeight: 750,
                  letterSpacing: "-0.04em",
                }}
              >
                {item.value.toLocaleString()}
              </p>
              <p style={{ ...mutedStyle, margin: 0, fontSize: 12 }}>
                {item.note}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Recent activity</h2>
          <p style={{ ...mutedStyle, margin: "5px 0 0" }}>
            The five most recently created records in each workflow.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
            alignItems: "start",
          }}
        >
          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <h3 style={{ fontSize: 15, margin: 0 }}>Latest packages</h3>
              <Link href="/admin/packages" style={linkStyle}>
                View all
              </Link>
            </div>
            {recentPackages.length === 0 ? (
              <p style={mutedStyle}>No packages registered yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 13 }}>
                {recentPackages.map((item) => (
                  <div
                    key={item.id}
                    style={{ paddingBottom: 12, borderBottom: "1px solid #eef0f3" }}
                  >
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 650 }}>
                      {item.trackingNumber}
                    </p>
                    <p style={{ ...mutedStyle, margin: 0, fontSize: 12 }}>
                      {item.user.name} · {statusLabel(item.status)}
                    </p>
                    <p style={{ ...mutedStyle, margin: "4px 0 0", fontSize: 11 }}>
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <h3 style={{ fontSize: 15, margin: 0 }}>Latest shipments</h3>
              <Link href="/admin/shipments" style={linkStyle}>
                View all
              </Link>
            </div>
            {recentShipments.length === 0 ? (
              <p style={mutedStyle}>No shipments created yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 13 }}>
                {recentShipments.map((item) => (
                  <div
                    key={item.id}
                    style={{ paddingBottom: 12, borderBottom: "1px solid #eef0f3" }}
                  >
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 650 }}>
                      {item.trackingNumber}
                    </p>
                    <p style={{ ...mutedStyle, margin: 0, fontSize: 12 }}>
                      {item.user.name} · {statusLabel(item.status)}
                    </p>
                    <p style={{ ...mutedStyle, margin: "4px 0 0", fontSize: 11 }}>
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <h3 style={{ fontSize: 15, margin: 0 }}>Latest shopper requests</h3>
              <Link href="/admin/shopper" style={linkStyle}>
                View all
              </Link>
            </div>
            {recentShopperRequests.length === 0 ? (
              <p style={mutedStyle}>No shopper requests yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 13 }}>
                {recentShopperRequests.map((item) => (
                  <div
                    key={item.id}
                    style={{ paddingBottom: 12, borderBottom: "1px solid #eef0f3" }}
                  >
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 650 }}>
                      {item.productName}
                    </p>
                    <p style={{ ...mutedStyle, margin: 0, fontSize: 12 }}>
                      {item.user.name} · {statusLabel(item.status)}
                    </p>
                    <p style={{ ...mutedStyle, margin: "4px 0 0", fontSize: 11 }}>
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}

const linkStyle = {
  color: "#d96b3b",
  fontSize: 12,
  fontWeight: 650,
  textDecoration: "none",
};
