"use server";

import { revalidatePath } from "next/cache";
import { recordAudit } from "@/lib/audit";
import { requireOwner, requireStaff } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { articleSchema, productSchema } from "@/lib/validation/schemas";
import type { ProductRow } from "@/types/db";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

/*
  Every mutation in the admin app lives here. Each one starts by establishing
  who is asking, writes through the service role, records an audit row, and
  then revalidates the pages the change affects — so staff see proof the change
  is live instead of pressing publish twice (§9).
*/

/** Pages that show a product, so a publish is visible immediately. */
function revalidateProduct(product: Pick<ProductRow, "sku" | "series_slug">) {
  revalidatePath("/");
  revalidatePath("/jewelry");
  revalidatePath(`/jewelry/${product.sku.toLowerCase()}`);
  revalidatePath("/portfolio");
  revalidatePath("/favorites");
  if (product.series_slug) revalidatePath(`/series/${product.series_slug}`);
  revalidatePath("/sitemap.xml");
}

export async function saveProduct(raw: unknown): Promise<
  ActionResult<{ sku: string; status: string; url: string }>
> {
  const staff = await requireStaff();

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "ข้อมูลยังไม่ครบ",
    };
  }
  const input = parsed.data;
  const supabase = createAdminSupabase();

  const { data: existing } = await supabase
    .from("products")
    .select("*")
    .eq("sku", input.sku)
    .maybeSingle();

  const row = {
    sku: input.sku.toUpperCase(),
    name: input.name || "ยังไม่ได้ตั้งชื่อ",
    category: input.category,
    metal_type: input.metal_type ?? "ทอง 90",
    gold_weight_g: input.gold_weight_g ?? null,
    stone_type: input.stone_type ?? "ruby",
    stone_carat: input.stone_carat ?? null,
    stone_carat_note: input.stone_carat_note ?? null,
    stone_color: input.stone_color ?? null,
    ring_size_th: input.ring_size_th ?? null,
    cert_lab: input.cert_lab ?? null,
    cert_number: input.cert_number ?? null,
    price: input.price,
    description: input.description ?? null,
    series_slug: input.series_slug || null,
    status: input.status,
    published_at:
      input.status === "published"
        ? (existing?.published_at ?? new Date().toISOString())
        : null,
    updated_by: staff.id,
    ...(existing ? {} : { created_by: staff.id }),
  };

  const { data: saved, error } = existing
    ? await supabase
        .from("products")
        .update(row)
        .eq("id", existing.id)
        .select()
        .single()
    : await supabase.from("products").insert(row).select().single();

  if (error || !saved) {
    console.error("saveProduct failed", error?.message);
    return { ok: false, error: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  // Photos are replaced wholesale: the form always sends the full ordered list.
  await supabase.from("product_images").delete().eq("product_id", saved.id);
  if (input.photos.length) {
    await supabase.from("product_images").insert(
      input.photos.map((photo, i) => ({
        product_id: saved.id,
        storage_path: photo.path,
        alt_th: photo.alt ?? `${row.name} ${row.sku} รูปที่ ${i + 1}`,
        sort_order: i,
        width: photo.width ?? null,
        height: photo.height ?? null,
      })),
    );
  }

  await recordAudit({
    actorId: staff.id,
    action: existing ? "product.update" : "product.create",
    table: "products",
    recordId: saved.id,
    before: existing ?? null,
    after: saved,
  });

  revalidateProduct(saved);

  return {
    ok: true,
    data: {
      sku: saved.sku,
      status: saved.status,
      url: `/jewelry/${saved.sku.toLowerCase()}`,
    },
  };
}

/**
 * The most-used action in the whole system: one tap from the list, no edit
 * screen (§9). Tapping again undoes it, because mis-taps happen at the counter.
 */
export async function toggleSold(sku: string): Promise<ActionResult<{ sold: boolean }>> {
  const staff = await requireStaff();
  const supabase = createAdminSupabase();

  const { data: existing } = await supabase
    .from("products")
    .select("*")
    .eq("sku", sku)
    .maybeSingle();

  if (!existing) return { ok: false, error: "ไม่พบสินค้ารหัสนี้" };

  const sold_at = existing.sold_at ? null : new Date().toISOString();
  const { data: saved, error } = await supabase
    .from("products")
    .update({ sold_at, updated_by: staff.id })
    .eq("id", existing.id)
    .select()
    .single();

  if (error || !saved) {
    console.error("toggleSold failed", error?.message);
    return { ok: false, error: "บันทึกไม่สำเร็จ" };
  }

  await recordAudit({
    actorId: staff.id,
    action: sold_at ? "product.mark_sold" : "product.unmark_sold",
    table: "products",
    recordId: saved.id,
    before: existing,
    after: saved,
  });

  revalidateProduct(saved);
  revalidatePath("/admin");
  return { ok: true, data: { sold: sold_at !== null } };
}

/** Gold moves; the price has to be editable from the list too (§9). */
export async function updatePrice(
  sku: string,
  price: number,
): Promise<ActionResult> {
  const staff = await requireStaff();
  if (!Number.isInteger(price) || price < 1) {
    return { ok: false, error: "ราคาไม่ถูกต้อง" };
  }

  const supabase = createAdminSupabase();
  const { data: existing } = await supabase
    .from("products")
    .select("*")
    .eq("sku", sku)
    .maybeSingle();
  if (!existing) return { ok: false, error: "ไม่พบสินค้ารหัสนี้" };

  const { data: saved, error } = await supabase
    .from("products")
    .update({ price, updated_by: staff.id })
    .eq("id", existing.id)
    .select()
    .single();

  if (error || !saved) return { ok: false, error: "บันทึกไม่สำเร็จ" };

  await recordAudit({
    actorId: staff.id,
    action: "product.update_price",
    table: "products",
    recordId: saved.id,
    before: { price: existing.price },
    after: { price: saved.price },
  });

  revalidateProduct(saved);
  revalidatePath("/admin");
  return { ok: true };
}

/** Soft delete only. Staff may hide a row; only the owner can purge one (§9). */
export async function softDeleteProduct(sku: string): Promise<ActionResult> {
  const staff = await requireOwner();
  const supabase = createAdminSupabase();

  const { data: existing } = await supabase
    .from("products")
    .select("*")
    .eq("sku", sku)
    .maybeSingle();
  if (!existing) return { ok: false, error: "ไม่พบสินค้ารหัสนี้" };

  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), updated_by: staff.id })
    .eq("id", existing.id);

  if (error) return { ok: false, error: "ลบไม่สำเร็จ" };

  await recordAudit({
    actorId: staff.id,
    action: "product.soft_delete",
    table: "products",
    recordId: existing.id,
    before: existing,
  });

  revalidateProduct(existing);
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Hands the browser a one-shot upload URL. The file itself never passes through
 * the server action — the phone uploads it straight to Storage after shrinking
 * it locally.
 */
