// app/Tools/[tool]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export default async function OGImage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  // Map tool name to image filename
  const getImagePath = (toolName: string) => {
    return `https://schedual-five.vercel.app/images/${toolName}.png`;
  };

  return new ImageResponse(
    (
      <img
        src={getImagePath(tool)}
        alt={`${tool} Preview`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}