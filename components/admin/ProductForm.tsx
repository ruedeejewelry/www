"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { saveProduct } from "@/app/(admin)/admin/actions";
import { PhotoPicker, type PickedPhoto } from "@/components/admin/PhotoPicker";
import { useToast } from "@/components/ui/Toast";
import {
  METALS,
  RING_SIZE_MAX,
  RING_SIZE_MIN,
  STONES,
  STONE_COLORS,
  TYPES,
  skuPrefix,
} from "@/lib/site";
import { productSchema } from "@/lib/validation/schemas";

export type ProductFormValues = {
  sku: string;
  name: string;
  category: string;
  price: string;
  metal_type: string;
  gold_weight_g: string;
  stone_type: string;
  stone_color: string;
  stone_carat_note: string;
  ring_size_th: string;
  cert_lab: string;
  cert_number: string;
  description: string;
  photos: PickedPhoto[];
};

export const EMPTY_PRODUCT: ProductFormValues = {
  sku: "",
  name: "",
  category: "ring",
  price: "",
  metal_type: "ทอง 90",
  gold_weight_g: "",
  stone_type: "",
  stone_color: "",
  stone_carat_note: "",
  ring_size_th: "",
  cert_lab: "",
  cert_number: "",
  description: "",
  photos: [],
};

const DRAFT_KEY = "ruedee.admin.product-draft";

/** localStorage is read as an external store; nothing ever notifies it here. */
const noopSubscribe = () => () => {};