export async function createPhotoUploadUrl(
  bucket: "product-photos" | "article-images",
  filename: string,
): Promise<ActionResult<{ path: string; token: string }>> {
  await requireStaff();

  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safe}`;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createSignedUploadUrl failed", error?.message);
    return { ok: false, error: "อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  return { ok: true, data: { path: data.path, token: data.token } };
}

export async function saveArticle(raw: unknown): Promise<
  ActionResult<{ slug: string; url: string; status: string }>
> {
  const staff = await requireStaff();

  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "ข้อมูลยังไม่ครบ",
    };
  }
  const input = parsed.data;
  const supabase = createAdminSupabase();

  const { data: existing } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", input.slug)
    .maybeSingle();

  const row = {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt ?? null,
    seo_description: input.seo_description ?? null,
    cover_image_path: input.cover_image_path ?? null,
    cover_alt: input.cover_alt ?? null,
    status: input.status,
    published_at:
      input.status === "published"
        ? (existing?.published_at ?? new Date().toISOString())
        : null,
    updated_by: staff.id,
    ...(existing ? {} : { created_by: staff.id }),
  };

  const { data: saved, error } = existing
    ? await supabase.from("articles").update(row).eq("id", existing.id).select().single()
    : await supabase.from("articles").insert(row).select().single();

  if (error || !saved) {
    console.error("saveArticle failed", error?.message);
    return { ok: false, error: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  await supabase.from("article_blocks").delete().eq("article_id", saved.id);
  if (input.blocks.length) {
    await supabase.from("article_blocks").insert(
      input.blocks.map((b, i) => ({
        article_id: saved.id,
        sort_order: i,
        kind: b.kind,
        text: b.text ?? null,
        image_path: b.image_path ?? null,
      })),
    );
  }

  await supabase.from("article_products").delete().eq("article_id", saved.id);
  if (input.related_skus.length) {
    const { data: linked } = await supabase
      .from("products")
      .select("id")
      .in("sku", input.related_skus);
    if (linked?.length) {
      await supabase.from("article_products").insert(
        linked.map((p) => ({ article_id: saved.id, product_id: p.id })),
      );
    }
  }

  await recordAudit({
    actorId: staff.id,
    action: existing ? "article.update" : "article.create",
    table: "articles",
    recordId: saved.id,
    before: existing ?? null,
    after: saved,
  });

  revalidatePath("/");
  revalidatePath("/gemstone-guide");
  revalidatePath(`/gemstone-guide/${saved.slug}`);
  revalidatePath("/sitemap.xml");

  return {
    ok: true,
    data: {
      slug: saved.slug,
      status: saved.status,
      url: `/gemstone-guide/${saved.slug}`,
    },
  };
}
