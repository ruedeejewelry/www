# Ruedee Jewelry — เว็บหน้าบ้าน

Storefront for `ruedeejewelry.com`, built from the Claude Design prototype in
[`design/`](design/). Next.js App Router + TypeScript + Tailwind + Supabase, per
`design/project/uploads/CLAUDE-storefront.md` and `CLAUDE (3).md`.

The site has one job: **show the piece, then get the customer into LINE chat
about that specific piece in one tap.** No cart, no checkout.

## Run it

```bash
npm install
cp .env.example .env.local   # optional for the storefront, required for admin
npm run dev
```

Without Supabase credentials the storefront still runs: it falls back to the
sample catalogue in `lib/data/seed.json` (16 pieces, 5 articles, 4 reviews
carried over from the prototype) so the design can be reviewed before the
database exists. The admin app needs real credentials.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm test` | Vitest — catalogue filtering and the staff access check |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed:sql` | Regenerates `supabase/seed.sql` from `lib/data/seed.json` |
| `npm run brand` | Rebuilds favicon, app icon, OG image and logos from `design/brand/ruedee-logo.png` |

## Database

Migrations are plain SQL in `supabase/migrations`, applied in order. Each one
carries its own RLS policies — never add a table here without them.

```bash
supabase db push                              # or run the files in order
psql "$DATABASE_URL" -f supabase/seed.sql     # sample catalogue, optional
```

| Migration | Contents |
| --- | --- |
| `0001_staff_and_audit.sql` | `staff`, `audit_log`, `is_staff()` / `is_owner()` |
| `0002_products.sql` | `series`, `products`, `product_images` |
| `0003_articles_reviews_notify.sql` | `articles`, `article_blocks`, `article_products`, `reviews`, `notify_subscriptions` |
| `0004_storage.sql` | Private buckets for photos, certificates, article images |

`staff` and `audit_log` are **shared with the LINE CRM** (`CLAUDE.md` §8): one
login, both menus. If the CRM project already owns those tables, skip `0001` and
point this app at the same database rather than creating a second set.

Product columns mirror `purchase_items` in the CRM, so recording a sale can copy
a product row instead of making staff retype the spec.

## Structure

```
app/(storefront)   15 public routes, all static or ISR
app/(admin)/admin  staff app — product list, product form, article editor
lib/data           queries, with the seed fallback
lib/supabase       client.ts (browser, anon) · server.ts (session) · admin.ts (service role)
lib/validation     zod schemas shared by form and server action
supabase/          migrations + generated seed
design/            the original Claude Design handoff: prototype, chats, briefs
```

Admin is served at `admin.ruedeejewelry.com` by a host rewrite in
`proxy.ts` — one deployment, not two. The proxy only rewrites and
refreshes the session; **every** admin page and server action calls
`requireStaff()` itself, because hiding a route is not a permission check.

## Rules this code is built around

From `CLAUDE-storefront.md`, and not up for quiet renegotiation:

- Every piece has its own URL. No modal product pages, no flip cards, no
  carousel as the main way to browse.
- Price, code, size and stone are real text in the HTML, never baked into an
  image.
- Filters live in the URL as query params, so a filtered result can be shared
  into a chat. The catalogue is sent once and filtered client-side.
- Every route into LINE carries the product code. `lib/line.ts` is the only
  place chat links are built — the button also copies the code to the clipboard,
  because prefilled text does not survive every in-app browser.
- Sold pieces stay on the site. They are proof of work and the menu for ordering
  the same thing again.
- No animation library. No emoji in the UI. No ALL CAPS blocks.
- Two font families, three weights, Thai subset only.

## Photos

Nothing is uploaded yet, so every image slot renders as a hatched placeholder
carrying a Thai description of the shot that belongs there ("รูปหลัก RG126 —
มุมตรง ซูมได้"). They are visible on the live site on purpose: gaps should be
obvious, not silent. Uploading a real photo replaces the placeholder with no
layout change.

Photos are shrunk, cropped and compressed **in the browser** before upload
(`lib/image-compress.ts`) — phone originals are 5–10 MB and uploading them raw
is slow enough at the counter that staff stop using the system. Buckets are
private; pages serve signed URLs valid for 7 days, comfortably longer than the
1-hour ISR window.

## Performance budget: one number is missed

Measured on the production build, gzipped, for `/jewelry`:

| Metric | Ceiling | Actual |
| --- | --- | --- |
| JS on the catalogue page | ≤ 120 KB | **~146 KB** (plus a 39 KB `noModule` chunk legacy browsers only) |
| App code within that | — | ~18 KB |
| Framework floor (React 19 + App Router runtime) | — | ~105 KB |

Application code is well inside the budget; the overage is the framework's own
runtime, which arrives with the stack the brief mandates. Three honest options:

1. Accept ~146 KB and hold the line on LCP ≤ 2.5s / CLS ≤ 0.05, which are the
   metrics customers actually feel. Everything is static HTML with real text, so
   first paint does not wait on JS.
2. Make `/jewelry` filter server-side with plain links. That drops most of the
   JS but reloads the page on every filter tap, which the brief rules out.
3. Revisit the stack for the storefront specifically. Not recommended — it would
   split the codebase away from the CRM and lose the shared schema.

Recommendation: option 1, and re-measure on a real mid-range phone on 4G before
launch.

## Before launch

- [ ] Check the current domain does not answer 404 to crawlers — it did during
      the audit (`CLAUDE-storefront.md` §8). A CDN/WAF rule will silently keep
      Google out.
- [ ] Set `NEXT_PUBLIC_LINE_OA_ID` to the real LINE OA basic id; every chat link
      is built from it.
- [ ] Replace the bracketed Thai placeholders — they mark copy the shop still
      has to confirm: shipping and returns terms, real customer reviews, and the
      before/after custom-order cases. `grep -rn "\[" lib/data/content.ts` finds
      them.
- [ ] Create the first `staff` row and link it to a Supabase Auth user.
- [ ] Decide staff sign-in: this implements email/password; `CLAUDE.md` §12
      leaves LINE login open. Swapping it means replacing
      `app/(admin)/admin/login/actions.ts` and nothing else.
