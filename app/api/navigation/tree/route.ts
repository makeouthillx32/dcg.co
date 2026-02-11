// app/api/navigation/tree/route.ts
import { NextResponse } from "next/server";
import { getCachedNavigationTree } from "@/lib/navigation";

/**
 * GET /api/navigation/tree
 * Returns the complete navigation tree for client components
 * Cached on the server for 1 hour
 */
export async function GET() {
  try {
    const tree = await getCachedNavigationTree();
    
    return NextResponse.json(tree, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error("Error fetching navigation tree:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch navigation tree" },
      { status: 500 }
    );
  }
}

/**
 * Optional: POST to revalidate cache
 * Call this from your admin panel when categories are updated
 */
export async function POST() {
  try {
    const { revalidateNavigationCache } = await import("@/lib/navigation");
    await revalidateNavigationCache();
    
    return NextResponse.json({ success: true, revalidated: true });
  } catch (error) {
    console.error("Error revalidating navigation cache:", error);
    
    return NextResponse.json(
      { error: "Failed to revalidate cache" },
      { status: 500 }
    );
  }