-- seed.sql — GENERATED from lib/data/seed.json by scripts/generate-seed-sql.mjs.
-- Do not edit by hand; edit the JSON and regenerate.
--
-- Sample catalogue carried over from the Claude Design prototype. Photos are
-- deliberately absent: every image slot renders as a labelled placeholder
-- until the shop uploads the real shot.

begin;

insert into series (slug, title, episode_label, blurb) values ('crab', 'Crab ซีรี่ย์แหวนปู', 'Episode 50', 'งานชุดที่ทำต่อเนื่องกันเป็นตอน งานทำมือทั้งชุด')
  on conflict (slug) do nothing;

insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG60', 'ปูกระดองทอง', 'ring', 'ทอง 90', 5.8, 'ruby', null,
  'เม็ดเล็กที่ตาและขา', 'แดง', null, 50, 48800, 'crab', 'ตอน 01 · ปูกระดองทอง',
  'กระดองโล่งเห็นเนื้อทอง ฝังเพาะตาและขาด้วยทับทิมเม็ดเล็ก ไม่มีพลอยใหญ่กลาง เน้นความเรียบหรูของตัวเรือน', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG126', 'ปูกระดองทอง', 'ring', 'ทอง 90', 5.2, 'ruby', null,
  'เม็ดเล็กที่ตาและขา', 'แดง', null, 49, 43100, 'crab', 'ตอน 01 · ปูกระดองทอง',
  'กระดองโล่งเห็นเนื้อทอง ฝังเพาะตาและขาด้วยทับทิมเม็ดเล็ก ไม่มีพลอยใหญ่กลาง เน้นความเรียบหรูของตัวเรือน', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG125', 'ปูกระดองทอง', 'ring', 'ทอง 90', 5.4, 'ruby', null,
  'เม็ดเล็กที่ตาและขา', 'แดง', null, 51, 44400, 'crab', 'ตอน 01 · ปูกระดองทอง',
  'กระดองโล่งเห็นเนื้อทอง ฝังเพาะตาและขาด้วยทับทิมเม็ดเล็ก ไม่มีพลอยใหญ่กลาง เน้นความเรียบหรูของตัวเรือน', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG81', 'ปูกระดองทอง', 'ring', 'ทอง 90', 5.6, 'ruby', null,
  'เม็ดเล็กที่ตาและขา', 'แดง', null, 52, 46000, 'crab', 'ตอน 01 · ปูกระดองทอง',
  'กระดองโล่งเห็นเนื้อทอง ฝังเพาะตาและขาด้วยทับทิมเม็ดเล็ก ไม่มีพลอยใหญ่กลาง เน้นความเรียบหรูของตัวเรือน', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG56', 'ปูกระดองพลอย', 'ring', 'ทอง 90', 6.2, 'ruby', null,
  'เม็ดใหญ่กลางกระดอง', 'แดง', null, 56, 54300, 'crab', 'ตอน 02 · ปูกระดองพลอย',
  'ฝังพลอยเม็ดใหญ่กลางกระดอง ทั้งทับทิมแดงและพลอยสตาร์ หลายโทนสีให้เลือก', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG121', 'ปูกระดองพลอย', 'ring', 'ทอง 90', 5.9, 'ruby', null,
  'เม็ดใหญ่กลางกระดอง', 'แดง', null, 55, 60900, 'crab', 'ตอน 02 · ปูกระดองพลอย',
  'ฝังพลอยเม็ดใหญ่กลางกระดอง ทั้งทับทิมแดงและพลอยสตาร์ หลายโทนสีให้เลือก', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG59', 'ปูกระดองพลอย', 'ring', 'ทอง 90', 7.5, 'star', null,
  'เม็ดใหญ่กลางกระดอง', 'เทาเงิน', null, 56, 64600, 'crab', 'ตอน 02 · ปูกระดองพลอย',
  'ฝังพลอยเม็ดใหญ่กลางกระดอง ทั้งทับทิมแดงและพลอยสตาร์ หลายโทนสีให้เลือก', 'published', now(), now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG57', 'ปูกระดองพลอย', 'ring', 'ทอง 90', 7.1, 'ruby', null,
  'เม็ดใหญ่กลางกระดอง', 'แดง', null, 56, 61200, 'crab', 'ตอน 02 · ปูกระดองพลอย',
  'ฝังพลอยเม็ดใหญ่กลางกระดอง ทั้งทับทิมแดงและพลอยสตาร์ หลายโทนสีให้เลือก', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG123', 'ปูกระดองพลอย', 'ring', 'ทอง 90', 6.5, 'star', null,
  'เม็ดใหญ่กลางกระดอง', 'เทาเงิน', null, 56, 57000, 'crab', 'ตอน 02 · ปูกระดองพลอย',
  'ฝังพลอยเม็ดใหญ่กลางกระดอง ทั้งทับทิมแดงและพลอยสตาร์ หลายโทนสีให้เลือก', 'published', now(), now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG83', 'ปูกระดองพลอย', 'ring', 'ทอง 90', 6.4, 'ruby', null,
  'เม็ดใหญ่กลางกระดอง', 'แดง', null, 56, 55800, 'crab', 'ตอน 02 · ปูกระดองพลอย',
  'ฝังพลอยเม็ดใหญ่กลางกระดอง ทั้งทับทิมแดงและพลอยสตาร์ หลายโทนสีให้เลือก', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG82', 'ปูกระดองพลอย', 'ring', 'ทอง 90', 6.1, 'ruby', null,
  'เม็ดใหญ่กลางกระดอง', 'แดง', null, 55, 52900, 'crab', 'ตอน 02 · ปูกระดองพลอย',
  'ฝังพลอยเม็ดใหญ่กลางกระดอง ทั้งทับทิมแดงและพลอยสตาร์ หลายโทนสีให้เลือก', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'RG61', 'แหวนปลา', 'ring', 'ทอง 90', 6.3, 'ruby', null,
  'เม็ดเล็กที่ตา', 'แดง', null, 52, 51300, 'crab', 'ตอน 03 · แหวนปลา',
  'แหวนรูปปลาทองรังสรรค์ด้วยมือ ตาฝังทับทิมเล็ก', 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'ER18', 'ต่างหูเพชรหยดน้ำ', 'earring', 'ทอง 90', 2.6, 'diamond', 1.1,
  '1.10 กะรัต รวม', 'น้ำขาว D–F · VS', 'GIA', null, 52000, null, null,
  null, 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'BR07', 'สร้อยข้อมือทับทิม', 'bracelet', 'ทอง 90', 8.2, 'ruby', 5.4,
  '5.40 กะรัต รวม', 'แดงสด', null, null, 39000, null, null,
  null, 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'BC05', 'เข็มกลัดปูทอง', 'brooch', 'ทอง 90', 6.4, 'ruby', null,
  'เม็ดเล็กที่ตาและขา', 'แดง', null, null, 58000, null, null,
  null, 'published', null, now())
  on conflict (sku) do nothing;
insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,
  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,
  series_note, status, sold_at, published_at) values (
  'PD22', 'จี้เพชรเดี่ยว', 'pendant', 'ทองคำขาว 18K', 1.9, 'diamond', 0.72,
  '0.72 กะรัต', 'น้ำขาว D · VS1 · Excellent', 'GIA', null, 76000, null, null,
  null, 'published', null, now())
  on conflict (sku) do nothing;

insert into reviews (sku, customer_name, body, published) values ('RG60', 'ชื่อลูกค้า', '[ใส่รีวิวจริงจากแชทไลน์ — ขออนุญาตลูกค้าก่อนลง]', true);
insert into reviews (sku, customer_name, body, published) values ('RG56', 'ชื่อลูกค้า', '[ใส่รีวิวจริง พร้อมรูปที่ลูกค้าส่งมาให้]', true);
insert into reviews (sku, customer_name, body, published) values ('RG61', 'ชื่อลูกค้า', '[ใส่รีวิวจริง เลือกอันที่เล่าเรื่องงานสั่งทำได้ดี]', true);
insert into reviews (sku, customer_name, body, published) values ('PD22', 'ชื่อลูกค้า', '[ใส่รีวิวจริง เน้นเรื่องใบเซอร์หรือบริการหลังการขาย]', true);

