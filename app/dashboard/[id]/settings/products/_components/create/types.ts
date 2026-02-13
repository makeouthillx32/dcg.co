export type CategoryNode = {
  id: string;
  name?: string;
  title?: string;
  label?: string;
  slug?: string;
  children?: CategoryNode[];
};

export type CollectionRow = {
  id: string;
  name?: string;
  title?: string;
  label?: string;
  slug?: string;
  is_home_section?: boolean;
  is_homepage?: boolean;
};

export type ImageWithAlt = {
  file: File;
  alt: string;
  preview: string;
  position: number;
  isPrimary: boolean;
};

export type SizeOption = { id: string; value: string };
export type ColorOption = { id: string; name: string; hex: string };
export type MaterialOption = { id: string; value: string };
export type MadeInOption = { id: string; value: string };

export type VariantInput = {
  id: string;
  title: string;
  sku: string;
  selectedSizes: string[];
  selectedColors: string[];
  selectedMaterials: string[];
  selectedMadeIn: string[];
  customOptions: Record<string, string>;
  weight_grams: string;
  price_override: string;
  initial_stock: string;
};