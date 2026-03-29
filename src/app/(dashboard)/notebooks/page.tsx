"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, BookOpen, Trash2 } from "lucide-react"

interface Notebook {
  id: string
  title: string
  description?: string
  created_at: string
}

export default function NotebooksPage() {
  const router = useRouter()
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchNotebooks()
  }, [])

  const fetchNotebooks = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notebooks")
      const data = await res.json()
      setNotebooks(data.notebooks || [])
    } catch (error) {
      console.error("Failed to fetch notebooks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotebook = async () => {
    if (!title.trim()) {
      alert("Please enter a notebook name")
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() })
      })

      if (res.ok) {
        const data = await res.json()
        setTitle("")
        setIsOpen(false)
        router.push(`/notebooks/${data.notebook.id}`)
      }
    } catch (error) {
      console.error("Failed to create notebook:", error)
      alert("Failed to create notebook")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteNotebook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notebook?")) return

    try {
      const res = await fetch(`/api/notebooks/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        fetchNotebooks()
      }
    } catch (error) {
      console.error("Failed to delete notebook:", error)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notebooks</h1>
            <p className="text-muted-foreground">Organize your thoughts and study materials</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Notebook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notebook</DialogTitle>
              <DialogDescription>
                Give your notebook a name to get started
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Notebook name..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNotebook()
                }}
              />
              <Button
                onClick={handleCreateNotebook}
                disabled={isCreating || !title.trim()}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Notebook"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notebooks Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">Loading notebooks...</p>
        </div>
      ) : notebooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No notebooks yet. Create one to get started!
            </p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Notebook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Notebook</DialogTitle>
                  <DialogDescription>
                    Give your notebook a name to get started
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Notebook name..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateNotebook()
                    }}
                  />
                  <Button
                    onClick={handleCreateNotebook}
                    disabled={isCreating || !title.trim()}
                    className="w-full"
                  >
                    {isCreating ? "Creating..." : "Create Notebook"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notebooks.map((notebook) => (
            <Card
              key={notebook.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(`/notebooks/${notebook.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNotebook(notebook.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                  {notebook.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(notebook.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
