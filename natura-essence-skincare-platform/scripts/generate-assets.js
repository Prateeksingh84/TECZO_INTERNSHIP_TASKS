const fs = require("fs");
const path = require("path");

const root = process.cwd();
const storePath = path.join(root, "data", "natura-store.json");
const outDir = path.join(root, "public", "assets", "natura");

fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").trim();
  return JSON.parse(raw);
}

function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const store = readJson(storePath);

const assets = [
  {
    file: "hero-soft-skin.svg",
    kind: "hero",
    title: "Nurturing Beauty",
    subtitle: "Nature inspired skincare",
    colors: ["#d8d5c9", "#a9ae98", "#f4efe6", "#6f765e"],
    mode: "portrait"
  },
  {
    file: "hero-refill-pouch.svg",
    kind: "hero",
    title: "Nourishing Soap",
    subtitle: "Refill conscious ritual",
    colors: ["#a8aa86", "#e5dfcf", "#f8f5ec", "#73795c"],
    mode: "pouch"
  },
  {
    file: "editorial-dropper.svg",
    kind: "editorial",
    title: "Botanical Serum",
    subtitle: "Clean active drops",
    colors: ["#a0a66f", "#e9ddc8", "#f6f1e7", "#51573a"],
    mode: "dropper"
  },
  {
    file: "editorial-portrait.svg",
    kind: "editorial",
    title: "Soft Skin Ritual",
    subtitle: "Gentle daily glow",
    colors: ["#ded8c9", "#c8b8a8", "#f5eee5", "#7c6b5d"],
    mode: "portrait"
  },
  {
    file: "editorial-hand-cream.svg",
    kind: "editorial",
    title: "Nourished by Nature",
    subtitle: "Plant powered care",
    colors: ["#f0e7d9", "#d8c7ad", "#f8f3ec", "#9a805f"],
    mode: "hands"
  },
  {
    file: "product-fresh-cleanser.svg",
    kind: "product",
    title: "NaturaFresh Cleanser",
    subtitle: "Gentle daily cleanser",
    colors: ["#f2eadf", "#8d936f", "#d7cbb8", "#ffffff"],
    mode: "bottle"
  },
  {
    file: "product-hydrate-cream.svg",
    kind: "product",
    title: "NaturaHydrate Cream",
    subtitle: "Rich hydration cream",
    colors: ["#c8ab83", "#efe3d0", "#d6bd93", "#ffffff"],
    mode: "jar"
  },
  {
    file: "product-glow-bundle.svg",
    kind: "product",
    title: "NaturaGlow Bundle",
    subtitle: "Complete skincare set",
    colors: ["#e8ddc9", "#b5814e", "#e7caa7", "#ffffff"],
    mode: "bundle"
  },
  {
    file: "product-eyes-cream.svg",
    kind: "product",
    title: "NaturaEyes Cream",
    subtitle: "Soft eye care",
    colors: ["#f1ddc6", "#c08f64", "#efd9c4", "#ffffff"],
    mode: "tube"
  }
];

