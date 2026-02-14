export type ProductImageRow = {
  id?: string;
  bucket_name: string | null;
  object_path: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
  position?: number | null;
  is_primary?: boolean | null;
  is_public?: boolean | null;
  created_at?: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  material: string | null;
  made_in: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  badge: string | null;
  is_featured: boolean;
  status?: string;
  created_at: string;
  product_images?: ProductImageRow[];
  product_variants?: any[];
  categories?: any[];
  collections?: any[];
  tags?: { id: string; slug: string; name: string }[];
};

export type TabType = "details" | "media" | "variants" | "inventory" | "categories" | "collections" | "tags" | "advanced";