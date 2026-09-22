import { Building2, Package, Plane, ShoppingCart } from "lucide-react";


const steps = [
  {
    n: "01",
    icon: ShoppingCart,
    title: "Buy",
    desc: "Shop from Korean online stores.",
    img: "/assets/step-buy.jpg",
    alt: "Shopping on a Korean online store from a laptop",
  },
  {
    n: "02",
    icon: Building2,
    title: "Store",
    desc: "Send purchases to your Oppapost Korean address.",
    img: "/assets/step-store.jpg",
    alt: "Oppapost warehouse building",
  },
  {
    n: "03",
    icon: Package,
    title: "Combine",
    desc: "We receive and consolidate your packages.",
    img: "/assets/step-combine.jpg",
    alt: "Packing consolidated parcels into one box",
  },
  {
    n: "04",
    icon: Plane,
    title: "Ship",
    desc: "Ship worldwide.",
    img: "/assets/step-ship.jpg",
    alt: "Cargo aircraft in flight",
  },
];

export function HowItWorks() {
  return (
    <section className="section section--white">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Simple steps</p>
          <h2 className="section-title">
            How Oppapost Works
          </h2>
          <p className="section-subtitle">
            Easy, simple, and reliable. Get your Korean favorites in 4 steps.
          </p>
        </div>

        <ol className="steps-grid">
          {steps.map(({ n, icon: Icon, title, desc, img, alt }) => (
            <li
              key={n}
              className="step-card"
            >
              <div className="step-card__header">
                <span className="step-card__number">
                  {n}
                </span>
                <div className="min-width-zero">
                  <p className="step-card__title">
                    <Icon className="icon icon--sm" aria-hidden="true" />
                    {title}
                  </p>
                  <p className="step-card__description">{desc}</p>
                </div>
              </div>
              <img
                src={img}
                alt={alt}
                loading="lazy"
                width={640}
                height={512}
                className="step-card__image"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
