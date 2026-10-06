"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

export function AddressRequest() {
    const [isStarted, setIsStarted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (isSubmitted) {
        return (
            <div className="address-request">
                <div className="address-request__header">
                    <span className="address-request__icon-wrap">
                    <MapPin className="icon" aria-hidden="true" />
                    </span>

                    <div>
                    <h2 className="address-request__title">
                        Request Received
                    </h2>

                    <p className="small-muted">
                        Thanks! We'll be in touch with your Korean address details.
                    </p>
                    </div>
                </div>

                <div className="address-request__body">
                    <p className="body-muted">
                    Your request has been recorded. Once your account system is
                    connected, you'll be able to access your Korean address here.
                    </p>
                </div>
            </div>
        );
        }

    if (isStarted) {
        return (
        <div className="address-request">
            <div className="address-request__header">
                <span className="address-request__icon-wrap">
                    <MapPin className="icon" aria-hidden="true" />
                </span>

                <div>
                    <h2 className="address-request__title">
                        Get Your Korean Address
                    </h2>

                    <p className="small-muted">
                        Tell us a little about yourself to get started.
                    </p>
                </div>
            </div>

            <form 
                className="address-request__form"
                onSubmit={(e) => {
                    e.preventDefault();
                    setIsSubmitted(true);
                }}
            >
                <div>
                    <label
                        htmlFor="address-name"
                        className="form-label"
                    >
                        Full Name
                    </label>

                    <input
                        id="address-name"
                        type="text"
                        placeholder="Your full name"
                        className="form-input"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="address-email"
                        className="form-label"
                    >
                        Email Address
                    </label>

                    <input
                        id="address-email"
                        type="email"
                        placeholder="you@example.com"
                        className="form-input"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="address-country"
                        className="form-label"
                    >
                        Country
                    </label>

                    <input
                        id="address-country"
                        type="text"
                        placeholder="Your country"
                        className="form-input"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="button button--brand"
                >
                    Request Korean Address
                </button>
            </form>
        </div>
        );
    }

    return (
        <div className="address-request">
            <div className="address-request__header">
                <span className="address-request__icon-wrap">
                    <MapPin className="icon" aria-hidden="true" />
                </span>

                <div>
                    <h2 className="address-request__title">
                        Get Your Korean Address
                    </h2>

                    <p className="small-muted">
                        Get your personal Korean address and start receiving
                        packages through Oppapost.
                    </p>
                </div>
            </div>

            <div className="address-request__body">
                <p className="body-muted">
                    Your Korean address will allow you to shop from Korean
                    stores and have your packages delivered to our warehouse.
                </p>

                <button
                    type="button"
                    className="button button--brand"
                    onClick={() => setIsStarted(true)}
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}