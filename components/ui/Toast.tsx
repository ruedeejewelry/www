"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastContext = { show: (message: string) => void };

const Ctx = createContext<ToastContext>({ show: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(""), 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[92px] z-40 flex justify-center px-4"
      >
        {message ? (
          <div className="dc-toast max-w-full rounded-[11px] bg-ink px-4 py-[11px] text-[12.5px] text-[#f5f1ea] shadow-[0_8px_24px_rgba(0,0,0,.25)]">
            {message}
          </div>
        ) : null}
      </div>
    </Ctx.Provider>
  );
}
