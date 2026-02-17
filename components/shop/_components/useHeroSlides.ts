"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface HeroSlide {
  id: string;

  desktop_image_url: string | null;
  mobile_image_url: string | null;

  alt_text: string | null;
  mobile_alt_text: string | null;

  primary_button_href: string;
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
          setError(fetchError.message);
          setSlides([]);
          return;
        }

        const slidesWithUrls = (data || []).map((slide) => {
          let desktopUrl: string | null = null;
          let mobileUrl: string | null = null;

          if (slide.object_path) {
            const { data } = supabase.storage
              .from(slide.bucket_name)
              .getPublicUrl(slide.object_path);
            desktopUrl = data.publicUrl;
          }

          if (slide.mobile_object_path) {
            const { data } = supabase.storage
              .from(slide.mobile_bucket_name || slide.bucket_name)
              .getPublicUrl(slide.mobile_object_path);
            mobileUrl = data.publicUrl;
          }

          return {
            id: slide.id,
            desktop_image_url: desktopUrl,
            mobile_image_url: mobileUrl,
            alt_text: slide.alt_text ?? null,
            mobile_alt_text: slide.mobile_alt_text ?? null,
            primary_button_href: slide.primary_button_href,
          };
        });

        setSlides(slidesWithUrls);
      } catch (err) {
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