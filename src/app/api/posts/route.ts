import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get("course_id")
  const status = searchParams.get("status")

  try {
    let query = supabase
      .from("student_posts")
      .select("*, post_upvotes(id, user_id), post_responses(id)")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })

    if (courseId) query = query.eq("course_id", courseId)
    if (status) query = query.eq("status", status)

    const { data, error } = await query

    if (error) throw error

    return Response.json({ posts: data })
  } catch (error) {
    console.error("Failed to fetch posts:", error)
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 })
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
    const { title, content, course_id, topic, category } = body

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()

    const { data, error } = await supabase
      .from("student_posts")
      .insert({
        user_id: user.id,
        course_id: course_id || null,
        title,
        content,
        topic: topic || null,
        category: category || "doubt",
        created_by_name: profile?.full_name || "Anonymous"
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ post: data }, { status: 201 })
  } catch (error) {
    console.error("Failed to create post:", error)
    return Response.json({ error: "Failed to create post" }, { status: 500 })
  }
}
