import { FileText, MapPin, Package, Plane, Search, ShoppingBag } from "lucide-react";

const benefits = [
  {
    icon: MapPin,
    title: "Korean Address",
    desc: "Get your own Korean address to shop from any store.",
  },
  { icon: Package, title: "Package Consolidation", desc: "Combine multiple packages to save on shipping." },
  { icon: Plane, title: "International Shipping", desc: "Reliable shipping to 200+ countries." },
  { icon: FileText, title: "Transparent Pricing", desc: "Clear and upfront fees. No hidden costs." },
  { icon: Search, title: "Package Tracking", desc: "Track your packages every step of the way." },
  { icon: ShoppingBag, title: "Personal Shopper", desc: "We buy from Korean stores on your behalf." },
];

export function WhyOppapost() {
  return (
    <section className="section section--white">
      <div className="container container--narrow">
        <div className="section-heading">
          <p className="eyebrow">
            Why choose Oppapost
          </p>
          <h2 className="section-title">
            More Than a Forwarding Service
          </h2>
          <p className="section-subtitle">
            A trusted partner for your Korean shopping journey.
          </p>
        </div>

        <ul className="benefits-grid">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="benefit">
              <span className="benefit__icon-wrap">
                <Icon className="icon" aria-hidden="true" />
              </span>
              <div className="min-width-zero">
                <h3 className="benefit__title">{title}</h3>
                <p className="benefit__description">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
