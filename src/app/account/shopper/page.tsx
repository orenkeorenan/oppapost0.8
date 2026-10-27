
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AccountLayout } from "../../components/account/AccountLayout";
import { ShopperRequestForm } from "./ShopperRequestForm";
import { ShopperPaymentInstructions } from "./ShopperPaymentInstructions";

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function formatPrice(price: { toString(): string } | null) {
  if (price === null) return null;

  return `₩${Number(price.toString()).toLocaleString("en-US")}`;
}

export default async function ShopperPage() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      personalShopperRequests: {
        orderBy: { createdAt: "desc" },
        include: {
          package: {
            select: {
              id: true,
              trackingNumber: true,
              status: true,
              weight: true,
            },
          },
        },
      },
    },
  });

  const requests = user?.personalShopperRequests ?? [];

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Personal Shopper</h1>
          <p>
            View your Personal Shopper requests, prices, and package status.
          </p>
        </header>

        <section>
          <h2>My Requests</h2>

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
                      year: "numeric",
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

                  {request.quotedPrice !== null && (
                    <p>Product price: {formatPrice(request.quotedPrice)}</p>
                  )}

                  {request.serviceFee !== null && (
                    <p>Service fee: {formatPrice(request.serviceFee)}</p>
                  )}

                  {request.quotedPrice !== null &&
                    request.serviceFee !== null && (
                      <p>
                        <strong>
                          Total:{" "}
                          {formatPrice(
                            Number(request.quotedPrice.toString()) +
                              Number(request.serviceFee.toString())
                          )}
                        </strong>
                      </p>
                    )}
                </div>

                {request.package && (
                  <div>
                    <strong>Warehouse Package</strong>
                    <p>Tracking number: {request.package.trackingNumber}</p>
                    <p>
                      Package status: {formatStatus(request.package.status)}
                    </p>
                    <p>
                      Weight:{" "}
                      {Number(request.package.weight).toLocaleString("en-US")}{" "}
                      kg
                    </p>
                    <p>Package ID: {request.package.id}</p>
                  </div>
                )}

                {request.status === "AWAITING_PAYMENT" &&
                  request.quotedPrice !== null &&
                  request.serviceFee !== null && (
                    <ShopperPaymentInstructions
                      total={
                        Number(request.quotedPrice.toString()) +
                        Number(request.serviceFee.toString())
                      }
                    />
                  )}
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

          <ShopperRequestForm />
        </section>
      </div>
    </AccountLayout>
  );
}
