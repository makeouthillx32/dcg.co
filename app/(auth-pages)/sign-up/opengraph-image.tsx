// app/sign-up/opengraph-image.tsx

import { ImageResponse } from "next/og";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Settings for OpenGraph size
export const size = {
  width: 1200,
  height: 630,
};

// Tell Next.js this is an OpenGraph handler
export const contentType = "image/png";

export default async function OGImage({ searchParams }: { searchParams: { invite?: string } }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const inviteCode = searchParams?.invite;

  let imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/images/default-invite.png`; // fallback image

  if (inviteCode) {
    const { data: invite } = await supabase
      .from("invites")
      .select("role_id")
      .eq("code", inviteCode)
      .maybeSingle();

    if (invite?.role_id) {
      // Map role_id to an image
      const roleToImageMap: Record<string, string> = {
        admin1: "/images/admin-invite.jpg",
        job_coach1: "/images/jobcoach-invite.jpg",
        client1: "/images/client-invite.jpg",
        anonymous1: "/images/anonymous-invite.jpg",
      };

      const matchedImage = roleToImageMap[invite.role_id];
      if (matchedImage) {
        imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${matchedImage}`;
      }
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          fontSize: 48,
          color: "#111827",
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      </div>
    ),
    size
  );
}