import { NextResponse } from "next/server";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { modelId } = await req.json();
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!modelId) {
    return NextResponse.json({ error: "Model ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ selected_model: modelId })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating selected model:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Selected model updated successfully" });
}
