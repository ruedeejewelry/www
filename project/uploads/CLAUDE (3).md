# CLAUDE.md — Ruedee Jewelry Customer Portal & CRM

เอกสารนี้เป็น single source of truth ของโปรเจกต์ ใช้ร่วมกันทั้งใน Claude Design (ออกแบบ UI) และ Claude Code (เขียนโค้ด)
ถ้าข้อมูลในไฟล์นี้ขัดกับสิ่งที่คุณเดาเอง ให้ยึดไฟล์นี้เสมอ ถ้าไฟล์นี้ไม่ได้ระบุไว้ ให้ถามก่อน อย่าเดาแล้วสร้าง feature ใหม่ขึ้นมาเอง

---

## 1. บริบทธุรกิจ

Ruedee Jewelry (ฤดีจิวเวลรี่) ร้านเครื่องประดับอัญมณี เพชรแท้ พลอยแท้ งานทอง 18k/22k รับงานออกแบบและงานสั่งทำ
ลูกค้าติดต่อผ่าน LINE OA เป็นหลัก รองลงมาคือ Instagram, Facebook, TikTok

ลักษณะเฉพาะที่มีผลต่อการออกแบบระบบ:

- สินค้าส่วนใหญ่เป็นชิ้นเดียวในโลก ไม่ใช่สินค้ามีสต็อกหลายชิ้น
- ราคาสูง (หลักหมื่นถึงหลักแสน) ลูกค้าไม่ได้กดซื้อออนไลน์ แต่ปิดการขายผ่านแชท
- ลูกค้าซื้อซ้ำและซื้อเป็นของขวัญให้คนอื่น
- ความสัมพันธ์ระยะยาว มีบริการหลังการขาย (ล้างทอง ซ่อม เปลี่ยนไซซ์ ชุบใหม่)

---

## 2. เป้าหมายของเฟส 1 (ขอบเขตของงานนี้)

สร้าง web app ที่ลูกค้าเข้าผ่าน LINE OA เพื่อ:

1. ดูและบันทึก **ประวัติไซซ์นิ้ว** ของตัวเอง แยกรายนิ้วรายมือ เก็บเป็นประวัติการวัดหลายครั้ง ไม่ใช่ค่าเดียว
2. ดู **ประวัติเครื่องประดับที่เคยซื้อ** จากร้าน พร้อมรูป รายละเอียดพลอย และใบเซอร์
3. ลูกค้าใหม่ที่ไม่เคยซื้อ ก็ล็อกอินเข้ามาใช้ได้ทันที เห็นหน้าจอที่ยังว่างและมีทางเดินต่อที่ชัดเจน

และให้พนักงานร้าน:

4. ค้นหาลูกค้า บันทึกไซซ์นิ้ว บันทึกรายการซื้อ และแนบรูป/ใบเซอร์ได้จากมือถือ

### สิ่งที่ **ไม่อยู่** ในเฟส 1 (อย่าสร้าง)

ตะกร้าสินค้า, ระบบชำระเงิน, catalog สินค้าหน้าเว็บ, ระบบงานสั่งทำ, ใบเสนอราคา, คลังสินค้า, ระบบพอยต์/แต้มสะสม, chat inbox
ออกแบบ schema ให้ต่อยอดได้ แต่ไม่ต้อง implement

---

## 3. ผู้ใช้และสิทธิ์

| Role | เข้าทางไหน | ทำอะไรได้ |
|---|---|---|
| `customer` | LIFF ใน LINE OA | ดู/แก้ข้อมูลตัวเอง ดูประวัติตัวเองเท่านั้น |
| `staff` | เว็บ admin (LINE Login หรือ email) | ค้นหา/สร้าง/แก้ลูกค้าทุกคน บันทึกไซซ์และรายการซื้อ |
| `owner` | เว็บ admin | ทุกอย่างของ staff + ลบข้อมูล + ดู audit log + จัดการ staff |

ลูกค้าห้ามเห็นข้อมูลลูกค้าคนอื่นเด็ดขาด ไม่ว่ากรณีใด

