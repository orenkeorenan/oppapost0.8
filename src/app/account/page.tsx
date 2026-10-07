import { AccountLayout } from "../components/account/AccountLayout";
import { WarehouseStatus } from "../components/account/WarehouseStatus";
import { KoreanAddressCard } from "../components/account/KoreanAddressCard";
import { CurrentShipmentCard } from "../components/account/CurrentShipmentCard";
import { PersonalShopperCard } from "../components/account/PersonalShopperCard";
import { RecentActivity } from "../components/account/RecentActivity";

export default function AccountPage() {
  return (
    <AccountLayout>
  <div className="account-dashboard">
    <header className="account-dashboard__header">
      <h1>My Oppapost</h1>
      <p>Welcome back.</p>
    </header>

    <div className="dashboard-grid dashboard-grid--top">
      <WarehouseStatus
        incoming={2}
        warehouseWeight={5}
        readyToShipWeight={5}
      />

      <KoreanAddressCard
        name="Bernardus Oren"
        address="123 Example-ro, Busan, South Korea"
      />
    </div>

    <CurrentShipmentCard
      method="Air Cargo"
      weight={5}
      status="Shipping"
      shippedDate="Oct 10"
      estimatedArrival="Oct 14–17"
      trackingNumber="KR123456789"
    />

    <div className="dashboard-grid dashboard-grid--bottom">
      <PersonalShopperCard
        productName="Nike Air Max"
        status="Purchased / Incoming"
      />

      <RecentActivity
        activities={[
          {
            id: 1,
            message: "Package received at warehouse",
            date: "Oct 8",
          },
          {
            id: 2,
            message: "Personal Shopper purchase completed",
            date: "Oct 7",
          },
          {
            id: 3,
            message: "Shipment created",
            date: "Oct 6",
          },
        ]}
      />
    </div>
  </div>
</AccountLayout>
  );
}
