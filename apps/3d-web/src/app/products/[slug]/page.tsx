import { notFound } from "next/navigation";
import { ProductViewer3D } from "@/components/ProductViewer3D";
import { PRODUCTS, getProduct } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 sm:flex-row">
      <ProductViewer3D
        shape={product.shape}
        color={product.color}
        interactive
        className="h-80 flex-1 rounded-2xl bg-zinc-50 dark:bg-zinc-900 sm:h-auto"
      />

      <div className="flex flex-1 flex-col gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h1>
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          £{product.priceGBP.toFixed(2)}
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          {product.description}
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <dt>Material</dt>
          <dd>{product.material}</dd>
          <dt>Print time</dt>
          <dd>~{product.printTimeHours}h</dd>
        </dl>
        <button
          type="button"
          className="mt-4 w-full rounded-full bg-zinc-900 px-5 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Add to cart
        </button>
        <p className="text-xs text-zinc-400">
          Checkout isn&apos;t wired up yet — this is a placeholder.
        </p>
      </div>
    </div>
  );
}