---

## 4. สถาปัตยกรรม

### โครงสร้าง repo

ใช้ **Next.js project เดียว** (App Router) แยกส่วนด้วย route group ไม่ต้องแยก repo
เหตุผล: แชร์ type, schema, Supabase client และ deploy ครั้งเดียวบน Vercel

```
/app
  /(portal)        → ฝั่งลูกค้า
    /login         → หน้าปุ่ม "เข้าสู่ระบบด้วย LINE"
    /me            → หน้าโปรไฟล์ + สรุป
    /sizes         → ไซซ์นิ้ว
    /jewelry       → เครื่องประดับที่เคยซื้อ
    /jewelry/[id]  → รายละเอียดชิ้นงาน
  /(admin)         → ฝั่งพนักงาน
    /customers
    /customers/[id]
  /api
    /auth/line/login     → redirect ไป LINE authorize พร้อม state + nonce
    /auth/line/callback  → แลก code เป็น token, verify, ออก session
    /auth/logout
/lib
  /supabase        → client (server / admin แยกไฟล์ให้ชัด)
  /line            → OAuth helper, verify id_token
  /validation      → zod schemas ใช้ร่วมกัน client+server
/types
/supabase
  /migrations      → SQL migration ทุกไฟล์อยู่ที่นี่
```

### Subdomain

- `app.ruedeejewelry.com` → LIFF ฝั่งลูกค้า
- `admin.ruedeejewelry.com` → ฝั่งพนักงาน
- ทำด้วย middleware rewrite ใน Next.js ไม่ต้องแยก deployment

### Stack

- Next.js (App Router) + TypeScript strict mode
- Tailwind CSS
- Supabase (Postgres + Storage) — Storage ใช้เก็บรูปเครื่องประดับและไฟล์ใบเซอร์
- Vercel
- LINE Login (OAuth 2.0 / OIDC) — **ไม่ใช้ LIFF SDK** ห้ามติดตั้ง `@line/liff`

---

## 5. Authentication

ใช้ **LINE Login แบบ web OAuth มาตรฐาน** ไม่ใช้ LIFF ไม่มี client-side SDK

### Flow ฝั่งลูกค้า

1. ลูกค้ากด rich menu ใน LINE OA → เปิด `https://app.ruedeejewelry.com` (จะเปิดใน in-app browser ของ LINE หรือ browser ปกติก็ได้ ต้องทำงานได้ทั้งคู่)
2. ยังไม่มี session → เห็นหน้า `/login` มีปุ่มเดียว "เข้าสู่ระบบด้วย LINE"
3. กดปุ่ม → `/api/auth/line/login` สร้าง `state` และ `nonce` เก็บใน httpOnly cookie แล้ว redirect ไป `https://access.line.me/oauth2/v2.1/authorize`
   scope: `openid profile`
4. LINE redirect กลับมาที่ `/api/auth/line/callback` พร้อม `code` และ `state`
5. **ตรวจ `state` ให้ตรงกับ cookie ก่อนทำอย่างอื่น** ถ้าไม่ตรงให้ปฏิเสธทันที
6. แลก `code` เป็น token ที่ `https://api.line.me/oauth2/v2.1/token`
7. **Verify `id_token` ที่ `https://api.line.me/oauth2/v2.1/verify` พร้อม `client_id` และ `nonce`** ห้าม decode JWT เองแล้วเชื่อ
8. ได้ `sub` (LINE user id), `name`, `picture` → upsert แถวใน `customers`
9. ออก session เป็น httpOnly cookie แล้ว redirect ไป `/me`

### ข้อควรระวังเฉพาะของการไม่ใช้ LIFF

