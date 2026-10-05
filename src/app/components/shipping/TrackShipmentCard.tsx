"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";

export function TrackShipmentCard() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
        setMessage("Please enter your tracking number.");
        return;
    }

        setIsTracking(true);
        setMessage("");

        setTimeout(() => {
            setIsTracking(false);
            setMessage(
            "Tracking is not connected yet. Your tracking system will be available soon."
            );
        }, 800);
    };

  return (
    <div className="track-card">
        <div className="track-card__header">
            <span className="track-card__icon-wrap">
                <Package className="icon" aria-hidden="true" />
            </span>

            <div>
                <h2 className="track-card__title">
                    Track Your Shipment
                </h2>

                <p className="small-muted">
                    Enter your tracking number to see your shipment status.
                </p>
            </div>
        </div>

        <form
            onSubmit={handleSubmit}
            className="track-card__form"
        >
            <div>
                <label
                    htmlFor="tracking-number"
                    className="form-label"
                >
                    Tracking Number
                </label>

                <input
                    id="tracking-number"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter your tracking number"
                    className="form-input"
                />
            </div>

            <button
                type="submit"
                className="button button--brand track-card__submit"
                disabled={isTracking}
            >
                {isTracking ? "Checking..." : "Track Shipment"}

                {!isTracking && (
                    <Search
                    className="icon icon--sm"
                    aria-hidden="true"
                    />
                )}
            </button>
        </form>
        {message && (
            <p className="track-card__message">
                {message}
            </p>
        )}
    
        <p className="track-card__help">
            You can find your tracking number in your shipment confirmation.
        </p>
    </div>
  );
}
