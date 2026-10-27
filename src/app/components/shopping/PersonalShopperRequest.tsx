
"use client";

import { useState } from "react";
import { Plus, Trash2, ShoppingBag } from "lucide-react";

type ProductRequest = {
  name: string;
  url: string;
};

export function PersonalShopperRequest() {
  const [products, setProducts] = useState<ProductRequest[]>([
    { name: "", url: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  const addProduct = () => {
    setProducts((current) => [...current, { name: "", url: "" }]);
    setMessage("");
  };

  const removeProduct = (index: number) => {
    if (products.length === 1) return;

    setProducts((current) => current.filter((_, i) => i !== index));
    setMessage("");
  };

  const updateProduct = (
    index: number,
    field: keyof ProductRequest,
    value: string
  ) => {
    setProducts((current) =>
      current.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    const submittedProducts = products.map((product) => ({
      name: product.name.trim(),
      url: product.url.trim(),
    }));

    for (const product of submittedProducts) {
      if (!product.name || !product.url) {
        setMessageType("error");
        setMessage("Please enter a name and URL for every product.");
        return;
      }

      try {
        const url = new URL(product.url);
        if (url.protocol !== "https:") {
          setMessageType("error");
          setMessage("Please use an HTTPS link for each product.");
          return;
        }
      } catch {
        setMessageType("error");
        setMessage("Please enter a valid product URL.");
        return;
      }
    }

    setIsSubmitting(true);
    setMessage("");

    let successful = 0;

    try {
      for (const product of submittedProducts) {
        const response = await fetch("/api/shopper/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: product.name,
            productUrl: product.url,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (successful > 0) {
            setMessageType("error");
            setMessage(
              `${successful} product request(s) were submitted, but the next request failed. Please check your account before retrying to avoid duplicates.`
            );
          } else if (response.status === 401) {
            setMessageType("error");
            setMessage("Please log in before submitting a product request.");
          } else {
            setMessageType("error");
            setMessage(
              data?.error || "Unable to submit your request. Please try again."
            );
          }
          return;
        }

        successful++;
      }

      setProducts([{ name: "", url: "" }]);
      setMessageType("success");
      setMessage(
        `Success! All ${successful} product request(s) have been submitted.`
      );
    } catch {
      setMessageType("error");
      setMessage(
        successful > 0
          ? `${successful} product request(s) were submitted before a connection error. Please check your account before retrying.`
          : "A connection error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shopper-request">
      <div className="shopper-request__header">
        <span className="shopper-request__icon-wrap">
          <ShoppingBag className="icon" aria-hidden="true" />
        </span>

        <div>
          <h2 className="shopper-request__title">
            Request a Personal Shopper
          </h2>
          <p className="small-muted">
            Tell us what you'd like us to purchase in Korea.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="shopper-request__form">
        {products.map((product, index) => (
          <div key={index} className="shopper-request__product">
            <div className="shopper-request__product-header">
              <span>Product {index + 1}</span>

              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="shopper-request__remove"
                  aria-label={`Remove product ${index + 1}`}
                  disabled={isSubmitting}
                >
                  <Trash2 className="icon icon--sm" />
                </button>
              )}
            </div>

            <div>
              <label htmlFor={`product-name-${index}`} className="form-label">
                Product Name
              </label>
              <input
                id={`product-name-${index}`}
                type="text"
                value={product.name}
                onChange={(e) =>
                  updateProduct(index, "name", e.target.value)
                }
                placeholder="e.g. Laneige Lip Sleeping Mask"
                className="form-input"
                maxLength={200}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor={`product-url-${index}`} className="form-label">
                Product URL
              </label>
              <input
                id={`product-url-${index}`}
                type="url"
                value={product.url}
                onChange={(e) => updateProduct(index, "url", e.target.value)}
                placeholder="https://..."
                className="form-input"
                maxLength={1000}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addProduct}
          className="button button--outline"
          disabled={isSubmitting}
        >
          <Plus className="icon icon--sm" />
          Add Another Product
        </button>

        <button
          type="submit"
          className="button button--brand"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>

        {message && (
          <p
            role="status"
            aria-live="polite"
            style={{
              margin: 0,
              color:
                messageType === "success"
                  ? "#15803d"
                  : messageType === "error"
                    ? "#b91c1c"
                    : "#57534e",
            }}
          >
            {message}
          </p>
        )}
      </form>

      <p className="shopper-request__help">
        We'll review your request and confirm the product price, availability,
        and any additional shopping fees.
      </p>
    </div>
  );
}
