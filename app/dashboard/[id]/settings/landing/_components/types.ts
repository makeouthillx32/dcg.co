// settings/landing/_components/types.ts
export type LandingSectionType =
  | "top_banner"
  | "hero_carousel"
  | "categories_grid"
  | "static_html"
  | "products_grid";

export type LandingSectionRow = {
  id: string;
  position: number;
  type: string; // tolerate unknown types in DB
  is_active: boolean;
  config: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type LandingSectionsResponse =
  | { ok: true; sections: LandingSectionRow[] }
  | { ok: false; error: { code: string; message: string; details?: any } };
