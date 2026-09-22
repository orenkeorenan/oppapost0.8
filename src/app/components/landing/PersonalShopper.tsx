import { ArrowRight, Cookie, Gift, Shirt, Music, Sparkles, Sofa } from "lucide-react";

const categories = [
  { icon: Sparkles, label: "K-Beauty" },
  { icon: Shirt, label: "K-Fashion" },
  { icon: Music, label: "K-Pop" },
  { icon: Cookie, label: "Snacks" },
  { icon: Sofa, label: "Lifestyle" },
  { icon: Gift, label: "Collectibles" },
];

export function PersonalShopper() {
  return (
    <section id="personal-shopper" className="section section--cream">
      <div className="container shopper__layout">
        <div>
          <p className="eyebrow">
            Personal Shopper
          </p>
          <h2 className="section-title">
            We'll Shop It for You
          </h2>
          <p className="shopper__description">
            Found something in a Korean store but can't purchase it? Our{" "}
            <strong className="text-strong">Personal Shopper</strong> service buys it
            for you.
          </p>
          <button
            type="button"
            className="button button--brand shopper__button"
          >
            Request a Personal Shopper <ArrowRight className="icon icon--sm" aria-hidden="true" />
          </button>

          <ul className="shopper__categories">
            {categories.map(({ icon: Icon, label }) => (
              <li key={label} className="shopper__category">
                <span className="shopper__category-icon">
                  <Icon className="icon" aria-hidden="true" />
                </span>
                <span className="shopper__category-label">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <img
          src="/assets/personal-shopper.jpg"
          alt="Korean beauty, fashion and lifestyle products laid out together"
          loading="lazy"
          width={1200}
          height={900}
          className="shopper__image"
        />
      </div>
    </section>
  );
}
