import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../components/account/AccountLayout";

export default async function WarehousePage() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      packages: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const packages = user?.packages ?? [];

  const incomingCount = packages.filter(
    (pkg) => pkg.status === "INCOMING"
  ).length;

  const warehouseWeight = packages
    .filter((pkg) =>
      ["RECEIVED", "READY_TO_SHIP"].includes(pkg.status)
    )
    .reduce((total, pkg) => total + pkg.weight, 0);

  const readyToShipWeight = packages
    .filter((pkg) => pkg.status === "READY_TO_SHIP")
    .reduce((total, pkg) => total + pkg.weight, 0);

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Warehouse</h1>
          <p>View packages currently being processed or stored.</p>
        </header>

        <section>
          <h2>Warehouse Summary</h2>

          <div className="warehouse-stats">
            <div className="warehouse-stat">
              <span>Incoming</span>
              <strong>{incomingCount}</strong>
              <small>packages</small>
            </div>

            <div className="warehouse-stat">
              <span>In Warehouse</span>
              <strong>{warehouseWeight.toFixed(1)} kg</strong>
              <small>stored weight</small>
            </div>

            <div className="warehouse-stat">
              <span>Ready to Ship</span>
              <strong>{readyToShipWeight.toFixed(1)} kg</strong>
              <small>available to ship</small>
            </div>
          </div>
        </section>

        <section>
          <h2>Your Packages</h2>

          {packages.length === 0 ? (
            <p>No packages found.</p>
          ) : (
            packages.map((pkg) => (
              <div className="warehouse-package" key={pkg.id}>
                <div>
                  <strong>{pkg.trackingNumber}</strong>
                  <p>
                    {pkg.receivedAt
                      ? `Received · ${pkg.receivedAt.toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                          }
                        )}`
                      : "Awaiting warehouse arrival"}
                  </p>
                </div>

                <div>
                  <strong>{pkg.weight.toFixed(1)} kg</strong>
                  <p>{pkg.status.replaceAll("_", " ")}</p>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </AccountLayout>
  );
}