insert into articles (slug, title, excerpt, seo_description, cover_alt, status, published_at) values (
  'burnt-sapphire', 'ไพลินเผากับไม่เผา ต่างกันตรงไหน ราคาห่างเท่าไร', 'ทำไมร้านเดียวกันขายไพลินสองเม็ดสีใกล้กันแต่ราคาต่างสามเท่า', 'ไพลินเผากับไม่เผาต่างกันตรงไหน ราคาห่างกันเท่าไร และดูจากใบเซอร์อย่างไร อธิบายจากประสบการณ์ที่ตลาดพลอยจันทบุรี', 'ไพลินสองเม็ดวางเทียบกัน เม็ดซ้ายผ่านการเผา เม็ดขวาไม่เผา', 'published', now())
  on conflict (slug) do nothing;
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 0, 'text', 'พลอยเกือบทั้งหมดในตลาดผ่านการเผาเพื่อให้สีสดขึ้นและใสขึ้น ซึ่งเป็นเรื่องปกติและยอมรับกันทั่วโลก ไม่ใช่ของปลอม แต่พลอยที่สวยอยู่แล้วโดยไม่ต้องเผาหาได้ยากกว่ามาก ราคาจึงต่างกันหลายเท่าที่คุณภาพสีเท่ากัน' from articles where slug = 'burnt-sapphire';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 1, 'text', 'วิธีรู้คือดูใบเซอร์ ตรงบรรทัด treatment ถ้าเขียนว่า no indication of heating คือไม่เผา ถ้าเขียน heated หรือ H คือเผา ร้านที่ไม่ยอมบอกว่าเผาหรือไม่เผา ให้ระวัง' from articles where slug = 'burnt-sapphire';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 2, 'text', 'สำหรับคนซื้อใส่เอง ไพลินเผาสีสวยคุ้มกว่ามาก เก็บงบไปลงที่ขนาดและความใสจะได้ของที่ใส่สวยกว่าในงบเท่ากัน พลอยไม่เผาเหมาะกับคนที่ซื้อเก็บเป็นสินทรัพย์' from articles where slug = 'burnt-sapphire';

insert into articles (slug, title, excerpt, seo_description, cover_alt, status, published_at) values (
  'read-cert', 'อ่านใบเซอร์ GIA และ HRD ให้เข้าใจในสามนาที', 'บรรทัดไหนสำคัญจริง บรรทัดไหนอ่านผ่านได้', 'อ่านใบเซอร์ GIA และ HRD ให้เป็นในสามนาที บรรทัดไหนมีผลกับราคา บรรทัดไหนอ่านผ่านได้ และตรวจเลขใบเซอร์ย้อนหลังอย่างไร', 'ใบเซอร์ GIA ชี้จุดสำคัญสามบรรทัด', 'published', now())
  on conflict (slug) do nothing;
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 0, 'text', 'ใบเซอร์บอกสามเรื่องหลัก คือชนิดพลอย น้ำหนัก และการปรับปรุงคุณภาพ สามบรรทัดนี้คือทั้งหมดที่มีผลกับราคา ส่วนที่เหลือเป็นข้อมูลทางเทคนิค' from articles where slug = 'read-cert';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 1, 'text', 'ใบเซอร์ไม่ได้ตีราคาให้ และไม่รับประกันว่าพลอยสวย พลอยสองเม็ดที่ใบเซอร์เหมือนกันเป๊ะอาจสวยไม่เท่ากันเลย เพราะไฟและการเจียระไนวัดเป็นตัวเลขไม่ได้' from articles where slug = 'read-cert';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 2, 'text', 'เลขใบเซอร์ตรวจย้อนหลังได้ในเว็บของสถาบัน ถ้าเลขไม่ตรงกับพลอยในมือ ให้คืนของทันที' from articles where slug = 'read-cert';

