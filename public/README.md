# public/

Files served as-is at the site root: `public/logo.png` is reachable at
`/logo.png`. Anything here is public to the whole internet — product photos and
certificate scans belong in Supabase Storage, which is private and served
through signed URLs.

Waiting on the shop:

| File | What it is | Used for |
| --- | --- | --- |
| `logo.png` | Square lockup, mark above the wordmark | Favicon, home-screen icon, link previews in LINE |
| `logo-wide.png` | Horizontal lockup, if one exists | Site header |

Transparent PNG or SVG please — the site sits on a cream background
(`#faf8f4`), so a white-boxed logo shows as a white rectangle.

Git does not track empty directories, which is why this file exists.
