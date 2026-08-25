// Turns lib/data/seed.json into supabase/seed.sql so the sample catalogue and
// the SQL seed can never drift apart. Run: npm run seed:sql

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seed = JSON.parse(readFileSync(join(root, "lib/data/seed.json"), "utf8"));

const q = (v) =>
  v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`;
const n = (v) => (v === null || v === undefined ? "null" : String(v));

const lines = [
  "-- seed.sql — GENERATED from lib/data/seed.json by scripts/generate-seed-sql.mjs.",
  "-- Do not edit by hand; edit the JSON and regenerate.",
  "--",
  "-- Sample catalogue carried over from the Claude Design prototype. Photos are",
  "-- deliberately absent: every image slot renders as a labelled placeholder",
  "-- until the shop uploads the real shot.",
  "",
  "begin;",
  "",
];

for (const s of seed.series) {
  lines.push(
    `insert into series (slug, title, episode_label, blurb) values (${q(s.slug)}, ${q(s.title)}, ${q(s.episode_label)}, ${q(s.blurb)})`,
    "  on conflict (slug) do nothing;",
  );
}
lines.push("");

for (const p of seed.products) {
  lines.push(
    "insert into products (sku, name, category, metal_type, gold_weight_g, stone_type, stone_carat,",
    "  stone_carat_note, stone_color, cert_lab, ring_size_th, price, series_slug, series_episode,",
    "  series_note, status, sold_at, published_at) values (",
    `  ${q(p.sku)}, ${q(p.name)}, ${q(p.category)}, ${q(p.metal_type)}, ${n(p.gold_weight_g)}, ${q(p.stone_type)}, ${n(p.stone_carat)},`,
    `  ${q(p.stone_carat_note)}, ${q(p.stone_color)}, ${q(p.cert_lab)}, ${n(p.ring_size_th)}, ${n(p.price)}, ${q(p.series_slug)}, ${q(p.series_episode)},`,
    `  ${q(p.series_note)}, 'published', ${p.sold ? "now()" : "null"}, now())`,
    "  on conflict (sku) do nothing;",
  );
}
lines.push("");

for (const r of seed.reviews) {
  lines.push(
    `insert into reviews (sku, customer_name, body, published) values (${q(r.sku)}, ${q(r.customer_name)}, ${q(r.body)}, true);`,
  );
}
lines.push("");

for (const a of seed.articles) {
  lines.push(
    "insert into articles (slug, title, excerpt, seo_description, cover_alt, status, published_at) values (",
    `  ${q(a.slug)}, ${q(a.title)}, ${q(a.excerpt)}, ${q(a.seo_description)}, ${q(a.cover_alt)}, 'published', now())`,
    "  on conflict (slug) do nothing;",
  );
  a.blocks.forEach((text, i) => {
    lines.push(
      "insert into article_blocks (article_id, sort_order, kind, text)",
      `  select id, ${i}, 'text', ${q(text)} from articles where slug = ${q(a.slug)};`,
    );
  });
  lines.push("");
}

lines.push("commit;", "");

writeFileSync(join(root, "supabase/seed.sql"), lines.join("\n"), "utf8");
console.log(
  `seed.sql written: ${seed.products.length} products, ${seed.articles.length} articles, ${seed.reviews.length} reviews`,
);
