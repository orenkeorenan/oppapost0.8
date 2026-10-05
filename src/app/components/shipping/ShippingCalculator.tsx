"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

const countries = [
  "Indonesia",
  "United States",
  "Japan",
  "Singapore",
  "Australia",
];

export function ShippingCalculator() {
  const [country, setCountry] = useState(countries[0]);
  const [weight, setWeight] = useState("");

  return (
    <div className="shipping-calculator">
      <div className="shipping-calculator__header">
        <span className="shipping-calculator__icon-wrap">
          <Calculator className="icon" aria-hidden="true" />
        </span>

        <div>
          <h2 className="shipping-calculator__title">
            Shipping Calculator
          </h2>

          <p className="small-muted">
            Estimate your international shipping cost.
          </p>
        </div>
      </div>

      <div className="shipping-calculator__body">
        <div>
          <label
            htmlFor="calculator-country"
            className="form-label"
          >
            Destination Country
          </label>

          <select
            id="calculator-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="form-select"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="calculator-weight"
            className="form-label"
          >
            Package Weight
          </label>

          <div className="weight-field">
            <input
              id="calculator-weight"
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              className="weight-field__input"
            />

            <span className="weight-field__unit">
              kg
            </span>
          </div>
        </div>

        <div className="shipping-calculator__result">
          <p className="form-label">
            Estimated Shipping Fee
          </p>

          <p className="shipping-calculator__price">
            ₩24,500
          </p>

          <p className="body-muted">
            ≈ IDR 260,000
          </p>

          <p className="shipping-calculator__disclaimer">
            Sample estimate only. Final shipping cost may vary
            depending on carrier, package dimensions, and destination.
          </p>
        </div>

        <button
          type="button"
          className="button button--brand"
        >
          Calculate Estimate
        </button>
      </div>
    </div>
  );
}
