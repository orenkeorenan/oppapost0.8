
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../components/account/AccountLayout";
import CreateShipmentForm from "./CreateShipmentForm";

function formatDate(date: Date | null) {
  if (!date) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatMethod(method: string) {
  return method.replaceAll("_", " ");
}

function formatStatus(status: string) {
  switch (status) {
    case "PENDING_DISPATCH":
      return "Awaiting Dispatch";
    case "SHIPPING":
      return "In Transit";
    case "DELIVERED":
      return "Delivered";
    default:
      return status.replaceAll("_", " ");
  }
}

export default async function ShipmentsPage() {
  const sessionUser = await requireUser();

  const [shipments, readyPackages] = await Promise.all([
    prisma.shipment.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.package.findMany({
      where: {
        userId: sessionUser.id,
        status: "READY_TO_SHIP",
        shipmentItems: {
          none: {},
        },
        shippingGroupPackage: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingNumber: true,
        weight: true,
      },
    }),
  ]);

  const activeShipments = shipments.filter(
    (shipment) =>
      shipment.status === "PENDING_DISPATCH" ||
      shipment.status === "SHIPPING"
  );

  const shipmentHistory = shipments.filter(
    (shipment) => shipment.status === "DELIVERED"
  );

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Shipments</h1>
          <p>
            Track your international shipments and delivery history.
          </p>
        </header>

        <section>
          <h2>Create a Shipment</h2>
          <p>
            Select your ready-to-ship packages and choose a shipping method.
          </p>

          <CreateShipmentForm
            packages={readyPackages.map((pkg) => ({
              id: pkg.id,
              trackingNumber: pkg.trackingNumber,
              weight: pkg.weight,
            }))}
          />
        </section>

        <section>
          <h2>Active Shipments ({activeShipments.length})</h2>

          {activeShipments.length === 0 ? (
            <p>No active shipments yet.</p>
          ) : (
            activeShipments.map((shipment) => (
              <div className="shipment-history-item" key={shipment.id}>
                <div>
                  <strong>{shipment.trackingNumber}</strong>
                  <p>
                    {formatMethod(shipment.method)} ·{" "}
                    {shipment.weight.toFixed(1)} kg
                  </p>
                </div>

                <div>
                  <strong>{formatStatus(shipment.status)}</strong>
                  <p>{formatDate(shipment.createdAt)}</p>
                </div>

                <a
                  className="button"
                  href={`/account/shipments/${shipment.id}`}
                >
                  View Shipment
                </a>
              </div>
            ))
          )}
        </section>

        <section>
          <h2>Shipment History ({shipmentHistory.length})</h2>

          {shipmentHistory.length === 0 ? (
            <p>No completed shipments yet.</p>
          ) : (
            shipmentHistory.map((shipment) => (
              <div className="shipment-history-item" key={shipment.id}>
                <div>
                  <strong>{shipment.trackingNumber}</strong>
                  <p>
                    {formatMethod(shipment.method)} ·{" "}
                    {shipment.weight.toFixed(1)} kg
                  </p>
                </div>

                <div>
                  <strong>Delivered</strong>
                  <p>{formatDate(shipment.deliveredAt)}</p>
                </div>

                <a
                  className="button"
                  href={`/account/shipments/${shipment.id}`}
                >
                  View Shipment
                </a>
              </div>
            ))
          )}
        </section>
      </div>
    </AccountLayout>
  );
}
