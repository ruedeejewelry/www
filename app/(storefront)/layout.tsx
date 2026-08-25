import { ChatTargetProvider } from "@/components/storefront/ChatContext";
import { Header } from "@/components/storefront/Header";
import { LineBar } from "@/components/storefront/LineBar";
import { ToastProvider } from "@/components/ui/Toast";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ChatTargetProvider>
        <Header />
        <main className="mx-auto w-full max-w-[430px] md:max-w-[768px]">
          {children}
        </main>
        <LineBar />
      </ChatTargetProvider>
    </ToastProvider>
  );
}
