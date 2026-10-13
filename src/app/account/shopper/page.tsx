import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../components/account/AccountLayout";

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function formatPrice(price: { toString(): string } | null) {
  if (!price) return null;

  return `₩${Number(price.toString()).toLocaleString("en-US")}`;
}

export default async function ShopperPage() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      personalShopperRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const requests = user?.personalShopperRequests ?? [];

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Personal Shopper</h1>
          <p>View and manage your Personal Shopper requests.</p>
        </header>

        <section>
          <h2>Active Requests</h2>

          {requests.length === 0 ? (
            <p>You don't have any Personal Shopper requests yet.</p>
          ) : (
            requests.map((request) => (
              <div className="shopper-request" key={request.id}>
                <div>
                  <strong>{request.productName}</strong>
                  <p>
                    Requested{" "}
                    {request.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>

                  {request.productUrl && (
                    <p>
                      <a
                        href={request.productUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View product
                      </a>
                    </p>
                  )}
                </div>

                <div>
                  <strong>{formatStatus(request.status)}</strong>

                  {request.quotedPrice && (
                    <p>Product: {formatPrice(request.quotedPrice)}</p>
                  )}

                  {request.serviceFee && (
                    <p>Service fee: {formatPrice(request.serviceFee)}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <section>
          <h2>Request a Product</h2>

          <p>
            Can't purchase a product from a Korean store yourself?
            Let Oppapost purchase it for you.
          </p>

          <button type="button">Request a Product</button>
        </section>
      </div>
    </AccountLayout>
  );
}
