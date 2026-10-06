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
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);

  const calculateEstimate = () => {
    const numericWeight = Number(weight);

    if (!numericWeight || numericWeight <= 0) {
      setEstimatedFee(null);
      return;
    }

    const countryRate: Record<string, number> = {
      Indonesia: 12000,
      "United States": 18000,
      Japan: 10000,
      Singapore: 11000,
      Australia: 16000,
    };

    const baseRate = countryRate[country] ?? 12000;

    const fee = Math.round(
      baseRate + numericWeight * 6250
    );

    setEstimatedFee(fee);
  };

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
            {estimatedFee !== null
              ? `₩${estimatedFee.toLocaleString()}`
              : "—"}
          </p>

          <p className="body-muted">
            {estimatedFee !== null
              ? `≈ IDR ${Math.round(estimatedFee * 10.6).toLocaleString()}`
              : "Enter your weight to calculate"}
          </p>

          <p className="shipping-calculator__disclaimer">
            Sample estimate only. Final shipping cost may vary
            depending on carrier, package dimensions, and destination.
          </p>
        </div>

        <button
          type="button"
          className="button button--brand"
          onClick={calculateEstimate}
        >
          Calculate Estimate
        </button>
      </div>
    </div>
  );
}
