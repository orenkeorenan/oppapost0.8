import Link from "next/link";
import {
  ArrowRight,
  Box,
  ClipboardList,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

type Activity = {
  id: string;
  message: string;
  date: string;
};

type DashboardOverviewProps = {
  name: string;
  activeRequests: number;
  warehousePackages: number;
  inTransitShipments: number;
  readyToShipPackages: number;
  recentActivity: Activity[];
  latestRequest?: {
    productName: string;
    status: string;
    createdAt: string;
  } | null;
};

export function DashboardOverview({
  name,
  activeRequests,
  warehousePackages,
  inTransitShipments,
  readyToShipPackages,
  recentActivity,
  latestRequest,
}: DashboardOverviewProps) {
  const stats = [
    {
      label: "Active shopper requests",
      value: activeRequests,
      detail: "View your requests",
      href: "/account/shopper",
      icon: ShoppingBag,
      tone: "orange",
    },
    {
      label: "Warehouse packages",
      value: warehousePackages,
      detail: "Open warehouse",
      href: "/account/warehouse",
      icon: Package,
      tone: "blue",
    },
    {
      label: "In transit",
      value: inTransitShipments,
      detail: "Track shipments",
      href: "/account/shipments",
      icon: Truck,
      tone: "green",
    },
    {
      label: "Ready to ship",
      value: readyToShipPackages,
      detail: "Prepare shipment",
      href: "/account/warehouse",
      icon: Box,
      tone: "purple",
    },
  ];

  return (
    <div className="customer-overview">
      <header className="overview-heading">
        <div>
          <h1>Welcome back, {name}</h1>
          <p>Here’s your Oppapost dashboard overview.</p>
        </div>
        <Link className="overview-text-link" href="/shopper">
          Shop Korean products <ArrowRight size={15} />
        </Link>
      </header>

      <section className="overview-stats" aria-label="Account summary">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="overview-stat" key={stat.label}>
              <div className={`overview-stat-icon ${stat.tone}`}>
                <Icon size={21} />
              </div>
              <div className="overview-stat-copy">
                <div className="overview-stat-label">{stat.label}</div>
                <div className="overview-stat-value">{stat.value}</div>
                <Link className="overview-stat-link" href={stat.href}>
                  {stat.detail} <ArrowRight size={12} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <div className="overview-main-grid">
        <section className="overview-panel">
          <div className="overview-panel-heading">
            <h2>Recent Activity</h2>
            <Link className="overview-text-link" href="/account/warehouse">
              View activity <ArrowRight size={14} />
            </Link>
          </div>
          {recentActivity.length ? (
            <div className="overview-activity-list">
              {recentActivity.slice(0, 5).map((activity) => (
                <div className="overview-activity" key={activity.id}>
                  <span className="overview-activity-dot" />
                  <div>
                    <p className="overview-activity-message">{activity.message}</p>
                    <p className="overview-activity-date">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="overview-empty">Your package and shipment updates will appear here.</p>
          )}
        </section>

        <section className="overview-banner">
          <div className="overview-banner-content">
            <span className="overview-banner-eyebrow">KOREA TO YOUR WORLD</span>
            <h2>Discover your next Korean favorite.</h2>
            <p>Explore products selected from Korea and let Oppapost help bring them to your door.</p>
            <Link className="overview-banner-button" href="/shopper">
              Browse products <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </div>

      <div className="overview-lower-grid">
        <section className="overview-panel">
          <div className="overview-panel-heading">
            <h2>Latest Shopper Request</h2>
            <Link className="overview-text-link" href="/account/shopper">
              View requests <ArrowRight size={14} />
            </Link>
          </div>
          {latestRequest ? (
            <div className="overview-request">
              <div>
                <p className="overview-request-name">{latestRequest.productName}</p>
                <p className="overview-request-meta">Submitted {latestRequest.createdAt}</p>
              </div>
              <span className="overview-status">{latestRequest.status}</span>
            </div>
          ) : (
            <p className="overview-empty">You have no custom shopper requests yet.</p>
          )}
        </section>

        <section className="overview-panel">
          <div className="overview-panel-heading">
            <h2>Quick Access</h2>
          </div>
          <div className="overview-shortcuts">
            <Link className="overview-shortcut" href="/account/address"><MapPin className="overview-shortcut-icon" size={17} /> Korean address</Link>
            <Link className="overview-shortcut" href="/account/warehouse"><Package className="overview-shortcut-icon" size={17} /> Warehouse</Link>
            <Link className="overview-shortcut" href="/account/shipments"><Truck className="overview-shortcut-icon" size={17} /> Shipments</Link>
            <Link className="overview-shortcut" href="/account/shopper"><ClipboardList className="overview-shortcut-icon" size={17} /> Shopper requests</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
