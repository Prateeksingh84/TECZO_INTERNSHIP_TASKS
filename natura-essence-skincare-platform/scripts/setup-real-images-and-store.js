const fs = require("fs");
const path = require("path");

const root = process.cwd();
const storePath = path.join(root, "data", "natura-store.json");
const assetDir = path.join(root, "public", "assets", "natura");

fs.mkdirSync(assetDir, { recursive: true });

const imageJobs = [
  {
    file: "hero-soft-skin.jpg",
    url: "https://loremflickr.com/1800/1400/skincare,face?lock=101"
  },
  {
    file: "hero-refill-pouch.jpg",
    url: "https://loremflickr.com/1800/1400/skincare,soap?lock=102"
  },
  {
    file: "editorial-dropper.jpg",
    url: "https://loremflickr.com/1400/1200/skincare,serum?lock=103"
  },
  {
    file: "editorial-portrait.jpg",
    url: "https://loremflickr.com/1400/1200/skincare,woman?lock=104"
  },
  {
    file: "editorial-hand-cream.jpg",
    url: "https://loremflickr.com/1800/1000/skincare,cream?lock=105"
  },
  {
    file: "product-fresh-cleanser.jpg",
    url: "https://loremflickr.com/1400/1400/skincare,cleanser?lock=106"
  },
  {
    file: "product-hydrate-cream.jpg",
    url: "https://loremflickr.com/1400/1400/skincare,moisturizer?lock=107"
  },
  {
    file: "product-glow-bundle.jpg",
    url: "https://loremflickr.com/1400/1400/skincare,cosmetics?lock=108"
  },
  {
    file: "product-eyes-cream.jpg",
    url: "https://loremflickr.com/1400/1400/skincare,beauty?lock=109"
  }
];

async function downloadImage(job) {
  const outPath = path.join(assetDir, job.file);

  try {
    const response = await fetch(job.url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.length < 5000) {
      throw new Error("Downloaded file is too small.");
    }

    fs.writeFileSync(outPath, buffer);
    console.log("Downloaded:", `/assets/natura/${job.file}`);
  } catch (error) {
    console.log("Image download failed:", job.file, error.message);
  }
}

async function main() {
  for (const job of imageJobs) {
    await downloadImage(job);
  }

  const store = {
    brand: {
      name: "natura essence",
      tagline: "eco-conscious skincare created to nourish, cleanse, and rejuvenate",
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
      leftImage: "/assets/natura/hero-soft-skin.jpg",
      rightImage: "/assets/natura/hero-refill-pouch.jpg"
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
        "/assets/natura/editorial-dropper.jpg",
        "/assets/natura/editorial-portrait.jpg"
      ]
    },
    collection: {
      eyebrow: "OUR PRODUCTS",
      title: "Our Collection",
      description: "Click any product to view full ingredients, usage, benefits, skin type, price, and cart actions.",
      image: "/assets/natura/editorial-hand-cream.jpg"
    },
    products: [
      {
        id: "fresh-cleanser",
        name: "NaturaFresh Cleanser",
        category: "Cleanser",
        price: 1900,
        rating: 4.8,
        stock: 42,
        size: "150 ml",
        skinTypes: ["Normal", "Oily", "Combination"],
        description: "A gentle daily cleanser with creamy botanical foam and a soft skin finish.",
        longDescription: "NaturaFresh Cleanser removes daily impurities without stripping the skin barrier. It is designed for morning and evening routines where freshness, softness, and balance matter.",
        ingredients: ["Aloe Vera", "Green Tea Extract", "Cucumber Extract", "Coconut-derived Cleanser"],
        benefits: ["Removes buildup", "Keeps skin soft", "Supports balanced glow", "Gentle daily cleansing"],
        directions: "Apply to damp skin, massage for 30 seconds, then rinse with lukewarm water.",
        image: "/assets/natura/product-fresh-cleanser.jpg",
        badge: "BESTSELLER"
      },
      {
        id: "hydrate-cream",
        name: "NaturaHydrate Cream",
        category: "Cream",
        price: 2600,
        rating: 4.7,
        stock: 34,
        size: "80 g",
        skinTypes: ["Dry", "Normal", "Sensitive"],
        description: "A rich hydration cream designed for long-lasting moisture and barrier support.",
        longDescription: "NaturaHydrate Cream comforts dry skin with a cushiony texture and botanical oils. It helps reduce tightness and supports a healthier skin barrier.",
        ingredients: ["Jojoba Oil", "Shea Butter", "Chamomile Extract", "Plant Ceramides"],
        benefits: ["Deep hydration", "Softens texture", "Barrier support", "Comforts dry skin"],
        directions: "Apply a small amount after serum. Use morning and night.",
        image: "/assets/natura/product-hydrate-cream.jpg",
        badge: "NEW"
      },
      {
        id: "glow-bundle",
        name: "NaturaGlow Bundle",
        category: "Bundle",
        price: 3400,
        rating: 4.9,
        stock: 18,
        size: "4 product set",
        skinTypes: ["All Skin Types"],
        description: "A complete glow ritual with cleanser, serum, cream, and balancing mist.",
        longDescription: "NaturaGlow Bundle brings together a complete botanical skincare routine for cleansing, hydration, nourishment, and glow maintenance.",
        ingredients: ["Vitamin E", "Rose Water", "Green Tea Extract", "Aloe Vera", "Jojoba Oil"],
        benefits: ["Complete routine", "Natural glow", "Hydration support", "Great value set"],
        directions: "Use cleanser first, apply serum, seal with cream, and finish with mist.",
        image: "/assets/natura/product-glow-bundle.jpg",
        badge: "VALUE SET"
      },
      {
        id: "eyes-cream",
        name: "NaturaEyes Cream",
        category: "Eye Care",
        price: 2200,
        rating: 4.6,
        stock: 25,
        size: "30 ml",
        skinTypes: ["Sensitive", "Normal", "Dry"],
        description: "A lightweight eye cream for a smoother, refreshed under-eye look.",
        longDescription: "NaturaEyes Cream is a soft under-eye treatment designed for daily hydration and a refreshed appearance without heaviness.",
        ingredients: ["Caffeine Extract", "Chamomile", "Peptides", "Aloe Vera"],
        benefits: ["Refreshes under-eye area", "Lightweight texture", "Softens dryness", "Gentle formula"],
        directions: "Tap a rice-sized amount around the under-eye area using your ring finger.",
        image: "/assets/natura/product-eyes-cream.jpg",
        badge: "GENTLE"
      }
    ],
    natureSection: {
      eyebrow: "OUR INGREDIENTS",
      title: "Nourished by Nature",
      description: "Our products are made with carefully selected natural ingredients, offering effective care that is kind to your skin and the planet.",
      image: "/assets/natura/editorial-hand-cream.jpg"
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

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");

  const verify = JSON.parse(fs.readFileSync(storePath, "utf8"));
  console.log("Store updated:", verify.brand.name);
  console.log("Products:", verify.products.length);
}

main();
