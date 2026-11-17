import type { Metadata } from "next";
import { ShippingPage } from "../components/shipping/ShippingPage";

export const metadata: Metadata = {
  title: "International Shipping from Korea | Oppapost",
  description:
    "Compare international shipping options from Korea, estimate package weight, and explore delivery timelines with Oppapost.",
};

export default function ShippingRoute() {
  return <ShippingPage />;
}
