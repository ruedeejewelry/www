"use client";

import { useState, useTransition } from "react";
import { subscribeToNewArrivals } from "@/app/(storefront)/notify-me/actions";
import { useToast } from "@/components/ui/Toast";
import { PRICE_BANDS, STONES } from "@/lib/site";
import { notifySchema } from "@/lib/validation/schemas";

const CONTACT_KINDS = [
  { key: "line", label: "ไลน์ไอดี" },
  { key: "phone", label: "เบอร์โทร" },
] as const;

function pickClass(active: boolean) {
  return [
    "min-h-[44px] rounded-[9px] border px-[14px] py-[11px] text-[13px]",
    active
      ? "border-ink bg-ink text-[#f5f1ea]"
      : "border-border bg-card text-[#3a332c]",
  ].join(" ");
}

export function NotifyForm() {
  const [stones, setStones] = useState<string[]>([]);
  const [bands, setBands] = useState<string[]>([]);
  const [contact, setContact] = useState("");
  const [kind, setKind] = useState<"line" | "phone">("line");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const toggle = (
    value: string,
    list: string[],
    set: (next: string[]) => void,
  ) => {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const submit = () => {
    const payload = {
      contact,
      contact_kind: kind,
      stone_types: stones,
      price_bands: bands,
      consent,
    };
    const parsed = notifySchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ครบ");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await subscribeToNewArrivals(parsed.data);
      if (result.ok) {
        setDone(true);
        toast.show("บันทึกความสนใจแล้ว มีของเข้าจะทักไปหาก่อนใคร");
      } else {
        setError(result.error);
      }
    });
  };

  if (done) {
    return (
      <div className="mt-5 rounded-[14px] border border-ok-border bg-ok-bg p-[14px] text-[13.5px] leading-[1.7] text-ok-ink">
        บันทึกแล้ว มีของตรงที่สนใจเข้ามาเมื่อไหร่ จันจะทักไปหาก่อนลงเว็บ
      </div>
    );
  }

  return (
    <div>
      <h2 className="mt-[22px] text-[13px] text-ink">สนใจพลอยชนิดไหน</h2>
      <div className="mt-[10px] flex flex-wrap gap-[7px]">
        {STONES.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={stones.includes(s.key)}
            onClick={() => toggle(s.key, stones, setStones)}
            className={pickClass(stones.includes(s.key))}
          >
            {s.label}
          </button>
        ))}
      </div>

      <h2 className="mt-[22px] text-[13px] text-ink">ช่วงราคาที่ดูอยู่</h2>
      <div className="mt-[10px] flex flex-wrap gap-[7px]">
        {PRICE_BANDS.map((b) => (
          <button
            key={b.key}
            type="button"
            aria-pressed={bands.includes(b.key)}
            onClick={() => toggle(b.key, bands, setBands)}
            className={pickClass(bands.includes(b.key))}
          >
            {b.label}
          </button>
        ))}
      </div>

      <h2 className="mt-[22px] text-[13px] text-ink">ให้ติดต่อกลับทางไหน</h2>
      <div className="mt-[10px] flex gap-[7px]">
        {CONTACT_KINDS.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={kind === c.key}
            onClick={() => setKind(c.key)}
            className={pickClass(kind === c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <label htmlFor="contact" className="sr-only">
        {kind === "line" ? "ไลน์ไอดี" : "เบอร์โทร"}
      </label>
      <input
        id="contact"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        inputMode={kind === "phone" ? "tel" : "text"}
        placeholder={kind === "line" ? "ไลน์ไอดีของคุณ" : "เบอร์โทรของคุณ"}
        className="mt-[10px] h-[52px] w-full rounded-[11px] border border-border bg-card px-[14px] text-[14px] text-ink outline-none"
      />

      <label className="mt-[14px] flex items-start gap-[10px] text-[12.5px] leading-[1.7] text-body">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0"
        />
        <span>
          ยินยอมให้เก็บข้อมูลติดต่อไว้เพื่อแจ้งของเข้าใหม่เท่านั้น
          ขอให้ลบได้ทุกเมื่อในแชท
        </span>
      </label>

      {error ? (
        <p className="mt-3 text-[12.5px] text-danger">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="mt-4 min-h-[50px] w-full rounded-[13px] bg-ink text-[15px] font-semibold text-[#f5f1ea] disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก" : "ให้แจ้งเตือนฉัน"}
      </button>
    </div>
  );
}
