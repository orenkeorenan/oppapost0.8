
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../../components/account/AccountLayout";
import { PackageSelection } from "../../../components/account/PackageSelection";

export default async function PrepareShipmentPage() {
  const sessionUser = await requireUser();

  const packages = await prisma.package.findMany({
    
    where: {
      userId: sessionUser.id,
      status: "READY_TO_SHIP",
      shipmentItems: {
        none: {},
      },
      shippingGroupPackage: {
        is: null,
      },
    },

    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      trackingNumber: true,
      weight: true,
      receivedAt: true,
    },
  });

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Prepare Shipment</h1>
          <p>
            Select the packages you want to combine into an international
            shipment.
          </p>
        </header>

        <PackageSelection packages={packages} />
      </div>
    </AccountLayout>
  );
}
