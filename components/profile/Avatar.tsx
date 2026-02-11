"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, X } from "lucide-react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

const SUPABASE_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ??
  "";

const DEFAULT_AVATAR_PATH = "avatars/Default.png";

function buildPublicAvatarUrl(path: string) {
  if (!SUPABASE_BASE) return null;
  return `${SUPABASE_BASE}/storage/v1/object/public/${path}`;
}

export default function Avatar({
  userId,
  role,
}: {
  userId: string;
  role?: string;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let alive = true;

    const fetchAvatar = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single();

      if (!alive) return;

      // 1) Use DB value if present
      if (!error && data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
        return;
      }

      // 2) Otherwise build default avatar from THIS project
      const fallback = buildPublicAvatarUrl(DEFAULT_AVATAR_PATH);
      setAvatarUrl(fallback);
    };

    fetchAvatar();
    return () => {
      alive = false;
    };
  }, [userId]);

  if (!avatarUrl) return null;

  return (
    <div className="relative flex flex-col items-center gap-4">
      <Image
        src={avatarUrl}
        alt="User Avatar"
        width={128}
        height={128}
        className="rounded-full border-4 border-gray-300 dark:border-zinc-700 object-cover w-32 h-32 cursor-pointer"
        onClick={() => setShowPreview(true)}
      />

      {role && (
        <BadgeCheck className="absolute bottom-0 right-0 h-6 w-6 text-green-500 bg-white rounded-full p-1" />
      )}

      {showPreview &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={avatarUrl}
                alt="Full Avatar"
                width={512}
                height={512}
                className="rounded-xl object-contain max-h-[90vh] max-w-[90vw]"
              />
              <button
                title="Close image preview"
                aria-label="Close image preview"
                className="absolute top-2 right-2 bg-white rounded-full p-1 text-black"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