- **ไม่มี auto-login** ลูกค้าต้องกดปุ่มเข้าสู่ระบบเองทุกครั้งที่ session หมด ให้ session อายุยาว (30 วัน) แบบ rolling เพื่อลดความรำคาญ
- **ไม่มี `liff.shareTargetPicker`** ฟีเจอร์แชร์ไซซ์นิ้วต้องใช้ลิงก์ธรรมดา + `navigator.share()` และมีปุ่มคัดลอกลิงก์เป็น fallback
- **ไม่มี `liff.closeWindow()`** อย่าออกแบบปุ่ม "ปิดหน้าต่าง"
- Callback URL ต้องลงทะเบียนใน LINE Developers Console ทั้ง production และ preview domain ของ Vercel
- Session cookie ใช้ `SameSite=Lax`, `Secure`, `httpOnly` (flow เป็น top-level redirect จึงใช้ Lax ได้)
- ใส่ `noindex` ทุกหน้าในฝั่ง portal และ admin

### Session + Supabase

เปิด RLS ทุกตาราง แล้ว mint JWT ที่ Supabase ยอมรับ ใส่ `sub` = `customers.id` และ claim `line_user_id` เพื่อให้ RLS policy ทำงานได้จริง
(เจ้าของโปรเจกต์เคยทำ pattern นี้มาแล้ว ให้ทำตามแนวทางเดิมของทีมได้เลย)

### กฎเหล็ก

- `SUPABASE_SERVICE_ROLE_KEY` ห้ามหลุดออกไปฝั่ง client เด็ดขาด ใช้เฉพาะใน server action / route handler
- ห้ามใช้ service role ตอบ request ของลูกค้าโดยไม่มี filter สิทธิ์
- ฝั่ง admin ต้องเช็ค role ทุก request ห้ามซ่อนปุ่มแล้วถือว่าปลอดภัย

### ไม่มีข้อมูลลูกค้าเก่าในระบบใดเลย

ตอนเริ่มโปรเจกต์ ฐานข้อมูลว่างเปล่า 100% ไม่มีไฟล์ให้ import ไม่ต้องเขียน import script ไม่ต้องมี flow merge บัญชี
ทุก record เกิดจากการที่ลูกค้าล็อกอินครั้งแรกด้วยตัวเองผ่าน rich menu แล้วพนักงานค่อยเติมประวัติย้อนหลังให้ทีหลัง

### การหาลูกค้าที่หน้าร้าน (สำคัญ)

พนักงานต้องหา record ของลูกค้าที่ยืนอยู่ตรงหน้าให้เจอ แต่ค้นด้วยชื่อ LINE ไม่ได้จริง เพราะลูกค้าตั้งชื่อเป็นฉายา อิโมจิ หรือชื่อซ้ำกัน จึงต้องมี:

- ทุก `customers` ได้ **รหัสลูกค้าแบบสั้น** ตอนสร้าง เช่น `RD-4821` (ตัวอักษร 2 + ตัวเลข 4 หลัก สุ่ม ไม่เรียงลำดับ)
- หน้า `/me` แสดงรหัสนี้ตัวใหญ่ชัด พร้อม **QR code** ที่ encode รหัสไว้
- หน้า admin มีทั้งช่องพิมพ์รหัส และปุ่มสแกน QR ด้วยกล้องมือถือ
- ค้นด้วยชื่อ/เบอร์โทรได้ด้วย แต่เป็นทางรอง

---

## 6. Data model

เขียนเป็น SQL migration ใน `/supabase/migrations` ทุกตารางมี `created_at`, `updated_at`
ใช้ soft delete (`deleted_at`) ห้าม hard delete ข้อมูลลูกค้าและประวัติการซื้อ

### `customers`

```
id                uuid pk
line_user_id      text unique          -- sub จาก LINE ID token
line_display_name text
line_picture_url  text
full_name         text                 -- ชื่อจริง กรอกทีหลังได้
nickname          text
phone             text                 -- ใช้ match ลูกค้าเก่า
email             text
birth_date        date                 -- ใช้แนะนำพลอยประจำวันเกิด
note_internal     text                 -- พนักงานเห็นเท่านั้น ลูกค้าห้ามเห็น
source_channel    text                 -- line / ig / fb / tiktok / walk-in
pdpa_consent_at   timestamptz
pdpa_version      text
customer_code     text unique not null -- รหัสสั้นให้ลูกค้าโชว์ที่หน้าร้าน เช่น RD-4821
created_at, updated_at, deleted_at
```

