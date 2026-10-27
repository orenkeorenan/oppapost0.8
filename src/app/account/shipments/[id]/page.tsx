
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

        
      {[
        {
          title: "Shipment Created",
          date: shipment.createdAt,
          complete: true,
        },
        {
          title: "Dispatched",
          date: shipment.shippedAt,
          complete:
            shipment.status === "SHIPPING" ||
            shipment.status === "DELIVERED",
        },
        {
          title: "Delivered",
          date: shipment.deliveredAt,
          complete: shipment.status === "DELIVERED",
        },
      ].map((step) => (
        <div
          key={step.title}
          style={{
            padding: "16px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            background: step.complete ? "#f0fdf4" : "#fafafa",
          }}
        >
          <strong>
            {step.complete ? "✓ " : "○ "}
            {step.title}
          </strong>
          <p style={{ marginBottom: 0, color: "#666" }}>
            {formatDate(step.date)}
          </p>
        </div>
      ))}


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
