import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../components/account/AccountLayout";

function formatDate(date: Date | null) {
  if (!date) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatMethod(method: string) {
  return method.replaceAll("_", " ");
}

export default async function ShipmentsPage() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      shipments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const shipments = user?.shipments ?? [];

  const activeShipments = shipments.filter(
    (shipment) => shipment.status === "SHIPPING"
  );

  const shipmentHistory = shipments.filter(
    (shipment) => shipment.status === "DELIVERED"
  );

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Shipments</h1>
          <p>Track your international shipments and delivery history.</p>
        </header>

        <section>
          <h2>Active Shipment</h2>

          {activeShipments.length === 0 ? (
            <p>No active shipments.</p>
          ) : (
            activeShipments.map((shipment) => (
              <div
                className="shipment-history-item"
                key={shipment.id}
              >
                <div>
                  <strong>{shipment.trackingNumber}</strong>
                  <p>
                    {formatMethod(shipment.method)} ·{" "}
                    {shipment.weight.toFixed(1)} kg
                  </p>
                </div>

                <div>
                  <strong>Shipping</strong>
                  <p>
                    Estimated {formatDate(shipment.estimatedArrival)}
                  </p>
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
          <h2>Shipment History</h2>

          {shipmentHistory.length === 0 ? (
            <p>No completed shipments yet.</p>
          ) : (
            shipmentHistory.map((shipment) => (
              <div
                className="shipment-history-item"
                key={shipment.id}
              >
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
