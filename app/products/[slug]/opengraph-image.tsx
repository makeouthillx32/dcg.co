import { ImageResponse } from "next/og";
import { createServerClient } from "@/utils/supabase/server";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = await createServerClient();

  // You can change this query to match your schema:
  // products.slug + products.title + product_images.url (or storage path)
  const { data: product, error } = await supabase
    .from("products")
    .select("title, slug, product_images(url)")
    .eq("slug", params.slug)
    .maybeSingle();

  const title = product?.title ?? "Product";
  const imageUrl = product?.product_images?.[0]?.url ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 64,
          alignItems: "center",
          justifyContent: "space-between",
          background: "white",
          fontSize: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 28, opacity: 0.7 }}>DCG.CO</div>
          <div style={{ fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 22, opacity: 0.7 }}>{`/products/${params.slug}`}</div>
        </div>

        {imageUrl ? (
          // next/og supports <img>
          <img
            src={imageUrl}
            width={460}
            height={460}
            style={{
              objectFit: "cover",
              borderRadius: 32,
              border: "1px solid #e5e7eb",
            }}
          />
        ) : null}
      </div>
    ),
    { ...size }
  );
}
