import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, created_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return Response.json({ notebooks: data })
  } catch (error) {
    console.error("Failed to fetch notebooks:", error)
    return Response.json({ error: "Failed to fetch notebooks" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title } = body

    if (!title?.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({
        title: title.trim(),
        created_by: user.id,
        is_published: false,
        subject: "General",
        level: "high_school",
        category: "notebook"
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ notebook: data }, { status: 201 })
  } catch (error) {
    console.error("Failed to create notebook:", error)
    return Response.json({ error: "Failed to create notebook" }, { status: 500 })
  }
}
