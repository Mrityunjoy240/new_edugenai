import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("post_responses")
      .select("*")
      .eq("post_id", params.id)
      .order("is_official", { ascending: false })
      .order("created_at", { ascending: true })

    if (error) throw error

    return Response.json({ responses: data })
  } catch (error) {
    console.error("Failed to fetch responses:", error)
    return Response.json({ error: "Failed to fetch responses" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { content } = body

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single()

    const { data, error } = await supabase
      .from("post_responses")
      .insert({
        post_id: params.id,
        user_id: user.id,
        content,
        is_official: profile?.role === "teacher" || profile?.role === "admin",
        responder_name: profile?.full_name || "Anonymous",
        responder_role: profile?.role || "student"
      })
      .select()
      .single()

    if (error) throw error

    const { count } = await supabase
      .from("post_responses")
      .select("*", { count: "exact", head: true })
      .eq("post_id", params.id)

    await supabase
      .from("student_posts")
      .update({ 
        status: "answered",
        responses_count: count || 0
      })
      .eq("id", params.id)

    return Response.json({ response: data }, { status: 201 })
  } catch (error) {
    console.error("Failed to create response:", error)
    return Response.json({ error: "Failed to create response" }, { status: 500 })
  }
}
