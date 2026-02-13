// app/dashboard/[id]/settings/products/_components/ProductVariantsInline.tsx
"use client";

import { useState } from "react";
import { Package, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

interface Variant {
  id: string;
  title: string;
  sku: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  weight_grams: number | null;
  position: number;
  is_active: boolean;
  inventory_qty?: number;
  track_inventory?: boolean;
}

interface ProductVariantsInlineProps {
  productId: string;
  variants: Variant[];
  onChanged: () => void;
}

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function centsToMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductVariantsInline({
  productId,
  variants,
  onChanged,
}: ProductVariantsInlineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formWeight, setFormWeight] = useState("");

  const startAdd = () => {
    setFormTitle("");
    setFormSku("");
    setFormPrice("");
    setFormWeight("");
    setAdding(true);
  };

  const startEdit = (v: Variant) => {
    setFormTitle(v.title);
    setFormSku(v.sku || "");
    setFormPrice((v.price_cents / 100).toFixed(2));
    setFormWeight(v.weight_grams?.toString() || "");
    setEditingId(v.id);
  };

  const cancel = () => {
    setAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formTitle.trim()) return toast.error("Title required");

    setSaving(true);
    try {
      const body: any = { title: formTitle.trim() };
      if (formSku.trim()) body.sku = formSku.trim();
      if (formPrice.trim()) {
        const cents = Math.round(parseFloat(formPrice) * 100);
        if (!isNaN(cents)) body.price_cents = cents;
      }
      if (formWeight.trim()) {
        const grams = parseInt(formWeight, 10);
        if (!isNaN(grams)) body.weight_grams = grams;
      }

      const res = await fetch(`/api/products/admin/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed");

      toast.success("Variant added");
      setAdding(false);
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add variant");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (variantId: string) => {
    setSaving(true);
    try {
      const body: any = { title: formTitle.trim() };
      if (formSku.trim()) body.sku = formSku.trim();
      if (formPrice.trim()) {
        const cents = Math.round(parseFloat(formPrice) * 100);
        if (!isNaN(cents)) body.price_cents = cents;
      }
      if (formWeight.trim()) {
        const grams = parseInt(formWeight, 10);
        if (!isNaN(grams)) body.weight_grams = grams;
      }

      const res = await fetch(`/api/products/admin/${productId}/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed");

      toast.success("Variant updated");
      setEditingId(null);
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update variant");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm("Delete this variant?")) return;

    try {
      const res = await fetch(`/api/products/admin/${productId}/variants/${variantId}`, {
        method: "DELETE",
      });
      const json = await safeReadJson(res);
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? "Failed");

      toast.success("Variant deleted");
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete variant");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Package size={16} />
          Variants ({variants.length})
        </h3>
        {!adding && !editingId && (
          <Button size="sm" variant="outline" onClick={startAdd}>
            <Plus size={14} className="mr-1" />
            Add Variant
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {variants.map((v) => {
          const isEditing = editingId === v.id;

          return (
            <div
              key={v.id}
              className="border border-[hsl(var(--border))] rounded-lg p-3"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                  <Input
                    placeholder="SKU"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price (USD)"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Weight (grams)"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(v.id)}
                      disabled={saving}
                    >
                      <Save size={14} className="mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{v.title}</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      {v.sku ? `SKU: ${v.sku}` : "No SKU"}
                    </div>
                    <div className="text-sm">
                      Price: {centsToMoney(v.price_cents)}
                      {v.compare_at_price_cents && (
                        <span className="ml-2 line-through text-[hsl(var(--muted-foreground))]">
                          {centsToMoney(v.compare_at_price_cents)}
                        </span>
                      )}
                    </div>
                    {v.weight_grams && (
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        Weight: {v.weight_grams}g
                      </div>
                    )}
                    {typeof v.inventory_qty === "number" && (
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        Stock: {v.inventory_qty} units
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(v)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(v.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {adding && (
          <div className="border border-[hsl(var(--border))] rounded-lg p-3 space-y-2">
            <Input
              placeholder="Title (e.g., Default, Size 7)"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
            <Input
              placeholder="SKU (optional)"
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Price Override (optional)"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Weight in grams (optional)"
              value={formWeight}
              onChange={(e) => setFormWeight(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={saving}>
                <Plus size={14} className="mr-1" />
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={cancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {variants.length === 0 && !adding && (
        <div className="text-center py-8 text-sm text-[hsl(var(--muted-foreground))]">
          No variants yet. Click "Add Variant" to create one.
        </div>
      )}
    </div>
  );
}
