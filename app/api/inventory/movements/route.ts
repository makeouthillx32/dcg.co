import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json(
    { ok: false, error: { code, message, details } },
    { status }
  );
}

// TODO: Replace with your real role gating (admin/catalog manager)
async function requireAdmin(supabase: Awaited<ReturnType<typeof createServerClient>>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false };
  return { ok: true };
}

/**
 * POST /api/inventory/movements
 *
 * Insert an inventory movement row. The database trigger should apply the movement
 * to the variant's stock fields (stock_on_hand, etc.).
 *
 * Body:
 * {
 *   "variant_id": "uuid",               // required
 *   "movement_type": "restock" | "sale" | "adjustment" | "damage" | "return",
 *   "quantity": 5,                      // required (positive integer)
 *   "note": "optional text",            // optional
 *   "reference": "order_123"            // optional (order id / external ref)
 * }
 *
 * Notes:
 * - Keep quantity positive. movement_type determines direction.
 * - If your schema uses signed quantities instead, tell me and I'll adjust.
 */
export async function POST(req: NextRequest) {
  // ✅ FIX: Await the createServerClient call
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required");
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const variant_id = body?.variant_id;
  const movement_type = body?.movement_type;
  const quantity = body?.quantity;
  const note = body?.note ?? null;
  const reference = body?.reference ?? null;

  if (!variant_id || typeof variant_id !== "string") {
    return jsonError(400, "INVALID_VARIANT_ID", "variant_id is required");
  }

  if (
    !movement_type ||
    typeof movement_type !== "string" ||
    !["restock", "sale", "adjustment", "damage", "return"].includes(movement_type)
  ) {
    return jsonError(
      400,
      "INVALID_MOVEMENT_TYPE",
      "movement_type must be restock|sale|adjustment|damage|return"
    );
  }

  if (
    typeof quantity !== "number" ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isInteger(quantity)
  ) {
    return jsonError(400, "INVALID_QUANTITY", "quantity must be a positive integer");
  }

  const { data, error } = await supabase
    .from("inventory_movements")
    .insert({
      variant_id,
      movement_type,
      quantity,
      note,
      reference,
    })
    .select()
    .single();

  if (error) {
    return jsonError(500, "MOVEMENT_CREATE_FAILED", error.message);
  }

  /**
   * Optional: return updated variant snapshot too (handy for admin UI)
   * If you want that, say "include variant", and I'll add it.
   */
  return NextResponse.json({ ok: true, data });
}