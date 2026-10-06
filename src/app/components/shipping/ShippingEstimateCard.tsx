"use client";

import { useState } from "react";
import { ArrowRight, Calculator, CheckCircle2, Package } from "lucide-react";

const countries = [
  "Indonesia",
  "United States",
  "Japan",
  "Singapore",
  "Australia",
];

type ShippingEstimateCardProps = {
  onCalculate?: () => void;
};

export function ShippingEstimateCard({
  onCalculate,
}: ShippingEstimateCardProps) {
  const [country, setCountry] = useState(countries[0]);
  const [weight, setWeight] = useState("2");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (onCalculate) {
      onCalculate();
    }
  };

  return (
    <div className="estimate-card-wrap">
      <form
        onSubmit={handleSubmit}
        className="estimate-card"
        aria-label="Shipping estimate"
      >
        <div className="estimate-card__header">
          <span className="estimate-card__icon-wrap">
            <Calculator className="icon" aria-hidden="true" />
          </span>

          <div className="min-width-zero">
            <h2 className="estimate-card__title">
              Shipping Estimate
            </h2>

            <p className="small-muted">
              Get an estimate for your shipment.
            </p>
          </div>
        </div>

        <div className="estimate-card__body">
          <div>
            <label htmlFor="country" className="form-label">
              Destination Country
            </label>

            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="form-select"
            >
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="weight" className="form-label">
              Weight
            </label>

            <div className="weight-field">
              <input
                id="weight"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="weight-field__input"
              />

              <span className="weight-field__unit">
                kg
              </span>
            </div>
          </div>

          <div>
            <p className="form-label">
              Estimated Shipping Fee
            </p>

            <p className="estimate-card__price">
              ₩24,500
            </p>

            <p className="body-muted">
              = IDR 260,000
            </p>

            <p className="estimate-card__disclaimer">
              Sample figures for preview only. Final shipping cost may vary based on carrier and package size.
            </p>
          </div>

          <button
            type="submit"
            className="button button--brand estimate-card__submit"
          >
            Calculate Estimate

            <ArrowRight
              className="icon icon--sm"
              aria-hidden="true"
            />
          </button>
        </div>
      </form>
      <div className="status-card">
        <span className="status-card__icon-wrap">
          <Package className="icon icon--sm text-brand" aria-hidden="true" />
        </span>

        <div className="min-width-zero">
          <p className="hero__indicator-title">Package received</p>

          <p className="status-card__detail">
            <CheckCircle2
              className="icon icon--xs text-brand"
              aria-hidden="true"
            />
            Ready for inspection
          </p>
        </div>
      </div>
    </div>
  );
}
