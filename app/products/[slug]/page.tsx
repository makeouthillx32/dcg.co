import { createServerClient, createServiceClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductDetailClient from "./_components/ProductDetailClient";

// Generate static params for all active products at build time
export async function generateStaticParams() {
  const supabase = createServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "active");

  return products?.map((product) => ({
    slug: product.slug,
  })) ?? [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: product } = await supabase
    .from("products")
    .select("title, description")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title} at Desert Cowgirl`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerClient();

  // Fetch product with all related data
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      title,
      slug,
      description,
      status,
      brand,
      is_featured,
      badge,
      price_cents,
      compare_at_price_cents,
      currency,
      material,
      made_in,
      created_at,
      updated_at,
      product_images (
        id,
        object_path,
        bucket_name,
        alt_text,
        position,
        is_primary
      ),
      product_variants (
        id,
        sku,
        title,
        options,
        price_cents,
        compare_at_price_cents,
        inventory_qty,
        weight_grams,
        position,
        is_active
      ),
      product_categories (
        categories (
          id,
          name,
          slug
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Format product data for client component
  const formattedProduct = {
    ...product,
    images: (product.product_images || [])
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0)),
    variants: (product.product_variants || [])
      .filter((v: any) => v.is_active !== false)
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .map((v: any) => ({
        id: v.id,
        sku: v.sku,
        title: v.title,
        options: v.options || {},
        price_cents: v.price_cents,
        compare_at_price_cents: v.compare_at_price_cents,
        inventory_quantity: v.inventory_qty || 0,
        weight_grams: v.weight_grams,
        position: v.position,
      })),
    categories: (product.product_categories || [])
      .map((pc: any) => pc.categories)
      .filter(Boolean),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ProductDetailClient product={formattedProduct} />
    </div>
  );
}

// Revalidate every hour
export const revalidate = 3600;