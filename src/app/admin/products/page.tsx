
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

type ShopProduct = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string | null;
  productUrl: string | null;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ProductForm = {
  name: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string;
  productUrl: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm: ProductForm = {
  name: "",
  category: "Skincare",
  description: "",
  price: "",
  imageUrl: "",
  productUrl: "",
  isPopular: false,
  isActive: true,
  sortOrder: "0",
};

const categories = [
  "Skincare",
  "Beauty",
  "Snacks",
  "Lifestyle",
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fa",
    color: "#172033",
    padding: "32px 20px 60px",
  } as React.CSSProperties,
  container: {
    maxWidth: 1180,
    margin: "0 auto",
  } as React.CSSProperties,
  panel: {
    background: "#ffffff",
    border: "1px solid #e8ebf0",
    borderRadius: 16,
    padding: 22,
  } as React.CSSProperties,
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    borderRadius: 10,
    padding: "11px 15px",
    background: "#f26b38",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dce1e8",
    borderRadius: 9,
    padding: "11px 12px",
    fontSize: 14,
    background: "#fff",
    color: "#172033",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 7,
    color: "#465064",
  } as React.CSSProperties,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load products.");
      }

      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = [
      product.name,
      product.category,
      product.description,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      matchesSearch &&
      (showInactive || product.isActive)
    );
  });

  const updateField = <K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const startNewProduct = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  const startEdit = (product: ShopProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl ?? "",
      productUrl: product.productUrl ?? "",
      isPopular: product.isPopular,
      isActive: product.isActive,
      sortOrder: String(product.sortOrder),
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const price = Number(form.price);
    const sortOrder = Number(form.sortOrder);

    if (
      !Number.isInteger(price) ||
      price < 0 ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setError("Enter a valid non-negative price and display order.");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      price,
      sortOrder,
      imageUrl: form.imageUrl.trim(),
      productUrl: form.productUrl.trim(),
    };

    try {
      const response = await fetch(
        editingId === null
          ? "/api/admin/products"
          : `/api/admin/products/${editingId}`,
        {
          method: editingId === null ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save product.");
      }

      setMessage(
        editingId === null
          ? "Product created successfully."
          : "Product updated successfully.",
      );
      setEditingId(null);
      setForm(emptyForm);
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save product.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (product: ShopProduct) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !product.isActive }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product.");
      }

      setMessage(
        product.isActive
          ? "Product hidden from the storefront."
          : "Product is now visible in the storefront.",
      );
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update product.",
      );
    }
  };

  const activeCount = products.filter((p) => p.isActive).length;
  const popularCount = products.filter(
    (p) => p.isPopular && p.isActive,
  ).length;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link
          href="/admin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            color: "#596579",
            textDecoration: "none",
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          <ArrowLeft size={17} />
          Back to Admin
        </Link>

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 26,
          }}
        >
          <div>
            <p
              style={{
                color: "#f26b38",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 1.2,
                margin: "0 0 8px",
              }}
            >
              OPPA POST / STORE
            </p>
            <h1 style={{ fontSize: 30, margin: "0 0 8px" }}>
              Product Management
            </h1>
            <p style={{ margin: 0, color: "#727d90" }}>
              Manage your curated Korean product catalog.
            </p>
          </div>

          <button
            type="button"
            style={styles.button}
            onClick={startNewProduct}
          >
            <Plus size={17} />
            Add Product
          </button>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Total products", value: products.length },
            { label: "Visible products", value: activeCount },
            { label: "Popular products", value: popularCount },
          ].map((item) => (
            <section key={item.label} style={styles.panel}>
              <p style={{ margin: 0, color: "#727d90", fontSize: 13 }}>
                {item.label}
              </p>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  margin: "8px 0 0",
                }}
              >
                {item.value}
              </p>
            </section>
          ))}
        </div>

        {(message || error) && (
          <div
            role="status"
            style={{
              padding: 13,
              borderRadius: 10,
              marginBottom: 18,
              background: error ? "#fff0ef" : "#eaf8ef",
              color: error ? "#b42318" : "#187344",
            }}
          >
            {error || message}
          </div>
        )}

        <section style={{ ...styles.panel, marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 20 }}>
            {editingId === null ? "Add a product" : "Edit product"}
          </h2>

          <form onSubmit={handleSave}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: 18,
              }}
            >
              <div>
                <label style={styles.label} htmlFor="product-name">
                  Product name *
                </label>
                <input
                  id="product-name"
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label style={styles.label} htmlFor="product-category">
                  Category *
                </label>
                <select
                  id="product-category"
                  style={styles.input}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label} htmlFor="product-price">
                  Indicative price (KRW) *
                </label>
                <input
                  id="product-price"
                  style={styles.input}
                  type="number"
                  min="0"
                  max="100000000"
                  step="1"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={styles.label} htmlFor="product-order">
                  Display order
                </label>
                <input
                  id="product-order"
                  style={styles.input}
                  type="number"
                  min="0"
                  max="100000"
                  step="1"
                  value={form.sortOrder}
                  onChange={(e) => updateField("sortOrder", e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={styles.label} htmlFor="product-image">
                  Image URL (HTTPS)
                </label>
                <input
                  id="product-image"
                  style={styles.input}
                  type="url"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                />
              </div>

              <div>
                <label style={styles.label} htmlFor="product-url">
                  Original product URL (HTTPS)
                </label>
                <input
                  id="product-url"
                  style={styles.input}
                  type="url"
                  placeholder="https://..."
                  value={form.productUrl}
                  onChange={(e) => updateField("productUrl", e.target.value)}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label} htmlFor="product-description">
                  Description
                </label>
                <textarea
                  id="product-description"
                  style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  maxLength={500}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                marginTop: 20,
                marginBottom: 22,
              }}
            >
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(e) =>
                    updateField("isPopular", e.target.checked)
                  }
                />
                <Star size={16} />
                Mark as popular
              </label>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    updateField("isActive", e.target.checked)
                  }
                />
                Visible in storefront
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="submit" style={styles.button} disabled={saving}>
                {saving ? (
                  <LoaderCircle size={17} />
                ) : editingId === null ? (
                  <Plus size={17} />
                ) : (
                  <Pencil size={17} />
                )}
                {saving
                  ? "Saving..."
                  : editingId === null
                    ? "Create Product"
                    : "Save Changes"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={startNewProduct}
                  style={{
                    ...styles.button,
                    background: "#eef0f4",
                    color: "#394458",
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.panel}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20 }}>Product catalog</h2>

            <button
              type="button"
              onClick={() => void loadProducts()}
              style={{
                ...styles.button,
                background: "#eef0f4",
                color: "#394458",
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ flex: "1 1 250px", position: "relative" }}>
              <Search
                size={17}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  color: "#8993a4",
                }}
              />
              <input
                aria-label="Search products"
                style={{ ...styles.input, paddingLeft: 38 }}
                placeholder="Search name, category, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              Show hidden products
            </label>
          </div>

          {loading ? (
            <p style={{ color: "#727d90" }}>Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: "35px 10px", textAlign: "center" }}>
              <ImageIcon size={30} color="#a0a8b6" />
              <p style={{ color: "#727d90" }}>
                No products found. Add your first product above.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                  minWidth: 720,
                }}
              >
                <thead>
                  <tr style={{ background: "#f7f8fa", textAlign: "left" }}>
                    {["Product", "Category", "Price", "Status", "Actions"].map(
                      (heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: 13,
                            borderBottom: "1px solid #e8ebf0",
                            color: "#596579",
                            fontWeight: 600,
                          }}
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td
                        style={{
                          padding: 13,
                          borderBottom: "1px solid #edf0f4",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt=""
                              style={{
                                width: 54,
                                height: 54,
                                objectFit: "cover",
                                borderRadius: 8,
                                background: "#f2f3f5",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 54,
                                height: 54,
                                borderRadius: 8,
                                display: "grid",
                                placeItems: "center",
                                background: "#f2f3f5",
                              }}
                            >
                              <ImageIcon size={20} color="#a0a8b6" />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {product.name}
                            </div>
                            {product.isPopular && (
                              <span
                                style={{
                                  color: "#b45309",
                                  fontSize: 12,
                                  display: "inline-flex",
                                  gap: 4,
                                  alignItems: "center",
                                  marginTop: 4,
                                }}
                              >
                                <Star size={12} />
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: 13,
                          borderBottom: "1px solid #edf0f4",
                        }}
                      >
                        {product.category}
                      </td>
                      <td
                        style={{
                          padding: 13,
                          borderBottom: "1px solid #edf0f4",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ₩{product.price.toLocaleString("ko-KR")}
                      </td>
                      <td
                        style={{
                          padding: 13,
                          borderBottom: "1px solid #edf0f4",
                        }}
                      >
                        <span
                          style={{
                            color: product.isActive ? "#187344" : "#687386",
                            background: product.isActive ? "#eaf8ef" : "#eef0f4",
                            padding: "5px 8px",
                            borderRadius: 6,
                            fontSize: 12,
                          }}
                        >
                          {product.isActive ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: 13,
                          borderBottom: "1px solid #edf0f4",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            title="Edit product"
                            onClick={() => startEdit(product)}
                            style={{
                              ...styles.button,
                              background: "#eef0f4",
                              color: "#394458",
                              padding: 9,
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            title={
                              product.isActive
                                ? "Hide product"
                                : "Show product"
                            }
                            onClick={() => void toggleActive(product)}
                            style={{
                              ...styles.button,
                              background: "#eef0f4",
                              color: "#394458",
                              padding: 9,
                            }}
                          >
                            {product.isActive ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
