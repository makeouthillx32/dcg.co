import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VariantInput, SizeOption, ColorOption } from "./types";

interface VariantSectionProps {
  variants: VariantInput[];
  baseSku: string;
  availableSizes: SizeOption[];
  availableColors: ColorOption[];
  actions: {
    addSize: () => void;
    updateSize: (id: string, value: string) => void;
    removeSize: (id: string) => void;
    addColor: () => void;
    updateColor: (id: string, field: "name" | "hex", value: string) => void;
    removeColor: (id: string) => void;
    addVariant: () => void;
    updateVariant: (id: string, field: keyof VariantInput, value: any) => void;
    removeVariant: (id: string) => void;
    setVariants?: (variants: VariantInput[]) => void;
  };
}

export function VariantSection({
  variants,
  baseSku,
  availableSizes,
  availableColors,
  actions,
}: VariantSectionProps) {
  // Local state to track weights without touching the fine-tuned hook state
  const [localWeights, setLocalWeights] = useState<Record<string, string>>({});

  const generateId = () => Math.random().toString(36).substring(7);

  const toggleSelection = (variantId: string, field: keyof VariantInput, optionId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    const current = variant[field] as string[];
    const updated = current.includes(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId];
    
    actions.updateVariant(variantId, field, updated);
  };

  const handleAddCustomVariant = () => {
    if (!actions.setVariants) {
      actions.addVariant();
      return;
    }

    const newVariant: VariantInput = {
      id: generateId(),
      title: "",
      sku: "", // ✅ Empty for auto-generation
      selectedSizes: [],
      selectedColors: [],
      selectedMaterials: [],
      selectedMadeIn: [],
      customOptions: {},
      weight_grams: "",
      price_override: "",
      initial_stock: "",
    };
    
    actions.setVariants([...variants, newVariant]);
  };

  const generateVariantsFromOptions = () => {
    if (!actions.setVariants) return;

    const generatedVariants: VariantInput[] = [];
    const filledSizes = availableSizes.filter(s => s.value.trim());
    const filledColors = availableColors.filter(c => c.name.trim());

    const colorsToProcess = filledColors.length > 0 ? filledColors : [{ id: null, name: "" }];
    const sizesToProcess = filledSizes.length > 0 ? filledSizes : [{ id: null, value: "" }];

    colorsToProcess.forEach(color => {
      sizesToProcess.forEach(size => {
        const titleParts = [];
        if (color.name) titleParts.push(color.name.trim());
        if (size.value) titleParts.push(size.value.trim());
        
        const title = titleParts.length > 0 ? titleParts.join(" / ") : "Default Variant";
        
        const seededWeight = size.id ? localWeights[size.id] : "";

        generatedVariants.push({
          id: generateId(),
          title: title,
          sku: "", // ✅ Empty for auto-generation
          selectedSizes: size.id ? [size.id] : [],
          selectedColors: color.id ? [color.id] : [],
          selectedMaterials: [],
          selectedMadeIn: [],
          customOptions: {},
          weight_grams: seededWeight || "", 
          price_override: "",
          initial_stock: "",
        });
      });
    });

    actions.setVariants(generatedVariants);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sizes & Weights */}
        <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Sizes & Weights</label>
            <Button type="button" size="sm" variant="outline" onClick={actions.addSize}>
              <Plus size={14} />
            </Button>
          </div>
          {availableSizes.map((s) => (
            <div key={s.id} className="flex gap-2">
              <Input 
                id={`size-val-${s.id}`}
                name={`size-val-${s.id}`}
                value={s.value} 
                onChange={(e) => actions.updateSize(s.id, e.target.value)} 
                placeholder="Size" 
                className="flex-[2]"
              />
              <Input 
                id={`size-weight-${s.id}`}
                name={`size-weight-${s.id}`}
                value={localWeights[s.id] || ""} 
                onChange={(e) => setLocalWeights(prev => ({ ...prev, [s.id]: e.target.value }))} 
                placeholder="Weight" 
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => actions.removeSize(s.id)}>
                <X size={14} />
              </Button>
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
              <Input id={`color-name-${c.id}`} name={`color-name-${c.id}`} value={c.name} onChange={(e) => actions.updateColor(c.id, "name", e.target.value)} placeholder="Blue" />
              <Input id={`color-hex-${c.id}`} name={`color-hex-${c.id}`} type="color" value={c.hex} onChange={(e) => actions.updateColor(c.id, "hex", e.target.value)} className="w-12 p-1" />
              <Button type="button" variant="ghost" size="sm" onClick={() => actions.removeColor(c.id)}><X size={14} /></Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          type="button" 
          onClick={generateVariantsFromOptions} 
          variant="default"
          className="flex-1"
        >
          🔄 Generate Variants (Color x Size)
        </Button>
        <Button 
          type="button" 
          onClick={handleAddCustomVariant} 
          variant="outline"
        >
          + Add Custom Variant
        </Button>
      </div>

      {variants.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold">Variants ({variants.length})</div>
          {variants.map((v, idx) => (
            <div key={v.id} className="border-2 border-[hsl(var(--border))] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Variant {idx + 1}: {v.title}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => actions.removeVariant(v.id)}><X size={16} /></Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input id={`v-title-${v.id}`} name={`v-title-${v.id}`} value={v.title} onChange={(e) => actions.updateVariant(v.id, "title", e.target.value)} placeholder="Title" />
                <Input id={`v-sku-${v.id}`} name={`v-sku-${v.id}`} value={v.sku} onChange={(e) => actions.updateVariant(v.id, "sku", e.target.value)} placeholder="SKU (auto-generated if empty)" />
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold">Options Attached (Read-Only)</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(s => (
                      <Button 
                        key={s.id} 
                        size="sm" 
                        variant={v.selectedSizes.includes(s.id) ? "default" : "outline"}
                        disabled
                        className="cursor-default"
                      >
                        {s.value || "Size"}
                      </Button>
                    ))}
                    {availableColors.map(c => (
                      <Button 
                        key={c.id} 
                        size="sm" 
                        variant={v.selectedColors.includes(c.id) ? "default" : "outline"}
                        disabled
                        className="cursor-default"
                      >
                        {c.name || "Color"}
                      </Button>
                    ))}
                  </div>
                </div>

                <Input id={`v-weight-${v.id}`} name={`v-weight-${v.id}`} value={v.weight_grams} onChange={(e) => actions.updateVariant(v.id, "weight_grams", e.target.value)} placeholder="Weight (g)" />
                <Input id={`v-stock-${v.id}`} name={`v-stock-${v.id}`} value={v.initial_stock} onChange={(e) => actions.updateVariant(v.id, "initial_stock", e.target.value)} placeholder="Initial Stock" />
                <Input id={`v-price-${v.id}`} name={`v-price-${v.id}`} className="md:col-span-2" value={v.price_override} onChange={(e) => actions.updateVariant(v.id, "price_override", e.target.value)} placeholder="Price Override (optional)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}