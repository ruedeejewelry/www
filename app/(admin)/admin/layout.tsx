import type { Metadata } from "next";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/Toast";

/** The admin app is never indexed (CLAUDE.md §5). */
export const metadata: Metadata = {
  title: { default: "จัดการสินค้า", template: "%s — admin" },
  robots: { index: false, follow: false, nocache: true },
};

const TABS = [
  { href: "/admin", label: "รายการสินค้า" },
  { href: "/admin/products/new", label: "เพิ่มสินค้า" },
  { href: "/admin/articles/new", label: "เขียนบทความ" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-admin-bg">
        <header className="sticky top-0 z-20 border-b border-border bg-card">
          <div className="mx-auto flex h-[52px] w-full max-w-[430px] items-center gap-3 px-4 md:max-w-[768px]">
            <Link href="/admin" className="font-serif text-[17px] text-ink">
              Ruedee admin
            </Link>
            <div className="flex-1" />
            <span className="text-[11.5px] text-muted">หน้าร้าน</span>
          </div>
          <nav className="no-scrollbar mx-auto flex w-full max-w-[430px] gap-2 overflow-x-auto px-4 pb-2 md:max-w-[768px]">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="shrink-0 rounded-full border border-border bg-paper px-3 py-1.5 text-[12.5px] text-[#3a332c]"
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[430px] md:max-w-[768px]">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
