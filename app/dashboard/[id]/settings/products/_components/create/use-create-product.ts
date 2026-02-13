import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { createBrowserClient } from "@/utils/supabase/client";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/images";
import { 
  slugify, 
  safeReadJson, 
  moneyToCents, 
  safeExtFromFile, 
  buildObjectPath 
} from "./utils";
import { 
  CategoryNode, 
  CollectionRow, 
  ImageWithAlt, 
  SizeOption, 
  ColorOption, 
  MaterialOption, 
  MadeInOption, 
  VariantInput 
} from "./types";

export function useCreateProduct(onOpenChange: (v: boolean) => void, onCreated: () => void) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [baseSku, setBaseSku] = useState(""); 
  const [price, setPrice] = useState("0.00");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageWithAlt[]>([]);
  const [availableSizes, setAvailableSizes] = useState<SizeOption[]>([]);
  const [availableColors, setAvailableColors] = useState<ColorOption[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<MaterialOption[]>([]);
  const [availableMadeIn, setAvailableMadeIn] = useState<MadeInOption[]>([]);
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [availableCategories, setAvailableCategories] = useState<CategoryNode[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [availableCollections, setAvailableCollections] = useState<CollectionRow[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const cents = useMemo(() => moneyToCents(price), [price]);
  const autoSlug = () => setSlug(slugify(title));

  // Reusable ID generator that works in all browser contexts
  const generateId = () => Math.random().toString(36).substring(7);

  const reset = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setTitle("");
    setSlug("");
    setBaseSku("");
    setPrice("0.00");
    setDescription("");
    setImages([]);
    setAvailableSizes([]);
    setAvailableColors([]);
    setAvailableMaterials([]);
    setAvailableMadeIn([]);
    setVariants([]);
    setSelectedCategoryIds([]);
    setSelectedCollectionIds([]);
  };

  const generateVariantSku = (variant: VariantInput) => {
    const base = baseSku.trim();
    if (!base) return variant.sku;

    const sizeId = variant.selectedSizes?.[0];
    const sizeVal = sizeId ? availableSizes.find(s => s.id === sizeId)?.value : null;

    if (sizeVal) {
      const cleanSize = sizeVal.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      return `${base}-${cleanSize}`;
    }

    return base;
  };

  const addSize = () => setAvailableSizes([...availableSizes, { id: generateId(), value: "" }]);
  const updateSize = (id: string, value: string) => setAvailableSizes(availableSizes.map(s => (s.id === id ? { ...s, value } : s)));
  const removeSize = (id: string) => {
    setAvailableSizes(availableSizes.filter(s => s.id !== id));
    setVariants(variants.map(v => ({ ...v, selectedSizes: v.selectedSizes.filter(sid => sid !== id) })));
  };

  const addColor = () => setAvailableColors([...availableColors, { id: generateId(), name: "", hex: "#000000" }]);
  const updateColor = (id: string, field: "name" | "hex", value: string) => setAvailableColors(availableColors.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  const removeColor = (id: string) => {
    setAvailableColors(availableColors.filter(c => c.id !== id));
    setVariants(variants.map(v => ({ ...v, selectedColors: v.selectedColors.filter(cid => cid !== id) })));
  };

  const addMaterial = () => setAvailableMaterials([...availableMaterials, { id: generateId(), value: "" }]);
  const updateMaterial = (id: string, value: string) => setAvailableMaterials(availableMaterials.map(m => (m.id === id ? { ...m, value } : m)));
  const removeMaterial = (id: string) => {
    setAvailableMaterials(availableMaterials.filter(m => m.id !== id));
    setVariants(variants.map(v => ({ ...v, selectedMaterials: v.selectedMaterials.filter(mid => mid !== id) })));
  };

  const addMadeIn = () => setAvailableMadeIn([...availableMadeIn, { id: generateId(), value: "" }]);
  const updateMadeIn = (id: string, value: string) => setAvailableMadeIn(availableMadeIn.map(m => (m.id === id ? { ...m, value } : m)));
  const removeMadeIn = (id: string) => {
    setAvailableMadeIn(availableMadeIn.filter(m => m.id !== id));
    setVariants(variants.map(v => ({ ...v, selectedMadeIn: v.selectedMadeIn.filter(mid => mid !== id) })));
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const newImages: ImageWithAlt[] = Array.from(fileList).map((file, idx) => ({
      file,
      alt: "",
      preview: URL.createObjectURL(file),
      position: images.length + idx,
      isPrimary: images.length === 0 && idx === 0,
    }));
    setImages([...images, ...newImages]);
  };

  const updateImageAlt = (index: number, alt: string) => {
    const updated = [...images];
    updated[index].alt = alt;
    setImages(updated);
  };

  const removeImage = (index: number) => {
    const imgToRemove = images[index];
    if (imgToRemove) URL.revokeObjectURL(imgToRemove.preview);
    const updated = images.filter((_, i) => i !== index);
    updated.forEach((img, i) => {
      img.position = i;
      if (i === 0 && !updated.some(x => x.isPrimary)) img.isPrimary = true;
    });
    setImages(updated);
  };

  const setPrimaryImage = (index: number) => setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));

  const addVariant = () => {
    const last = variants[variants.length - 1];
    const newVariant: VariantInput = last ? {
      id: generateId(),
      title: last.title,
      sku: last.sku,
      selectedSizes: [...last.selectedSizes],
      selectedColors: [...last.selectedColors],
      selectedMaterials: [...last.selectedMaterials],
      selectedMadeIn: [...last.selectedMadeIn],
      customOptions: { ...last.customOptions },
      weight_grams: last.weight_grams,
      price_override: last.price_override,
      initial_stock: last.initial_stock, 
    } : {
      id: generateId(),
      title: "", sku: "", selectedSizes: [], selectedColors: [], selectedMaterials: [],
      selectedMadeIn: [], customOptions: {}, weight_grams: "", price_override: "", initial_stock: "",
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (id: string, field: keyof VariantInput, value: any) => setVariants(variants.map(v => (v.id === id ? { ...v, [field]: value } : v)));
  const removeVariant = (id: string) => setVariants(variants.filter(v => v.id !== id));

  const buildVariantOptions = (variant: VariantInput) => {
    const options: Record<string, any> = {};
    if (variant.selectedSizes.length > 0) {
      const vals = variant.selectedSizes.map(id => availableSizes.find(s => s.id === id)?.value).filter(Boolean);
      options.size = vals.length === 1 ? vals[0] : vals.join(", ");
    }
    if (variant.selectedColors.length > 0) {
      const objs = variant.selectedColors.map(id => availableColors.find(c => c.id === id)).filter(Boolean);
      if (objs.length === 1) options.color = { name: objs[0]!.name, hex: objs[0]!.hex };
      else options.colors = objs.map(c => ({ name: c!.name, hex: c!.hex }));
    }
    if (variant.selectedMaterials.length > 0) {
      const vals = variant.selectedMaterials.map(id => availableMaterials.find(m => m.id === id)?.value).filter(Boolean);
      options.material = vals.length === 1 ? vals[0] : vals.join(", ");
    }
    if (variant.selectedMadeIn.length > 0) {
      const vals = variant.selectedMadeIn.map(id => availableMadeIn.find(m => m.id === id)?.value).filter(Boolean);
      options.made_in = vals.length === 1 ? vals[0] : vals.join(", ");
    }
    Object.entries(variant.customOptions).forEach(([k, v]) => {
      const val = typeof v === "string" ? v.trim() : "";
      if (val) options[k] = val;
    });
    return options;
  };

  const create = async () => {
    if (!title.trim()) return toast.error("Title is required");
    const finalSlug = (slug.trim() || slugify(title)).trim();
    if (!finalSlug) return toast.error("Slug is required");
    if (cents === null || cents < 0) return toast.error("Price must be valid");

    setCreating(true);
    try {
      const res = await fetch("/api/products/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: title.trim(), 
          slug: finalSlug, 
          base_sku: baseSku.trim() || null,
          description: description.trim() || null, 
          price_cents: cents, 
          status: "draft" 
        }),
      });

      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed to create product");
      const productId = json.data?.id;

      for (const variant of variants) {
        const weight = variant.weight_grams.trim() === "" ? null : Number(variant.weight_grams);
        const override = variant.price_override.trim() === "" ? null : moneyToCents(variant.price_override);
        const finalVariantSku = (variant.sku.trim() || generateVariantSku(variant)) || null;

        const vRes = await fetch(`/api/products/admin/${productId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: variant.title.trim() || "Default",
            sku: finalVariantSku,
            options: buildVariantOptions(variant),
            weight_grams: weight,
            price_cents: override,
          }),
        });

        const vJson = await safeReadJson(vRes);
        if (vRes.ok && vJson?.ok && variant.initial_stock.trim()) {
          await fetch("/api/inventory/movements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              variant_id: vJson.data.id,
              delta_qty: Number(variant.initial_stock),
              reason: "initial",
              note: `Initial stock for ${variant.title || finalVariantSku}`,
            }),
          });
        }
      }

      await Promise.all([
        ...selectedCategoryIds.map(id => fetch(`/api/products/admin/${productId}/categories`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category_id: id })
        })),
        ...selectedCollectionIds.map(id => fetch(`/api/products/admin/${productId}/collections`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection_id: id })
        }))
      ]);

      if (images.length) {
        const supabase = createBrowserClient();
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const ext = safeExtFromFile(img.file);
          const path = buildObjectPath(productId, i + 1, ext);
          const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, img.file);
          if (error) throw error;

          await fetch(`/api/products/admin/${productId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bucket_name: PRODUCT_IMAGE_BUCKET,
              object_path: path,
              alt_text: img.alt.trim() || null,
              position: img.position,
              is_primary: img.isPrimary,
            }),
          });
        }
      }

      toast.success("Product created successfully");
      onOpenChange(false);
      onCreated();
      reset();
    } catch (e: any) {
      toast.error(e?.message ?? "Create failed");
    } finally {
      setCreating(false);
    }
  };

  return {
    state: {
      title, slug, baseSku, price, description, images, availableSizes, availableColors,
      availableMaterials, availableMadeIn, variants, availableCategories,
      selectedCategoryIds, availableCollections, selectedCollectionIds, creating
    },
    actions: {
      setTitle, setSlug, setBaseSku, setPrice, setDescription, autoSlug,
      addSize, updateSize, removeSize,
      addColor, updateColor, removeColor,
      addMaterial, updateMaterial, removeMaterial,
      addMadeIn, updateMadeIn, removeMadeIn,
      handleFilesSelected, updateImageAlt, removeImage, setPrimaryImage,
      addVariant, updateVariant, removeVariant,
      setSelectedCategoryIds, setSelectedCollectionIds,
      setAvailableCategories, setAvailableCollections,
      create, reset
    }
  };
}