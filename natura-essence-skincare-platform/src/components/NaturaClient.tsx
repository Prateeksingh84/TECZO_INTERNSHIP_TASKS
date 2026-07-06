"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  size: string;
  skinTypes: string[];
  description: string;
  longDescription: string;
  ingredients: string[];
  benefits: string[];
  directions: string;
  image: string;
  badge: string;
};

type CartItem = {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
};

async function readJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  return JSON.parse(text);
}

export default function NaturaClient() {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productOpen, setProductOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFeature, setActiveFeature] = useState(0);
  const [message, setMessage] = useState("");

  async function loadCart() {
    const cartRes = await fetch("/api/cart", { cache: "no-store" });
    const cartData = await readJson(cartRes);

    setCartItems(cartData.cart?.items || []);
    setCartCount(cartData.count || 0);
    setCartTotal(cartData.total || 0);
  }

  async function loadAll() {
    const [storeRes, productsRes] = await Promise.all([
      fetch("/api/store", { cache: "no-store" }),
      fetch("/api/products", { cache: "no-store" })
    ]);

    const storeData = await readJson(storeRes);
    const productData = await readJson(productsRes);

    setStore(storeData);
    setProducts(productData.products || []);
    await loadCart();
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return products;

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.description,
        product.longDescription,
        product.badge,
        ...(product.ingredients || []),
        ...(product.skinTypes || [])
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [products, search]);

  async function addToCart(productId?: string, openCart = true) {
    if (!productId) return;

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    const data = await readJson(res);

    setCartItems(data.cart?.items || []);
    setCartCount(data.count || 0);
    setCartTotal(data.total || 0);
    setMessage(data.message || "Added to cart.");

    if (openCart) {
      setCartOpen(true);
    }
  }

  async function updateCartItem(itemId: string, action: "increase" | "decrease") {
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ itemId, action })
    });

    const data = await readJson(res);

    setCartItems(data.cart?.items || []);
    setCartCount(data.count || 0);
    setCartTotal(data.total || 0);
    setMessage(data.message || "Cart updated.");
  }

  async function removeCartItem(itemId: string) {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ itemId })
    });

    const data = await readJson(res);

    setCartItems(data.cart?.items || []);
    setCartCount(data.count || 0);
    setCartTotal(data.total || 0);
    setMessage(data.message || "Item removed.");
  }

  async function clearCart() {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ clear: true })
    });

    const data = await readJson(res);

    setCartItems(data.cart?.items || []);
    setCartCount(data.count || 0);
    setCartTotal(data.total || 0);
    setMessage(data.message || "Cart cleared.");
  }

  async function openProduct(productId: string) {
    const res = await fetch(`/api/products/${productId}`, { cache: "no-store" });
    const data = await readJson(res);

    if (data.product) {
      setSelectedProduct(data.product);
      setProductOpen(true);
    }
  }

  async function submitNewsletter(event: any) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await readJson(res);
    setMessage(data.message || "Saved.");
    event.currentTarget.reset();
  }

  async function submitContact(event: any) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        message: String(form.get("message") || "")
      })
    });

    const data = await readJson(res);
    setMessage(data.message || "Saved.");
    event.currentTarget.reset();
  }

  if (!store) {
    return (
      <main className="loading-page">
        <div className="loading-card">
          <span>natura essence</span>
          <p>Loading skincare experience...</p>
        </div>
      </main>
    );
  }

  const { brand, hero, about, collection, natureSection, benefits } = store;

  return (
    <main>
      {message && (
        <div className="toast" onClick={() => setMessage("")}>
          {message}
        </div>
      )}

      <header className="site-header">
        <nav className="nav-shell">
          <div className="nav-left">
            <a href="#collection">☰ MENU</a>
            <a href="#collection">⌕ SEARCH</a>
          </div>

          <a className="brand" href="#">
            {brand.name}
          </a>

          <div className="nav-right">
            <span>{brand.language}</span>
            <a href="#contact">ACCOUNT</a>
            <button className="nav-cart-button" onClick={() => setCartOpen(true)}>
              CART <b>{cartCount}</b>
            </button>
          </div>
        </nav>
      </header>

      <section className="hero-section">
        <article className="hero-card hero-card-large">
          <img src={hero.leftImage} alt={hero.title} />
          <div className="hero-text-overlay">
            <h1>
              Nurturing Beauty
              <em> with Nature&apos;s Touch</em>
            </h1>
            <p>{hero.subtitle}</p>

            <div className="hero-actions">
              <button onClick={() => addToCart(products[0]?.id)}>{hero.primaryCta}</button>
              <a href="#collection">{hero.secondaryCta}</a>
            </div>
          </div>
        </article>

        <article className="hero-card hero-card-product">
          <img src={hero.rightImage} alt={hero.eyebrow} />
          <div className="hero-product-copy">
            <span>{hero.eyebrow}</span>
            <p>{brand.tagline}</p>
          </div>
          <button onClick={() => addToCart(products[0]?.id)}>{hero.primaryCta}</button>
        </article>
      </section>

      <section className="about-section">
        <div className="section-label">{about.label}</div>
        <h2>{about.headline}</h2>

        <div className="about-grid">
          <div className="accordion">
            {about.features.map((feature: any, index: number) => (
              <button
                key={feature.title}
                className={activeFeature === index ? "feature-row active" : "feature-row"}
                onClick={() => setActiveFeature(index)}
              >
                <span>{feature.number}</span>
                <strong>{feature.title}</strong>
                <b>+</b>
              </button>
            ))}
          </div>

          <div className="about-copy">
            <p>{about.features[activeFeature]?.description}</p>
            <div className="about-images">
              {about.images.map((image: string) => (
                <img key={image} src={image} alt="Natural skincare detail" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="collection-section" id="collection">
        <div className="collection-hero">
          <img src={collection.image || natureSection.image} alt={collection.title} />
          <div>
            <span>{collection.eyebrow}</span>
            <h2>{collection.title}</h2>
            <p>{collection.description}</p>
          </div>
        </div>

        <div className="collection-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product, category, ingredient..."
          />
          <span>{filteredProducts.length} products · click product for details</span>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article
              className="product-card"
              key={product.id}
              onClick={() => openProduct(product.id)}
            >
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <span>{product.badge}</span>
                <button
                  aria-label="favorite"
                  onClick={(event) => {
                    event.stopPropagation();
                    openProduct(product.id);
                  }}
                >
                  ♡
                </button>
              </div>

              <div className="product-info">
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.category} · {product.size}</p>
                </div>
                <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
              </div>

              <p className="product-desc">{product.description}</p>

              <div className="product-actions">
                <span>★ {product.rating}</span>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    addToCart(product.id);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="nature-section">
        <div className="section-center">
          <span>{natureSection.eyebrow}</span>
          <h2>{natureSection.title}</h2>
          <p>{natureSection.description}</p>
        </div>

        <img className="nature-image" src={natureSection.image} alt={natureSection.title} />

        <div className="benefit-grid">
          {benefits.map((benefit: any) => (
            <article key={benefit.title}>
              <b>{benefit.icon}</b>
              <span>{benefit.title}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <span>CONTACT</span>
          <h2>Let nature guide your skincare ritual.</h2>
          <p>
            Ask about product recommendations, sensitive skin routines, refills,
            sustainable packaging, or order support.
          </p>
        </div>

        <form onSubmit={submitContact}>
          <input name="name" placeholder="Your name" required />
          <input name="email" type="email" placeholder="Email address" required />
          <textarea name="message" placeholder="Tell us what your skin needs..." required />
          <button>Send Message</button>
        </form>
      </section>

      <footer className="footer">
        <form onSubmit={submitNewsletter}>
          <label>Join the nature-first skincare letter</label>
          <div>
            <input name="email" type="email" placeholder="name@email.com" required />
            <button>Subscribe</button>
          </div>
        </form>

        <p>{brand.name} · clean skincare · sustainable rituals</p>
      </footer>

      {productOpen && selectedProduct && (
        <div className="modal-backdrop" onClick={() => setProductOpen(false)}>
          <section className="product-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setProductOpen(false)}>×</button>

            <div className="modal-image">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>

            <div className="modal-content">
              <span className="modal-badge">{selectedProduct.badge}</span>
              <h2>{selectedProduct.name}</h2>
              <p className="modal-category">
                {selectedProduct.category} · {selectedProduct.size} · ★ {selectedProduct.rating}
              </p>

              <p>{selectedProduct.longDescription}</p>

              <div className="detail-block">
                <h4>Ingredients</h4>
                <div className="pill-row">
                  {selectedProduct.ingredients.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>

              <div className="detail-block">
                <h4>Benefits</h4>
                <ul>
                  {selectedProduct.benefits.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-block">
                <h4>How to use</h4>
                <p>{selectedProduct.directions}</p>
              </div>

              <div className="detail-block">
                <h4>Best for</h4>
                <div className="pill-row">
                  {selectedProduct.skinTypes.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>

              <div className="modal-buy-row">
                <strong>₹{Number(selectedProduct.price).toLocaleString("en-IN")}</strong>
                <button onClick={() => addToCart(selectedProduct.id)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {cartOpen && (
        <div className="cart-backdrop" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="cart-header">
              <div>
                <span>CART</span>
                <h3>Your skincare bag</h3>
              </div>
              <button onClick={() => setCartOpen(false)}>×</button>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty.</p>
                <a href="#collection" onClick={() => setCartOpen(false)}>View collection</a>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <article className="cart-item" key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <div>
                        <h4>{item.name}</h4>
                        <p>{item.category} · {item.size}</p>
                        <strong>₹{Number(item.price).toLocaleString("en-IN")}</strong>

                        <div className="qty-row">
                          <button onClick={() => updateCartItem(item.id, "decrease")}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartItem(item.id, "increase")}>+</button>
                          <button className="remove-btn" onClick={() => removeCartItem(item.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="cart-footer">
                  <div>
                    <span>Total</span>
                    <strong>₹{Number(cartTotal).toLocaleString("en-IN")}</strong>
                  </div>

                  <button
                    onClick={() => {
                      setMessage("Checkout demo completed. Order backend can be added next.");
                      clearCart();
                    }}
                  >
                    Checkout
                  </button>

                  <button className="clear-cart" onClick={clearCart}>
                    Clear cart
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
