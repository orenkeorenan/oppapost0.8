
type FinalCtaProps = {
  onAddress: () => void;
};

export function FinalCta({
  onAddress,
}: FinalCtaProps) {
  return (
    <section className="final-cta" id="contact">
      <img
        src="/assets/korea-skyline.jpg"
        alt="Korean coastal city skyline at dusk"
        loading="lazy"
        width={1920}
        height={700}
        className="final-cta__image"
      />
      <div className="final-cta__overlay" />
      <div className="container final-cta__content">
        <h2 className="final-cta__title">
          Korea is closer than you think.
        </h2>
        <p className="final-cta__description">
          Your favorite stores. A trusted warehouse. A bigger world.
        </p>
        <div className="final-cta__actions">
          <a
            href="#top"
            className="button button--brand"
            onClick={onAddress}
          >
            Get Your Korean Address
          </a>
          <button
            type="button"
            className="button button--light-outline final-cta__button"
          >
            Track Shipment
          </button>
        </div>
      </div>
    </section>
  );
}

