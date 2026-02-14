"use client";

import React, { useState } from "react";
import { X, Image as ImageIcon, Tag as TagIcon, Settings2, AlertTriangle, Package, Box, FolderTree, Grid3x3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useManageProduct } from "./manage/use-manage-product";
import { DetailsTab } from "./manage/details-tab";
import { MediaTab } from "./manage/media-tab";
import { VariantsTab } from "./manage/variants-tab";
import { InventoryTab } from "./manage/inventory-tab";
import { CategoriesTab } from "./manage/categories-tab";
import { CollectionsTab } from "./manage/collections-tab";
import { TagsTab } from "./manage/tags-tab";
import { AdvancedTab } from "./manage/advanced-tab";
import type { TabType } from "./manage/types";

export default function ProductModal({
  open,
  onOpenChange,
  productId,
  title = "Manage Product",
  onChanged,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: string | null;
  title?: string;
  onChanged: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const { state, actions } = useManageProduct(productId, open, onChanged);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          <DialogHeader className="px-5 py-4">
            <DialogTitle className="flex items-center justify-between gap-3">
              <span className="truncate">{title}</span>
              <div className="flex items-center gap-2">
                {state.detail?.status && <Badge variant="secondary">{state.detail.status}</Badge>}
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex border-t border-[hsl(var(--border))] overflow-x-auto">
            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "details"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("details")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <Settings2 size={16} /> Details
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "media"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("media")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <ImageIcon size={16} /> Photos
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "variants"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("variants")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <Package size={16} /> Variants
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "inventory"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("inventory")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <Box size={16} /> Inventory
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "categories"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("categories")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <FolderTree size={16} /> Categories
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "collections"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("collections")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <Grid3x3 size={16} /> Collections
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "tags"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("tags")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <TagIcon size={16} /> Tags
              </span>
            </button>

            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "advanced"
                  ? "text-[hsl(var(--sidebar-primary))] border-b-2 border-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              }`}
              onClick={() => setActiveTab("advanced")}
              disabled={!productId}
            >
              <span className="inline-flex items-center gap-2">
                <AlertTriangle size={16} /> Advanced
              </span>
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-auto p-5">
          {!productId ? (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Select a product to manage.</div>
          ) : state.loading ? (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</div>
          ) : !state.detail ? (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Couldn't load product.</div>
          ) : activeTab === "details" ? (
            <DetailsTab
              detail={state.detail}
              formTitle={state.formTitle}
              formSlug={state.formSlug}
              formPrice={state.formPrice}
              formBadge={state.formBadge}
              formMaterial={state.formMaterial}
              formMadeIn={state.formMadeIn}
              formDesc={state.formDesc}
              formFeatured={state.formFeatured}
              formStatus={state.formStatus}
              saving={state.saving}
              setFormTitle={actions.setFormTitle}
              setFormSlug={actions.setFormSlug}
              setFormPrice={actions.setFormPrice}
              setFormBadge={actions.setFormBadge}
              setFormMaterial={actions.setFormMaterial}
              setFormMadeIn={actions.setFormMadeIn}
              setFormDesc={actions.setFormDesc}
              setFormFeatured={actions.setFormFeatured}
              setFormStatus={actions.setFormStatus}
              autoSlug={actions.autoSlug}
              saveDetails={actions.saveDetails}
            />
          ) : activeTab === "media" ? (
            <MediaTab
              detail={state.detail}
              files={state.files}
              alt={state.alt}
              uploading={state.uploading}
              setFiles={actions.setFiles}
              setAlt={actions.setAlt}
              uploadImages={actions.uploadImages}
              deleteImage={actions.deleteImage}
              onUpdated={() => {
                actions.load();
                onChanged();
              }}
            />
          ) : activeTab === "variants" ? (
            <VariantsTab
              productId={productId}
              detail={state.detail}
              load={actions.load}
            />
          ) : activeTab === "inventory" ? (
            <InventoryTab
              detail={state.detail}
              load={actions.load}
            />
          ) : activeTab === "categories" ? (
            <CategoriesTab
              productId={productId}
              detail={state.detail}
              availableCategories={state.availableCategories}
              load={actions.load}
            />
          ) : activeTab === "collections" ? (
            <CollectionsTab
              productId={productId}
              detail={state.detail}
              availableCollections={state.availableCollections}
              load={actions.load}
            />
          ) : activeTab === "tags" ? (
            <TagsTab
              detail={state.detail}
              tagInput={state.tagInput}
              setTagInput={actions.setTagInput}
              addTag={actions.addTag}
              removeTag={actions.removeTag}
            />
          ) : activeTab === "advanced" ? (
            <AdvancedTab
              productId={productId}
              productTitle={state.detail.title}
              onDeleted={() => {
                onOpenChange(false);
                onChanged();
              }}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}