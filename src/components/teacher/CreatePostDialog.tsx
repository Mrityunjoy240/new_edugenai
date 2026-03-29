"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface CreatePostDialogProps {
  onPostCreate: (post: {
    title: string
    content: string
    topic: string
    category: string
  }) => Promise<void>
  courseId?: string
}

const CATEGORIES = ["doubt", "clarification", "discussion"]

export function CreatePostDialog({ onPostCreate, courseId }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [topic, setTopic] = useState("")
  const [category, setCategory] = useState("doubt")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in title and content")
      return
    }

    setIsSubmitting(true)
    try {
      await onPostCreate({
        title: title.trim(),
        content: content.trim(),
        topic: topic.trim(),
        category
      })
      setTitle("")
      setContent("")
      setTopic("")
      setCategory("doubt")
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ask a Question
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post Your Question</DialogTitle>
          <DialogDescription>
            Share your doubt or question. Other students and teachers can help!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input
              placeholder="Brief question title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Details</label>
            <Textarea
              placeholder="Describe your question in detail..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Topic (Optional)</label>
            <Input
              placeholder="e.g., Arrays, Recursion, etc."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Posting..." : "Post Question"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
