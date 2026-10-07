import { AccountLayout } from "../../components/account/AccountLayout";

export default function ShopperPage() {
  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Personal Shopper</h1>
          <p>View and manage your Personal Shopper requests.</p>
        </header>

        <section>
          <h2>Active Requests</h2>

          <div className="shopper-request">
            <div>
              <strong>Nike Air Max</strong>
              <p>Requested Oct 6</p>
            </div>

            <div>
              <strong>Purchased</strong>
              <p>Package incoming</p>
            </div>
          </div>

          <div className="shopper-request">
            <div>
              <strong>Korean Skincare Set</strong>
              <p>Requested Oct 5</p>
            </div>

            <div>
              <strong>Awaiting Payment</strong>
              <p>Quote available</p>
            </div>
          </div>
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
