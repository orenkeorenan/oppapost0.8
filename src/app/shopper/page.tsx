"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";


type ShopProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string | null;
  isPopular: boolean;
};

const categories = [
  "All Products",
  "Skincare",
  "Beauty",
  "Snacks",
  "Lifestyle",
];


const formatPrice = (price: number) =>
  `₩${price.toLocaleString("en-US")}`;

export default function ShopperPage() {
    const [activeCategory, setActiveCategory] =
        useState("All Products");
    const [search, setSearch] = useState("");
    const [requestName, setRequestName] = useState("");
    const [requestUrl, setRequestUrl] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState("");
    const [requestSubmitting, setRequestSubmitting] = useState(false);


    useEffect(() => {
        let cancelled = false;

        async function loadProducts() {
            try {
            const response = await fetch("/api/shopper/products", {
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Unable to load products.");
            }

            const data: ShopProduct[] = await response.json();

            if (!cancelled) {
                setProducts(data);
            }
            } catch {
            if (!cancelled) {
                setProductsError("We couldn't load products. Please try again.");
            }
            } finally {
            if (!cancelled) {
                setProductsLoading(false);
            }
            }
        }

        void loadProducts();

        return () => {
            cancelled = true;
        };
    }, []);


  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All Products" ||
      product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleProductRequest = (productName: string) => {
    setRequestName(productName);
    setRequestMessage("");
    document
      .getElementById("product-request")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
        ) => {
        event.preventDefault();
        setRequestSubmitting(true);
        setRequestMessage("");

        try {
            const response = await fetch("/api/shopper/requests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productName: requestName.trim(),
                productUrl: requestUrl.trim(),
            }),
            });

            const data = await response.json();

            if (response.status === 401) {
            setRequestMessage(
                "Please log in to submit a purchase request.",
            );
            return;
            }

            if (!response.ok) {
            throw new Error(
                data.error || "Unable to submit your request.",
            );
            }

            setRequestMessage(
            `Request submitted successfully! Your request number is #${data.request.id}.`,
            );
            setRequestName("");
            setRequestUrl("");
        } catch (error) {
            setRequestMessage(
            error instanceof Error
                ? error.message
                : "Unable to submit your request. Please try again.",
            );
        } finally {
            setRequestSubmitting(false);
        }
    };


  return (
    <main style={{ color: "#171717" }}>
      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
          padding: "72px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "center",
            gap: 40,
          }}
        >
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#c2410c",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              <Sparkles size={16} />
              DISCOVER KOREA WITH OPPAPOST
            </span>

            <h1
              style={{
                fontSize: "clamp(36px, 5vw, 58px)",
                lineHeight: 1.1,
                letterSpacing: "-1.8px",
                margin: "0 0 20px",
                maxWidth: 600,
              }}
            >
              Your Korean favorites,
              <span style={{ color: "#ea580c" }}>
                {" "}delivered.
              </span>
            </h1>

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: "#57534e",
                maxWidth: 500,
                margin: "0 0 28px",
              }}
            >
              Discover popular products from Korea.
              Found something else you love? We can help
              you purchase that, too.
            </p>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("popular-products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={primaryButton}
            >
              Explore Products <ArrowRight size={18} />
            </button>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: 12,
              boxShadow: "0 24px 60px rgba(124, 45, 18, 0.10)",
            }}
          >
            <img
              src="https://placehold.co/800x650/FFEDD5/9A3412?text=Popular+Korean+Products"
              alt="Popular Korean products"
              style={{
                width: "100%",
                display: "block",
                borderRadius: 16,
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section
        id="popular-products"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "64px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div>
            <p style={eyebrow}>THE COMMUNITY FAVORITES</p>
            <h2 style={sectionTitle}>Popular in Korea</h2>
            <p style={mutedText}>
              A curated selection of products worth discovering.
            </p>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid #e5e5e5",
              borderRadius: 10,
              padding: "0 12px",
              minWidth: 240,
            }}
          >
            <Search size={18} color="#737373" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              style={{
                width: "100%",
                padding: "12px 0",
                border: "none",
                outline: "none",
                font: "inherit",
                background: "transparent",
              }}
            />
          </label>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 8,
            marginBottom: 28,
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              style={{
                flexShrink: 0,
                border: "1px solid",
                borderColor:
                  activeCategory === category ? "#ea580c" : "#e5e5e5",
                borderRadius: 999,
                padding: "10px 18px",
                background:
                  activeCategory === category ? "#ea580c" : "#ffffff",
                color:
                  activeCategory === category ? "#ffffff" : "#404040",
                cursor: "pointer",
                font: "inherit",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 235px), 1fr))",
            gap: 24,
          }}
        >
            {productsLoading ? (
                <p>Loading Korean products...</p>
                ) : productsError ? (
                <p>{productsError}</p>
                ) : filteredProducts.length === 0 ? (
                <p style={{ color: "#737373", padding: "24px 0" }}>
                    No products found. Try another search or request the product below.
                </p>
                ) : (
                filteredProducts.map((product) => (
                    <article
                        key={product.id}
                        style={{
                            border: "1px solid #eeeeee",
                            borderRadius: 16,
                            overflow: "hidden",
                            background: "#ffffff",
                        }}
                    >
                        <div style={{ position: "relative" }}>
                            
                            {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    loading="lazy"
                                    style={{
                                    display: "block",
                                    width: "100%",
                                    aspectRatio: "4 / 3",
                                    objectFit: "cover",
                                    background: "#fafafa",
                                    }}
                                />
                                ) : (
                                <div
                                    style={{
                                    width: "100%",
                                    aspectRatio: "4 / 3",
                                    display: "grid",
                                    placeItems: "center",
                                    background: "#fff7ed",
                                    color: "#9a3412",
                                    fontSize: 13,
                                    }}
                                >
                                    Product image coming soon
                                </div>
                            )}


                            {product.isPopular && (
                            <span
                                style={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                background: "#ffffff",
                                color: "#c2410c",
                                borderRadius: 999,
                                padding: "6px 10px",
                                fontSize: 11,
                                fontWeight: 700,
                                }}
                            >
                                POPULAR
                            </span>
                            )}
                        </div>

                        <div style={{ padding: 18 }}>
                            <p
                            style={{
                                fontSize: 12,
                                color: "#737373",
                                margin: "0 0 8px",
                            }}
                            >
                            {product.category}
                            </p>

                            <h3
                            style={{
                                fontSize: 17,
                                margin: "0 0 8px",
                            }}
                            >
                            {product.name}
                            </h3>

                            <p
                            style={{
                                fontSize: 13,
                                lineHeight: 1.6,
                                color: "#737373",
                                margin: "0 0 18px",
                                minHeight: 42,
                            }}
                            >
                            {product.description}
                            </p>

                            <p
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                margin: "0 0 16px",
                            }}
                            >
                            {formatPrice(product.price)}
                            <span
                                style={{
                                display: "block",
                                fontSize: 11,
                                fontWeight: 400,
                                color: "#737373",
                                marginTop: 4,
                                }}
                            >
                                Indicative product price
                            </span>
                            </p>

                            <button
                            type="button"
                            onClick={() => handleProductRequest(product.name)}
                            style={{
                                ...primaryButton,
                                width: "100%",
                                justifyContent: "center",
                                padding: "12px 14px",
                                fontSize: 14,
                            }}
                            >
                            <ShoppingBag size={17} />
                            Request Purchase
                            </button>
                        </div>
                    </article>
                    // Keep your existing <article>...</article> here.
                ))
            )}
        </div>

        {filteredProducts.length === 0 && (
          <p style={{ color: "#737373", padding: "24px 0" }}>
            No products found. Try another search or request the product below.
          </p>
        )}
      </section>

      {/* Request form */}
      <section
        id="product-request"
        style={{
          background: "#fafafa",
          borderTop: "1px solid #eeeeee",
          padding: "64px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
          }}
        >
          <p style={eyebrow}>YOUR NEXT KOREAN FIND</p>
          <h2 style={sectionTitle}>
            Can't find what you're looking for?
          </h2>
          <p style={{ ...mutedText, marginBottom: 28 }}>
            Tell us the product name or paste a link.
            We'll review availability and send you a quote.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: 16,
              padding: 24,
              display: "grid",
              gap: 18,
            }}
          >
            <label style={formLabel}>
              Product name
              <input
                value={requestName}
                onChange={(event) => setRequestName(event.target.value)}
                placeholder="e.g. a Korean skincare product"
                required
                style={formInput}
              />
            </label>

            <label style={formLabel}>
              Product URL <span style={{ color: "#737373" }}>(optional)</span>
              <input
                type="url"
                value={requestUrl}
                onChange={(event) => setRequestUrl(event.target.value)}
                placeholder="https://..."
                style={formInput}
              />
            </label>

            <p
              style={{
                color: "#737373",
                fontSize: 13,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Prices shown above are estimates, not final quotes.
              We'll confirm the product price and service fee before
              purchasing. International shipping is handled separately.
            </p>

            {requestMessage && (
              <p role="status" style={{ color: "#b45309", margin: 0 }}>
                {requestMessage}
              </p>
            )}

            
            <button
                type="submit"
                style={primaryButton}
                disabled={requestSubmitting}
            >
                {requestSubmitting
                    ? "Submitting..."
                    : "Submit Product Request"}
                {!requestSubmitting && <ArrowRight size={18} />}
            </button>

          </form>
        </div>
      </section>
    </main>
  );
}

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  border: "none",
  borderRadius: 10,
  padding: "14px 20px",
  background: "#ea580c",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 600,
};

const sectionTitle: React.CSSProperties = {
  fontSize: "clamp(28px, 4vw, 38px)",
  lineHeight: 1.2,
  letterSpacing: "-0.8px",
  margin: "0 0 12px",
};

const eyebrow: React.CSSProperties = {
  color: "#c2410c",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "1.4px",
  margin: "0 0 12px",
};

const mutedText: React.CSSProperties = {
  color: "#737373",
  fontSize: 15,
  lineHeight: 1.7,
  margin: 0,
};

const formLabel: React.CSSProperties = {
  display: "grid",
  gap: 8,
  fontSize: 14,
  fontWeight: 600,
};

const formInput: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #d4d4d4",
  borderRadius: 8,
  font: "inherit",
  fontWeight: 400,
};
