import type { NextConfig } from "next";

/*
  Supabase Storage serves signed URLs from the project host, so the optimiser
  has to be told it is allowed to fetch from there. AVIF first, WebP as the
  fallback (CLAUDE-storefront.md §7).
*/
function supabaseHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    // A blank or malformed dashboard value must not fail the build; images
    // simply will not be optimised until it is corrected.
    console.warn(`NEXT_PUBLIC_SUPABASE_URL is not a usable URL (${raw})`);
    return null;
  }
}

const supabaseHost = supabaseHostname();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/sign/**",
          },
        ]
      : [],
    // Widths the layout actually asks for: a 2-up grid on a phone, thumbnails,
    // and the full-bleed product shot.
    deviceSizes: [390, 430, 640, 768, 1024],
    imageSizes: [64, 68, 72, 78, 96, 236],
  },
};

export default nextConfig;
