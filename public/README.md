# public/

Files served as-is at the site root: `public/ruedee-mark.webp` is reachable at
`/ruedee-mark.webp`. Anything here is public to the whole internet — product
photos and certificate scans belong in Supabase Storage, which is private and
served through signed URLs.

## Brand assets are generated, not edited

The master is `design/brand/ruedee-logo.png` (1200×1200, transparent). Replace
that one file and run `npm run brand` to rebuild everything below; do not edit
the outputs by hand.

| File | Size | Where it shows |
| --- | --- | --- |
| `public/ruedee-mark.webp` | 12 KB | Site header |
| `public/ruedee-logo.webp` | 44 KB | Full lockup, for wherever the name needs to read |
| `app/icon.png` | 8 KB | Browser tab |
| `app/apple-icon.png` | 4 KB | iOS home screen — on cream, since iOS composites onto black |
| `app/opengraph-image.png` | 72 KB | Link previews in LINE, for pages with no photo of their own |

Product pages override the last one with the actual piece, because a link
dropped into a chat should preview the jewellery, not the logo.

Still missing: a horizontal lockup (mark left, wordmark right). The header uses
the monogram alone for now, since the stacked wordmark is unreadable at 52px.
