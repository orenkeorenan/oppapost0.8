
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../../components/account/AccountLayout";

type ShipmentDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date | null) {
  if (!date) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (character) => character.toUpperCase());
}

export default async function ShipmentDetailsPage({
  params,
}: ShipmentDetailsPageProps) {
  const sessionUser = await requireUser();
  const { id } = await params;
  const shipmentId = Number(id);

  if (!Number.isSafeInteger(shipmentId) || shipmentId <= 0) {
    notFound();
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      userId: sessionUser.id,
    },
    include: {
      packages: {
        include: {
          package: {
            select: {
              trackingNumber: true,
              weight: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!shipment) {
    notFound();
  }

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Shipment Details</h1>
          <p>{shipment.trackingNumber}</p>
        </header>

        
      <section>
        <h2>Shipment Overview</h2>

        <div className="warehouse-package">
          <div>
            <strong>Tracking Number</strong>
            <p>{shipment.trackingNumber}</p>
          </div>
          <div>
            <strong>Status</strong>
            <p>{formatLabel(shipment.status)}</p>
          </div>
          <div>
            <strong>Shipping Method</strong>
            <p>{formatLabel(shipment.method)}</p>
          </div>
          <div>
            <strong>Total Weight</strong>
            <p>{shipment.weight.toFixed(1)} kg</p>
          </div>
        </div>

        
      <div
        aria-label="Shipment progress"
        style={{
          display: "grid",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        {[
          {
            title: "Shipment created",
            description: "Your shipment request has been received.",
            date: shipment.createdAt,
            complete: true,
            current: shipment.status === "PENDING_DISPATCH",
          },
          {
            title: "Dispatched",
            description:
              shipment.status === "PENDING_DISPATCH"
                ? "Your shipment is waiting to be dispatched from Korea."
                : "Your shipment has left the origin facility.",
            date: shipment.shippedAt,
            complete:
              shipment.status === "SHIPPING" ||
              shipment.status === "DELIVERED",
            current: shipment.status === "SHIPPING",
          },
          {
            title: "Delivered",
            description:
              shipment.status === "DELIVERED"
                ? "Your shipment has been marked as delivered."
                : "This step will be updated after delivery.",
            date: shipment.deliveredAt,
            complete: shipment.status === "DELIVERED",
            current: false,
          },
        ].map((step) => (
          <div
            key={step.title}
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
              padding: "16px",
              border: step.current
                ? "1px solid #fdba74"
                : "1px solid #e5e7eb",
              borderRadius: "10px",
              background: step.current ? "#fff7ed" : "#fff",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 28px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: step.complete ? "#dcfce7" : step.current ? "#ffedd5" : "#f3f4f6",
                color: step.complete ? "#166534" : step.current ? "#9a3412" : "#6b7280",
                fontWeight: 700,
              }}
            >
              {step.complete ? "✓" : "○"}
            </span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <strong>{step.title}</strong>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>
                  {step.complete
                    ? "Completed"
                    : step.current
                      ? "Current stage"
                      : "Upcoming"}
                </span>
              </div>
              <p style={{ margin: "5px 0 0", color: "#666" }}>
                {step.description}
              </p>
              <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: "13px" }}>
                {formatDate(step.date)}
              </p>
            </div>
          </div>
        ))}
      </div>


        <p>
          <strong>Estimated Arrival:</strong>{" "}
          {formatDate(shipment.estimatedArrival)}
        </p>
      </section>


        <section>
          <h2>Delivery Destination</h2>
          <div className="warehouse-package">
            <div>
              <strong>{shipment.recipientName ?? "—"}</strong>
              <p>{shipment.deliveryPhone ?? "—"}</p>
              <p>{shipment.deliveryAddress ?? "—"}</p>
              <p>
                {shipment.deliveryCity ?? ""}
                {shipment.deliveryState
                  ? `, ${shipment.deliveryState}`
                  : ""}
              </p>
              <p>{shipment.deliveryPostalCode ?? "—"}</p>
              <p>{shipment.deliveryCountry ?? "—"}</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Included Packages ({shipment.packages.length})</h2>

          {shipment.packages.length === 0 ? (
            <p>No package records are linked to this shipment.</p>
          ) : (
            shipment.packages.map((item) => (
              <div
                className="warehouse-package"
                key={item.packageId}
              >
                <div>
                  <strong>{item.package.trackingNumber}</strong>
                  <p>{formatLabel(item.package.status)}</p>
                </div>
                <strong>{item.package.weight.toFixed(1)} kg</strong>
              </div>
            ))
          )}
        </section>

        <a
          className="button"
          href="/account/shipments"
          style={{ display: "inline-block", marginTop: "16px" }}
        >
          Back to Shipments
        </a>
      </div>
    </AccountLayout>
  );
}
