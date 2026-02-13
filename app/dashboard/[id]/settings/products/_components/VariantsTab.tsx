// app/dashboard/[id]/settings/products/_components/VariantsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Plus, Loader2 } from "lucide-react";
import type { ProductVariant, CreateVariantInput } from "@/types/product-variants";
import VariantCard from "./VariantCard";
import VariantForm from "./VariantForm";

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: { code: "NON_JSON_RESPONSE", message: text.slice(0, 300) } };
  }
}

interface VariantsTabProps {
  productId: string;
  onVariantChanged?: () => void;
}

export default function VariantsTab({ productId, onVariantChanged }: VariantsTabProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadVariants = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/products/admin/${productId}/variants`, { 
        cache: "no-store" 
      });
      const json = await safeReadJson(res);
      
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message ?? "Failed to load variants");
      }
      
      setVariants(json.data ?? []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleCreateVariant = async (input: CreateVariantInput) => {
    setCreating(true);
    try {
      const res = await fetch(`/api/products/admin/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message ?? "Failed to create variant");
      }
      
      toast.success("Variant created");
      setShowCreateForm(false);
      await loadVariants();
      onVariantChanged?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to create variant");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Delete this variant? This cannot be undone.")) return;
    
    try {
      const res = await fetch(
        `/api/products/admin/${productId}/variants/${variantId}`,
        { method: "DELETE" }
      );
      
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message ?? "Failed to delete variant");
      }
      
      toast.success("Variant deleted");
      await loadVariants();
      onVariantChanged?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to delete variant");
    }
  };

  const handleUpdateVariant = async () => {
    await loadVariants();
    onVariantChanged?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        <span className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">
          Loading variants...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Variants ({variants.length})
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Manage SKUs, pricing, and inventory for each variant
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          size="sm"
          variant="default"
        >
          <Plus size={16} className="mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--muted)/0.3)]">
          <h4 className="text-sm font-medium mb-3 text-[hsl(var(--foreground))]">
            Create New Variant
          </h4>
          <VariantForm
            productId={productId}
            onSubmit={handleCreateVariant}
            onCancel={() => setShowCreateForm(false)}
            submitting={creating}
          />
        </div>
      )}

      {/* Variants List */}
      {variants.length === 0 && !showCreateForm ? (
        <div className="text-center py-12 border border-dashed border-[hsl(var(--border))] rounded-lg">
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
            No variants yet. Add your first variant to enable SKU tracking and inventory management.
          </p>
          <Button onClick={() => setShowCreateForm(true)} size="sm" variant="outline">
            <Plus size={16} className="mr-2" />
            Create First Variant
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              productId={productId}
              onDelete={() => handleDeleteVariant(variant.id)}
              onUpdate={handleUpdateVariant}
            />
          ))}
        </div>
      )}
    </div>
  );
}