### `finger_sizes` — หัวใจของเฟสนี้

เก็บเป็น **ประวัติการวัด** ไม่ใช่ค่าเดียว ลูกค้าจะได้เห็นว่านิ้วเปลี่ยนไปตามเวลา

```
id              uuid pk
customer_id     uuid fk
hand            text     -- 'left' | 'right'
finger          text     -- 'thumb' | 'index' | 'middle' | 'ring' | 'pinky'
size_th         numeric  -- เบอร์แหวนไทย รองรับทศนิยม เช่น 52.5
circumference_mm numeric -- optional แต่แนะนำให้เก็บถ้าวัดได้ เพราะแปลงข้ามระบบได้
measured_at     date
method          text     -- 'ring_sizer' | 'existing_ring' | 'string' | 'customer_reported'
measured_by     uuid fk staff nullable   -- null = ลูกค้าวัดเอง
note            text     -- เช่น "วัดตอนบ่าย นิ้วบวมกว่าปกติ"
created_at
```

กฎ:
- **`size_th` รับค่า 40 ถึง 70 เท่านั้น** เพิ่มทีละ 0.5 (validate ทั้ง zod และ CHECK constraint ใน Postgres)
- ร้านใช้ระบบเบอร์ไทยที่อ้างอิงเส้นรอบวงในมิลลิเมตร ดังนั้น `size_th` กับ `circumference_mm` มีค่าใกล้เคียงกัน ถ้าไม่ได้วัดเส้นรอบวงจริงให้ปล่อย `circumference_mm` เป็น null อย่าคำนวณเติมเอง
- **ห้ามแปลงหน่วยแล้วเก็บทับค่าที่วัดมา** เก็บค่าที่วัดจริงเสมอ การแปลงเป็นระบบ US/UK ให้ทำตอนแสดงผลเท่านั้น สูตรประมาณ: `US ≈ (เส้นรอบวง mm − 36.5) / 2.55` ใช้เป็นค่าอ้างอิงคร่าว ๆ ห้ามใช้ตัดสินใจสั่งทำงานจริง
- "ไซซ์ปัจจุบัน" ของแต่ละนิ้ว = record ที่ `measured_at` ใหม่สุด ไม่ต้องมีคอลัมน์ `is_current` ให้ compute เอา
- record ที่วัดโดยพนักงาน (`method = 'ring_sizer'`) ให้แสดงป้าย "วัดที่ร้าน" ให้ต่างจากที่ลูกค้ากรอกเอง
- ลูกค้าแก้ record ที่พนักงานวัดไม่ได้ แต่เพิ่ม record ใหม่ของตัวเองได้

### `purchases` + `purchase_items`

```
purchases
  id, customer_id, purchased_at, channel, staff_id,
  purchased_at_precision text,  -- 'day' | 'month' | 'year' | 'unknown'
  record_source          text,  -- 'staff' | 'customer_reported'
  verified_by            uuid fk staff nullable
  total_amount numeric,
  show_price_to_customer boolean default true,   -- สำคัญ ดูข้อ 7
  note, created_at, updated_at, deleted_at

purchase_items
  id, purchase_id
  name              text     -- "แหวนไพลินล้อมเพชร"
  category          text     -- ring / necklace / earring / bracelet / pendant / loose_stone
  metal_type        text     -- 18k / 22k / 90 / 95 / platinum / silver
  gold_weight_g     numeric
  stone_type        text     -- ไพลิน ทับทิม มรกต เพชร ...
  stone_carat       numeric
  stone_color       text
  stone_origin      text
  stone_treatment   text     -- เผา / ไม่เผา / unknown
  cert_lab          text     -- GIT / AIGS / GIA / ...
  cert_number       text
  cert_file_url     text     -- Supabase Storage
  ring_size_th      numeric  -- ถ้าเป็นแหวน
  photos            jsonb    -- array ของ storage path
  price             numeric
  warranty_until    date
```

