const fs = require("fs");
const path = require("path");

const root = process.cwd();
const assetDir = path.join(root, "public", "assets", "natura");
const storePath = path.join(root, "data", "natura-store.json");

fs.mkdirSync(assetDir, { recursive: true });

function escapeXml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function makeProductImage({
  file,
  productName,
  productType,
  subtitle,
  background,
  accent,
  dark,
  shape
}) {
  const product = escapeXml(productName);
  const type = escapeXml(productType);
  const sub = escapeXml(subtitle);

  let object = "";

  if (shape === "cleanser") {
    object = `
      <g filter="url(#shadow)">
        <rect x="495" y="200" width="210" height="85" rx="34" fill="#f8f4ec"/>
        <rect x="535" y="130" width="130" height="120" rx="38" fill="#ffffff"/>
        <rect x="445" y="260" width="310" height="470" rx="72" fill="#f4eee3"/>
        <rect x="475" y="305" width="250" height="380" rx="54" fill="${accent}" opacity="0.24"/>
        <rect x="500" y="430" width="200" height="145" rx="22" fill="#ffffff" opacity="0.82"/>
        <text x="600" y="477" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${dark}">natura</text>
        <text x="600" y="516" text-anchor="middle" font-family="Arial" font-size="20" letter-spacing="3" fill="${dark}">CLEANSER</text>
      </g>`;
  }

  if (shape === "cream") {
    object = `
      <g filter="url(#shadow)">
        <ellipse cx="600" cy="735" rx="280" ry="38" fill="#302b23" opacity="0.16"/>
        <rect x="365" y="420" width="470" height="250" rx="82" fill="${accent}"/>
        <rect x="420" y="350" width="360" height="110" rx="50" fill="#fffaf0"/>
        <rect x="445" y="480" width="310" height="115" rx="30" fill="#ffffff" opacity="0.68"/>
        <text x="600" y="525" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="${dark}">natura</text>
        <text x="600" y="565" text-anchor="middle" font-family="Arial" font-size="19" letter-spacing="3" fill="${dark}">HYDRATE</text>
      </g>`;
  }

  if (shape === "bundle") {
    object = `
      <g filter="url(#shadow)">
        <ellipse cx="600" cy="742" rx="340" ry="42" fill="#302b23" opacity="0.16"/>

        <rect x="315" y="390" width="160" height="315" rx="48" fill="#f3e7d7"/>
        <rect x="500" y="250" width="190" height="455" rx="62" fill="${accent}"/>
        <rect x="720" y="350" width="150" height="355" rx="50" fill="#ead6bf"/>

        <rect x="350" y="485" width="90" height="80" rx="16" fill="#ffffff" opacity="0.78"/>
        <rect x="535" y="420" width="120" height="105" rx="18" fill="#ffffff" opacity="0.72"/>
        <rect x="750" y="470" width="90" height="88" rx="15" fill="#ffffff" opacity="0.74"/>

        <text x="395" y="530" text-anchor="middle" font-family="Arial" font-size="18" fill="${dark}">SERUM</text>
        <text x="595" y="466" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="${dark}">natura</text>
        <text x="795" y="515" text-anchor="middle" font-family="Arial" font-size="18" fill="${dark}">CREAM</text>
      </g>`;
  }

  if (shape === "eye") {
    object = `
      <g filter="url(#shadow)">
        <ellipse cx="600" cy="728" rx="270" ry="40" fill="#302b23" opacity="0.16"/>
        <path d="M375 410 L825 330 L870 520 L420 600 Z" fill="${accent}"/>
        <path d="M420 600 L870 520 L825 690 L375 760 Z" fill="#f4e7d8"/>
        <rect x="490" y="465" width="260" height="92" rx="28" fill="#ffffff" opacity="0.76"/>
        <text x="620" y="505" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${dark}">natura</text>
        <text x="620" y="543" text-anchor="middle" font-family="Arial" font-size="19" letter-spacing="3" fill="${dark}">EYES</text>
      </g>`;
  }

  if (shape === "hero-woman") {
    object = `
      <g filter="url(#shadow)">
        <ellipse cx="600" cy="470" rx="260" ry="330" fill="${accent}" opacity="0.25"/>
        <circle cx="600" cy="330" r="92" fill="#d7b99b"/>
        <path d="M430 650 C470 500 730 500 770 650 C700 730 500 730 430 650 Z" fill="#e7d2bd"/>
        <path d="M390 405 C520 300 680 300 810 405 C660 455 540 455 390 405 Z" fill="#fff9ef" opacity="0.66"/>
        <path d="M500 382 C560 430 645 430 700 382" stroke="${dark}" stroke-width="18" opacity="0.18" fill="none" stroke-linecap="round"/>
      </g>`;
  }

  if (shape === "pouch") {
    object = `
      <g filter="url(#shadow)">
        <path d="M400 230 C520 180 680 180 800 230 L760 735 C675 790 525 790 440 735 Z" fill="${accent}"/>
        <path d="M460 300 C550 265 650 265 740 300 L710 695 C640 730 560 730 490 695 Z" fill="#eee4d2" opacity="0.75"/>
        <rect x="510" y="430" width="180" height="120" rx="30" fill="#ffffff" opacity="0.72"/>
        <text x="600" y="480" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${dark}">natura</text>
        <text x="600" y="520" text-anchor="middle" font-family="Arial" font-size="20" letter-spacing="3" fill="${dark}">REFILL</text>
      </g>`;
  }

  if (shape === "dropper") {
    object = `
      <g filter="url(#shadow)">
        <rect x="525" y="260" width="150" height="435" rx="48" fill="${accent}"/>
        <rect x="548" y="200" width="104" height="100" rx="32" fill="#fffaf2"/>
        <path d="M570 145 C605 115 650 140 650 188 L550 188 C550 165 555 154 570 145 Z" fill="${dark}" opacity="0.72"/>
        <rect x="555" y="418" width="90" height="135" rx="22" fill="#ffffff" opacity="0.7"/>
        <text x="600" y="475" text-anchor="middle" font-family="Arial" font-size="19" fill="${dark}">SERUM</text>
      </g>`;
  }

  if (shape === "hands") {
    object = `
      <g filter="url(#shadow)">
        <path d="M150 570 C330 480 470 520 600 595 C730 520 870 480 1050 570 C920 710 730 750 600 690 C470 750 280 710 150 570 Z" fill="#decab2" opacity="0.78"/>
        <circle cx="600" cy="430" r="105" fill="${accent}" opacity="0.62"/>
        <path d="M545 435 C600 365 665 405 695 460 C625 485 575 480 545 435 Z" fill="${dark}" opacity="0.14"/>
      </g>`;
  }

  const svg = `
<svg width="1400" height="1400" viewBox="0 0 1400 1400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffaf2"/>
      <stop offset="48%" stop-color="${background}"/>
      <stop offset="100%" stop-color="#d9d2c0"/>
    </linearGradient>
    <radialGradient id="light" cx="28%" cy="18%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.88"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="32" stdDeviation="34" flood-color="#514a3d" flood-opacity="0.22"/>
    </filter>
  </defs>

  <rect width="1400" height="1400" fill="url(#bg)"/>
  <rect width="1400" height="1400" fill="url(#light)"/>

  <circle cx="1170" cy="190" r="260" fill="#ffffff" opacity="0.20"/>
  <circle cx="170" cy="1180" r="320" fill="#ffffff" opacity="0.20"/>

  <path d="M0 1040 C260 890 460 1160 700 980 C940 800 1130 900 1400 760 L1400 1400 L0 1400 Z" fill="#ffffff" opacity="0.28"/>

  <g transform="translate(100 120)">
    ${object}
  </g>

  <rect x="70" y="70" width="330" height="58" rx="29" fill="#ffffff" opacity="0.70"/>
  <text x="105" y="108" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="4" fill="${dark}">${type.toUpperCase()}</text>

  <text x="80" y="1235" font-family="Georgia, serif" font-size="62" font-weight="700" fill="${dark}">${product}</text>
  <text x="82" y="1292" font-family="Arial, sans-serif" font-size="26" fill="${dark}" opacity="0.72">${sub}</text>
</svg>`;

  fs.writeFileSync(path.join(assetDir, file), svg, "utf8");
}