function productShape(mode, colors) {
  const [a, b, c, d] = colors;

  if (mode === "jar") {
    return `
      <ellipse cx="600" cy="700" rx="240" ry="38" fill="#3d352c" opacity="0.16"/>
      <g filter="url(#shadow)">
        <rect x="390" y="350" width="420" height="280" rx="70" fill="${a}"/>
        <rect x="430" y="300" width="340" height="95" rx="44" fill="${b}"/>
        <rect x="470" y="440" width="260" height="110" rx="24" fill="#ffffff" opacity="0.42"/>
        <text x="600" y="488" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${d}">natura</text>
        <text x="600" y="526" text-anchor="middle" font-family="Arial" font-size="20" fill="${d}">cream</text>
      </g>`;
  }

  if (mode === "bundle") {
    return `
      <ellipse cx="600" cy="720" rx="320" ry="42" fill="#3d352c" opacity="0.16"/>
      <g filter="url(#shadow)">
        <path d="M330 305 C390 260 500 260 560 305 L540 685 C490 720 400 720 350 685 Z" fill="${b}"/>
        <path d="M520 255 C590 210 720 210 790 255 L765 705 C700 745 610 745 545 705 Z" fill="${a}"/>
        <path d="M735 355 C795 320 885 320 935 355 L915 690 C865 720 795 720 755 690 Z" fill="${c}"/>
        <rect x="580" y="430" width="150" height="90" rx="20" fill="#ffffff" opacity="0.42"/>
        <text x="655" y="477" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="${d}">natura</text>
      </g>`;
  }

  if (mode === "tube") {
    return `
      <ellipse cx="600" cy="720" rx="220" ry="34" fill="#3d352c" opacity="0.16"/>
      <g filter="url(#shadow)">
        <path d="M430 240 L770 240 L715 690 C650 730 550 730 485 690 Z" fill="${a}"/>
        <rect x="500" y="190" width="200" height="70" rx="32" fill="${b}"/>
        <rect x="505" y="420" width="190" height="95" rx="20" fill="#ffffff" opacity="0.38"/>
        <text x="600" y="466" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="${d}">natura</text>
      </g>`;
  }

  return `
    <ellipse cx="600" cy="735" rx="245" ry="36" fill="#3d352c" opacity="0.16"/>
    <g filter="url(#shadow)">
      <path d="M445 250 C515 210 685 210 755 250 L735 710 C670 755 530 755 465 710 Z" fill="${a}"/>
      <path d="M485 300 C550 270 650 270 715 300 L700 690 C645 720 555 720 500 690 Z" fill="${c}" opacity="0.62"/>
      <rect x="520" y="410" width="160" height="105" rx="22" fill="#ffffff" opacity="0.44"/>
      <text x="600" y="458" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="${d}">natura</text>
      <text x="600" y="496" text-anchor="middle" font-family="Arial" font-size="18" fill="${d}">essence</text>
    </g>`;
}

function editorialShape(mode, colors) {
  const [a, b, c, d] = colors;

  if (mode === "portrait") {
    return `
      <g filter="url(#shadow)">
        <ellipse cx="600" cy="470" rx="230" ry="310" fill="${d}" opacity="0.16"/>
        <circle cx="600" cy="315" r="92" fill="${b}" opacity="0.45"/>
        <path d="M420 665 C470 505 735 505 785 665 C700 730 505 730 420 665 Z" fill="${a}" opacity="0.76"/>
        <path d="M405 410 C520 310 680 310 795 410 C650 455 535 455 405 410 Z" fill="#ffffff" opacity="0.42"/>
        <path d="M500 385 C565 435 645 435 705 385" stroke="${d}" stroke-width="20" opacity="0.22" fill="none" stroke-linecap="round"/>
      </g>`;
  }

  if (mode === "dropper") {
    return `
      <g filter="url(#shadow)">
        <rect x="530" y="220" width="140" height="430" rx="50" fill="${a}"/>
        <rect x="552" y="180" width="96" height="95" rx="32" fill="${d}" opacity="0.5"/>
        <path d="M585 120 C620 95 660 120 648 160 L552 160 C542 130 560 123 585 120 Z" fill="${b}"/>
        <rect x="560" y="390" width="80" height="135" rx="20" fill="#ffffff" opacity="0.38"/>
        <circle cx="600" cy="455" r="26" fill="${c}" opacity="0.58"/>
      </g>`;
  }

  if (mode === "hands") {
    return `
      <g filter="url(#shadow)">
        <path d="M170 560 C330 480 470 510 600 575 C730 510 870 480 1030 560 C910 690 725 730 600 675 C475 730 290 690 170 560 Z" fill="${b}" opacity="0.58"/>
        <path d="M330 480 C445 390 550 445 600 575 C455 565 360 540 330 480 Z" fill="#ffffff" opacity="0.42"/>
        <path d="M870 480 C755 390 650 445 600 575 C745 565 840 540 870 480 Z" fill="#ffffff" opacity="0.42"/>
        <circle cx="600" cy="430" r="100" fill="${a}" opacity="0.62"/>
        <path d="M545 430 C600 365 665 405 690 455 C620 480 575 475 545 430 Z" fill="${d}" opacity="0.18"/>
      </g>`;
  }

  return productShape("bottle", colors);
}

