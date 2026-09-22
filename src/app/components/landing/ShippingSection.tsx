import { ArrowRight, Check } from "lucide-react";

const options = [
  {
    name: "EMS",
    points: ["Fast delivery", "Wide global coverage", "Online tracking", "Reliable and secure"],
  },
  {
    name: "Korea Post",
    points: [
      "Affordable rates",
      "Global delivery network",
      "Tracking available",
      "A trusted postal service",
    ],
  },
];

export function ShippingSection() {
  return (
    <section id="shipping" className="section section--sky">
      <div className="container shipping__layout">
        <div>
          <p className="eyebrow">Shipping</p>
          <h2 className="section-title shipping__title">
            Fast and Reliable Worldwide Shipping
          </h2>
          <p className="shipping__description">
            Choose from widely used shipping options such as EMS and Korea Post.
          </p>
          <button
            type="button"
            className="button button--brand shipping__button"
          >
            Check Shipping Rates <ArrowRight className="icon icon--sm" aria-hidden="true" />
          </button>
        </div>

        <div className="shipping__options">
          {options.map((o) => (
            <article
              key={o.name}
              className="shipping-card"
            >
              <h3 className="shipping-card__title">{o.name}</h3>
              <ul className="shipping-card__list">
                {o.points.map((p) => (
                  <li key={p} className="shipping-card__item">
                    <Check className="icon icon--sm shipping-card__check" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <img
            src="/assets/shipping-boxes.jpg"
            alt="Parcels moving along a conveyor belt in a shipping facility"
            loading="lazy"
            width={1200}
            height={800}
            className="shipping__image"
          />
        </div>
      </div>
    </section>
  );
}
