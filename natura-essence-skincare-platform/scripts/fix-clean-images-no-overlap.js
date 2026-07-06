const fs = require("fs");
const path = require("path");

const root = process.cwd();
const assetDir = path.join(root, "public", "assets", "natura");
const storePath = path.join(root, "data", "natura-store.json");

fs.mkdirSync(assetDir, { recursive: true });

function cleanSvg({ file, bg1, bg2, accent, dark, type }) {
  let object = "";

  if (type === "face") {
    object = `
      <ellipse cx="700" cy="690" rx="300" ry="390" fill="${accent}" opacity="0.22"/>
      <circle cx="700" cy="485" r="100" fill="#dcc0a0"/>
      <path d="M500 890 C540 690 860 690 900 890 C820 965 580 965 500 890 Z" fill="#ead6c0"/>
      <path d="M445 575 C580 450 820 450 955 575 C790 640 610 640 445 575 Z" fill="#fff9ee" opacity="0.62"/>
      <path d="M570 565 C640 618 760 618 830 565" stroke="${dark}" stroke-width="18" opacity="0.13" fill="none" stroke-linecap="round"/>
    `;
  }

  if (type === "pouch") {
    object = `
      <path d="M505 350 C620 295 780 295 895 350 L850 1010 C760 1078 640 1078 550 1010 Z" fill="${accent}"/>
      <path d="M575 430 C660 390 740 390 825 430 L790 955 C725 995 675 995 610 955 Z" fill="#eee6d4" opacity="0.78"/>
      <rect x="625" y="610" width="150" height="112" rx="34" fill="#fffaf0" opacity="0.88"/>
      <text x="700" y="664" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${dark}">natura</text>
      <text x="700" y="700" text-anchor="middle" font-family="Arial" font-size="16" letter-spacing="3" fill="${dark}">REFILL</text>
    `;
  }

  if (type === "cleanser") {
    object = `
      <rect x="590" y="280" width="220" height="80" rx="34" fill="#fff9ef"/>
      <rect x="635" y="190" width="130" height="130" rx="38" fill="#ffffff"/>
      <rect x="525" y="355" width="350" height="620" rx="84" fill="#f3ebdf"/>
      <rect x="565" y="425" width="270" height="455" rx="58" fill="${accent}" opacity="0.25"/>
      <rect x="595" y="610" width="210" height="150" rx="26" fill="#ffffff" opacity="0.82"/>
      <text x="700" y="670" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="${dark}">natura</text>
      <text x="700" y="710" text-anchor="middle" font-family="Arial" font-size="17" letter-spacing="3" fill="${dark}">CLEANSER</text>
    `;
  }

  if (type === "cream") {
    object = `
      <ellipse cx="700" cy="1040" rx="300" ry="42" fill="#302b23" opacity="0.14"/>
      <rect x="450" y="610" width="500" height="300" rx="90" fill="${accent}"/>
      <rect x="505" y="520" width="390" height="120" rx="55" fill="#fffaf0"/>
      <rect x="560" y="700" width="280" height="118" rx="30" fill="#ffffff" opacity="0.75"/>
      <text x="700" y="752" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="${dark}">natura</text>
      <text x="700" y="792" text-anchor="middle" font-family="Arial" font-size="17" letter-spacing="3" fill="${dark}">HYDRATE</text>
    `;
  }

  if (type === "bundle") {
    object = `
      <ellipse cx="700" cy="1050" rx="360" ry="45" fill="#302b23" opacity="0.14"/>
      <rect x="410" y="560" width="170" height="400" rx="54" fill="#f3e7d7"/>
      <rect x="610" y="390" width="200" height="570" rx="70" fill="${accent}"/>
      <rect x="845" y="520" width="160" height="440" rx="54" fill="#ead6bf"/>
      <rect x="445" y="685" width="96" height="90" rx="18" fill="#ffffff" opacity="0.76"/>
      <rect x="650" y="610" width="120" height="112" rx="20" fill="#ffffff" opacity="0.74"/>
      <rect x="878" y="675" width="96" height="92" rx="18" fill="#ffffff" opacity="0.74"/>
    `;
  }

  if (type === "eye") {
    object = `
      <ellipse cx="700" cy="1025" rx="310" ry="44" fill="#302b23" opacity="0.14"/>
      <path d="M430 610 L930 510 L990 735 L490 850 Z" fill="${accent}"/>
      <path d="M490 850 L990 735 L930 930 L430 1040 Z" fill="#f4e7d8"/>
      <rect x="575" y="690" width="250" height="95" rx="28" fill="#ffffff" opacity="0.78"/>
      <text x="700" y="735" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="${dark}">natura</text>
      <text x="700" y="772" text-anchor="middle" font-family="Arial" font-size="17" letter-spacing="3" fill="${dark}">EYES</text>
    `;
  }

  if (type === "dropper") {
    object = `
      <rect x="625" y="370" width="150" height="520" rx="50" fill="${accent}"/>
      <rect x="650" y="285" width="100" height="120" rx="34" fill="#fffaf2"/>
      <path d="M670 230 C705 195 755 225 750 280 L650 280 C650 255 655 240 670 230 Z" fill="${dark}" opacity="0.72"/>
      <rect x="655" y="560" width="90" height="140" rx="24" fill="#ffffff" opacity="0.74"/>
    `;
  }

  if (type === "hands") {
    object = `
      <path d="M170 780 C360 650 540 720 700 820 C860 720 1040 650 1230 780 C1080 960 855 1010 700 930 C545 1010 320 960 170 780 Z" fill="#decab2" opacity="0.78"/>
      <circle cx="700" cy="610" r="120" fill="${accent}" opacity="0.62"/>
      <path d="M635 612 C700 525 780 585 815 650 C725 682 665 675 635 612 Z" fill="${dark}" opacity="0.14"/>
    `;
  }

  const svg = `
<svg width="1400" height="1400" viewBox="0 0 1400 1400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffaf2"/>
      <stop offset="50%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="light" cx="28%" cy="18%" r="72%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="34" stdDeviation="36" flood-color="#514a3d" flood-opacity="0.20"/>
    </filter>
  </defs>

  <rect width="1400" height="1400" fill="url(#bg)"/>
  <rect width="1400" height="1400" fill="url(#light)"/>
  <circle cx="1180" cy="190" r="280" fill="#ffffff" opacity="0.18"/>
  <circle cx="180" cy="1180" r="320" fill="#ffffff" opacity="0.16"/>
  <path d="M0 1040 C260 890 460 1160 700 980 C940 800 1130 900 1400 760 L1400 1400 L0 1400 Z" fill="#ffffff" opacity="0.24"/>

  <g filter="url(#shadow)">
    ${object}
  </g>
</svg>`;

  fs.writeFileSync(path.join(assetDir, file), svg, "utf8");
}

