import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KoreanAddressCard } from "../../components/account/KoreanAddressCard";
import { AddressForm } from "../../components/account/AddressForm";
import { AccountLayout } from "../../components/account/AccountLayout";

export default async function AddressPage() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      address: true,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <header className="account-dashboard__header">
          <h1>My Addresses</h1>
          <p>
            Use the Korean warehouse address for Korean purchases and save
            your own address for international deliveries.
          </p>
        </header>

        <KoreanAddressCard />

        
        <AddressForm
          initialAddress={
            user.address
              ? {
                  recipientName: user.address.recipientName,
                  phone: user.address.phone,
                  address: user.address.address,
                  city: user.address.city,
                  stateProvince: user.address.stateProvince,
                  postalCode: user.address.postalCode,
                  country: user.address.country,
                }
              : null
          }
        />

      </div>
    </AccountLayout>
  );
}
