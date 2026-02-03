import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(req: Request) {
  const { uuid } = await req.json();

  if (!uuid) {
    return NextResponse.json({ error: "Missing UUID" }, { status: 400 });
  }

  const supabase = await createClient("service");

  // Delete user_specializations
  await supabase
    .from("user_specializations")
    .delete()
    .eq("user_id", uuid);

  // Delete messages sent by the user
  await supabase
    .from("messages")
    .delete()
    .eq("sender_id", uuid);

  // Delete channel participation
  await supabase
    .from("channel_participants")
    .delete()
    .eq("user_id", uuid);

  // Optionally: delete orphaned channels (channels with 0 participants)
  const { data: orphanedChannels } = await supabase
    .rpc("get_orphaned_channels"); // See note below

  if (orphanedChannels?.length) {
    await supabase
      .from("channels")
      .delete()
      .in("id", orphanedChannels.map(c => c.id));
  }

  // Delete profile row
  await supabase
    .from("profiles")
    .delete()
    .eq("id", uuid);

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(uuid);

  if (authError) {
    console.error("❌ Failed to delete auth user:", authError.message);
    return NextResponse.json({ error: "Auth user deletion failed" }, { status: 500 });
  }

  return NextResponse.json({ message: "✅ User and all related data purged" });
}