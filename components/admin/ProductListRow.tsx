"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleSold, updatePrice } from "@/app/(admin)/admin/actions";
import { useToast } from "@/components/ui/Toast";
import { baht } from "@/lib/format";
import type { AdminProduct } from "@/lib/data/admin-products";

/**
 * One row of the staff list. Marking a piece sold and fixing its price are the
 * two things done all day, so both happen right here — no edit screen (§9).
 */
export function ProductListRow({ product }: { product: AdminProduct }) {
  const [sold, setSold] = useState(product.sold_at !== null);
  const [price, setPrice] = useState(String(product.price));
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const savePrice = () => {
    const next = Number.parseInt(price.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(next) || next < 1) {
      toast.show("ราคาไม่ถูกต้อง");
      return;
    }
    startTransition(async () => {
      const result = await updatePrice(product.sku, next);
      if (result.ok) {
        setEditing(false);
        toast.show(`แก้ราคา ${product.sku} เป็น ${baht(next)} แล้ว`);
      } else {
        toast.show(result.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-3 border-b border-rule bg-card px-3 py-3">
      <Link
        href={`/admin/products/${product.sku.toLowerCase()}/edit`}
        className="min-w-0 flex-1"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11.5px] text-muted">{product.sku}</span>
          {product.status === "draft" ? (
            <span className="rounded-full bg-panel px-2 py-0.5 text-[10.5px] text-body">
              ฉบับร่าง
            </span>
          ) : null}
          {product.photoCount === 0 ? (
            <span className="rounded-full bg-[#fbeae7] px-2 py-0.5 text-[10.5px] text-danger">
              ยังไม่มีรูป
            </span>
          ) : null}
        </div>
        <div className="mt-1 truncate text-[13px] text-ink">{product.name}</div>
        {editing ? null : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setEditing(true);
            }}
            className="mt-0.5 text-left text-[13px] font-semibold text-ink underline decoration-dotted"
          >
            {baht(product.price)}
          </button>
        )}
      </Link>

      {editing ? (
        <div className="flex items-center gap-2">
          <input
            value={price}
            inputMode="numeric"
            autoFocus
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
            className="h-11 w-[110px] rounded-[10px] border border-border px-3 text-right text-[15px] font-semibold text-ink outline-none"
          />
          <button
            type="button"
            onClick={savePrice}
            disabled={pending}
            className="h-11 rounded-[10px] bg-ink px-3 text-[12.5px] text-[#f5f1ea] disabled:opacity-60"
          >
            บันทึก
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-pressed={sold}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await toggleSold(product.sku);
              if (result.ok) {
                setSold(result.data.sold);
                toast.show(
                  result.data.sold
                    ? `${product.sku} ขายแล้ว`
                    : `ยกเลิกสถานะขายแล้วของ ${product.sku}`,
                );
              } else {
                toast.show(result.error);
              }
            })
          }
          className={`h-11 shrink-0 rounded-[10px] border px-3 text-[12.5px] disabled:opacity-60 ${
            sold
              ? "border-ink bg-ink text-[#f5f1ea]"
              : "border-border bg-paper text-[#3a332c]"
          }`}
        >
          {sold ? "ขายแล้ว" : "กดเมื่อขาย"}
        </button>
      )}
    </div>
  );
}
