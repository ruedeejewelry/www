import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireStaff } from "@/lib/auth";
import { nextSku } from "@/lib/data/admin-products";
import { loadProductForForm } from "@/lib/data/product-form";
import { TYPES } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  await requireStaff();
  const { sku } = await params;

  const initial = await loadProductForForm(sku);
  if (!initial) notFound();

  const suggestions = Object.fromEntries(
    await Promise.all(
      TYPES.map(async (t) => [t.key, await nextSku(t.prefix)] as const),
    ),
  );

  return (
    <div>
      <div className="px-4 pt-4">
        <div className="flex gap-2">
          {/* The biggest time-saver in the whole system (§9). */}
          <Link
            href={`/admin/products/new?from=${initial.sku}`}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] border border-border bg-card text-[13px] text-ink"
          >
            ทำซ้ำจากชิ้นนี้
          </Link>
          <Link
            href={`/jewelry/${initial.sku.toLowerCase()}`}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] border border-border bg-card text-[13px] text-ink"
          >
            ดูหน้าจริง
          </Link>
        </div>
      </div>
      <ProductForm initial={initial} skuSuggestions={suggestions} mode="edit" />
    </div>
  );
}