### `service_records`

บริการหลังการขาย ลูกค้าเห็นได้ว่าชิ้นไหนเคยส่งซ่อม/ล้างเมื่อไหร่

```
id, customer_id, purchase_item_id nullable
type        text  -- clean / repair / resize / replate / restring / appraisal
status      text  -- received / in_progress / ready / delivered
received_at, promised_at, done_at
cost numeric, note text, photos jsonb
```

### `staff`, `audit_log`, `consents`

- `audit_log` บันทึกทุกการแก้ไขข้อมูลลูกค้าโดยพนักงาน: `actor_id`, `action`, `table_name`, `record_id`, `before`, `after`, `created_at`
- `consents` เก็บประวัติการให้ความยินยอม PDPA แยกจาก `customers` เพื่อให้ย้อนดูได้ว่ายินยอมเวอร์ชันไหน เมื่อไหร่

---

## 7. กฎธุรกิจที่ต้องระวัง

**เรื่องราคา** — เครื่องประดับจำนวนมากเป็นของขวัญ สามีซื้อให้ภรรยา ลูกซื้อให้แม่ การโชว์ราคาในหน้าประวัติของผู้รับอาจสร้างปัญหา
ใช้ `show_price_to_customer` ควบคุมรายรายการซื้อ ค่าเริ่มต้นให้พนักงานเป็นคนเลือกตอนบันทึก และ **ต้องถามในฟอร์มทุกครั้ง อย่าตั้ง default เงียบ ๆ**

**เรื่องไซซ์นิ้ว** — เป็นข้อมูลที่มีมูลค่าทางอารมณ์ ลูกค้าหลายคนอยากส่งไซซ์ตัวเองให้แฟนแบบไม่ต้องบอกตรง ๆ
ให้มีปุ่ม "แชร์ไซซ์นิ้วของฉัน" ที่สร้างลิงก์ชั่วคราว (token สุ่ม หมดอายุ 7 วัน เพิกถอนได้) หน้าปลายทางเป็น public route ที่ **เห็นเฉพาะไซซ์ ไม่เห็นชื่อ ไม่เห็นประวัติการซื้อ ไม่ต้องล็อกอิน**
ปุ่มแชร์ใช้ `navigator.share()` ถ้าเบราว์เซอร์รองรับ ไม่รองรับให้ fallback เป็นปุ่มคัดลอกลิงก์

**ลูกค้าใหม่ที่ยังไม่มี record** — หน้าจอว่างต้องไม่ทำให้รู้สึกว่าระบบพัง ให้มีทางเดินต่อ 3 ทาง:
1. กรอกไซซ์เองถ้ารู้อยู่แล้ว
2. นัดเข้ามาวัดที่ร้าน (ลิงก์กลับไปแชท LINE พร้อมข้อความตั้งต้น)
3. วิธีวัดนิ้วเองที่บ้าน (หน้าอธิบายสั้น ๆ พร้อมภาพ)

**การเติมประวัติย้อนหลัง** — ระบบเปิดใช้ทั้งที่ร้านขายมาหลายปีแล้ว ประวัติเก่าจะถูกกรอกย้อนหลังทีละคนตอนลูกค้าเดินเข้าร้าน ดังนั้น:
- `purchased_at` ต้องกรอกแบบไม่รู้วันที่แน่นอนได้ ใช้ `purchased_at_precision` บอกว่าละเอียดแค่ไหน แล้ว UI แสดงตามนั้น เช่น "ประมาณปี 2566" ไม่ใช่ "1 ม.ค. 2566"
- ห้ามบังคับกรอกราคาหรือใบเซอร์ ของเก่าหลายชิ้นไม่มีข้อมูลแล้ว ฟิลด์บังคับมีแค่ชื่อกับหมวดหมู่
- ถ้าลูกค้าเป็นคนแจ้งเองว่าเคยซื้ออะไร ให้ `record_source = 'customer_reported'` และแสดงป้าย "รอร้านยืนยัน" จนกว่าพนักงานจะกด verify

