type WarehouseStatusProps = {
  incoming: number;
  warehouseWeight: number;
  readyToShipWeight: number;
};

export function WarehouseStatus({
  incoming,
  warehouseWeight,
  readyToShipWeight,
}: WarehouseStatusProps) {
  return (
    <section>
      <h2>Warehouse Status</h2>

      <div className="warehouse-stats">
        <div className="warehouse-stat">
          <span>Incoming</span>
          <strong>{incoming}</strong>
          <small>packages</small>
        </div>

        <div className="warehouse-stat">
          <span>In Warehouse</span>
          <strong>{warehouseWeight.toFixed(1)} kg</strong>
          <small>stored weight</small>
        </div>

        <div className="warehouse-stat">
          <span>Ready to Ship</span>
          <strong>{readyToShipWeight.toFixed(1)} kg</strong>
          <small>available to ship</small>
        </div>
      </div>
    </section>
  );
}
