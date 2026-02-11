import { createServerClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductDetailClient from "./_components/ProductDetailClient";

// Generate static params for all active products at build time
export async function generateStaticParams() {
  const supabase = await createServerClient();
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
    description: product.description || `Shop ${product.title}`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerClient();

  // Fetch product with all related data in parallel
  const [productResult, imagesResult, variantsResult, tagsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single(),
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", slug) // We'll need to join or fetch by ID
      .order("position", { ascending: true }),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", slug) // We'll need to join or fetch by ID
      .order("position", { ascending: true }),
    supabase
      .from("product_tags")
      .select(`
        tag_id,
        tags (
          id,
          name,
          slug
        )
      `)
      .eq("product_id", slug), // We'll need to join or fetch by ID
  ]);

  // If product not found, show 404
  if (!productResult.data) {
    notFound();
  }

  const product = productResult.data;

  // Now fetch images, variants, and tags using the product ID
  const [actualImages, actualVariants, actualTags] = await Promise.all([
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("position", { ascending: true }),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .order("position", { ascending: true }),
    supabase
      .from("product_tags")
      .select(`
        tag_id,
        tags (
          id,
          name,
          slug
        )
      `)
      .eq("product_id", product.id),
  ]);

  // Combine all data
  const productWithRelations = {
    ...product,
    images: actualImages.data || [],
    variants: actualVariants.data || [],
    tags: actualTags.data?.map((pt: any) => pt.tags).filter(Boolean) || [],
  };

  return <ProductDetailClient product={productWithRelations} />;
}

// Revalidate every hour
export const revalidate = 3600;