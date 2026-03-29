"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Sparkles, MessageCircle, AlertCircle } from "lucide-react"
import { CreatePostDialog } from "@/components/teacher/CreatePostDialog"
import { PostCard } from "@/components/teacher/PostCard"
import { mockLessonPlan } from "@/data/mockData"

interface Post {
  id: string
  title: string
  content: string
  topic: string
  category: string
  status: string
  upvotes_count: number
  responses_count: number
  created_by_name: string
  is_pinned: boolean
  post_upvotes: any[]
}

export default function TeacherPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchCurrentUser()
    fetchPosts()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/user")
      const data = await res.json()
      setCurrentUser(data.user)
    } catch (error) {
      console.error("Failed to fetch user:", error)
    }
  }

  const fetchPosts = async () => {
    setPostsLoading(true)
    try {
      const res = await fetch("/api/posts")
      const data = await res.json()
      setPosts(data.posts || [])

      const upvotedIds = new Set<string>()
      data.posts?.forEach((post: Post) => {
        if (post.post_upvotes?.some((u: any) => u.user_id === currentUser?.id)) {
          upvotedIds.add(post.id)
        }
      })
      setUserUpvotes(upvotedIds)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setPostsLoading(false)
    }
  }

  const handlePostCreate = async (postData: any) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      })
      if (res.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    }
  }

  const handleUpvote = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/upvote`, {
        method: "POST"
      })
      if (res.ok) {
        const data = await res.json()
        if (data.upvoted) {
          setUserUpvotes((prev) => new Set([...prev, postId]))
        } else {
          setUserUpvotes((prev) => {
            const next = new Set(prev)
            next.delete(postId)
            return next
          })
        }
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to toggle upvote:", error)
    }
  }

  const generate = () => {
    setLoading(true)
    setTimeout(() => {
      setPlan(mockLessonPlan)
      setLoading(false)
    }, 1500)
  }

  const answeredCount = posts.filter((p) => p.status === "answered").length
  const openCount = posts.filter((p) => p.status === "open").length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Teacher Support</h1>
          <p className="text-muted-foreground">AI tools & community Q&A</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{answeredCount}</p>
              <p className="text-sm text-muted-foreground">Answered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">{openCount}</p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="qa" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qa" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Community Q&A
          </TabsTrigger>
          <TabsTrigger value="lesson" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Lesson Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qa" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Community Questions</h2>
              <p className="text-sm text-muted-foreground">
                Help each other learn by sharing doubts and solutions
              </p>
            </div>
            <CreatePostDialog onPostCreate={handlePostCreate} />
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading questions...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center max-w-xs">
                  No questions yet. Be the first to ask!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpvote={handleUpvote}
                  onViewDetails={(id) => router.push(`/teacher/posts/${id}`)}
                  userUpvoted={userUpvotes.has(post.id)}
                  isTeacher={currentUser?.role === "teacher" || currentUser?.role === "admin"}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lesson" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              AI Lesson Plan Generator
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto">
              Generate detailed lesson plans with objectives, activities, and assessments powered by AI.
            </p>
            <Button onClick={generate} disabled={loading} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating..." : "Generate Lesson Plan"}
            </Button>
          </div>

          {plan && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Lesson Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed overflow-x-auto">
                  {plan}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
