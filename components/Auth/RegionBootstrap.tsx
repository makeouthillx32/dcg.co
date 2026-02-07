"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { detectRegionFromTimezone } from "@/lib/region";

export default function RegionBootstrap() {
  useEffect(() => {
    const run = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      // Read current region
      const { data: profile, error: readErr } = await supabase
        .from("profiles")
        .select("region")
        .eq("id", user.id)
        .single();

      if (readErr) return;

      // Only set if null/empty
      if (profile?.region) return;

      const region = detectRegionFromTimezone();

      await supabase
        .from("profiles")
        .update({ region })
        .eq("id", user.id);
    };

    run();
  }, []);

  return null;
}