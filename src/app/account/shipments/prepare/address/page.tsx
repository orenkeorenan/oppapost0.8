
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../../../components/account/AccountLayout";

type PrepareAddressPageProps = {
  searchParams: Promise<{
    packages?: string;
  }>;
};

export default async function PrepareAddressPage({
  searchParams,
}: PrepareAddressPageProps) {
  const sessionUser = await requireUser();
  const params = await searchParams;

  const packageIds = (params.packages ?? "")
    .split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

  if (packageIds.length === 0) {
    redirect("/account/shipments/prepare");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      address: true,
    },
  });

  if (!user?.address) {
    redirect("/account/address");
  }

  const packages = await prisma.package.findMany({
    
    where: {
      id: { in: packageIds },
      userId: sessionUser.id,
      status: "READY_TO_SHIP",
      shipmentItems: {
        none: {},
      },
      shippingGroupPackage: {
        is: null,
      },
    },

    select: {
      id: true,
      trackingNumber: true,
      weight: true,
    },
  });

  // Don't proceed if any selected package is missing or no longer eligible.
  if (
    packages.length !== new Set(packageIds).size ||
    packages.length !== packageIds.length
  ) {
    redirect("/account/shipments/prepare");
  }

  const totalWeight = packages.reduce(
    (total, pkg) => total + pkg.weight,
    0
  );

  const address = user.address;

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Confirm Delivery Address</h1>
          <p>
            Review your destination and selected packages before choosing a
            shipping method.
          </p>
        </header>

        <section>
          <h2>Delivery Destination</h2>

          <div className="warehouse-package">
            <div>
              <strong>{address.recipientName}</strong>
              <p>{address.phone}</p>
              <p>{address.address}</p>
              <p>
                {address.city}
                {address.stateProvince
                  ? `, ${address.stateProvince}`
                  : ""}
              </p>
              <p>{address.postalCode}</p>
              <p>{address.country}</p>
            </div>

            <a
              className="button button--brand"
              href="/account/address"
            >
              Edit Address
            </a>
          </div>
        </section>

        <section>
          <h2>Selected Packages</h2>

          {packages.map((pkg) => (
            <div className="warehouse-package" key={pkg.id}>
              <strong>{pkg.trackingNumber}</strong>
              <strong>{pkg.weight.toFixed(1)} kg</strong>
            </div>
          ))}

          <div style={{ marginTop: "20px" }}>
            <p>
              Packages selected: <strong>{packages.length}</strong>
            </p>
            <p>
              Total weight: <strong>{totalWeight.toFixed(1)} kg</strong>
            </p>
          </div>
        </section>

        <p>
          Your address will be saved with this shipment when you confirm the
          shipment details.
        </p>

        <a
          className="button button--brand"
          href={`/account/shipments/prepare/method?packages=${packages
            .map((pkg) => pkg.id)
            .join(",")}`}
        >
          Continue to Shipping Method
        </a>
      </div>
    </AccountLayout>
  );
}
