import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const postId = params.id

  try {
    const { data: existingUpvote } = await supabase
      .from("post_upvotes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingUpvote) {
      await supabase
        .from("post_upvotes")
        .delete()
        .eq("id", existingUpvote.id)

      await supabase.rpc("decrement_upvotes", { post_id: postId })
      return Response.json({ upvoted: false })
    } else {
      await supabase.from("post_upvotes").insert({
        post_id: postId,
        user_id: user.id
      })

      await supabase.rpc("increment_upvotes", { post_id: postId })
      return Response.json({ upvoted: true })
    }
  } catch (error) {
    console.error("Failed to toggle upvote:", error)
    return Response.json({ error: "Failed to toggle upvote" }, { status: 500 })
  }
}
