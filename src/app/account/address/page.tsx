import { AccountLayout } from "../../components/account/AccountLayout";
import { KoreanAddressCard } from "../../components/account/KoreanAddressCard";

export default function AddressPage() {
  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>My Korean Address</h1>
          <p>Use this address when shopping from Korean stores.</p>
        </header>

        <KoreanAddressCard
          name="Bernardus Oren"
          address="123 Example-ro, Busan, South Korea"
        />
      </div>
    </AccountLayout>
  );
}
