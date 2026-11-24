"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, ExternalLink, Search, Sparkles } from "lucide-react";
import { Logo } from "@/app/components/landing/Logo";

type ShopProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string | null;
  productUrl: string | null;
  isPopular: boolean;
  createdAt: string;
};

const money = (price: number) => `₩${price.toLocaleString("en-US")}`;
const PAGE_SIZE = 8;

export default function ShopperPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All products");
  const [popularPage, setPopularPage] = useState(1);
  const [newPage, setNewPage] = useState(1);
  const [showRequest, setShowRequest] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestUrl, setRequestUrl] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  const [destination, setDestination] = useState({ country: "", city: "", region: "" });
  const [destinationLoading, setDestinationLoading] = useState(true);
  const [destinationSaving, setDestinationSaving] = useState(false);
  const [destinationMessage, setDestinationMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const response = await fetch("/api/shopper/products", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load products.");
        const data: ShopProduct[] = await response.json();
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setLoadError("We couldn't load products. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadDestination() {
      try {
        const response = await fetch("/api/account/shopping-destination", { cache: "no-store" });
        if (cancelled) return;
        if (response.status === 401) {
          setIsLoggedIn(false);
          return;
        }
        if (!response.ok) throw new Error("Unable to load destination.");
        const data = await response.json();
        setIsLoggedIn(true);
        setDestination({
          country: data.destination?.country ?? "",
          city: data.destination?.city ?? "",
          region: data.destination?.region ?? "",
        });
      } catch {
        if (!cancelled) setDestinationMessage("Unable to load your saved destination.");
      } finally {
        if (!cancelled) setDestinationLoading(false);
      }
    }
    void loadDestination();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(
    () => ["All products", ...Array.from(new Set(products.map((item) => item.category))).sort()],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === "All products" || product.category === category;
      const matchesSearch = !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  const popularProducts = filteredProducts.filter((product) => product.isPopular);
  const newArrivals = [...filteredProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const noSearchMatches = search.trim().length > 0 && filteredProducts.length === 0;
  const hasPartialMatches = search.trim().length > 0 && filteredProducts.length > 0;

  function openRequest(prefill = search.trim()) {
    setRequestName(prefill);
    setRequestUrl("");
    setRequestMessage("");
    setShowRequest(true);
    window.setTimeout(() => document.getElementById("product-request")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  async function saveDestination() {
    setDestinationSaving(true);
    setDestinationMessage("");
    try {
      const response = await fetch("/api/account/shopping-destination", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(destination),
      });
      const data = await response.json();
      if (response.status === 401) {
        setIsLoggedIn(false);
        setDestinationMessage("Please log in to save your destination.");
        return;
      }
      if (!response.ok) throw new Error(data.message || "Unable to save your destination.");
      setDestination({
        country: data.destination.country ?? "",
        city: data.destination.city ?? "",
        region: data.destination.region ?? "",
      });
      setDestinationMessage(data.message || "Destination saved.");
    } catch (error) {
      setDestinationMessage(error instanceof Error ? error.message : "Unable to save your destination.");
    } finally {
      setDestinationSaving(false);
    }
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestSubmitting(true);
    setRequestMessage("");
    try {
      const response = await fetch("/api/shopper/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: requestName.trim(), productUrl: requestUrl.trim() }),
      });
      const data = await response.json();
      if (response.status === 401) {
        setRequestMessage("Please log in to submit a purchase request.");
      } else if (!response.ok) {
        throw new Error(data.error || "Unable to submit your request.");
      } else {
        setRequestMessage(`Request submitted successfully! Your request number is #${data.request.id}.`);
        setRequestName("");
        setRequestUrl("");
      }
    } catch (error) {
      setRequestMessage(error instanceof Error ? error.message : "Unable to submit your request.");
    } finally {
      setRequestSubmitting(false);
    }
  }

  return (
    <main style={{ color: "#171717" }}>
      <header style={shopperHeader}>
        <Link href="/" aria-label="Oppapost home" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          <Logo />
        </Link>
        <nav aria-label="Shopper navigation" style={shopperNav}>
          <Link href="/" style={shopperNavLink}>Home</Link>
          <Link href="/shipping" style={shopperNavLink}>Shipping</Link>
          <Link href="/account" style={shopperNavCta}>My Account</Link>
        </nav>
      </header>
      <section style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", padding: "64px 24px 54px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <span style={eyebrow}><Sparkles size={15} /> KOREAN PRODUCTS, DELIVERED WORLDWIDE</span>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.08, letterSpacing: "-1.8px", margin: "18px 0 16px" }}>
            Find your next <span style={{ color: "#ea580c" }}>Korean favorite.</span>
          </h1>
          <p style={{ color: "#57534e", fontSize: 16, lineHeight: 1.7, maxWidth: 620, margin: "0 auto 28px" }}>
            Explore products selected from Korea. Search our catalog or tell us what you want us to find.
          </p>
          <label style={searchBox}>
            <Search size={21} color="#737373" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPopularPage(1); setNewPage(1); }}
              placeholder="Search Korean products, brands, or categories..."
              aria-label="Search Korean products"
              style={searchInput}
            />
            {search && <button type="button" onClick={() => setSearch("")} style={clearButton}>Clear</button>}
          </label>
          <p style={{ color: "#78716c", fontSize: 12, margin: "12px 0 0" }}>Search our curated catalog · Original Korean retail prices</p>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 0" }}>
        <div style={destinationBox}>
          <div>
            <p style={eyebrow}>YOUR DELIVERY DESTINATION</p>
            <h2 style={{ fontSize: 21, margin: "0 0 6px" }}>Where should we deliver?</h2>
            <p style={muted}>Set your destination to help us prepare your shopping and shipping options.</p>
          </div>
          {destinationLoading ? <p style={muted}>Loading saved destination...</p> : !isLoggedIn ? (
            <p style={muted}>You can browse as a guest. Log in to save your delivery destination.</p>
          ) : (
            <>
              <div style={formGrid}>
                <label style={formLabel}>Country<input value={destination.country} onChange={(e) => setDestination({ ...destination, country: e.target.value })} placeholder="e.g. Indonesia" style={inputStyle} /></label>
                <label style={formLabel}>City<input value={destination.city} onChange={(e) => setDestination({ ...destination, city: e.target.value })} placeholder="e.g. Jakarta" style={inputStyle} /></label>
                <label style={formLabel}>Region / State<input value={destination.region} onChange={(e) => setDestination({ ...destination, region: e.target.value })} placeholder="Optional" style={inputStyle} /></label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <button type="button" onClick={saveDestination} disabled={destinationSaving || !destination.country.trim() || !destination.city.trim()} style={primaryButton}>{destinationSaving ? "Saving..." : "Save destination"}</button>
                {destinationMessage && <span role="status" style={muted}>{destinationMessage}</span>}
              </div>
            </>
          )}
          {!destinationLoading && !isLoggedIn && destinationMessage && <p role="status" style={muted}>{destinationMessage}</p>}
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "42px 24px 72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <p style={eyebrow}>EXPLORE THE CATALOG</p>
            <h2 style={{ fontSize: 30, letterSpacing: "-0.8px", margin: "0 0 8px" }}>Discover Korean products</h2>
            <p style={muted}>Browse our catalog even before searching.</p>
          </div>
          <div style={{ color: "#737373", fontSize: 13 }}>{loading ? "Loading catalog..." : `${filteredProducts.length} products`}</div>
        </div>

        <div style={categoryRow}>
          {categories.map((item) => (
            <button key={item} type="button" onClick={() => { setCategory(item); setPopularPage(1); setNewPage(1); }} style={{ ...categoryButton, ...(category === item ? activeCategoryButton : {}) }}>{item}</button>
          ))}
        </div>

        {loading ? <p style={muted}>Loading Korean products...</p> : loadError ? <p role="alert" style={{ color: "#b91c1c" }}>{loadError}</p> : noSearchMatches ? (
          <div style={emptyState}>
            <Search size={28} color="#c2410c" />
            <h3 style={{ margin: "12px 0 6px" }}>We couldn't find “{search}” in our catalog.</h3>
            <p style={muted}>You can ask Oppapost to source this product for you.</p>
            <button type="button" onClick={() => openRequest(search.trim())} style={{ ...primaryButton, marginTop: 18 }}>Request this product <ArrowRight size={17} /></button>
          </div>
        ) : (
          <>
            {hasPartialMatches && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "4px 0 26px", padding: "12px 16px", borderRadius: 10, background: "#fffaf5", border: "1px solid #fed7aa" }}>
              <span style={{ color: "#57534e", fontSize: 13 }}>Not seeing the exact product you're looking for?</span>
              <button type="button" onClick={() => openRequest(search.trim())} style={textButton}>Request a different product <ArrowRight size={15} /></button>
            </div>}

            <ProductSection title="Popular Products" subtitle="Community favorites and Korean essentials" products={popularProducts} page={popularPage} setPage={setPopularPage} />
            <ProductSection title="New Arrivals" subtitle="Recently added to our catalog" products={newArrivals} page={newPage} setPage={setNewPage} />
            {filteredProducts.length === 0 && <div style={emptyState}><p style={muted}>No products in this category yet.</p></div>}
          </>
        )}
      </section>

      {showRequest && <section id="product-request" style={{ background: "#fafafa", borderTop: "1px solid #eeeeee", padding: "56px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
            <div><p style={eyebrow}>PERSONAL SHOPPER REQUEST</p><h2 style={{ fontSize: 30, margin: "0 0 8px" }}>Tell us what you're looking for.</h2><p style={muted}>We'll review the product and confirm availability and a quote.</p></div>
            <button type="button" onClick={() => setShowRequest(false)} style={clearButton}>Close</button>
          </div>
          <form onSubmit={submitRequest} style={requestForm}>
            <label style={formLabel}>Product name<input required value={requestName} onChange={(e) => setRequestName(e.target.value)} placeholder="Product or brand name" style={inputStyle} /></label>
            <label style={formLabel}>Product URL <span style={{ color: "#737373", fontWeight: 400 }}>(optional)</span><input type="url" value={requestUrl} onChange={(e) => setRequestUrl(e.target.value)} placeholder="https://..." style={inputStyle} /></label>
            <p style={{ ...muted, fontSize: 13 }}>The catalog price is the original listed product price. Purchase service fees and international shipping are quoted separately.</p>
            {requestMessage && <p role="status" style={{ color: "#9a3412", margin: 0 }}>{requestMessage}</p>}
            <button type="submit" disabled={requestSubmitting || !requestName.trim()} style={primaryButton}>{requestSubmitting ? "Submitting..." : "Submit product request"} <ArrowRight size={17} /></button>
          </form>
        </div>
      </section>}
    </main>
  );
}

