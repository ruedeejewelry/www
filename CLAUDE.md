# CLAUDE.md — วิธีทำงานกับโปรเจกต์นี้

อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง ข้อตกลงข้างล่างมาจากการทำงานจริงกับเจ้าของร้าน
ไม่ใช่ข้อแนะนำ

## วิธีสื่อสาร

- **ตอบเป็นภาษาไทย**
- **SQL หรืออะไรก็ตามที่ต้องรันบน Supabase ให้พิมพ์ลงในแชทเลย**
  ห้ามส่งเป็นไฟล์แนบ ห้ามให้ลิงก์ไปเปิดใน GitHub ต่อให้ยาวหลายสิบบรรทัดก็พิมพ์
  ลงไป — เจ้าของร้านจะ copy จากแชทไปวางใน SQL Editor
  (ยังคง commit ไฟล์ SQL ไว้ใน `supabase/` เพื่อเก็บประวัติได้ แต่ต้องพิมพ์ในแชทด้วยเสมอ)
- Claude เข้าถึง Supabase กับ Vercel dashboard ไม่ได้ (proxy บล็อก) ทุกอย่างที่
  ต้องกดบนสองระบบนั้นเจ้าของร้านทำเอง — เพราะฉะนั้นบอกให้ชัดว่าต้องกดอะไรตรงไหน

## git และการ deploy

- **push ตรงเข้า `main` เสมอ** ไม่ต้องสร้าง branch ไม่ต้องเปิด PR ไม่ต้องรอ merge
- Vercel deploy จาก `main` อัตโนมัติ **เจ้าของร้านดูผลที่ production เท่านั้น**
  ไม่ได้รัน dev server เอง
- อย่าโยนงานกดปุ่มให้เจ้าของร้านถ้าเลี่ยงได้ ถ้าแก้ที่โค้ดแล้วจบก็แก้ที่โค้ด

## ก่อน push ทุกครั้ง

```bash
npm run verify
```

รันแล้ว **ต้องดู exit code ให้เป็น 0 จริง ๆ** ห้ามส่งผลผ่าน `| grep` หรือ `| head`
เพื่อกรองเอาบรรทัดที่อยากเห็น เพราะ exit code ของ pipeline มาจากคำสั่งสุดท้าย
build ที่ล้มเหลวจะดูเหมือนผ่านแล้วหลุดขึ้น production — เกิดมาแล้วหนึ่งครั้ง

`verify` รัน typecheck, lint, test และ **build สองรอบ** รอบหนึ่งไม่มี env อีกรอบ
มี env เพราะโค้ดมีสองทางเดิน ถ้าไม่มี env ข้อมูลจะวิ่งเข้า seed fallback แล้ว
โค้ดที่คุยกับฐานข้อมูลจริงจะไม่ถูกรันเลย

### บั๊กที่หลุดขึ้น production มาแล้ว อย่าให้ซ้ำ

1. **env ค่าว่าง** ตัวแปรที่มีอยู่แต่ไม่ได้ใส่ค่าจะได้ `""` ไม่ใช่ `undefined`
   `??` ไม่ช่วย — ใช้ตัวช่วยใน `lib/site.ts`
2. **คุกกี้ตอน build** หน้าสาธารณะห้ามอ่านข้อมูลผ่าน client ที่ผูก session เพราะ
   `generateStaticParams` รันตอนที่ไม่มี request — `tests/data-layer.test.ts` คุมไว้
3. **segment config ต้องเป็นค่าคงที่ตรง ๆ** `export const revalidate` เอาค่า import
   จากไฟล์อื่นมาใส่ไม่ได้ Next อ่านมันตอน compile — `tests/revalidate.test.ts` คุมไว้
   และ tsc ไม่จับให้ ต้อง build เท่านั้นถึงเจอ

## สภาพแวดล้อมจริง

- Supabase: `https://veypbyqcspwpgbdgdrxr.supabase.co` — schema, RLS และ bucket
  ตั้งครบแล้ว มี owner หนึ่งคน (`ruedeejewelryweb@gmail.com`)
- Vercel: build ที่ Washington DC, ฐานข้อมูลอยู่สิงคโปร์ ยิ่งลด query ยิ่งดี
- env ที่ตั้งแล้ว 3 ตัว: Supabase URL, anon key, service role
- **ยังไม่ได้ตั้ง**: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_LINE_OA_ID` — ตัวหลัง
  ทำให้ปุ่มทักไลน์ทุกปุ่มยังชี้ไปบัญชีสมมติ

## กฎของตัวเว็บ

รายละเอียดอยู่ใน `design/project/uploads/CLAUDE-storefront.md` ข้อที่พลาดบ่อย

- ทุกชิ้นมี URL ของตัวเอง ห้าม modal เป็นหน้าสินค้า ห้าม flip card
- ราคาต้องเห็นตั้งแต่ในกริด และเป็น text จริงใน HTML ไม่ใช่ฝังในรูป
- ฟิลเตอร์อยู่ใน query param เพื่อให้แชร์ลิงก์ผลลัพธ์เข้าแชทได้
- ทุกทางเข้า LINE ต้องพ่วงรหัสสินค้า สร้างลิงก์ผ่าน `lib/line.ts` ที่เดียว
- ของที่ขายแล้วยังอยู่ในเว็บ
- ห้าม animation library ห้าม emoji ใน UI ห้าม ALL CAPS ทั้งบล็อก
- ฟอนต์ 2 ตระกูล 3 น้ำหนัก subset ไทยเท่านั้น

## คำสั่งที่มี

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run brand` | สร้าง favicon/OG/โลโก้ใหม่จาก `design/brand/ruedee-logo.png` |
| `npm run seed:sql` | สร้าง `supabase/seed.sql` จาก `lib/data/seed.json` |
| `npm run demo:sql` | สร้าง `supabase/demo-catalogue.sql` (ข้อมูลทดสอบ 50 ชิ้น) |
| `npm test` | vitest |
