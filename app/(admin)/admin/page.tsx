import Link from "next/link";
import { ProductListRow } from "@/components/admin/ProductListRow";
import { requireStaff } from "@/lib/auth";
import { getAdminProducts } from "@/lib/data/admin-products";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "draft", label: "ฉบับร่าง" },
  { key: "nophoto", label: "ยังไม่มีรูป" },
  { key: "available", label: "ยังมีของ" },
] as const;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const staff = await requireStaff();
  const { filter = "all" } = await searchParams;
  const products = await getAdminProducts();

  /* Two of these exist purely to chase down unfinished work (§9). */
  const shown = products.filter((p) => {
    if (filter === "draft") return p.status === "draft";
    if (filter === "nophoto") return p.photoCount === 0;
    if (filter === "available") return p.sold_at === null;
    return true;
  });

  return (
    <div className="pb-24">
      <div className="flex items-baseline justify-between px-4 pt-4">
        <h1 className="font-serif text-[20px] text-ink">รายการสินค้า</h1>
        <span className="text-[11.5px] text-muted">{staff.full_name}</span>
      </div>

      <nav className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3 pb-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin" : `/admin?filter=${f.key}`}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] ${
              filter === f.key
                ? "border-ink bg-ink text-[#f5f1ea]"
                : "border-border bg-card text-[#3a332c]"
            }`}
          >
            {f.label}
            {f.key === "draft" || f.key === "nophoto" ? (
              <span className="ml-1 text-[11px] opacity-70">
                {f.key === "draft"
                  ? products.filter((p) => p.status === "draft").length
                  : products.filter((p) => p.photoCount === 0).length}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="mt-1 overflow-hidden rounded-[14px] border border-border bg-card mx-3">
        {shown.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-muted">
            ไม่มีรายการในตัวกรองนี้
          </p>
        ) : (
          shown.map((p) => <ProductListRow key={p.id} product={p} />)
        )}
      </div>

      <div className="px-3 pt-4">
        <Link
          href="/admin/products/new"
          className="flex min-h-[50px] w-full items-center justify-center rounded-[13px] bg-ink text-[15px] font-semibold text-[#f5f1ea]"
        >
          เพิ่มสินค้าใหม่
        </Link>
      </div>
    </div>
  );
}