function heroShape(mode, colors) {
  const [a, b, c, d] = colors;

  if (mode === "pouch") {
    return `
      <g filter="url(#shadow)">
        <path d="M410 230 C530 185 670 185 790 230 L750 735 C665 785 535 785 450 735 Z" fill="${b}" opacity="0.88"/>
        <path d="M455 290 C550 250 650 250 745 290 L718 700 C650 735 550 735 482 700 Z" fill="${a}" opacity="0.75"/>
        <rect x="515" y="425" width="170" height="110" rx="28" fill="#ffffff" opacity="0.42"/>
        <text x="600" y="475" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${d}">natura</text>
        <text x="600" y="515" text-anchor="middle" font-family="Arial" font-size="18" fill="${d}">refill</text>
      </g>`;
  }

  return editorialShape("portrait", colors);
}

function svg(asset) {
  const [a, b, c, d] = asset.colors;
  const title = esc(asset.title);
  const subtitle = esc(asset.subtitle);
  const content =
    asset.kind === "hero"
      ? heroShape(asset.mode, asset.colors)
      : asset.kind === "editorial"
        ? editorialShape(asset.mode, asset.colors)
        : productShape(asset.mode, asset.colors);

  return `<svg width="1200" height="900" viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c}"/>
      <stop offset="50%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="35%" cy="25%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#4c463b" flood-opacity="0.22"/>
    </filter>
  </defs>

  <rect width="1200" height="900" fill="url(#bg)"/>
  <rect width="1200" height="900" fill="url(#glow)"/>
  <circle cx="1050" cy="115" r="230" fill="#ffffff" opacity="0.15"/>
  <circle cx="120" cy="780" r="280" fill="#ffffff" opacity="0.14"/>
  <path d="M0 640 C230 520 365 760 600 615 C835 465 970 505 1200 410 L1200 900 L0 900 Z" fill="#ffffff" opacity="0.22"/>

  ${content}

  <rect x="64" y="64" width="280" height="52" rx="26" fill="#ffffff" opacity="0.48"/>
  <text x="92" y="99" font-family="Arial, sans-serif" font-size="20" letter-spacing="4" fill="${d}">${asset.kind.toUpperCase()}</text>

  <text x="70" y="805" font-family="Georgia, serif" font-size="58" fill="#ffffff" font-weight="700">${title}</text>
  <text x="72" y="850" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" opacity="0.9">${subtitle}</text>
</svg>`;
}

for (const asset of assets) {
  fs.writeFileSync(path.join(outDir, asset.file), svg(asset), "utf8");
}

store.hero.leftImage = "/assets/natura/hero-soft-skin.svg";
store.hero.rightImage = "/assets/natura/hero-refill-pouch.svg";

store.about.images = [
  "/assets/natura/editorial-dropper.svg",
  "/assets/natura/editorial-portrait.svg"
];

store.natureSection.image = "/assets/natura/editorial-hand-cream.svg";

const productImageMap = {
  "fresh-cleanser": "/assets/natura/product-fresh-cleanser.svg",
  "hydrate-cream": "/assets/natura/product-hydrate-cream.svg",
  "glow-bundle": "/assets/natura/product-glow-bundle.svg",
  "eyes-cream": "/assets/natura/product-eyes-cream.svg"
};

store.products = store.products.map((product) => ({
  ...product,
  image: productImageMap[product.id] || product.image
}));

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");

console.log("Generated assets:");
for (const asset of assets) {
  console.log(" - /assets/natura/" + asset.file);
}
console.log("Updated:", storePath);