**ห้ามลบประวัติ** — ทุกอย่าง soft delete ลูกค้าขอลบข้อมูลตาม PDPA ให้ทำผ่าน flow เฉพาะที่เจ้าของอนุมัติ

---

## 8. UI/UX conventions (สำหรับ Claude Design)

### ข้อจำกัดของสภาพแวดล้อม

- เปิดจาก rich menu ใน LINE เป็นหลัก จึงอยู่ใน in-app browser ของ LINE บนมือถือ แต่ต้องใช้งานได้ปกติในเบราว์เซอร์ทั่วไปด้วย **ออกแบบ mobile-first เสมอ** ความกว้างอ้างอิง 375–430px
- in-app browser มีแถบของ LINE ด้านบน อย่าออกแบบ header ที่ซ้ำซ้อนหรือมีปุ่มปิดของตัวเอง
- ต้องมี navigation ในแอปเอง (กลับหน้าก่อนหน้า) อย่าพึ่งปุ่ม back ของเบราว์เซอร์อย่างเดียว
- รองรับ safe area ด้านล่าง (iPhone home indicator)
- หน้า `/login` เป็นหน้าแรกที่ลูกค้าเห็น ต้องอธิบายสั้น ๆ ว่าล็อกอินไปทำอะไรได้ ก่อนกดปุ่ม ไม่ใช่มีแค่ปุ่มลอย ๆ
- ปุ่มหลักขนาดไม่ต่ำกว่า 44px สูง คนกลุ่มลูกค้ามีทั้งวัยกลางคนขึ้นไป
- หลีกเลี่ยง hover state ล้วน ต้องมี active/pressed state ที่ชัด

### โทนการออกแบบ

- ร้านเพชรพลอย ความรู้สึกต้องเป็น "ประณีต น่าเชื่อถือ อบอุ่น" ไม่ใช่ "แอปเทค"
- รูปเครื่องประดับคือพระเอก UI ต้องถอยให้รูป ใช้พื้นหลังเรียบ ไม่แย่งสายตา
- ระวังการใช้ทองเป็นสีหลักจนดูเชย ใช้เป็น accent เล็ก ๆ พอ
- ภาษาไทยทั้งหมด ใช้ฟอนต์ที่อ่านง่ายบนมือถือ ตัวเลขไซซ์ต้องอ่านชัดในระยะแขน
- **sentence case ในภาษาอังกฤษ ห้าม Title Case ห้าม ALL CAPS**
- ห้ามใช้ emoji ใน UI

### หน้าจอฝั่งลูกค้า

| หน้า | สาระสำคัญ |
|---|---|
| `/me` | ชื่อ + รูปจาก LINE, ไซซ์นิ้วปัจจุบัน 2 นิ้วที่ใช้บ่อย, เครื่องประดับล่าสุด 3 ชิ้น, ปุ่มทักแชทร้าน |
| `/sizes` | รูปมือซ้าย-ขวาให้กดเลือกนิ้ว แต่ละนิ้วแสดงไซซ์ล่าสุด + ดูประวัติการวัดย้อนหลังได้ |
| `/jewelry` | grid รูปเครื่องประดับที่ซื้อไป เรียงตามวันที่ |
| `/jewelry/[id]` | รูปใหญ่ซูมได้, รายละเอียดพลอย, ใบเซอร์, ประวัติการเข้ารับบริการ, ปุ่มขอนัดล้าง/ซ่อม |

### หน้าจอฝั่งพนักงาน

ใช้บนมือถือหน้าร้านเป็นหลัก ให้ความสำคัญกับความเร็วในการกรอกมากกว่าความสวย
ฟอร์มบันทึกไซซ์นิ้วต้องกรอกเสร็จได้ใน 15 วินาที

**หน้า admin นี้จะถูกใช้ร่วมกับระบบจัดการสินค้าของเว็บหน้าบ้าน** (ดู `CLAUDE-storefront.md`) พนักงานล็อกอินที่เดียว เห็นทั้งเมนูลูกค้าและเมนูสินค้า
ดังนั้นตาราง `staff`, ระบบสิทธิ์ และ `audit_log` ต้องออกแบบให้รองรับทั้งสองงานตั้งแต่แรก อย่าผูกติดกับเรื่องลูกค้าอย่างเดียว

