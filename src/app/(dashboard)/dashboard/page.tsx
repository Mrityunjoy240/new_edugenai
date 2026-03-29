"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, BookOpen, Brain, TrendingUp, MessageCircle } from "lucide-react"

interface Course {
  id: string
  title: string
  subject?: string
  image_url?: string
  emoji?: string
  category?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [sampleCourses, setSampleCourses] = useState<Course[]>([])
  const [userNotebooks, setUserNotebooks] = useState<Course[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notebookTitle, setNotebookTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch sample courses
    const sampleRes = await fetch("/api/courses")
    const sampleData = await sampleRes.json()
    setSampleCourses(sampleData.courses?.slice(0, 4) || [])

    // Fetch user notebooks
    const notebookRes = await fetch("/api/notebooks")
    const notebookData = await notebookRes.json()
    setUserNotebooks(notebookData.notebooks || [])
  }

  const handleCreateNotebook = async () => {
    if (!notebookTitle.trim()) {
      alert("Please enter a notebook name")
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notebookTitle.trim() })
      })

      if (res.ok) {
        const data = await res.json()
        setNotebookTitle("")
        setIsDialogOpen(false)
        router.push(`/notebooks/${data.notebook.id}`)
      } else {
        const error = await res.json()
        alert(`Failed to create notebook: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to create notebook:", error)
      alert("Failed to create notebook")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome Back, Continue Your Personalized Learning</h1>
          <p className="text-muted-foreground">AI tracks your progress, suggests next lessons, and builds your career roadmap.</p>
        </div>
        <Button size="lg" className="gap-2">
          <span>▶</span>
          Resume Learning
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Learning Hours</p>
                <p className="text-2xl font-bold">12.5</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Courses Active</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Skills Gained</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Community Help</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Notebooks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Notebooks</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Notebook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Notebook</DialogTitle>
                <DialogDescription>Give your notebook a name to get started</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Notebook name..."
                  value={notebookTitle}
                  onChange={(e) => setNotebookTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateNotebook()
                  }}
                />
                <Button
                  onClick={handleCreateNotebook}
                  disabled={isCreating || !notebookTitle.trim()}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create Notebook"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Create New Notebook Card */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer h-full min-h-[200px]">
                <Plus className="h-12 w-12 text-primary mb-2" />
                <p className="font-medium">Create new notebook</p>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Notebook</DialogTitle>
                <DialogDescription>Give your notebook a name to get started</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Notebook name..."
                  value={notebookTitle}
                  onChange={(e) => setNotebookTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateNotebook()
                  }}
                />
                <Button
                  onClick={handleCreateNotebook}
                  disabled={isCreating || !notebookTitle.trim()}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create Notebook"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* User Notebooks */}
          {userNotebooks.map((notebook) => (
            <div
              key={notebook.id}
              onClick={() => router.push(`/notebooks/${notebook.id}`)}
              className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow h-[200px] flex flex-col justify-between"
            >
              <BookOpen className="h-8 w-8" />
              <div>
                <h3 className="font-semibold text-lg line-clamp-2">{notebook.title}</h3>
                <p className="text-sm opacity-75">Sample</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Link href="/dashboard/courses">
            <span className="text-primary hover:underline flex items-center gap-1">
              View All →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {sampleCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/course-workspace/${course.id}`)}
              className="p-6 rounded-xl bg-gradient-to-br from-orange-400 to-red-600 text-white cursor-pointer hover:shadow-lg transition-shadow h-[200px] flex flex-col justify-between"
            >
              <span className="text-4xl">{course.emoji || "📚"}</span>
              <div>
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <p className="text-sm opacity-75">Sample</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
