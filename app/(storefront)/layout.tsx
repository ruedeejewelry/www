import { ChatTargetProvider } from "@/components/storefront/ChatContext";
import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { LineBar } from "@/components/storefront/LineBar";
import { SectionBar } from "@/components/storefront/SectionBar";
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
        <div className="mx-auto w-full max-w-[430px] md:max-w-[768px]">
          <SectionBar />
          <main>{children}</main>
          <Footer />
        </div>
        <LineBar />
      </ChatTargetProvider>
    </ToastProvider>
  );
}
