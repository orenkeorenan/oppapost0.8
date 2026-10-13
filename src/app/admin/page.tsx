
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [customerCount, packageCount, shipmentCount, shopperRequestCount] =
    await Promise.all([
      prisma.user.count({
        where: { role: "CUSTOMER" },
      }),
      prisma.package.count(),
      prisma.shipment.count(),
      prisma.personalShopperRequest.count(),
    ]);

  const stats = [
    { label: "Customers", value: customerCount },
    { label: "Packages", value: packageCount },
    { label: "Shipments", value: shipmentCount },
    { label: "Personal Shopper Requests", value: shopperRequestCount },
  ];

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      <header style={{ marginBottom: "40px" }}>
        <p style={{ color: "#f97316", fontWeight: 600 }}>
          OPPAPOST ADMIN
        </p>

        <h1 style={{ fontSize: "32px", margin: "8px 0" }}>
          Admin Dashboard
        </h1>

        <p style={{ color: "#737373" }}>
          Welcome, {admin.name}. Manage your warehouse operations here.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            style={{
              padding: "24px",
              border: "1px solid #e5e5e5",
              borderRadius: "16px",
            }}
          >
            <p style={{ color: "#737373", margin: "0 0 12px" }}>
              {stat.label}
            </p>

            <p style={{ fontSize: "32px", fontWeight: 700, margin: 0 }}>
              {stat.value}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