const assets = [
  { file: "hero-soft-skin.svg", bg1: "#ded9cb", bg2: "#cfc7b7", accent: "#aeb493", dark: "#4f5843", type: "face" },
  { file: "hero-refill-pouch.svg", bg1: "#dfd5c2", bg2: "#cfc7b7", accent: "#9aa173", dark: "#596044", type: "pouch" },
  { file: "editorial-dropper.svg", bg1: "#e8dfcc", bg2: "#d6cab8", accent: "#a1a96f", dark: "#4d5638", type: "dropper" },
  { file: "editorial-portrait.svg", bg1: "#ddd3c2", bg2: "#cec1af", accent: "#b6aa8c", dark: "#5b5245", type: "face" },
  { file: "editorial-hand-cream.svg", bg1: "#eadfce", bg2: "#d7c6ae", accent: "#c8ad89", dark: "#6d573c", type: "hands" },
  { file: "product-fresh-cleanser.svg", bg1: "#ebe3d5", bg2: "#d8ccbb", accent: "#9fa884", dark: "#4f5940", type: "cleanser" },
  { file: "product-hydrate-cream.svg", bg1: "#eadcc9", bg2: "#d6c2aa", accent: "#c7a37f", dark: "#6a523a", type: "cream" },
  { file: "product-glow-bundle.svg", bg1: "#eee1cf", bg2: "#d4c4ad", accent: "#aab083", dark: "#575d42", type: "bundle" },
  { file: "product-eyes-cream.svg", bg1: "#f0dfcd", bg2: "#d6bea7", accent: "#d6a47c", dark: "#75533a", type: "eye" }
];

for (const asset of assets) {
  cleanSvg(asset);
}

const raw = fs.readFileSync(storePath, "utf8").replace(/^\uFEFF/, "").trim();
const store = JSON.parse(raw);

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

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");

console.log("Clean no-overlap image assets generated.");