function ProductSection({ title, subtitle, products, page, setPage }: {
  title: string;
  subtitle: string;
  products: ShopProduct[];
  page: number;
  setPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  if (products.length === 0) return null;

  return (
    <section style={{ marginTop: 38 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 23, letterSpacing: "-0.5px", margin: "0 0 5px" }}>{title}</h3>
        <p style={muted}>{subtitle}</p>
      </div>
      <div style={productGrid}>
        {visible.map((product) => (
          <article key={product.id} style={productCard}>
            <Link href={`/shopper/${product.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <div style={productImage}>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : <span style={{ color: "#9a3412", fontSize: 13 }}>Product image coming soon</span>}
                {product.isPopular && <span style={popularTag}>POPULAR</span>}
              </div>
              <div style={{ padding: "16px 16px 8px" }}>
                <p style={{ color: "#737373", fontSize: 12, margin: "0 0 7px" }}>{product.category}</p>
                <h4 style={{ fontSize: 16, lineHeight: 1.4, margin: "0 0 12px", minHeight: 44 }}>{product.name}</h4>
                <p style={{ fontSize: 19, fontWeight: 750, margin: 0 }}>{money(product.price)}</p>
                <p style={{ color: "#737373", fontSize: 11, margin: "4px 0 0" }}>Original Korean retail price</p>
              </div>
            </Link>
            <div style={{ padding: "8px 16px 16px" }}>
              {product.productUrl ? <a href={product.productUrl} target="_blank" rel="noopener noreferrer" style={sourceLink}>Original store <ExternalLink size={13} /></a> : <span style={{ color: "#a3a3a3", fontSize: 12 }}>Source link unavailable</span>}
            </div>
          </article>
        ))}
      </div>
      {products.length > PAGE_SIZE && <nav aria-label={`${title} pagination`} style={pagination}>
        <button type="button" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))} style={pageButton}>Previous</button>
        <span style={{ color: "#737373", fontSize: 13 }}>Page {page} of {pages}</span>
        <button type="button" disabled={page === pages} onClick={() => setPage(Math.min(pages, page + 1))} style={pageButton}>Next</button>
      </nav>}
    </section>
  );
}

const shopperHeader: React.CSSProperties = { minHeight: 76, maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, boxSizing: "border-box" };
const shopperNav: React.CSSProperties = { display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" };
const shopperNavLink: React.CSSProperties = { color: "#404040", textDecoration: "none", fontSize: 14, fontWeight: 600 };
const shopperNavCta: React.CSSProperties = { color: "#fff", background: "#ea580c", borderRadius: 9, padding: "10px 15px", textDecoration: "none", fontSize: 13, fontWeight: 700 };
const eyebrow: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, color: "#c2410c", fontSize: 12, fontWeight: 750, letterSpacing: "1.2px", margin: "0 0 12px" };
const muted: React.CSSProperties = { color: "#737373", fontSize: 14, lineHeight: 1.7, margin: 0 };
const searchBox: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, maxWidth: 760, margin: "0 auto", padding: "0 18px", height: 62, background: "#fff", border: "1px solid #f5d0a8", borderRadius: 14, boxShadow: "0 12px 35px rgba(124,45,18,.10)", textAlign: "left" };
const searchInput: React.CSSProperties = { width: "100%", minWidth: 0, border: 0, outline: 0, background: "transparent", font: "inherit", fontSize: 15, color: "#171717" };
const clearButton: React.CSSProperties = { border: 0, background: "transparent", color: "#737373", cursor: "pointer", font: "inherit", fontSize: 13, whiteSpace: "nowrap" };
const destinationBox: React.CSSProperties = { display: "grid", gap: 16, border: "1px solid #fed7aa", background: "#fffaf5", borderRadius: 15, padding: 22 };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 };
const formLabel: React.CSSProperties = { display: "grid", gap: 8, fontSize: 13, fontWeight: 650 };
const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #d4d4d4", borderRadius: 8, padding: "12px 13px", font: "inherit", fontWeight: 400, background: "#fff" };
const primaryButton: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, border: 0, borderRadius: 9, padding: "13px 18px", background: "#ea580c", color: "#fff", cursor: "pointer", font: "inherit", fontSize: 14, fontWeight: 700 };
const categoryRow: React.CSSProperties = { display: "flex", gap: 9, overflowX: "auto", paddingBottom: 8, marginBottom: 28 };
const categoryButton: React.CSSProperties = { flexShrink: 0, border: "1px solid #e5e5e5", borderRadius: 999, padding: "9px 15px", background: "#fff", color: "#404040", cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 600 };
const activeCategoryButton: React.CSSProperties = { borderColor: "#ea580c", background: "#ea580c", color: "#fff" };
const emptyState: React.CSSProperties = { textAlign: "center", padding: "52px 20px", border: "1px dashed #fed7aa", borderRadius: 16, background: "#fffaf5" };
const textButton: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, border: 0, background: "transparent", color: "#c2410c", cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 700 };
const requestForm: React.CSSProperties = { display: "grid", gap: 17, background: "#fff", border: "1px solid #e5e5e5", borderRadius: 14, padding: 24, marginTop: 24 };
const productGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))", gap: 18 };
const productCard: React.CSSProperties = { border: "1px solid #eeeeee", borderRadius: 14, overflow: "hidden", background: "#fff", transition: "box-shadow .2s ease" };
const productImage: React.CSSProperties = { position: "relative", aspectRatio: "4 / 3", display: "grid", placeItems: "center", overflow: "hidden", background: "#faf7f3" };
const popularTag: React.CSSProperties = { position: "absolute", top: 11, left: 11, borderRadius: 999, padding: "5px 9px", background: "#fff", color: "#c2410c", fontSize: 10, fontWeight: 800, letterSpacing: ".5px" };
const sourceLink: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, color: "#737373", fontSize: 12, textDecoration: "underline" };
const pagination: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 24 };
const pageButton: React.CSSProperties = { border: "1px solid #e5e5e5", borderRadius: 8, padding: "9px 13px", background: "#fff", color: "#404040", cursor: "pointer", font: "inherit", fontSize: 13 };