const assets = [
  {
    file: "hero-soft-skin.svg",
    productName: "Nurturing Beauty",
    productType: "Natural skincare",
    subtitle: "soft botanical skincare ritual",
    background: "#dcd6c7",
    accent: "#aeb493",
    dark: "#4f5843",
    shape: "hero-woman"
  },
  {
    file: "hero-refill-pouch.svg",
    productName: "Nourishing Soap",
    productType: "Refill pouch",
    subtitle: "eco-conscious refill skincare",
    background: "#dfd5c2",
    accent: "#9aa173",
    dark: "#596044",
    shape: "pouch"
  },
  {
    file: "editorial-dropper.svg",
    productName: "Botanical Serum",
    productType: "Serum",
    subtitle: "clean active drops",
    background: "#e8dfcc",
    accent: "#a1a96f",
    dark: "#4d5638",
    shape: "dropper"
  },
  {
    file: "editorial-portrait.svg",
    productName: "Soft Skin Ritual",
    productType: "Skincare",
    subtitle: "gentle daily glow",
    background: "#ddd3c2",
    accent: "#b6aa8c",
    dark: "#5b5245",
    shape: "hero-woman"
  },
  {
    file: "editorial-hand-cream.svg",
    productName: "Nourished by Nature",
    productType: "Ingredients",
    subtitle: "plant powered care",
    background: "#eadfce",
    accent: "#c8ad89",
    dark: "#6d573c",
    shape: "hands"
  },
  {
    file: "product-fresh-cleanser.svg",
    productName: "NaturaFresh Cleanser",
    productType: "Cleanser",
    subtitle: "150 ml gentle daily cleanser",
    background: "#ebe3d5",
    accent: "#9fa884",
    dark: "#4f5940",
    shape: "cleanser"
  },
  {
    file: "product-hydrate-cream.svg",
    productName: "NaturaHydrate Cream",
    productType: "Hydration Cream",
    subtitle: "80 g rich moisture cream",
    background: "#eadcc9",
    accent: "#c7a37f",
    dark: "#6a523a",
    shape: "cream"
  },
  {
    file: "product-glow-bundle.svg",
    productName: "NaturaGlow Bundle",
    productType: "Skincare Set",
    subtitle: "cleanser serum cream mist",
    background: "#eee1cf",
    accent: "#aab083",
    dark: "#575d42",
    shape: "bundle"
  },
  {
    file: "product-eyes-cream.svg",
    productName: "NaturaEyes Cream",
    productType: "Eye Cream",
    subtitle: "30 ml gentle under-eye care",
    background: "#f0dfcd",
    accent: "#d6a47c",
    dark: "#75533a",
    shape: "eye"
  }
];

