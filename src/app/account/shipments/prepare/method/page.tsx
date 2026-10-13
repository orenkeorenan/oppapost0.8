
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../../../components/account/AccountLayout";

type ShippingMethodPageProps = {
  searchParams: Promise<{
    packages?: string;
  }>;
};

export default async function ShippingMethodPage({
  searchParams,
}: ShippingMethodPageProps) {
  const sessionUser = await requireUser();
  const params = await searchParams;

  const packageIds = (params.packages ?? "")
    .split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

  if (
    packageIds.length === 0 ||
    new Set(packageIds).size !== packageIds.length
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

  const isIndonesia =
    user.address.country.trim().toLowerCase() === "indonesia";

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Choose Shipping Method</h1>
          <p>
            Select a shipping service for your packages going to{" "}
            {user.address.country}.
          </p>
        </header>

        <section>
          <h2>Shipment Summary</h2>
          <p>Packages: {packages.length}</p>
          <p>Total weight: {totalWeight.toFixed(1)} kg</p>
          <p>
            Destination: {user.address.city},{" "}
            {user.address.country}
          </p>
        </section>

        <section>
          <h2>Available Methods</h2>

          <form action="/account/shipments/prepare/confirm" method="GET">
            <input
              type="hidden"
              name="packages"
              value={packages.map((pkg) => pkg.id).join(",")}
            />

            <label
              className="warehouse-package"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="method"
                value="EMS"
                required
              />
              <div>
                <strong>EMS</strong>
                <p>International postal shipping.</p>
              </div>
            </label>

            {isIndonesia && (
              <label
                className="warehouse-package"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="method"
                  value="AIR_CARGO"
                  required
                />
                <div>
                  <strong>Air Cargo</strong>
                  <p>Air freight shipping to Indonesia.</p>
                </div>
              </label>
            )}

            <button
              type="submit"
              className="button button--brand"
              style={{ marginTop: "20px" }}
            >
              Continue to Confirmation
            </button>
          </form>
        </section>
      </div>
    </AccountLayout>
  );
}
