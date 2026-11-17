"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, ShoppingBag } from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string | null;
  productUrl: string | null;
  isPopular: boolean;
};

export default function ShopperProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/shopper/products", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load this product.");
        const products: Product[] = await response.json();
        const found = products.find((item) => item.id === Number(params.id));
        if (!cancelled) setProduct(found ?? null);
      } catch {
        if (!cancelled) setMessage("We couldn't load this product. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [params.id]);

  async function requestPurchase() {
    if (!product) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/shopper/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: product.name, productUrl: product.productUrl ?? "" }),
      });
      const data = await response.json();
      if (response.status === 401) {
        setMessage("Please log in to submit a purchase request.");
      } else if (!response.ok) {
        throw new Error(data.error || "Unable to submit your request.");
      } else {
        setMessage(`Request submitted successfully! Your request number is #${data.request.id}.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit your request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main style={page}><p>Loading product...</p></main>;
  if (!product) return <main style={page}><Link href="/shopper" style={back}><ArrowLeft size={17} /> Back to products</Link><h1>Product not found</h1><p>{message || "This product may no longer be available."}</p></main>;

  return (
    <main style={page}>
      <Link href="/shopper" style={back}><ArrowLeft size={17} /> Back to products</Link>
      <div style={layout}>
        <div style={imagePanel}>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: 560 }} />
          ) : (
            <div style={{ minHeight: 360, display: "grid", placeItems: "center", color: "#9a3412" }}>Product image coming soon</div>
          )}
        </div>
        <section>
          <p style={eyebrow}>{product.category}</p>
          <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.12, letterSpacing: "-1px", margin: "0 0 18px" }}>{product.name}</h1>
          <p style={{ fontSize: 30, fontWeight: 750, margin: "0 0 8px" }}>₩{product.price.toLocaleString("en-US")}</p>
          <p style={muted}>Original listed product price · Purchase service fee and international shipping are separate</p>
          <div style={{ height: 1, background: "#e5e5e5", margin: "28px 0" }} />
          <h2 style={{ fontSize: 18, margin: "0 0 10px" }}>Product information</h2>
          <p style={{ color: "#525252", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{product.description || "Product details will be confirmed during purchase review."}</p>
          <div style={infoBox}>
            <strong>Weight and shipping</strong>
            <p style={{ ...muted, marginTop: 8 }}>Final item weight, packed weight, and carrier billable weight are confirmed during purchase and packing. International shipping is calculated separately.</p>
          </div>
          {product.productUrl ? (
            <a href={product.productUrl} target="_blank" rel="noopener noreferrer" style={sourceLink}>View original store <ExternalLink size={16} /></a>
          ) : <p style={muted}>Original store link has not been added yet.</p>}
          <button type="button" onClick={requestPurchase} disabled={submitting} style={button}>
            <ShoppingBag size={18} /> {submitting ? "Submitting..." : "Request to Buy"}
          </button>
          {message && <p role="status" style={{ color: "#9a3412", lineHeight: 1.6 }}>{message}</p>}
          <p style={{ ...muted, marginTop: 16 }}>Submitting a request does not place an order. Oppapost will review availability and confirm the final quote before purchase.</p>
        </section>
      </div>
    </main>
  );
}

const page: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "36px 24px 80px", color: "#171717" };
const back: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, color: "#525252", textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 28 };
const layout: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 48, alignItems: "start" };
const imagePanel: React.CSSProperties = { background: "#fafafa", border: "1px solid #eeeeee", borderRadius: 18, padding: 20, minHeight: 360, display: "grid", placeItems: "center" };
const eyebrow: React.CSSProperties = { color: "#c2410c", fontSize: 12, fontWeight: 700, letterSpacing: "1.3px", textTransform: "uppercase", margin: "0 0 14px" };
const muted: React.CSSProperties = { color: "#737373", fontSize: 14, lineHeight: 1.7, margin: 0 };
const infoBox: React.CSSProperties = { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 18, margin: "24px 0" };
const sourceLink: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, color: "#c2410c", fontWeight: 650, textDecoration: "underline", margin: "0 0 24px" };
const button: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", border: 0, borderRadius: 10, padding: "15px 20px", background: "#ea580c", color: "#fff", font: "inherit", fontWeight: 700, cursor: "pointer" };
