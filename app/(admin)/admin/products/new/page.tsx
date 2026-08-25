import { EMPTY_PRODUCT, ProductForm } from "@/components/admin/ProductForm";
import { requireStaff } from "@/lib/auth";
import { nextSku } from "@/lib/data/admin-products";
import { loadProductForForm } from "@/lib/data/product-form";
import { TYPES } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  await requireStaff();
  const { from } = await searchParams;

  const suggestions = Object.fromEntries(
    await Promise.all(
      TYPES.map(async (t) => [t.key, await nextSku(t.prefix)] as const),
    ),
  );

  /*
    "ทำซ้ำจากชิ้นนี้" — most of the shop's work is the same design in another
    size or another stone, so duplicating arrives with everything filled in
    except the code, and photos left off deliberately (§9).
  */
  const duplicated = from ? await loadProductForForm(from) : null;
  const initial = duplicated
    ? {
        ...duplicated,
        sku: suggestions[duplicated.category] ?? "",
        photos: [],
      }
    : { ...EMPTY_PRODUCT, sku: suggestions.ring ?? "RG1" };

  return (
    <ProductForm initial={initial} skuSuggestions={suggestions} mode="new" />
  );
}
