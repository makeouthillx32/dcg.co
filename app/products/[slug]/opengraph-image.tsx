// app/products/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { createServerClient } from "@/utils/supabase/server";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function buildImageUrl(bucket_name: string | null, object_path: string | null): string | null {
  if (!bucket_name || !object_path || !SUPABASE_URL) return null;
  const encodedPath = object_path
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket_name}/${encodedPath}`;
}

function pickPrimaryImage(images: Array<{
  bucket_name: string | null;
  object_path: string | null;
  is_primary: boolean | null;
  sort_order: number | null;
  position: number | null;
  is_public: boolean | null;
}>): { bucket_name: string | null; object_path: string | null } | null {
  if (!images?.length) return null;

  const publicOnly = images.filter((i) => i.is_public ?? true);
  const arr = publicOnly.length ? publicOnly : images;

  const primary = arr.find((i) => i.is_primary);
  if (primary) return primary;

  return [...arr].sort((a, b) => {
    const as = a.sort_order ?? a.position ?? 999999;
    const bs = b.sort_order ?? b.position ?? 999999;
    return as - bs;
  })[0] ?? null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = await createServerClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      title,
      slug,
      price_cents,
      currency,
      badge,
      product_images (
        bucket_name,
        object_path,
        is_primary,
        is_public,
        sort_order,
        position
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  const title = product?.title ?? "Shop Desert Cowgirl";
  const price = product?.price_cents
    ? `$${(product.price_cents / 100).toFixed(2)}`
    : null;
  const badge = product?.badge ?? null;

  const primaryImg = pickPrimaryImage(product?.product_images ?? []);
  const imageUrl = primaryImg
    ? buildImageUrl(primaryImg.bucket_name, primaryImg.object_path)
    : null;

  // Brand colors
  const sand = "#F5E6C8";
  const rust = "#C0522A";
  const darkBrown = "#2C1810";
  const warmWhite = "#FDF8F0";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: warmWhite,
          position: "relative",
          overflow: "hidden",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Decorative background texture stripes */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 40px,
              rgba(192, 82, 42, 0.04) 40px,
              rgba(192, 82, 42, 0.04) 41px
            )`,
            display: "flex",
          }}
        />

        {/* Left: Brand info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 56px",
            flex: imageUrl ? "0 0 560px" : "1",
            zIndex: 1,
          }}
        >
          {/* Top: Logo / Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Brand mark — simple star/badge icon substitute */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: rust,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    background: warmWhite,
                    borderRadius: "50%",
                    display: "flex",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: rust,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Desert Cowgirl
              </span>
            </div>

            {/* Divider */}
            <div
              style={{
                width: 60,
                height: 2,
                background: rust,
                marginTop: 16,
                display: "flex",
              }}
            />
          </div>

          {/* Middle: Product title + badge + price */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {badge && (
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                }}
              >
                <span
                  style={{
                    background: rust,
                    color: warmWhite,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "6px 18px",
                    borderRadius: 4,
                  }}
                >
                  {badge}
                </span>
              </div>
            )}

            <div
              style={{
                fontSize: imageUrl ? 42 : 52,
                fontWeight: 800,
                color: darkBrown,
                lineHeight: 1.15,
                maxWidth: 440,
              }}
            >
              {title}
            </div>

            {price && (
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: rust,
                }}
              >
                {price}
              </div>
            )}
          </div>

          {/* Bottom: CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: darkBrown,
                color: warmWhite,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "14px 28px",
                borderRadius: 8,
                alignSelf: "flex-start",
              }}
            >
              Shop Now
            </div>
            <span
              style={{
                fontSize: 13,
                color: "rgba(44, 24, 16, 0.5)",
                marginTop: 4,
              }}
            >
              desertcowgirl.co/products/{slug}
            </span>
          </div>
        </div>

        {/* Right: Product image */}
        {imageUrl && (
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              overflow: "hidden",
            }}
          >
            {/* Gradient overlay on left edge for smooth blending */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 80,
                height: "100%",
                background: `linear-gradient(to right, ${warmWhite}, transparent)`,
                zIndex: 2,
                display: "flex",
              }}
            />
            <img
              src={imageUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
          </div>
        )}

        {/* Bottom brand bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(to right, ${rust}, ${darkBrown})`,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}