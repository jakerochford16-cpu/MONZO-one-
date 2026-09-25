export type ProductShape = "box" | "torus" | "icosahedron" | "cone" | "torusKnot";

export interface Product {
  slug: string;
  name: string;
  priceGBP: number;
  color: string;
  shape: ProductShape;
  description: string;
  material: string;
  printTimeHours: number;
}

// Placeholder catalogue. Swap `shape`/`color` for a real `modelUrl` (.glb)
// per product once actual scans/exports of the printed pieces exist.
export const PRODUCTS: Product[] = [
  {
    slug: "twist-vase",
    name: "Twist Vase",
    priceGBP: 24,
    color: "#c084fc",
    shape: "torusKnot",
    description:
      "A single continuous spiral wall, printed in one piece with no supports. Holds water with an inserted glass liner.",
    material: "PLA",
    printTimeHours: 6,
  },
  {
    slug: "hex-planter",
    name: "Hex Planter",
    priceGBP: 18,
    color: "#4ade80",
    shape: "icosahedron",
    description:
      "Faceted planter with a built-in drainage lip and saucer. Sized for a 10cm root ball.",
    material: "PETG",
    printTimeHours: 4,
  },
  {
    slug: "desk-organiser",
    name: "Desk Organiser",
    priceGBP: 15,
    color: "#60a5fa",
    shape: "box",
    description:
      "Three-slot tray for pens, cards and a phone stand. Non-slip printed texture on the base.",
    material: "PLA",
    printTimeHours: 3,
  },
  {
    slug: "ring-holder",
    name: "Ring Holder",
    priceGBP: 12,
    color: "#f97316",
    shape: "torus",
    description:
      "A weighted ring stand that sits flat without a base plate. Fits up to 8 rings.",
    material: "PLA",
    printTimeHours: 2,
  },
  {
    slug: "cable-tower",
    name: "Cable Tower",
    priceGBP: 20,
    color: "#f472b6",
    shape: "cone",
    description:
      "Stacking cable organiser for a desk — four cutouts, weighted base, snap-fit sections.",
    material: "PETG",
    printTimeHours: 5,
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
