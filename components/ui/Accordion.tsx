"use client";

import { useState } from "react";

export type QA = { q: string; a: string };

/**
 * FAQ rows. Plain CSS-only open/close state — no animation library anywhere on
 * this site (§2).
 */
export function Accordion({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <div>
      {items.map((item, i) => (
        <div key={item.q} className="border-b border-rule">
          <button
            type="button"
            aria-expanded={!!open[i]}
            onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
            className="flex w-full justify-between gap-3 py-[14px] text-left text-[13.5px] text-ink"
          >
            <span>{item.q}</span>
            <span className="text-gold" aria-hidden="true">
              {open[i] ? "−" : "+"}
            </span>
          </button>
          {open[i] ? (
            <div className="pb-[15px] text-[13px] leading-[1.9] text-body">
              {item.a}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