---

## 9. Coding conventions (สำหรับ Claude Code)

- TypeScript strict ห้าม `any` ถ้าเลี่ยงไม่ได้ให้ comment เหตุผล
- ทุก input จาก client validate ด้วย zod ทั้งฝั่ง client และ server ใช้ schema ตัวเดียวกันจาก `/lib/validation`
- ใช้ Server Actions หรือ Route Handler สำหรับทุก mutation ห้ามยิง Supabase ตรงจาก client component ด้วยสิทธิ์ที่เขียนข้อมูลได้
- แยกไฟล์ Supabase client ให้ชัด: `client.ts` (browser, anon), `server.ts` (server, ใช้ session ของ user), `admin.ts` (service role, มี comment เตือนไว้บนหัวไฟล์)
- Error message ที่แสดงให้ user เป็นภาษาไทย ส่วน log ภายในเป็นภาษาอังกฤษ
- ทุก migration เป็นไฟล์ SQL ตั้งชื่อ `NNNN_description.sql` ห้ามแก้ไฟล์ migration เก่าที่ apply ไปแล้ว
- เขียน RLS policy คู่กับ migration ที่สร้างตาราง อย่าทิ้งไว้ทีหลัง
- รูปภาพทั้งหมดผ่าน `next/image` และ Supabase Storage แบบ signed URL ห้ามเปิด bucket เป็น public
- ไม่ต้องเขียน unit test ทุกอย่าง แต่ logic การคำนวณไซซ์และการเช็คสิทธิ์เข้าถึงข้อมูล ต้องมี test

### Environment variables

```
LINE_LOGIN_CHANNEL_ID
LINE_LOGIN_CHANNEL_SECRET
LINE_LOGIN_CALLBACK_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
NEXT_PUBLIC_SITE_URL
```

---

## 10. PDPA

ระบบเก็บข้อมูลส่วนบุคคลของลูกค้าไทย ต้องทำตาม PDPA:

- แสดงหน้าขอความยินยอมครั้งแรกที่ล็อกอิน ระบุวัตถุประสงค์ให้ชัด (เก็บประวัติเพื่อให้บริการและแนะนำสินค้า)
- มีหน้า "ข้อมูลของฉัน" ที่ลูกค้าขอ export ข้อมูลตัวเอง และขอลบได้
- `note_internal` เป็นข้อมูลที่พนักงานบันทึก ลูกค้าไม่เห็น แต่ถ้าลูกค้าใช้สิทธิ์ขอดูข้อมูล ต้อง export ได้ด้วย ดังนั้น **อย่าเขียนอะไรที่ไม่อยากให้ลูกค้าเห็นลงไป** ให้ระบุเตือนไว้ใต้ช่องกรอกในหน้า admin

---

## 11. ลำดับการสร้าง

1. Supabase schema + RLS + seed ข้อมูลตัวอย่าง
2. LINE Login OAuth flow ครบวง (login → callback → verify → session) ให้ทำงานจริงก่อนทำ UI อื่น ทดสอบทั้งใน in-app browser ของ LINE และ Safari/Chrome
3. หน้า `/sizes` ฝั่งลูกค้า (feature ที่คุ้มที่สุด ทำก่อน)
4. หน้า admin บันทึกไซซ์
5. หน้า `/jewelry` + admin บันทึกรายการซื้อ
6. รหัสลูกค้า + QR + ปุ่มสแกนฝั่ง admin
7. แชร์ไซซ์, service records, PDPA export

---

## 12. เรื่องที่ยังไม่ตัดสินใจ (ถามก่อนทำ)

- พนักงานล็อกอินด้วย LINE หรือ email/password
- ต้องรองรับภาษาอังกฤษสำหรับลูกค้าต่างชาติในเฟสนี้หรือไม่
