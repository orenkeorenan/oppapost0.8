type KoreanAddressCardProps = {
  name: string;
  address: string;
};

export function KoreanAddressCard({
  name,
  address,
}: KoreanAddressCardProps) {
  return (
    <section>
      <h2>Your Korean Address</h2>

      <p>Name</p>
      <strong>{name}</strong>

      <p>Warehouse Address</p>
      <strong>{address}</strong>

      <button type="button">Copy Address</button>
    </section>
  );
}
