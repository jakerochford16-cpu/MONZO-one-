import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <section className="border-b border-zinc-200 px-6 py-16 text-center dark:border-zinc-800">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Printed to order
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
          Every piece below is 3D printed one at a time. Spin the preview,
          pick a colour, and it goes on the print queue.
        </p>
      </section>

      <section className="grid flex-1 grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </section>
    </div>
  );
}
