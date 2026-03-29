import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return Response.json({ error: "Missing user ID" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: notes } = await supabase
      .from("notes")
      .select("id, created_at")
      .eq("user_id", userId)

    const { data: assessments } = await supabase
      .from("assessments")
      .select("id, created_at")
      .eq("user_id", userId)

    const { data: latestActivity } = await supabase
      .from("notes")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    const totalNotes = notes?.length || 0
    const totalQuizzes = assessments?.length || 0
    const lastActivity = latestActivity?.[0]?.created_at 
      ? new Date(latestActivity[0].created_at).toLocaleDateString()
      : "No activity yet"

    const stats = {
      totalNotes,
      totalQuizzes,
      lastActivity,
      status: totalNotes > 0 ? "Active" : "Getting Started"
    }

    return Response.json({
      success: true,
      stats
    })
  } catch (error: any) {
    console.error("Progress error:", error)
    return Response.json(
      { error: error.message || "Failed to fetch progress" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, courseId, progressPercentage, status } = await request.json()
    if (!userId || !courseId) {
      return Response.json({ error: "Missing fields" }, { status: 400 })
    }
    const supabase = await createClient()
    await supabase
      .from("user_progress")
      .upsert({
        user_id: userId,
        course_id: courseId,
        progress_percentage: progressPercentage || 10,
        status: status || "in_progress",
        last_accessed_at: new Date().toISOString()
      }, { onConflict: "user_id,course_id" })
    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
