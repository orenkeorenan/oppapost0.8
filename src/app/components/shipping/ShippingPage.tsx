"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Box, Calculator, Check, Clock3, PackageCheck, Plane, ShieldCheck, Truck } from "lucide-react";
import { Navbar } from "../layout/Navbar";
import { Footer } from "../layout/Footer";
import { Popup } from "../ui/popup/Popup";
import { AddressRequest } from "../account/AddressRequest";
import styles from "./ShippingPage.module.css";

const destinations = [
  "Indonesia",
  "United States",
  "Japan",
  "Singapore",
  "Australia",
];

const deliveryCities: Record<string, string[]> = {
  Indonesia: ["Jakarta", "Bandung", "Surabaya", "Other city"],
  "United States": ["Los Angeles", "New York", "Other city"],
  Japan: ["Tokyo", "Osaka", "Other city"],
  Singapore: ["Singapore"],
  Australia: ["Sydney", "Melbourne", "Other city"],
};

const serviceNotes = [
  "Your own Korean warehouse address",
  "Combine eligible packages before dispatch",
  "Package photos and shipment tracking",
];

export function ShippingPage() {
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [destination, setDestination] = useState("Indonesia");
  const [city, setCity] = useState("Jakarta");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [calculated, setCalculated] = useState(false);

  const methods = useMemo(() => {
    const available = [
      {
        name: "EMS",
        detail: "Postal express service",
        time: "Estimate shown after rates are confirmed",
        price: "Rate confirmation pending",
        icon: Truck,
      },
    ];

    if (destination === "Indonesia") {
      available.push({
        name: "Air Cargo",
        detail: "Consolidated air freight · Indonesia only",
        time: "Estimate shown after rates are confirmed",
        price: "Rate confirmation pending",
        icon: Plane,
      });
    }

    return available;
  }, [destination]);

  const changeDestination = (value: string) => {
    setDestination(value);
    setCity(deliveryCities[value][0]);
    setCalculated(false);
  };

  const handleCalculate = () => {
    if (!weight || Number(weight) <= 0) {
      setCalculated(false);
      return;
    }
    setCalculated(true);
  };

  return (
    <div className="site-page">
      <Navbar onAddress={() => setIsAddressOpen(true)} />

      <main className={styles.page}>
        <div className="container">
          <div className={styles.heading}>
            <span className="eyebrow">SHIPPING FROM KOREA</span>
            <h1 className={styles.title}>Ship your Korean finds, <span>worldwide.</span></h1>
            <p className={styles.subtitle}>
              Compare delivery options, check package details, and plan your shipment with Oppapost.
            </p>
          </div>

          <section className={styles.calculator} aria-labelledby="calculator-title">
            <div className={styles.calculatorMain}>
              <div className={styles.sectionTop}>
                <div className={styles.iconBox}><Calculator size={20} /></div>
                <div>
                  <h2 id="calculator-title">Shipping calculator</h2>
                  <p>Enter your destination and package details to explore your options.</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Destination country</span>
                  <select value={destination} onChange={(event) => changeDestination(event.target.value)}>
                    {destinations.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>City / destination area</span>
                  <select value={city} onChange={(event) => setCity(event.target.value)}>
                    {deliveryCities[destination].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Actual weight</span>
                  <div className={styles.inputUnit}>
                    <input type="number" min="0.1" step="0.1" placeholder="e.g. 2.5" value={weight} onChange={(event) => { setWeight(event.target.value); setCalculated(false); }} />
                    <span>kg</span>
                  </div>
                </label>
              </div>

              <div className={styles.dimensions}>
                <div className={styles.dimensionsTitle}>
                  <Box size={16} />
                  <span>Package dimensions <small>Optional · cm</small></span>
                </div>
                <div className={styles.dimensionFields}>
                  {[
                    ["Length", length, setLength],
                    ["Width", width, setWidth],
                    ["Height", height, setHeight],
                  ].map(([label, value, setter]) => (
                    <label className={styles.field} key={label as string}>
                      <span>{label as string}</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="0"
                        value={value as string}
                        onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formFooter}>
                <p>Final charges may depend on chargeable weight, service availability, and destination.</p>
                <button className="button button--brand" type="button" onClick={handleCalculate}>
                  Calculate shipping <ArrowRight size={16} />
                </button>
              </div>
              {weight && Number(weight) <= 0 && <p className={styles.validation}>Please enter a weight greater than zero.</p>}
            </div>

            <aside className={styles.results} aria-live="polite">
              <div className={styles.resultsHeader}>
                <div>
                  <span className={styles.resultsEyebrow}>YOUR SHIPPING OPTIONS</span>
                  <h3>{destination}</h3>
                  <p>{city}</p>
                </div>
                <span className={styles.countryMark}>✈</span>
              </div>

              {methods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div className={styles.method} key={method.name}>
                    <div className={styles.methodTop}>
                      <span className={styles.methodIcon}><Icon size={17} /></span>
                      <div className={styles.methodName}>
                        <strong>{method.name}</strong>
                        <small>{method.detail}</small>
                      </div>
                      {index === 0 && <span className={styles.recommended}>Available</span>}
                    </div>
                    <div className={styles.methodMetrics}>
                      <div>
                        <small>Estimated price</small>
                        <strong>{calculated ? "Rate pending" : "—"}</strong>
                      </div>
                      <div>
                        <small>Delivery estimate</small>
                        <strong>{calculated ? "To be confirmed" : "—"}</strong>
                      </div>
                    </div>
                    <p className={styles.methodNote}><Clock3 size={13} /> {method.time}</p>
                  </div>
                );
              })}

              <p className={styles.rateNotice}>
                {calculated
                  ? "Your package details are ready. Live carrier rates and delivery estimates will be connected in a later phase."
                  : "Enter your package weight and calculate to preview the shipping options."}
              </p>
            </aside>
          </section>

          <div className={styles.trustStrip}>
            <div><PackageCheck size={17} /><span>Package consolidation</span></div>
            <div><ShieldCheck size={17} /><span>Careful handling</span></div>
            <div><Truck size={17} /><span>Shipment tracking</span></div>
          </div>

          <section className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoHeading}>
                <span className={styles.iconBox}><Calculator size={18} /></span>
                <div><span className="eyebrow">CLEAR PRICING</span><h2>Shipping price guide</h2></div>
              </div>
              <p className={styles.infoDescription}>Your final shipping cost is based on the selected service and the carrier's chargeable-weight rules.</p>
              <div className={styles.priceTable}>
                <div className={styles.tableHead}><span>Service</span><span>Availability</span><span>Price</span></div>
                <div><strong>EMS</strong><span>Supported destinations</span><b>Rates pending</b></div>
                {destination === "Indonesia" && <div><strong>Air Cargo</strong><span>Indonesia only</span><b>Rates pending</b></div>}
              </div>
              <p className={styles.footnote}>Rates will be published after Oppapost confirms its carrier pricing.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoHeading}>
                <span className={styles.iconBox}><Clock3 size={18} /></span>
                <div><span className="eyebrow">DELIVERY TIMELINE</span><h2>Know what to expect</h2></div>
              </div>
              <div className={styles.timeline}>
                <div><span className={styles.timelineDot}>1</span><div><strong>Warehouse processing</strong><p>Receiving, checking, and preparing your packages.</p></div></div>
                <div><span className={styles.timelineDot}>2</span><div><strong>International transit</strong><p>Transit time depends on the selected shipping service.</p></div></div>
                <div><span className={styles.timelineDot}>3</span><div><strong>Customs & local delivery</strong><p>Customs review and last-mile delivery may add time.</p></div></div>
              </div>
              <p className={styles.footnote}>Exact delivery estimates will be added when carrier schedules are confirmed.</p>
            </div>
          </section>

          <section className={styles.bottomGrid}>
            <div className={styles.processCard}>
              <span className="eyebrow">HOW IT WORKS</span>
              <h2>From Korean warehouse to your door.</h2>
              <div className={styles.processSteps}>
                <div><span>01</span><strong>Shop in Korea</strong><p>Buy from Korean stores or use our Personal Shopper.</p></div>
                <div><span>02</span><strong>Arrive at Oppapost</strong><p>Your packages are received at our Korean warehouse.</p></div>
                <div><span>03</span><strong>Prepare & ship</strong><p>Choose an available service and follow your delivery.</p></div>
              </div>
            </div>
            <div className={styles.noteCard}>
              <span className="eyebrow">GOOD TO KNOW</span>
              <h2>A few things before shipping</h2>
              <ul>{serviceNotes.map((note) => <li key={note}><Check size={15} />{note}</li>)}</ul>
              <p>Some products may be restricted or require additional customs documentation. Check with Oppapost before sending regulated or fragile items.</p>
              <button type="button" className={styles.textLink} onClick={() => setIsAddressOpen(true)}>Get your Korean address <ArrowRight size={15} /></button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <Popup isOpen={isAddressOpen} onClose={() => setIsAddressOpen(false)}>
        <AddressRequest />
      </Popup>
    </div>
  );
}
