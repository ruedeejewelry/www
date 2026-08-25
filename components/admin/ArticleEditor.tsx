"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { saveArticle } from "@/app/(admin)/admin/actions";
import { PhotoPicker, type PickedPhoto } from "@/components/admin/PhotoPicker";
import { useToast } from "@/components/ui/Toast";
import { readingMinutes, slugify } from "@/lib/format";
import { SITE } from "@/lib/site";

const SEO_LIMIT = 155;

type Block =
  | { kind: "text"; text: string }
  | { kind: "image"; text: string; photo: PickedPhoto | null };

/**
 * Writing happens on a phone at the shop, so the editor is blocks with big
 * touch targets rather than a rich-text surface. Reading time and the Google
 * preview update as you type, because that is what makes people fix them.
 */
export function ArticleEditor({ skus }: { skus: string[] }) {
  const [title, setTitle] = useState("");
  const [seo, setSeo] = useState("");
  const [cover, setCover] = useState<PickedPhoto[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([{ kind: "text", text: "" }]);
  const [related, setRelated] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<{ url: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const slug = title.trim() ? slugify(title) : "new-article";
  const path = `/gemstone-guide/${slug}`;

  const chars = useMemo(
    () =>
      blocks
        .filter((b) => b.kind === "text")
        .reduce((total, b) => total + b.text.length, 0),
    [blocks],
  );

  const updateBlock = (index: number, text: string) => {
    setBlocks((list) =>
      list.map((b, i) => (i === index ? { ...b, text } : b)),
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setBlocks((list) => {
      const next = [...list];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const removeBlock = (index: number) => {
    setBlocks((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));
  };

  const submit = (status: "draft" | "published") => {
    if (status === "published" && !title.trim()) {
      setError("ยังไม่ได้ตั้งหัวข้อ");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await saveArticle({
        slug,
        title: title.trim() || "ร่างบทความ",
        excerpt: seo.trim().slice(0, 160) || null,
        seo_description: seo.trim() || null,
        cover_image_path: cover[0]?.path ?? null,
        cover_alt: cover[0]?.alt || title.trim() || null,
        blocks: blocks.map((b) => ({
          kind: b.kind,
          text: b.text || null,
          image_path: b.kind === "image" ? (b.photo?.path ?? null) : null,
        })),
        related_skus: related,
        status,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (status === "published") {
        setPublished({ url: result.data.url });
        toast.show("เผยแพร่บทความแล้ว");
      } else {
        toast.show("บันทึกร่างแล้ว ยังไม่ขึ้นเว็บ");
      }
    });
  };

  const seoNote =
    seo.length === 0
      ? "ถ้าเว้นว่าง Google จะตัดข้อความมาเอง ส่วนใหญ่อ่านไม่รู้เรื่อง"
      : seo.length > SEO_LIMIT
        ? `ยาวเกิน ${SEO_LIMIT} ตัว Google จะตัดท้ายทิ้ง`
        : `ความยาวพอดี ${seo.length}/${SEO_LIMIT}`;

  return (
    <div className="px-4 pt-4 pb-[150px]">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-[20px] text-ink">เขียนบทความ</h1>
        <span className="text-[11.5px] text-muted">admin · ความรู้พลอย</span>
      </div>

      <section className="mt-[14px] rounded-[14px] border border-border bg-card p-[14px]">
        <label htmlFor="title" className="text-[13px] text-ink">
          หัวข้อ
        </label>
        <textarea
          id="title"
          rows={2}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น ไพลินเผากับไม่เผา ต่างกันตรงไหน"
          className="mt-[10px] w-full resize-none rounded-[11px] border border-border px-[13px] py-[11px] font-serif text-[16px] leading-[1.55] text-ink outline-none"
        />
        <div className="mt-[10px] flex justify-between gap-3 text-[11.5px] text-muted">
          <span>ลิงก์บทความ</span>
          <span className="text-right font-mono text-body">{path}</span>
        </div>
      </section>

      <section className="mt-3 rounded-[14px] border border-border bg-card p-[14px]">
        <h2 className="text-[13px] text-ink">
          รูปปก <span className="text-danger">ต้องมี</span>
        </h2>
        <PhotoPicker
          bucket="article-images"
          photos={cover}
          onChange={setCover}
          aspect={4 / 3}
          max={1}
        />
        <p className="mt-2 text-[12px] leading-[1.7] text-muted">
          ครอป 4:3 อัตโนมัติ · รูปนี้ขึ้นในหน้ารวมและตอนแชร์ไลน์
        </p>
      </section>

      <section className="mt-3 rounded-[14px] border border-border bg-card p-[14px]">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] text-ink">เนื้อหา</h2>
          <span className="text-[11.5px] text-muted">
            อ่าน {readingMinutes(chars)} นาที · {chars} ตัวอักษร
          </span>
        </div>

        {blocks.map((block, i) => (
          <div
            key={i}
            className="mt-3 rounded-[12px] border border-[#f0eae0] bg-[#fdfcfa] p-[10px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] text-muted">
                {block.kind === "text" ? `ย่อหน้า ${i + 1}` : "รูปในเนื้อหา"}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  aria-label="เลื่อนขึ้น"
                  onClick={() => moveUp(i)}
                  className="h-9 w-11 rounded-lg border border-border bg-card text-[13px] text-body-soft"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="ลบ"
                  onClick={() => removeBlock(i)}
                  className="h-9 w-11 rounded-lg border border-border bg-card text-[14px] text-muted"
                >
                  ×
                </button>
              </div>
            </div>

            {block.kind === "text" ? (
              <textarea
                rows={4}
                value={block.text}
                onChange={(e) => updateBlock(i, e.target.value)}
                placeholder="เขียนอย่างที่พูดกับลูกค้าหน้าร้าน"
                className="mt-[9px] w-full resize-none rounded-[10px] border border-border px-3 py-[10px] text-[13px] leading-[1.85] text-ink outline-none"
              />
            ) : (
              <div className="mt-[9px]">
                <PhotoPicker
                  bucket="article-images"
                  photos={block.photo ? [block.photo] : []}
                  onChange={(next) =>
                    setBlocks((list) =>
                      list.map((b, j) =>
                        j === i && b.kind === "image"
                          ? { ...b, photo: next[0] ?? null }
                          : b,
                      ),
                    )
                  }
                  aspect={16 / 9}
                  max={1}
                />
                <input
                  value={block.text}
                  onChange={(e) => updateBlock(i, e.target.value)}
                  placeholder="คำบรรยายใต้รูป"
                  className="mt-2 h-11 w-full rounded-[10px] border border-border px-3 text-[12.5px] text-ink outline-none"
                />
              </div>
            )}
          </div>
        ))}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setBlocks((l) => [...l, { kind: "text", text: "" }])}
            className="min-h-[46px] flex-1 rounded-[10px] border border-dashed border-border-dash text-[13px] text-[#3a332c]"
          >
            + ย่อหน้า
          </button>
          <button
            type="button"
            onClick={() =>
              setBlocks((l) => [...l, { kind: "image", text: "", photo: null }])
            }
            className="min-h-[46px] flex-1 rounded-[10px] border border-dashed border-border-dash text-[13px] text-[#3a332c]"
          >
            + รูป
          </button>
        </div>
      </section>

      <section className="mt-3 rounded-[14px] border border-border bg-card p-[14px]">
        <h2 className="text-[13px] text-ink">สินค้าที่เกี่ยวข้อง</h2>
        <p className="mt-1 text-[11.5px] leading-[1.6] text-muted">
          ขึ้นเป็นการ์ดท้ายบทความ คนอ่านจบแล้วกดซื้อได้เลย
        </p>
        <div className="mt-[11px] flex flex-wrap gap-[7px]">
          {skus.map((sku) => {
            const active = related.includes(sku);
            return (
              <button
                key={sku}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setRelated((list) =>
                    active ? list.filter((s) => s !== sku) : [...list, sku],
                  )
                }
                className={`min-h-[44px] rounded-[9px] border px-3 py-[9px] font-mono text-[12px] ${
                  active
                    ? "border-ink bg-ink text-[#f5f1ea]"
                    : "border-border bg-paper text-[#3a332c]"
                }`}
              >
                {sku}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-3 rounded-[14px] border border-border bg-card p-[14px]">
        <label htmlFor="seo" className="text-[13px] text-ink">
          ข้อความที่คนเห็นตอนค้น Google
        </label>
        <textarea
          id="seo"
          rows={2}
          value={seo}
          onChange={(e) => setSeo(e.target.value)}
          placeholder="สรุปสองบรรทัดว่าบทความนี้ตอบอะไร"
          className="mt-[10px] w-full resize-none rounded-[11px] border border-border px-[13px] py-[11px] text-[12.5px] leading-[1.7] text-ink outline-none"
        />
        <p
          className={`mt-[7px] text-[11.5px] ${
            seo.length > SEO_LIMIT ? "text-danger" : "text-muted"
          }`}
        >
          {seoNote}
        </p>

        <div className="mt-3 border-t border-rule-soft pt-3">
          <div className="text-[11.5px] text-muted">ตัวอย่างที่ขึ้นใน Google</div>
          <div className="mt-[7px] rounded-[10px] bg-paper p-[11px]">
            <div className="font-mono text-[11px] text-[#5f7d5a]">
              {SITE.url.replace(/^https?:\/\//, "")}
              {path}
            </div>
            <div className="mt-1 text-[14px] leading-[1.45] text-[#2d4b8e]">
              {title || "หัวข้อบทความจะขึ้นที่นี่"}
            </div>
            <div className="mt-1 text-[12px] leading-[1.6] text-body">
              {seo || "คำอธิบายสองบรรทัดจะขึ้นที่นี่"}
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <p className="mt-3 rounded-[12px] border border-border bg-card p-3 text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}

      {published ? (
        <div className="mt-[14px] rounded-[14px] border border-ok-border bg-ok-bg p-[14px]">
          <div className="text-[13.5px] leading-[1.6] text-ok-ink">
            เผยแพร่แล้ว
            <br />
            <span className="font-mono text-[12px]">{published.url}</span>
          </div>
          <Link
            href={published.url}
            className="mt-[10px] inline-block rounded-full border border-[#b9d6be] bg-card px-[14px] py-[9px] text-[12.5px] text-ok-ink"
          >
            เปิดดูหน้าจริง
          </Link>
        </div>
      ) : null}

      {cover[0] ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="relative h-14 w-[74px] overflow-hidden rounded-[8px]">
            <Image
              src={cover[0].previewUrl}
              alt="รูปปกที่เลือกไว้"
              fill
              sizes="74px"
              unoptimized
              className="object-cover"
            />
          </div>
          <span className="text-[11.5px] text-muted">รูปปกพร้อมแล้ว</span>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-[430px] gap-[9px] px-4 pt-3 pb-[22px] md:max-w-[768px]">
          <button
            type="button"
            onClick={() => submit("draft")}
            disabled={pending}
            className="min-h-[50px] shrink-0 rounded-[13px] border border-[#d9d0c2] bg-card px-4 text-[13.5px] text-[#3a332c] disabled:opacity-60"
          >
            บันทึกร่าง
          </button>
          <button
            type="button"
            onClick={() => submit("published")}
            disabled={pending}
            className="min-h-[50px] flex-1 rounded-[13px] bg-ink text-[15px] font-semibold text-[#f5f1ea] disabled:opacity-60"
          >
            {pending ? "กำลังบันทึก" : "เผยแพร่บทความ"}
          </button>
        </div>
      </div>
    </div>
  );
}
