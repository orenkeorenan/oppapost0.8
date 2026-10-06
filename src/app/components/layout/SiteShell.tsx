"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { LandingPage } from "../landing/LandingPage";
import { Popup } from "../ui/popup/Popup";
import { AddressRequest } from "../account/AddressRequest";

export function SiteShell() {
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  const openAddress = () => {
    setIsAddressOpen(true);
  };

  const closeAddress = () => {
    setIsAddressOpen(false);
  };

  return (
    <div className="site-page">
      <Navbar onAddress={openAddress} />

      <main id="top">
        <LandingPage onAddress={openAddress} />
      </main>

      <Footer />

      <Popup
        isOpen={isAddressOpen}
        onClose={closeAddress}
      >
        <AddressRequest />
      </Popup>
    </div>
  );
}