for (const asset of assets) {
  makeProductImage(asset);
}

function readStore() {
  const raw = fs.readFileSync(storePath, "utf8").replace(/^\uFEFF/, "").trim();
  return JSON.parse(raw);
}

const store = readStore();

store.hero.leftImage = "/assets/natura/hero-soft-skin.svg";
store.hero.rightImage = "/assets/natura/hero-refill-pouch.svg";

store.about.images = [
  "/assets/natura/editorial-dropper.svg",
  "/assets/natura/editorial-portrait.svg"
];

store.collection.image = "/assets/natura/editorial-hand-cream.svg";
store.natureSection.image = "/assets/natura/editorial-hand-cream.svg";

const imageMap = {
  "fresh-cleanser": "/assets/natura/product-fresh-cleanser.svg",
  "hydrate-cream": "/assets/natura/product-hydrate-cream.svg",
  "glow-bundle": "/assets/natura/product-glow-bundle.svg",
  "eyes-cream": "/assets/natura/product-eyes-cream.svg"
};

store.products = store.products.map((product) => ({
  ...product,
  image: imageMap[product.id] || product.image
}));

store.cart = { items: [] };

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");

console.log("Product images fixed and matched:");
for (const product of store.products) {
  console.log(product.name + " => " + product.image);
}
