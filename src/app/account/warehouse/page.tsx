
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../components/account/AccountLayout";
import WarehousePackageList from "./WarehousePackageList";
import WarehousePackageForm from "./WarehousePackageForm";

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (character) => character.toUpperCase());
}

function formatDate(date: Date | null) {
  if (!date) return "Awaiting warehouse arrival";

  return `Received · ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}

export default async function WarehousePage() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      packages: {
        orderBy: { createdAt: "desc" },
        include: {
          shipmentItems: {
            select: { id: true },
          },
          shippingGroupPackage: {
            select: { id: true },
          },
        },
      },
    },
  });

  const packages = user?.packages ?? [];

  const incomingPackages = packages.filter(
    (pkg) => pkg.status === "INCOMING"
  );

  const readyPackages = packages.filter(
    (pkg) => pkg.status === "READY_TO_SHIP"
  );

  const eligiblePackages = readyPackages.filter(
    (pkg) =>
      pkg.shipmentItems.length === 0 &&
      pkg.shippingGroupPackage === null
  );

  const shippedPackages = packages.filter(
    (pkg) => pkg.status === "SHIPPED"
  );

  const deliveredPackages = packages.filter(
    (pkg) => pkg.status === "DELIVERED"
  );

  const processingPackages = packages.filter(
    (pkg) =>
      ["RECEIVED"].includes(pkg.status)
  );

  const warehouseWeight = packages
    .filter((pkg) => pkg.status === "READY_TO_SHIP")
    .reduce((total, pkg) => total + pkg.weight, 0);

  const readyToShipWeight = eligiblePackages.reduce(
    (total, pkg) => total + pkg.weight,
    0
  );

  function renderPackages(
    title: string,
    packageList: typeof packages,
    emptyMessage: string
  ) {
    return (
      <section>
        <h2>
          {title} ({packageList.length})
        </h2>

        {packageList.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          packageList.map((pkg) => (
            <div className="warehouse-package" key={pkg.id}>
              <div>
                <strong>{pkg.trackingNumber}</strong>
                  {pkg.productName && (
                    <p>Product: {pkg.productName}</p>
                  )}

                  {pkg.notes && (
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      Notes: {pkg.notes}
                    </p>
                  )}

                  <p>{formatDate(pkg.receivedAt)}</p>
              </div>

              <div>
                <strong>{pkg.weight.toFixed(1)} kg</strong>
                <p>{formatStatus(pkg.status)}</p>
              </div>
            </div>
          ))
        )}
      </section>
    );
  }

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Warehouse</h1>
          <p>
            Track incoming packages, prepare shipments, and review shipped
            and delivered packages.
          </p>
        </header>

        <section>
          <h2>Warehouse Summary</h2>
          <WarehousePackageForm />

          <div className="warehouse-stats">
            <div className="warehouse-stat">
              <span>Incoming</span>
              <strong>{incomingPackages.length}</strong>
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
              <small>{eligiblePackages.length} available packages</small>
            </div>
          </div>
        </section>

        <section>
          <h2>Ready to Ship ({eligiblePackages.length})</h2>
          <p>
            Packages are selected automatically. Uncheck any packages
            you want to keep for a future shipment.
          </p>

          <WarehousePackageList
            packages={eligiblePackages.map((pkg) => ({
              id: pkg.id,
              trackingNumber: pkg.trackingNumber,
              weight: pkg.weight,
              source: pkg.source,
            }))}
          />
        </section>

        {renderPackages(
          "Being Processed",
          [...incomingPackages, ...processingPackages],
          "No packages are currently being processed."
        )}

        {renderPackages(
          "Shipped",
          shippedPackages,
          "No shipped packages yet."
        )}

        {renderPackages(
          "Delivered",
          deliveredPackages,
          "No delivered packages yet."
        )}
      </div>
    </AccountLayout>
  );
}
