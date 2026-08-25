import { LoginForm } from "@/components/admin/LoginForm";

const REASONS: Record<string, string> = {
  unconfigured:
    "ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล ดูขั้นตอนใน README ก่อนใช้งานฝั่ง admin",
  inactive: "บัญชีนี้ถูกปิดการใช้งาน ติดต่อเจ้าของร้าน",
  error: "ตรวจสอบสิทธิ์ไม่สำเร็จ ลองเข้าสู่ระบบใหม่",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const notice = reason ? REASONS[reason] : undefined;

  return (
    <div className="px-4 pt-8 pb-24">
      <h1 className="font-serif text-[22px] text-ink">เข้าสู่ระบบพนักงาน</h1>
      <p className="mt-2 text-[12.5px] leading-[1.7] text-muted">
        บัญชีเดียวกับระบบลูกค้า ใช้เข้าได้ทั้งเมนูลูกค้าและเมนูสินค้า
      </p>
      {notice ? (
        <p className="mt-4 rounded-[12px] border border-border bg-card p-3 text-[12.5px] leading-[1.7] text-danger">
          {notice}
        </p>
      ) : null}
      <LoginForm />
    </div>
  );
}
