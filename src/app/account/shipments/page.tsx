import { AccountLayout } from "../../components/account/AccountLayout";

export default function ShipmentsPage() {
  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Shipments</h1>
          <p>Track your international shipments and delivery history.</p>
        </header>

        <section>
          <h2>Active Shipment</h2>

          <div className="shipment-history-item">
            <div>
              <strong>KR123456789</strong>
              <p>Air Cargo · 5.0 kg</p>
            </div>

            <div>
              <strong>Shipping</strong>
              <p>Estimated Oct 14–17</p>
            </div>

            <button type="button">Track Shipment</button>
          </div>
        </section>

        <section>
          <h2>Shipment History</h2>

          <div className="shipment-history-item">
            <div>
              <strong>KR555555555</strong>
              <p>Air Cargo · 3.2 kg</p>
            </div>

            <div>
              <strong>Delivered</strong>
              <p>Sep 28</p>
            </div>
          </div>

          <div className="shipment-history-item">
            <div>
              <strong>KR444444444</strong>
              <p>EMS · 1.8 kg</p>
            </div>

            <div>
              <strong>Delivered</strong>
              <p>Sep 12</p>
            </div>
          </div>
        </section>
      </div>
    </AccountLayout>
  );
}
