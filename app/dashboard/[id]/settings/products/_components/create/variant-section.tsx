import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VariantInput, SizeOption, ColorOption, MaterialOption, MadeInOption } from "./types";

interface VariantSectionProps {
  variants: VariantInput[];
  baseSku: string;
  availableSizes: SizeOption[];
  availableColors: ColorOption[];
  availableMaterials: MaterialOption[];
  availableMadeIn: MadeInOption[];
  actions: {
    addSize: () => void;
    updateSize: (id: string, value: string) => void;
    removeSize: (id: string) => void;
    addColor: () => void;
    updateColor: (id: string, field: "name" | "hex", value: string) => void;
    removeColor: (id: string) => void;
    addMaterial: () => void;
    updateMaterial: (id: string, value: string) => void;
    removeMaterial: (id: string) => void;
    addMadeIn: () => void;
    updateMadeIn: (id: string, value: string) => void;
    removeMadeIn: (id: string) => void;
    addVariant: () => void;
    updateVariant: (id: string, field: keyof VariantInput, value: any) => void;
    removeVariant: (id: string) => void;
    setVariants?: (variants: VariantInput[]) => void; // ✅ NEW!
  };
}

export function VariantSection({
  variants,
  baseSku,
  availableSizes,
  availableColors,
  availableMaterials,
  availableMadeIn,
  actions,
}: VariantSectionProps) {
  
  const toggleSelection = (variantId: string, field: keyof VariantInput, optionId: string) => {
    const current = variants.find(v => v.id === variantId)?.[field] as string[];
    const updated = current.includes(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId];
    actions.updateVariant(variantId, field, updated);
  };

  // ✅ NEW: Auto-generate variants from all option combinations
  const generateVariantsFromOptions = () => {
    if (!actions.setVariants) {
      console.warn("setVariants not available");
      return;
    }

    const generatedVariants: VariantInput[] = [];
    const generateId = () => Math.random().toString(36).substring(7);

    // Get filled-in options (non-empty values)
    const filledSizes = availableSizes.filter(s => s.value.trim());
    const filledColors = availableColors.filter(c => c.name.trim());
    const filledMaterials = availableMaterials.filter(m => m.value.trim());
    const filledMadeIn = availableMadeIn.filter(m => m.value.trim());

    // If no sizes, create one default variant
    if (filledSizes.length === 0) {
      generatedVariants.push({
        id: generateId(),
        title: "Default",
        sku: "",
        selectedSizes: [],
        selectedColors: filledColors.map(c => c.id),
        selectedMaterials: filledMaterials.map(m => m.id),
        selectedMadeIn: filledMadeIn.map(m => m.id),
        customOptions: {},
        weight_grams: "",
        price_override: "",
        initial_stock: "",
      });
    } else {
      // Create one variant per size
      filledSizes.forEach(size => {
        const title = size.value.trim();
        
        generatedVariants.push({
          id: generateId(),
          title: title,
          sku: "",
          selectedSizes: [size.id],
          selectedColors: filledColors.map(c => c.id),
          selectedMaterials: filledMaterials.map(m => m.id),
          selectedMadeIn: filledMadeIn.map(m => m.id),
          customOptions: {},
          weight_grams: "",
          price_override: "",
          initial_stock: "",
        });
      });
    }

    actions.setVariants(generatedVariants);
  };

  return (
    <div className="space-y-4">
      {/* Option Definitions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sizes */}
        <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Sizes</label>
            <Button type="button" size="sm" variant="outline" onClick={actions.addSize}>
              <Plus size={14} />
            </Button>
          </div>
          {availableSizes.map((s) => (
            <div key={s.id} className="flex gap-2">
              <Input value={s.value} onChange={(e) => actions.updateSize(s.id, e.target.value)} placeholder="S, M, L" />
              <Button type="button" variant="ghost" size="sm" onClick={() => actions.removeSize(s.id)}><X size={14} /></Button>
            </div>
          ))}
        </div>

        {/* Colors */}
        <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Colors</label>
            <Button type="button" size="sm" variant="outline" onClick={actions.addColor}>
              <Plus size={14} />
            </Button>
          </div>
          {availableColors.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Input value={c.name} onChange={(e) => actions.updateColor(c.id, "name", e.target.value)} placeholder="Blue" />
              <Input type="color" value={c.hex} onChange={(e) => actions.updateColor(c.id, "hex", e.target.value)} className="w-12 p-1" />
              <Button type="button" variant="ghost" size="sm" onClick={() => actions.removeColor(c.id)}><X size={14} /></Button>
            </div>
          ))}
        </div>

        {/* Materials */}
        <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Materials</label>
            <Button type="button" size="sm" variant="outline" onClick={actions.addMaterial}>
              <Plus size={14} />
            </Button>
          </div>
          {availableMaterials.map((m) => (
            <div key={m.id} className="flex gap-2">
              <Input value={m.value} onChange={(e) => actions.updateMaterial(m.id, e.target.value)} placeholder="100% Cotton" />
              <Button type="button" variant="ghost" size="sm" onClick={() => actions.removeMaterial(m.id)}><X size={14} /></Button>
            </div>
          ))}
        </div>

        {/* Made In */}
        <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Made In</label>
            <Button type="button" size="sm" variant="outline" onClick={actions.addMadeIn}>
              <Plus size={14} />
            </Button>
          </div>
          {availableMadeIn.map((mi) => (
            <div key={mi.id} className="flex gap-2">
              <Input value={mi.value} onChange={(e) => actions.updateMadeIn(mi.id, e.target.value)} placeholder="USA" />
              <Button type="button" variant="ghost" size="sm" onClick={() => actions.removeMadeIn(mi.id)}><X size={14} /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ NEW: Generate Variants Button */}
      <div className="flex gap-2">
        <Button 
          type="button" 
          onClick={generateVariantsFromOptions} 
          variant="default"
          className="flex-1"
        >
          🔄 Generate Variants from Options
        </Button>
        <Button 
          type="button" 
          onClick={actions.addVariant} 
          variant="outline"
        >
          + Add Custom Variant
        </Button>
      </div>

      {/* Variant Cards */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold">
            Variants ({variants.length})
          </div>
          {variants.map((v, idx) => (
            <div key={v.id} className="border-2 border-[hsl(var(--border))] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Variant {idx + 1}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => actions.removeVariant(v.id)}><X size={16} /></Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={v.title} onChange={(e) => actions.updateVariant(v.id, "title", e.target.value)} placeholder="Title" />
                <Input value={v.sku} onChange={(e) => actions.updateVariant(v.id, "sku", e.target.value)} placeholder="SKU (auto-generated if empty)" />
                
                {/* Multi-select Buttons for Options */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold">Select Options</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(s => (
                      <Button key={s.id} size="sm" variant={v.selectedSizes.includes(s.id) ? "default" : "outline"} onClick={() => toggleSelection(v.id, "selectedSizes", s.id)}>{s.value || "Size"}</Button>
                    ))}
                    {availableColors.map(c => (
                      <Button key={c.id} size="sm" variant={v.selectedColors.includes(c.id) ? "default" : "outline"} onClick={() => toggleSelection(v.id, "selectedColors", c.id)}>{c.name || "Color"}</Button>
                    ))}
                  </div>
                </div>

                <Input value={v.weight_grams} onChange={(e) => actions.updateVariant(v.id, "weight_grams", e.target.value)} placeholder="Weight (g)" />
                <Input value={v.initial_stock} onChange={(e) => actions.updateVariant(v.id, "initial_stock", e.target.value)} placeholder="Initial Stock" />
                <Input className="md:col-span-2" value={v.price_override} onChange={(e) => actions.updateVariant(v.id, "price_override", e.target.value)} placeholder="Price Override (optional)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variants.length === 0 && (
        <div className="text-center py-8 border border-dashed border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--muted-foreground))]">
          No variants yet. Click "Generate Variants from Options" or add a custom variant.
        </div>
      )}
    </div>
  );
}