function readStoredDraft(): string | null {
  try {
    return window.localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}

function clearStoredDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function pickClass(active: boolean) {
  return [
    "min-h-[44px] rounded-[9px] border px-[13px] py-[9px] text-[12.5px]",
    active
      ? "border-ink bg-ink text-[#f5f1ea]"
      : "border-border bg-paper text-[#3a332c]",
  ].join(" ");
}

function Card({
  title,
  hint,
  required,
  children,
}: {
  title: string;
  hint?: string;
  required?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-3 rounded-[14px] border border-border bg-card p-[14px]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] text-ink">
          {title}
          {required ? <span className="ml-1 text-danger">{required}</span> : null}
        </h2>
        {hint ? <span className="text-[11.5px] text-muted">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

/**
 * Ordered the way the person filling it in thinks — photo, kind, price, then
 * the specs and words that can wait (§9). Only three fields are required, so a
 * piece photographed at the counter can be live in well under two minutes.
 */
export function ProductForm({
  initial,
  skuSuggestions,
  mode,
}: {
  initial: ProductFormValues;
  /** Next free code per category, so the SKU fills itself in. */
  skuSuggestions: Record<string, string>;
  mode: "new" | "edit";
}) {
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [extra, setExtra] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<{ sku: string; url: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const toast = useToast();

  const set = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
    setDirty(true);
  };

  /*
    There is no silent auto-save to the database, and nothing is silently
    restored either (§9) — but a dropped connection must not cost the shop what
    they typed. The in-progress form is kept in this browser, and offered back
    as a banner the staff member chooses to accept.
  */
  const getStored = useCallback(
    () => (mode === "new" && !dirty ? readStoredDraft() : null),
    [mode, dirty],
  );
  const storedDraft = useSyncExternalStore(noopSubscribe, getStored, () => null);

  useEffect(() => {
    if (mode !== "new" || !dirty) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values, dirty, mode]);

  const restoreDraft = () => {
    if (!storedDraft) return;
    try {
      const parsed = JSON.parse(storedDraft) as ProductFormValues;
      setValues((v) => ({ ...v, ...parsed }));
      setDirty(true);
      toast.show("กู้ข้อมูลที่กรอกค้างไว้กลับมาแล้ว");
    } catch {
      clearStoredDraft();
    }
  };

  /* Leaving with unsaved work warns rather than losing it (§9). */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const submit = (status: "draft" | "published") => {
    const payload = {
      sku: values.sku.trim().toUpperCase(),
      name: values.name.trim(),
      category: values.category,
      price: Number.parseInt(values.price.replace(/[^0-9]/g, ""), 10),
      metal_type: values.metal_type || null,
      gold_weight_g: values.gold_weight_g ? Number(values.gold_weight_g) : null,
      stone_type: values.stone_type || null,
      stone_color: values.stone_color || null,
      stone_carat_note: values.stone_carat_note || null,
      ring_size_th: values.ring_size_th ? Number(values.ring_size_th) : null,
      cert_lab: values.cert_lab || null,
      cert_number: values.cert_number || null,
      description: values.description || null,
      photos: values.photos.map((p) => ({
        path: p.path,
        alt: p.alt || undefined,
        width: p.width,
        height: p.height,
      })),
      status,
    };

    // A draft may be missing almost everything; publishing may not.
    if (status === "published") {
      const parsed = productSchema.safeParse(payload);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "ข้อมูลยังไม่ครบ");
        return;
      }
    } else if (!payload.sku) {
      setError("ต้องมีรหัสสินค้าก่อนบันทึกร่าง");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await saveProduct({
        ...payload,
        price: Number.isFinite(payload.price) ? payload.price : 0,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDirty(false);
      clearStoredDraft();
      if (status === "published") {
        setPublished({ sku: result.data.sku, url: result.data.url });
        toast.show(`เผยแพร่ ${result.data.sku} ขึ้นเว็บแล้ว`);
      } else {
        toast.show("บันทึกเป็นฉบับร่างแล้ว ยังไม่ขึ้นเว็บ");
      }
    });
  };

  const optionsFor = (key: string, base: readonly string[]) => [
    ...base,
    ...(extra[key] ?? []),
  ];

  const addValue = (key: string, label: string) => {
    const value = window.prompt(`เพิ่มค่าใหม่ในรายการ ${label}`)?.trim();
    if (!value) return;
    setExtra((e) => ({ ...e, [key]: [...(e[key] ?? []), value] }));
  };

  const specFields = [
    {
      key: "stone_type",
      label: "ชนิดพลอย",
      options: optionsFor("stone_type", STONES.map((s) => s.label)),
      value: STONES.find((s) => s.key === values.stone_type)?.label ?? values.stone_type,
      onPick: (label: string) =>
        set("stone_type", STONES.find((s) => s.label === label)?.key ?? label),
    },
    {
      key: "metal_type",
      label: "ชนิดทอง",
      options: optionsFor("metal_type", METALS),
      value: values.metal_type,
      onPick: (label: string) => set("metal_type", label),
    },
    {
      key: "stone_color",
      label: "สีพลอย",
      options: optionsFor("stone_color", STONE_COLORS),
      value: values.stone_color,
      onPick: (label: string) => set("stone_color", label),
    },
    {
      key: "ring_size_th",
      label: "ไซซ์แหวน",
      options: optionsFor("ring_size_th", ["50", "52", "54", "56", "58"]),
      value: values.ring_size_th,
      onPick: (label: string) => set("ring_size_th", label),
    },
  ];

  return (
    <div className="px-4 pt-4 pb-[150px]">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-[20px] text-ink">
          {mode === "new" ? "เพิ่มสินค้าใหม่" : `แก้ไข ${initial.sku}`}
        </h1>
        <span className="text-[11.5px] text-muted">admin · หน้าร้าน</span>
      </div>

      {storedDraft ? (
        <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-border bg-card p-3">
          <p className="flex-1 text-[12.5px] leading-[1.6] text-body">
            มีข้อมูลที่กรอกค้างไว้ในเครื่องนี้
          </p>
          <button
            type="button"
            onClick={restoreDraft}
            className="min-h-[40px] rounded-[9px] border border-border px-3 text-[12.5px] text-ink"
          >
            กู้กลับมา
          </button>
          <button
            type="button"
            onClick={() => {
              clearStoredDraft();
              setDirty(true);
            }}
            className="min-h-[40px] rounded-[9px] px-2 text-[12.5px] text-muted"
          >
            ทิ้ง
          </button>
        </div>
      ) : null}

      <Card title="รูปสินค้า" required="ต้องมีอย่างน้อย 1 รูป">
        <PhotoPicker
          bucket="product-photos"
          photos={values.photos}
          onChange={(photos) => set("photos", photos)}
        />
        <p className="mt-2 text-[11.5px] leading-[1.6] text-muted">
          ย่อและครอปให้อัตโนมัติก่อนอัปโหลด เรียงลำดับได้ รูปแรกคือรูปที่ขึ้นในกริด
        </p>
      </Card>

      <Card title="ประเภท">
        <div className="mt-[10px] flex flex-wrap gap-[7px]">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={values.category === t.key}
              onClick={() => {
                setValues((v) => ({
                  ...v,
                  category: t.key,
                  // A code the staff already typed is never overwritten (§9).
                  sku: v.sku && v.sku !== skuSuggestions[v.category]
                    ? v.sku
                    : (skuSuggestions[t.key] ?? `${skuPrefix(t.key)}1`),
                }));
                setDirty(true);
              }}
              className={pickClass(values.category === t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-[14px] flex items-center justify-between gap-3 border-t border-rule-soft pt-3">
          <div>
            <label htmlFor="sku" className="text-[13px] text-ink">
              รหัสสินค้า
            </label>
            <p className="mt-0.5 text-[11.5px] text-muted">ระบบสร้างให้ แก้ทับได้</p>
          </div>
          <input
            id="sku"
            value={values.sku}
            onChange={(e) => set("sku", e.target.value.toUpperCase())}
            className="h-11 w-[120px] rounded-[10px] border border-border px-3 text-right font-mono text-[14px] text-ink outline-none"
          />
        </div>
      </Card>

      <Card title="ราคา" required="ต้องกรอก">
        <div className="mt-[10px] flex items-center gap-[10px]">
          <label htmlFor="price" className="sr-only">
            ราคา
          </label>
          <input
            id="price"
            value={values.price}
            inputMode="numeric"
            placeholder="0"
            onChange={(e) => set("price", e.target.value.replace(/[^0-9]/g, ""))}
            className="h-[52px] flex-1 rounded-[11px] border border-border px-[14px] text-[22px] font-semibold text-ink outline-none"
          />
          <span className="text-[14px] text-muted">บาท</span>
        </div>
      </Card>

      <Card title="สเปกพลอยและทอง" hint="กรอกทีหลังได้">
        {specFields.map((field) => (
          <div key={field.key} className="mt-[14px]">
            <div className="text-[12.5px] text-body-soft">{field.label}</div>
            <div className="mt-2 flex flex-wrap gap-[7px]">
              {field.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={field.value === option}
                  onClick={() => field.onPick(option)}
                  className={pickClass(field.value === option)}
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                onClick={() => addValue(field.key, field.label)}
                className="min-h-[44px] rounded-[9px] border border-dashed border-border-dash px-[13px] py-[9px] text-[12.5px] text-body-soft"
              >
                เพิ่มค่าใหม่
              </button>
            </div>
          </div>
        ))}

        <div className="mt-[14px] grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="gold" className="text-[12.5px] text-body-soft">
              น้ำหนักทอง (กรัม)
            </label>
            <input
              id="gold"
              value={values.gold_weight_g}
              inputMode="decimal"
              onChange={(e) =>
                set("gold_weight_g", e.target.value.replace(/[^0-9.]/g, ""))
              }
              className="mt-1.5 h-11 w-full rounded-[10px] border border-border px-3 text-[14px] text-ink outline-none"
            />
          </div>
          <div>
            <label htmlFor="cert" className="text-[12.5px] text-body-soft">
              ใบเซอร์ (GIA / HRD)
            </label>
            <input
              id="cert"
              value={values.cert_lab}
              onChange={(e) => set("cert_lab", e.target.value)}
              className="mt-1.5 h-11 w-full rounded-[10px] border border-border px-3 text-[14px] text-ink outline-none"
            />
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="setting" className="text-[12.5px] text-body-soft">
            การฝัง
          </label>
          <input
            id="setting"
            value={values.stone_carat_note}
            placeholder="เช่น เม็ดใหญ่กลางกระดอง"
            onChange={(e) => set("stone_carat_note", e.target.value)}
            className="mt-1.5 h-11 w-full rounded-[10px] border border-border px-3 text-[14px] text-ink outline-none"
          />
        </div>
      </Card>

      <Card title="ชื่อและคำบรรยาย" hint="กรอกทีหลังได้">
        <label htmlFor="name" className="sr-only">
          ชื่อชิ้นงาน
        </label>
        <input
          id="name"
          value={values.name}
          placeholder="ชื่อชิ้นงาน เช่น ปูกระดองทอง"
          onChange={(e) => set("name", e.target.value)}
          className="mt-[10px] h-11 w-full rounded-[10px] border border-border px-3 text-[14px] text-ink outline-none"
        />
        <label htmlFor="desc" className="sr-only">
          คำบรรยาย
        </label>
        <textarea
          id="desc"
          rows={3}
          value={values.description}
          placeholder="เขียนสั้น ๆ ว่าเม็ดนี้พิเศษยังไง"
          onChange={(e) => set("description", e.target.value)}
          className="mt-2 w-full resize-none rounded-[11px] border border-border px-[13px] py-[11px] text-[13px] leading-[1.7] text-ink outline-none"
        />
      </Card>

      <p className="mt-3 px-1 text-[12px] leading-[1.7] text-muted">
        บันทึกเป็นฉบับร่างได้ ยังไม่ขึ้นเว็บจนกว่าจะกดเผยแพร่ ·
        หน้าแก้ไขทุกชิ้นมีปุ่ม &ldquo;ทำซ้ำจากชิ้นนี้&rdquo;
      </p>

      {error ? (
        <p className="mt-3 rounded-[12px] border border-border bg-card p-3 text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}

      {published ? (
        <div className="mt-[14px] rounded-[14px] border border-ok-border bg-ok-bg p-[14px]">
          <div className="text-[13.5px] text-ok-ink">
            ขึ้นเว็บแล้ว {published.sku}
          </div>
          <Link
            href={published.url}
            className="mt-[10px] inline-block rounded-full border border-[#b9d6be] bg-card px-[14px] py-[9px] text-[12.5px] text-ok-ink"
          >
            เปิดดูหน้าจริง
          </Link>
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
            ฉบับร่าง
          </button>
          <button
            type="button"
            onClick={() => submit("published")}
            disabled={pending}
            className="min-h-[50px] flex-1 rounded-[13px] bg-ink text-[15px] font-semibold text-[#f5f1ea] disabled:opacity-60"
          >
            {pending ? "กำลังบันทึก" : "เผยแพร่ขึ้นเว็บ"}
          </button>
        </div>
      </div>

      <p className="mt-4 px-1 text-[11.5px] text-muted">
        ไซซ์แหวนที่ร้านใช้อยู่ระหว่าง {RING_SIZE_MIN}–{RING_SIZE_MAX}
      </p>
    </div>
  );
}
