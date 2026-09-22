import { ArrowRight, CheckCircle2, Home, Package, Plane, Search } from "lucide-react";
import { ShippingEstimateCard } from "./ShippingEstimateCard";

const indicators = [
  { icon: Home, title: "Korean Address", desc: "Get your own KR address" },
  { icon: Package, title: "Package Consolidation", desc: "Combine & save" },
  { icon: Plane, title: "Worldwide Shipping", desc: "To 200+ countries" },
];

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__desktop-image">
        <img
          src="/assets/hero-warehouse.jpg"
          alt="Oppapost warehouse worker inside a Korean fulfilment centre"
          width={1600}
          height={1100}
          className="hero__image"
        />
        <div className="hero__image-fade" />
      </div>

      <div className="container hero__container">
        <div className="hero__layout">
          <div className="hero__copy">
            <span className="hero__badge">
              <span aria-hidden="true">🇰🇷</span> Your Connection to Korea
            </span>

            <h1 className="hero__title">
              Everything you love from Korea.
              <br />
              <span className="text-brand">One trusted warehouse.</span>
            </h1>

            <p className="hero__description">
              Shop from any Korean store. Send your purchases to your Oppapost address. We receive,
              combine, and ship to you worldwide.
            </p>

            <button
              type="button"
              className="button button--navy hero__track"
            >
              <Search className="icon icon--sm" aria-hidden="true" />
              Track Shipment
              <ArrowRight className="icon icon--sm" aria-hidden="true" />
            </button>

            <ul className="hero__indicators">
              {indicators.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="hero__indicator">
                  <Icon className="icon hero__indicator-icon" aria-hidden="true" />
                  <div className="min-width-zero">
                    <p className="hero__indicator-title">{title}</p>
                    <p className="small-muted">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero__mobile-image-wrap">
            <img
              src="/assets/hero-warehouse.jpg"
              alt="Oppapost warehouse worker inside a Korean fulfilment centre"
              width={1600}
              height={1100}
              className="hero__mobile-image"
            />
          </div>

          <div className="hero__estimate-wrap">
            <div className="status-card">
              <span className="status-card__icon-wrap">
                <Package className="icon icon--sm text-brand" aria-hidden="true" />
              </span>
              <div className="min-width-zero">
                <p className="hero__indicator-title">Package received</p>
                <p className="status-card__detail">
                  <CheckCircle2 className="icon icon--xs text-brand" aria-hidden="true" />
                  Ready for inspection
                </p>
              </div>
            </div>
            <ShippingEstimateCard />
          </div>
        </div>
      </div>
    </section>
  );
}
