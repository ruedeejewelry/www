import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { requireStaff } from "@/lib/auth";
import { getAdminProducts } from "@/lib/data/admin-products";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  await requireStaff();
  const products = await getAdminProducts();

  return (
    <ArticleEditor
      skus={products
        .filter((p) => p.status === "published")
        .slice(0, 12)
        .map((p) => p.sku)}
    />
  );
}
