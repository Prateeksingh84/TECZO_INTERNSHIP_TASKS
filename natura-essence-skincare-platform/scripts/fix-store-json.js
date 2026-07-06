const fs = require("fs");
const path = require("path");

const dataPath = path.join(process.cwd(), "data", "natura-store.json");

const data = {
  brand: {
    name: "natura essence",
    tagline: "eco-conscious skincare created skincare to nourish, cleanse, and rejuvenate",
    currency: "INR",
    language: "EN"
  },
  navigation: [
    { label: "MENU", href: "#collection" },
    { label: "SEARCH", href: "#collection" },
    { label: "ACCOUNT", href: "#contact" },
    { label: "CART", href: "#cart" }
  ],
  hero: {
    eyebrow: "Nourishing Soap",
    title: "Nurturing Beauty with Nature's Touch",
    subtitle: "Certified organic skincare created to nourish your skin with pure botanicals, clean textures, and a calm daily ritual.",
    primaryCta: "BUY NOW",
    secondaryCta: "VIEW COLLECTION",
    leftImage: "/api/asset/hero/soft-skin",
    rightImage: "/api/asset/hero/refill-pouch"
  },
  about: {
    label: "ABOUT US",
    headline: "Explore our range of eco-friendly, skin-loving products designed to nourish, cleanse, and rejuvenate. Find the perfect match for your skincare routine.",
    features: [
      {
        number: "01/04",
        title: "Eco-Conscious Ingredients",
        description: "We source naturally derived ingredients that are effective, gentle, and responsibly harvested."
      },
      {
        number: "02/04",
        title: "Cruelty-Free & Vegan",
        description: "Every formula is created without animal testing and with thoughtful plant-based alternatives."
      },
      {
        number: "03/04",
        title: "Safe For All Skin Types",
        description: "Balanced textures designed for dry, oily, combination, and sensitive skin."
      },
      {
        number: "04/04",
        title: "Sustainable Packaging",
        description: "Refill-first packaging and recyclable materials reduce waste without reducing quality."
      }
    ],
    images: [
      "/api/asset/editorial/dropper",
      "/api/asset/editorial/portrait"
    ]
  },
  collection: {
    eyebrow: "OUR PRODUCTS",
    title: "Our Collection",
    description: "A selection of eco-friendly skincare essentials thoughtfully created to nourish your skin."
  },
  products: [
    {
      id: "fresh-cleanser",
      name: "NaturaFresh Cleanser",
      category: "Cleanser",
      price: 1900,
      rating: 4.8,
      stock: 42,
      description: "A gentle daily cleanser with creamy botanical foam and a soft skin finish.",
      image: "/api/asset/product/fresh-cleanser",
      badge: "BESTSELLER"
    },
    {
      id: "hydrate-cream",
      name: "NaturaHydrate Cream",
      category: "Cream",
      price: 2600,
      rating: 4.7,
      stock: 34,
      description: "A rich hydration cream designed for long-lasting moisture and barrier support.",
      image: "/api/asset/product/hydrate-cream",
      badge: "NEW"
    },
    {
      id: "glow-bundle",
      name: "NaturaGlow Bundle",
      category: "Bundle",
      price: 3400,
      rating: 4.9,
      stock: 18,
      description: "A complete glow ritual with cleanser, serum, cream, and balancing mist.",
      image: "/api/asset/product/glow-bundle",
      badge: "VALUE SET"
    },
    {
      id: "eyes-cream",
      name: "NaturaEyes Cream",
      category: "Eye Care",
      price: 2200,
      rating: 4.6,
      stock: 25,
      description: "A lightweight eye cream for a smoother, refreshed under-eye look.",
      image: "/api/asset/product/eyes-cream",
      badge: "GENTLE"
    }
  ],
  natureSection: {
    eyebrow: "OUR INGREDIENTS",
    title: "Nourished by Nature",
    description: "Our products are made with carefully selected natural ingredients, offering effective care that is kind to your skin and the planet.",
    image: "/api/asset/editorial/hand-cream"
  },
  benefits: [
    { title: "Jojoba Oil", icon: "◇" },
    { title: "Cucumber Extract", icon: "⌁" },
    { title: "Green Tea Extract", icon: "✦" },
    { title: "Chamomile Extract", icon: "✽" }
  ],
  cart: {
    items: []
  },
  newsletter: [],
  leads: [],
  orders: []
};

fs.mkdirSync(path.dirname(dataPath), { recursive: true });
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

const verify = JSON.parse(fs.readFileSync(dataPath, "utf8"));
console.log("natura-store.json fixed successfully:", verify.brand.name);
