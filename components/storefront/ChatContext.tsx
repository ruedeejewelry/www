"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ChatTargetState = {
  sku: string | null;
  setSku: (sku: string | null) => void;
};

const Ctx = createContext<ChatTargetState>({ sku: null, setSku: () => {} });

export function useChatTarget() {
  return useContext(Ctx);
}

export function ChatTargetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sku, setSku] = useState<string | null>(null);
  return <Ctx.Provider value={{ sku, setSku }}>{children}</Ctx.Provider>;
}

/**
 * Rendered by the single-product page. Tells the floating LINE bar which piece
 * the customer is looking at, so the bar always carries that SKU (§5).
 */
export function ChatTarget({ sku }: { sku: string }) {
  const { setSku } = useChatTarget();
  useEffect(() => {
    setSku(sku);
    return () => setSku(null);
  }, [sku, setSku]);
  return null;
}
