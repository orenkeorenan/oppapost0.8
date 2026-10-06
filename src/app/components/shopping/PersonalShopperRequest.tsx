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

  const addProduct = () => {
    setProducts((current) => [
      ...current,
      { name: "", url: "" },
    ]);
  };

  const removeProduct = (index: number) => {
    if (products.length === 1) return;

    setProducts((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const updateProduct = (
    index: number,
    field: keyof ProductRequest,
    value: string
  ) => {
    setProducts((current) =>
      current.map((product, i) =>
        i === index
          ? { ...product, [field]: value }
          : product
      )
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Personal Shopper Request:", products);
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

      <form
        onSubmit={handleSubmit}
        className="shopper-request__form"
      >
        {products.map((product, index) => (
          <div
            key={index}
            className="shopper-request__product"
          >
            <div className="shopper-request__product-header">
              <span>Product {index + 1}</span>

              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="shopper-request__remove"
                  aria-label={`Remove product ${index + 1}`}
                >
                  <Trash2 className="icon icon--sm" />
                </button>
              )}
            </div>

            <div>
              <label
                htmlFor={`product-name-${index}`}
                className="form-label"
              >
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
                required
              />
            </div>

            <div>
              <label
                htmlFor={`product-url-${index}`}
                className="form-label"
              >
                Product URL
              </label>

              <input
                id={`product-url-${index}`}
                type="text"
                value={product.url}
                onChange={(e) =>
                  updateProduct(index, "url", e.target.value)
                }
                placeholder="https://..."
                className="form-input"
                required
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addProduct}
          className="button button--outline"
        >
          <Plus className="icon icon--sm" />
          Add Another Product
        </button>

        <button
          type="submit"
          className="button button--brand"
        >
          Submit Request
        </button>
      </form>

      <p className="shopper-request__help">
        We'll review your request and confirm the product price,
        availability, and any additional shopping fees.
      </p>
    </div>
  );
}
