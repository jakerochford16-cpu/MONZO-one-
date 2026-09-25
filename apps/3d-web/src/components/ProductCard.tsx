import Link from "next/link";
import { ProductViewer3D } from "@/components/ProductViewer3D";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
    >
      <ProductViewer3D
        shape={product.shape}
        color={product.color}
        className="h-56 w-full bg-zinc-50 dark:bg-zinc-900"
      />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {product.description}
        </p>
        <p className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">
          £{product.priceGBP.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
