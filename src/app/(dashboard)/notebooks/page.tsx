"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function NotebooksPage() {
  const router = useRouter()

  const notebooks = [
    { title: "AI Basics", emoji: "🤖", date: "Mar 28, 2026", color: "from-blue-50 to-white dark:from-blue-950/20" },
    { title: "Physics Notes", emoji: "⚛️", date: "Mar 20, 2026", color: "from-orange-50 to-white dark:from-orange-950/20" },
    { title: "Startup Ideas", emoji: "🚀", date: "Mar 15, 2026", color: "from-green-50 to-white dark:from-green-950/20" },
    { title: "Data Structures", emoji: "💻", date: "Mar 10, 2026", color: "from-indigo-50 to-white dark:from-indigo-950/20" },
    { title: "Calculus Fundamentals", emoji: "📈", date: "Mar 05, 2026", color: "from-purple-50 to-white dark:from-purple-950/20" },
    { title: "React Patterns", emoji: "⚛️", date: "Mar 01, 2026", color: "from-cyan-50 to-white dark:from-cyan-950/20" },
    { title: "System Design", emoji: "🏗️", date: "Feb 28, 2026", color: "from-slate-50 to-white dark:from-slate-950/20" },
    { title: "Marketing Strategies", emoji: "📈", date: "Feb 20, 2026", color: "from-rose-50 to-white dark:from-rose-950/20" },
  ]

  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notebooks</h1>
          <p className="text-muted-foreground mt-1 text-sm">Organize your thoughts, study materials, and AI conversations.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {/* Create New Notebook Card */}
        <div className="h-[180px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <p className="text-base font-semibold text-foreground">Create new notebook</p>
        </div>
        
        {/* Existing Notebooks */}
        {notebooks.map((notebook, idx) => (
          <div 
            key={idx} 
            onClick={() => router.push(`/notebooks/${encodeURIComponent(notebook.title)}`)}
            className={cn(
              "h-[180px] rounded-2xl p-6 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] transition-all border border-border group relative overflow-hidden bg-gradient-to-br",
              notebook.color
            )}
          >
            <div className="text-4xl relative z-10 filter drop-shadow-sm">{notebook.emoji}</div>
            
            <div className="relative z-10">
              <h4 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors tracking-tight">{notebook.title}</h4>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-muted-foreground">{notebook.date}</p>
                <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  <span className="text-sm text-foreground">↗</span>
                </div>
              </div>
            </div>
            
            {/* Background faint emoji overlay */}
            <div className="absolute -right-8 -bottom-8 text-9xl opacity-[0.03] transform -rotate-12 select-none pointer-events-none">
              {notebook.emoji}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
