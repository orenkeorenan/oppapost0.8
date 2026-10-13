import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../components/account/AccountLayout";
import { WarehouseStatus } from "../components/account/WarehouseStatus";
import { KoreanAddressCard } from "../components/account/KoreanAddressCard";
import { CurrentShipmentCard } from "../components/account/CurrentShipmentCard";
import { PersonalShopperCard } from "../components/account/PersonalShopperCard";
import { RecentActivity } from "../components/account/RecentActivity";

function formatDate(date: Date | null) {
  if (!date) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}

export default async function AccountPage() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      address: true,
      packages: true,
      shipments: {
        orderBy: { createdAt: "desc" },
      },
      personalShopperRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return null;
  }

  const packages = user.packages;
  const shipments = user.shipments;
  const shopperRequests = user.personalShopperRequests;

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

  const currentShipment = shipments.find(
    (shipment) => shipment.status === "SHIPPING"
  );

  const latestRequest = shopperRequests[0];

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>My Oppapost</h1>
          <p>Welcome back, {user.name}.</p>
          <p>{user.email}</p>
        </header>

        <div className="dashboard-grid dashboard-grid--top">
          <WarehouseStatus
            incoming={incomingCount}
            warehouseWeight={warehouseWeight}
            readyToShipWeight={readyToShipWeight}
          />

          {user.address ? (
            <KoreanAddressCard/>
          ) : (
            <section>
              <h2>My Korean Address</h2>
              <p>No address has been registered yet.</p>
            </section>
          )}
        </div>

        {currentShipment ? (
          <CurrentShipmentCard
            method={formatStatus(currentShipment.method)}
            weight={currentShipment.weight}
            status={formatStatus(currentShipment.status)}
            shippedDate={formatDate(currentShipment.shippedAt)}
            estimatedArrival={formatDate(
              currentShipment.estimatedArrival
            )}
            trackingNumber={currentShipment.trackingNumber}
          />
        ) : (
          <section>
            <h2>Current Shipment</h2>
            <p>You have no active shipments.</p>
          </section>
        )}

        <div className="dashboard-grid dashboard-grid--bottom">
          {latestRequest ? (
            <PersonalShopperCard
              productName={latestRequest.productName}
              status={formatStatus(latestRequest.status)}
            />
          ) : (
            <section>
              <h2>Personal Shopper</h2>
              <p>You have no requests yet.</p>
            </section>
          )}

          <RecentActivity activities={[]} />
        </div>
      </div>
    </AccountLayout>
  );
}
