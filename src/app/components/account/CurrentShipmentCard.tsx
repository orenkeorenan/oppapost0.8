type CurrentShipmentCardProps = {
  method: string;
  weight: number;
  shippedDate: string;
  estimatedArrival: string;
  trackingNumber: string;
  status: string;
};

export function CurrentShipmentCard({
  method,
  weight,
  shippedDate,
  estimatedArrival,
  trackingNumber,
  status,
}: CurrentShipmentCardProps) {
  return (
    <section>
      <div className="shipment-card-header">
        <div>
          <h2>Current Shipment</h2>
          <p>{method}</p>
        </div>

        <span className="shipment-status">{status}</span>
      </div>

      <div className="shipment-details">
        <div>
          <span>Weight</span>
          <strong>{weight.toFixed(1)} kg</strong>
        </div>

        <div>
          <span>Shipped</span>
          <strong>{shippedDate}</strong>
        </div>

        <div>
          <span>Estimated Arrival</span>
          <strong>{estimatedArrival}</strong>
        </div>
      </div>

      <div className="shipment-tracking">
        <span>Tracking Number</span>
        <strong>{trackingNumber}</strong>
      </div>

      <button type="button">Track Shipment</button>
    </section>
  );
}
