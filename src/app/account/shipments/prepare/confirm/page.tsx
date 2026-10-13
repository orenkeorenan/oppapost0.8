
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../../../components/account/AccountLayout";
import { ConfirmShipmentButton } from "../../../../components/account/ConfirmShipmentButton";

type ConfirmPageProps = {
  searchParams: Promise<{
    packages?: string;
    method?: string;
  }>;
};

export default async function ConfirmShipmentPage({
  searchParams,
}: ConfirmPageProps) {
  const sessionUser = await requireUser();
  const params = await searchParams;

  const packageIds = (params.packages ?? "")
    .split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

  const method = params.method;
  const allowedMethods = ["EMS", "AIR_CARGO"];

  if (
    packageIds.length === 0 ||
    new Set(packageIds).size !== packageIds.length ||
    !method ||
    !allowedMethods.includes(method)
  ) {
    redirect("/account/shipments/prepare");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { address: true },
  });

  if (!user?.address) {
    redirect("/account/address");
  }

  const isIndonesia =
    user.address.country.trim().toLowerCase() === "indonesia";

  if (method === "AIR_CARGO" && !isIndonesia) {
    redirect("/account/shipments/prepare/method?packages=" +
      packageIds.join(","));
  }

  const packages = await prisma.package.findMany({
    where: {
      id: { in: packageIds },
      userId: sessionUser.id,
      status: "READY_TO_SHIP",
      shipmentItems: { none: {} },
    },
    select: {
      id: true,
      trackingNumber: true,
      weight: true,
    },
  });

  if (packages.length !== packageIds.length) {
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
          <h1>Confirm Your Shipment</h1>
          <p>
            Review your packages, delivery destination, and shipping
            method before proceeding.
          </p>
        </header>

        <section>
          <h2>Shipping Method</h2>
          <div className="warehouse-package">
            <div>
              <strong>
                {method === "EMS" ? "EMS" : "Air Cargo"}
              </strong>
              <p>
                Destination: {address.country}
              </p>
            </div>
            <strong>{totalWeight.toFixed(1)} kg</strong>
          </div>
        </section>

        <section>
          <h2>Delivery Address</h2>
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
          </div>
        </section>

        <section>
          <h2>Packages ({packages.length})</h2>
          {packages.map((pkg) => (
            <div className="warehouse-package" key={pkg.id}>
              <strong>{pkg.trackingNumber}</strong>
              <strong>{pkg.weight.toFixed(1)} kg</strong>
            </div>
          ))}
          <p style={{ marginTop: "16px" }}>
            Total weight: <strong>{totalWeight.toFixed(1)} kg</strong>
          </p>
        </section>

        <p>
          Shipping prices and delivery estimates will be confirmed once
          the applicable rates and service details are available.
        </p>

        <ConfirmShipmentButton
            packageIds={packages.map((pkg) => pkg.id)}
            method={method as "EMS" | "AIR_CARGO"}
        />
      </div>
    </AccountLayout>
  );
}
