"use client";

import { useState } from "react";
import { Package, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  options?: {
    size?: string;
    color?: { name: string; hex: string };
    material?: string;
    made_in?: string;
  };
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
        const grams = parseFloat(formWeight);
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
        const grams = parseFloat(formWeight);
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
          const opts = v.options || {};

          return (
            <div
              key={v.id}
              className="border border-[hsl(var(--border))] rounded-lg p-3"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Title"
                    />
                    <Input
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="SKU"
                    />
                    <Input
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="Price (USD)"
                    />
                    <Input
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
                      placeholder="Weight (grams)"
                    />
                  </div>

                  {/* Show variant options (read-only) */}
                  {(opts.size || opts.color || opts.material || opts.made_in) && (
                    <div className="space-y-2 pt-2 border-t">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Variant Options (Read-Only)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {opts.size && (
                          <Badge variant="outline" className="cursor-default">
                            Size: {opts.size}
                          </Badge>
                        )}
                        {opts.color && (
                          <Badge variant="outline" className="cursor-default flex items-center gap-1.5">
                            <div 
                              className="w-3 h-3 rounded-full border" 
                              style={{ backgroundColor: opts.color.hex }}
                            />
                            {opts.color.name}
                          </Badge>
                        )}
                        {opts.material && (
                          <Badge variant="outline" className="cursor-default">
                            {opts.material}
                          </Badge>
                        )}
                        {opts.made_in && (
                          <Badge variant="outline" className="cursor-default">
                            Made in {opts.made_in}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(v.id)} disabled={saving}>
                      <Save size={14} className="mr-1" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancel}>
                      <X size={14} className="mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold">{v.title}</h4>
                      {v.sku && (
                        <Badge variant="secondary" className="text-xs font-mono">
                          {v.sku}
                        </Badge>
                      )}
                    </div>

                    {/* Rich variant data display */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {opts.size && (
                        <Badge variant="outline" className="text-xs">
                          {opts.size}
                        </Badge>
                      )}
                      {opts.color && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1.5">
                          <div 
                            className="w-3 h-3 rounded-full border" 
                            style={{ backgroundColor: opts.color.hex }}
                          />
                          {opts.color.name}
                        </Badge>
                      )}
                      {opts.material && (
                        <span className="text-xs text-muted-foreground">
                          {opts.material}
                        </span>
                      )}
                      {opts.made_in && (
                        <span className="text-xs text-muted-foreground">
                          Made in {opts.made_in}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Price: {centsToMoney(v.price_cents)}</span>
                      {v.weight_grams && <span>Weight: {v.weight_grams}g</span>}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(v)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDelete(v.id)}
                      className="text-destructive hover:text-destructive"
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
          <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-3 space-y-3">
            <h4 className="text-sm font-semibold">Add New Variant</h4>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Title (e.g., Blue / Large)"
              />
              <Input
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                placeholder="SKU (optional)"
              />
              <Input
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="Price (USD)"
              />
              <Input
                value={formWeight}
                onChange={(e) => setFormWeight(e.target.value)}
                placeholder="Weight (grams)"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={saving}>
                <Save size={14} className="mr-1" />
                {saving ? "Adding..." : "Add Variant"}
              </Button>
              <Button size="sm" variant="outline" onClick={cancel}>
                <X size={14} className="mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}