type PersonalShopperCardProps = {
  productName: string;
  status: string;
};

export function PersonalShopperCard({
  productName,
  status,
}: PersonalShopperCardProps) {
  return (
    <section>
      <div className="shopper-card-header">
        <div>
          <h2>Personal Shopper</h2>
          <p>Your latest request</p>
        </div>

        <span className="shopper-status">{status}</span>
      </div>

      <div className="shopper-product">
        <strong>{productName}</strong>
        <span>Personal Shopper Request</span>
      </div>

      <button type="button">View Requests</button>
    </section>
  );
}
