import { AccountLayout } from "../../components/account/AccountLayout";

export default function WarehousePage() {
  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>Warehouse</h1>
          <p>View packages currently being processed or stored.</p>
        </header>

        <section>
          <h2>Warehouse Summary</h2>

          <div className="warehouse-stats">
            <div className="warehouse-stat">
              <span>Incoming</span>
              <strong>2</strong>
              <small>packages</small>
            </div>

            <div className="warehouse-stat">
              <span>In Warehouse</span>
              <strong>5.0 kg</strong>
              <small>stored weight</small>
            </div>

            <div className="warehouse-stat">
              <span>Ready to Ship</span>
              <strong>5.0 kg</strong>
              <small>available to ship</small>
            </div>
          </div>
        </section>

        <section>
          <h2>Your Packages</h2>

          <div className="warehouse-package">
            <div>
              <strong>KR123456789</strong>
              <p>Received · Oct 8</p>
            </div>

            <div>
              <strong>2.5 kg</strong>
              <p>Ready to Ship</p>
            </div>
          </div>

          <div className="warehouse-package">
            <div>
              <strong>KR987654321</strong>
              <p>Received · Oct 7</p>
            </div>

            <div>
              <strong>2.5 kg</strong>
              <p>Ready to Ship</p>
            </div>
          </div>
        </section>
      </div>
    </AccountLayout>
  );
}
