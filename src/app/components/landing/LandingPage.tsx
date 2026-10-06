"use client";

import { useState } from "react";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { PersonalShopper } from "./PersonalShopper";
import { WhyOppapost } from "./WhyOppapost";
import { ShippingSection } from "./ShippingSection";
import { FinalCta } from "./FinalCta";
import { Popup } from "../ui/popup/Popup";
import { ShippingCalculator } from "../shipping/ShippingCalculator";
import { PersonalShopperRequest } from "../shopping/PersonalShopperRequest";

type LandingPageProps = {
  onAddress: () => void;
};

export function LandingPage({
  onAddress,
}: LandingPageProps) {
  const [isEstimateOpen, setIsEstimateOpen] = useState(false);
  const [isShopperOpen, setIsShopperOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);


  return (
    <>
      <Hero 
        onCalculate={() => setIsEstimateOpen(true)}
      />

      <HowItWorks />

      <PersonalShopper 
        onRequest={() => setIsShopperOpen(true)}
      />

      <WhyOppapost />

      <ShippingSection
        onCalculate={() => setIsEstimateOpen(true)}
      />

      <FinalCta 
        onAddress={onAddress}
      />

      <Popup
        isOpen={isEstimateOpen}
        onClose={() => setIsEstimateOpen(false)}
      >
        <ShippingCalculator />
      </Popup>
      <Popup
        isOpen={isShopperOpen}
        onClose={() => setIsShopperOpen(false)}
      >
        <PersonalShopperRequest />
      </Popup>
    </>
  );
}