insert into articles (slug, title, excerpt, seo_description, cover_alt, status, published_at) values (
  'sapphire-color', 'สีไพลินแบบไหนราคาสูง รอยัลบลูคืออะไร', 'ชื่อเรียกสีในวงการ กับสิ่งที่ตาเห็นจริง', 'รอยัลบลู คอร์นฟลาวเวอร์ และน้ำเงินเข้ม ต่างกันอย่างไร สีไพลินแบบไหนราคาสูงและทดสอบไฟพลอยเองได้อย่างไร', 'ไล่เฉดสีไพลินห้าระดับจากอ่อนไปเข้ม', 'published', now())
  on conflict (slug) do nothing;
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 0, 'text', 'รอยัลบลูคือน้ำเงินเข้มอิ่มที่ยังเห็นไฟ ไม่ทึบดำ เป็นเฉดที่ราคาสูงที่สุดของไพลิน รองมาคือคอร์นฟลาวเวอร์ที่อ่อนกว่าและสว่างกว่า' from articles where slug = 'sapphire-color';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 1, 'text', 'คำที่ต้องระวังคือ น้ำเงินเข้ม ซึ่งบางร้านใช้เรียกพลอยที่เข้มจนทึบ ใส่แล้วดูดำ ราคาควรต่ำกว่ารอยัลบลูอย่างมาก' from articles where slug = 'sapphire-color';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 2, 'text', 'วิธีทดสอบง่ายสุดคือถ่ายรูปในร่มโดยไม่เปิดแฟลช ถ้ายังเห็นน้ำเงินสดคือพลอยมีไฟจริง ถ้าออกดำคือพลอยเข้มเกิน' from articles where slug = 'sapphire-color';

insert into articles (slug, title, excerpt, seo_description, cover_alt, status, published_at) values (
  'gold-90-vs-18k', 'ทอง 90 กับทอง 18K เลือกอันไหนดี', 'สีต่างกัน ความแข็งต่างกัน ราคาต่างกัน', 'ทอง 90 กับทอง 18K ต่างกันที่สี ความแข็ง และราคาขายคืน เลือกอย่างไรให้เหมาะกับการใส่จริงและการเก็บมูลค่า', 'เรือนทอง 90 และเรือนทอง 18K วางเทียบสีกัน', 'published', now())
  on conflict (slug) do nothing;
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 0, 'text', 'ทอง 90 คือทอง 21.6 กะรัตโดยประมาณ สีเหลืองอิ่มแบบไทย เนื้ออ่อนกว่า ขึ้นเรือนบางไม่ได้มาก แต่ตีเทิร์นได้ราคาดีกว่าเพราะเนื้อทองมากกว่า' from articles where slug = 'gold-90-vs-18k';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 1, 'text', 'ทอง 18K แข็งกว่า ทำเรือนละเอียดและก้ามฝังพลอยเม็ดใหญ่ได้มั่นคงกว่า สีอ่อนกว่าและมีทองคำขาวให้เลือก เหมาะกับงานล้อมเพชร' from articles where slug = 'gold-90-vs-18k';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 2, 'text', 'ถ้าซื้อใส่เป็นหลักเลือกตามงานที่ชอบ ถ้าซื้อเก็บมูลค่าเลือกทอง 90' from articles where slug = 'gold-90-vs-18k';

insert into articles (slug, title, excerpt, seo_description, cover_alt, status, published_at) values (
  'chanthaburi-market', 'ไปตลาดพลอยจันทบุรีครั้งแรก ควรรู้อะไร', 'เปิดวันไหน ต่อราคายังไง ระวังอะไร', 'ตลาดพลอยจันทบุรีเปิดวันไหน ต่อราคาอย่างไร และควรระวังอะไรเมื่อไปซื้อพลอยครั้งแรก', 'บรรยากาศตลาดพลอยจันทบุรีวันศุกร์ถึงอาทิตย์ ริมถนนศรีจันท์', 'published', now())
  on conflict (slug) do nothing;
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 0, 'text', 'ตลาดคึกคักที่สุดวันศุกร์ถึงอาทิตย์ ช่วงสายถึงบ่าย พ่อค้าจากทั่วโลกมานั่งดูพลอยกันริมถนนศรีจันท์ เดินดูฟรี ไม่มีใครบังคับซื้อ' from articles where slug = 'chanthaburi-market';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 1, 'text', 'ราคาที่บอกครั้งแรกมักต่อได้ แต่ถ้าไม่รู้ราคาตลาดจริงการต่อไม่ช่วยอะไร วิธีที่ปลอดภัยกว่าคือถามหลายแผงในของแบบเดียวกันก่อนตัดสินใจ' from articles where slug = 'chanthaburi-market';
insert into article_blocks (article_id, sort_order, kind, text)
  select id, 2, 'text', 'ของที่ไม่มีใบเซอร์ราคาถูกกว่าเสมอ ถ้าซื้อเม็ดใหญ่ให้ส่งตรวจก่อนจ่ายเต็ม ร้านที่ตรงไปตรงมาจะยินดีให้ส่งตรวจ' from articles where slug = 'chanthaburi-market';

commit;
