"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Notebook {
  id: string
  title: string
  created_at: string
}

export default function NotebooksPage() {
  const router = useRouter()
  const supabase = createClient()

  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function loadNotebooks() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("courses")
        .select("id, title, created_at")
        .eq("created_by", user.id)
        .eq("category", "notebook")
        .order("created_at", { ascending: false })
      
      if (data) {
        setNotebooks(data)
      }
      setLoading(false)
    }
    loadNotebooks()
  }, [supabase])

  const handleCreateNew = async () => {
    setCreating(true)
    try {
      const formData = new FormData()
      formData.append("name", "Untitled Notebook")
      const res = await fetch("/api/notebooks", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (data.success && data.notebookId) {
        router.push(`/notebooks/${data.notebookId}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notebooks</h1>
          <p className="text-muted-foreground mt-1 text-sm">Organize your thoughts, study materials, and AI conversations.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {/* Create New Notebook Card */}
          <div 
            onClick={!creating ? handleCreateNew : undefined}
            className={cn(
              "h-[180px] border-2 border-dashed border-border rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 relative",
              creating ? "opacity-50 cursor-default" : "cursor-pointer hover:scale-[1.03] hover:bg-muted/50"
            )}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              {creating ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
              )}
              <p className="text-base font-semibold text-foreground">
                {creating ? "Creating..." : "Create new notebook"}
              </p>
            </div>
          </div>
          
          {/* Existing Notebooks */}
          {notebooks.map((notebook) => (
            <div 
              key={notebook.id} 
              onClick={() => router.push(`/notebooks/${notebook.id}`)}
              className="relative h-[180px] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] group border border-border"
            >
              <img 
                src="/assets/hero-study.jpg" 
                alt={notebook.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 text-white z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <h4 className="font-bold text-xl tracking-tight mb-1">{notebook.title}</h4>
                <p className="text-xs text-white/70">
                  {new Date(notebook.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
