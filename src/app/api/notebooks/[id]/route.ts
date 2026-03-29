import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", params.id)
      .eq("created_by", user.id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error("Failed to delete notebook:", error)
    return Response.json({ error: "Failed to delete notebook" }, { status: 500 })
  }
}
