import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../components/account/AccountLayout";
import { DashboardOverview } from "../components/account/DashboardOverview";

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}

export default async function AccountPage() {
  const sessionUser = await requireUser();

  if (sessionUser.role === "ADMIN") {
    redirect("/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      packages: {
        include: {
          shipmentItems: { select: { id: true } },
          shippingGroupPackage: { select: { id: true } },
        },
      },
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

  const warehousePackages = packages.filter(
    (pkg) => pkg.status === "RECEIVED" || pkg.status === "READY_TO_SHIP"
  );

  const readyToShipPackages = packages.filter(
    (pkg) =>
      pkg.status === "READY_TO_SHIP" &&
      pkg.shipmentItems.length === 0 &&
      pkg.shippingGroupPackage === null
  );

  const activeRequests = shopperRequests.filter(
    (request) => request.status !== "COMPLETED" && request.status !== "CANCELLED"
  );

  const activities = [
    ...packages.map((pkg) => ({
      id: `package-${pkg.id}`,
      message: pkg.productName
        ? `Package registered: ${pkg.productName}`
        : `Package registered: ${pkg.trackingNumber}`,
      date: pkg.createdAt,
      timestamp: pkg.createdAt.getTime(),
    })),
    ...shipments.map((shipment) => {
      const activityDate =
        shipment.deliveredAt ?? shipment.shippedAt ?? shipment.createdAt;
      const message =
        shipment.status === "DELIVERED"
          ? `Shipment delivered: ${shipment.trackingNumber}`
          : shipment.status === "SHIPPING"
            ? `Shipment dispatched: ${shipment.trackingNumber}`
            : `Shipment created: ${shipment.trackingNumber}`;

      return {
        id: `shipment-${shipment.id}`,
        message,
        date: activityDate,
        timestamp: activityDate.getTime(),
      };
    }),
    ...shopperRequests.map((request) => {
      const hasStatusUpdate =
        request.updatedAt.getTime() > request.createdAt.getTime();
      const activityDate = hasStatusUpdate
        ? request.updatedAt
        : request.createdAt;

      return {
        id: `shopper-${request.id}`,
        message: hasStatusUpdate
          ? `Personal Shopper update: ${request.productName} — ${formatStatus(request.status)}`
          : `Personal Shopper request submitted: ${request.productName}`,
        date: activityDate,
        timestamp: activityDate.getTime(),
      };
    }),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6)
    .map((activity) => ({
      id: activity.id,
      message: activity.message,
      date: activity.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    }));

  const latestRequest = shopperRequests[0];

  return (
    <AccountLayout>
      <DashboardOverview
        name={user.name}
        activeRequests={activeRequests.length}
        warehousePackages={warehousePackages.length}
        inTransitShipments={shipments.filter((shipment) => shipment.status === "SHIPPING").length}
        readyToShipPackages={readyToShipPackages.length}
        recentActivity={activities}
        latestRequest={
          latestRequest
            ? {
                productName: latestRequest.productName,
                status: formatStatus(latestRequest.status),
                createdAt: latestRequest.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                }),
              }
            : null
        }
      />
    </AccountLayout>
  );
}
