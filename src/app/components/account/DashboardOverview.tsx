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
      <style jsx>{`
        .customer-overview { display: grid; gap: 24px; color: #263a5b; }
        .overview-heading { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; }
        .overview-heading h1 { margin:0; color:#172b4d; font-size:30px; line-height:1.2; font-weight:800; }
        .overview-heading p { margin:8px 0 0; color:#718096; font-size:14px; }
        .overview-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
        .overview-stat { display:flex; align-items:center; gap:13px; min-width:0; padding:18px; border:1px solid #e8edf3; border-radius:16px; background:#fff; box-shadow:0 3px 14px rgba(30,55,90,.04); }
        .overview-stat-icon { display:grid; place-items:center; width:44px; height:44px; flex:0 0 auto; border-radius:14px; }
        .overview-stat-icon.orange { color:#ea580c; background:#fff0e5; }
        .overview-stat-icon.blue { color:#2563eb; background:#eaf2ff; }
        .overview-stat-icon.green { color:#0f9f6e; background:#e8f8f1; }
        .overview-stat-icon.purple { color:#7c3aed; background:#f2ebff; }
        .overview-stat-copy { min-width:0; }
        .overview-stat-label { color:#64748b; font-size:12px; line-height:1.4; }
        .overview-stat-value { margin-top:3px; color:#172b4d; font-size:25px; font-weight:800; line-height:1.1; }
        .overview-stat-link { display:inline-flex; align-items:center; gap:4px; margin-top:8px; color:#e85d0c; font-size:11px; font-weight:700; }
        .overview-main-grid { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr); gap:18px; }
        .overview-panel { min-width:0; padding:22px; border:1px solid #e8edf3; border-radius:16px; background:#fff; box-shadow:0 3px 14px rgba(30,55,90,.035); }
        .overview-panel-heading { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
        .overview-panel-heading h2 { margin:0; color:#172b4d; font-size:17px; font-weight:800; }
        .overview-text-link { display:inline-flex; align-items:center; gap:5px; color:#e85d0c; font-size:12px; font-weight:700; white-space:nowrap; }
        .overview-activity-list { display:grid; }
        .overview-activity { display:flex; align-items:flex-start; gap:12px; padding:13px 0; border-top:1px solid #eef1f5; }
        .overview-activity:first-child { border-top:0; padding-top:0; }
        .overview-activity-dot { width:9px; height:9px; margin-top:5px; flex:0 0 auto; border-radius:50%; background:#f97316; box-shadow:0 0 0 4px #fff0e5; }
        .overview-activity-message { color:#334155; font-size:13px; line-height:1.5; }
        .overview-activity-date { margin-top:4px; color:#94a3b8; font-size:11px; }
        .overview-empty { padding:20px 0; color:#718096; font-size:13px; }
        .overview-banner { position:relative; display:flex; flex-direction:column; justify-content:center; min-height:230px; overflow:hidden; padding:26px; border:1px solid #ffdfc7; border-radius:18px; background:linear-gradient(115deg,#fff1e5 0%,#fff9f2 58%,#eef5ff 100%); }
        .overview-banner:after { content:""; position:absolute; width:180px; height:180px; right:-35px; top:-45px; border-radius:50%; background:rgba(255,255,255,.55); }
        .overview-banner-content { position:relative; z-index:1; max-width:340px; }
        .overview-banner-eyebrow { color:#ea580c; font-size:10px; font-weight:800; letter-spacing:1.3px; }
        .overview-banner h2 { margin:10px 0 8px; color:#172b4d; font-size:24px; line-height:1.2; font-weight:800; }
        .overview-banner p { margin:0; color:#64748b; font-size:13px; line-height:1.6; }
        .overview-banner-button { display:inline-flex; align-items:center; gap:8px; width:max-content; margin-top:18px; padding:11px 16px; border-radius:10px; background:#ea580c; color:#fff; font-size:12px; font-weight:800; }
        .overview-lower-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:18px; }
        .overview-request { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px; border:1px solid #eef1f5; border-radius:12px; background:#fbfcfe; }
        .overview-request-name { color:#263a5b; font-size:13px; font-weight:700; }
        .overview-request-meta { margin-top:5px; color:#8492a6; font-size:11px; }
        .overview-status { display:inline-flex; padding:6px 9px; border-radius:999px; background:#fff2df; color:#b45309; font-size:10px; font-weight:800; white-space:nowrap; }
        .overview-shortcuts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
        .overview-shortcut { display:flex; align-items:center; gap:10px; padding:13px; border:1px solid #edf0f4; border-radius:12px; color:#334155; font-size:12px; font-weight:700; }
        .overview-shortcut-icon { color:#ea580c; }
        @media(max-width:1050px) { .overview-stats { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(max-width:760px) {
          .overview-heading h1 { font-size:25px; }
          .overview-main-grid,.overview-lower-grid { grid-template-columns:1fr; }
          .overview-banner { min-height:200px; }
        }
        @media(max-width:480px) {
          .overview-stats { grid-template-columns:1fr 1fr; gap:9px; }
          .overview-stat { align-items:flex-start; flex-direction:column; padding:13px; gap:9px; }
          .overview-stat-icon { width:38px; height:38px; }
          .overview-stat-value { font-size:22px; }
          .overview-panel { padding:17px; }
          .overview-shortcuts { grid-template-columns:1fr; }
        }
      `}</style>

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
