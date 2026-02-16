// components/shop/_components/useHeroSlides.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface HeroSlide {
  id: string;
  image_url: string;
  alt_text: string | null;
  pill_text: string | null;
  headline_line1: string;
  headline_line2: string | null;
  subtext: string | null;
  primary_button_label: string;
  primary_button_href: string;
  secondary_button_label: string | null;
  secondary_button_href: string | null;
  text_alignment: 'left' | 'center' | 'right';
  text_color: 'dark' | 'light';
  overlay_opacity: string;
  blurhash: string | null;
  width: number;
  height: number;
}

export function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const supabase = createClient();
        
        const { data, error: fetchError } = await supabase
          .from("hero_slides")
          .select("*")
          .eq("is_active", true)
          .order("position", { ascending: true });

        if (fetchError) {
          console.error("Error fetching hero slides:", fetchError);
          setError(fetchError.message);
          setSlides([]);
          return;
        }

        // Generate public URLs for each slide
        const slidesWithUrls = (data || []).map((slide) => {
          const { data: urlData } = supabase.storage
            .from(slide.bucket_name)
            .getPublicUrl(slide.object_path);

          return {
            ...slide,
            image_url: urlData.publicUrl,
          };
        });

        setSlides(slidesWithUrls as HeroSlide[]);
      } catch (err) {
        console.error("Unexpected error fetching slides:", err);
        setError("Failed to load hero carousel");
        setSlides([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSlides();
  }, []);

  return { slides, loading, error };
}