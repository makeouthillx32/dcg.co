// app/dashboard/[id]/settings/landing/_components/SortableSection.tsx
"use client";

import React, { useState } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import type { LandingSectionRow } from "./types";

interface SortableSectionProps {
  section: LandingSectionRow;
  index: number;
  onEdit: () => void;
  onRefresh: () => void;
}

export function SortableSection({ section, index, onEdit, onRefresh }: SortableSectionProps) {
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function toggleActive() {
    setIsTogglingActive(true);
    try {
      const res = await fetch('/api/landing/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: section.id,
          is_active: !section.is_active,
        }),
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to toggle active:', error);
    } finally {
      setIsTogglingActive(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this section? This cannot be undone.')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/landing/sections?id=${section.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  const typeColors: Record<string, string> = {
    top_banner: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    hero_carousel: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    categories_grid: 'bg-green-500/10 text-green-600 border-green-500/20',
    static_html: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    products_grid: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  };

  const typeColor = typeColors[section.type] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border bg-[var(--card)] transition-all ${
        section.is_active ? 'border-[var(--border)]' : 'border-[var(--border)] opacity-60'
      } ${isDragging ? 'shadow-lg' : 'hover:shadow-md'}`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Position Badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center font-bold text-[var(--foreground)]">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${typeColor}`}>
              {section.type}
            </span>
            
            {section.config?.title && (
              <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                {section.config.title}
              </span>
            )}

            {section.config?.slug && (
              <span className="text-xs text-[var(--muted-foreground)] truncate">
                /{section.config.slug}
              </span>
            )}
          </div>

          {/* Config Preview */}
          <div className="text-xs text-[var(--muted-foreground)] font-mono truncate">
            {Object.keys(section.config || {}).length > 0
              ? Object.entries(section.config || {})
                  .slice(0, 3)
                  .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                  .join(' • ')
              : 'No config'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleActive}
            disabled={isTogglingActive}
            className={`p-2 rounded-lg transition-colors ${
              section.is_active
                ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20'
            }`}
            title={section.is_active ? 'Hide section' : 'Show section'}
          >
            {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            title="Edit section"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
