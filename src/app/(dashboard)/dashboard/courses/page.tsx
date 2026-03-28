"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Rocket } from "lucide-react"

export default function CoursesPage() {
  const router = useRouter()
  
  // Simulated user data
  const userLevel = "college" // "school" | "college" | "professional"

  // TASK 6: COURSE DATA STRUCTURE (EXPANDED)
  const allCourses = [
    { title: "AI Basics", level: "school", image: "/assets/course-coding.jpg" },
    { title: "Python", level: "school", image: "/assets/course-marketing.jpg" },
    { title: "Math Fundamentals", level: "school", image: "/assets/hero-study.jpg" },
    
    { title: "DSA", level: "college", image: "/assets/course-data.jpg" },
    { title: "Operating Systems", level: "college", image: "/assets/course-design.jpg" },
    { title: "DBMS", level: "college", image: "/assets/course-coding.jpg" },
    
    { title: "Data Analyst", level: "professional", image: "/assets/course-data.jpg" },
    { title: "Machine Learning", level: "professional", image: "/assets/hero-study.jpg" },
    { title: "Startup Building", level: "professional", image: "/assets/course-design.jpg" }
  ]

  // TASK 7: FILTER LOGIC
  const filteredCourses = allCourses.filter(
    (course) => course.level === userLevel
  )

  const handleCourseClick = (title: string) => {
    // TASK 3: Click Navigation
    const slug = title.toLowerCase().replace(/\s+/g, "-")
    router.push(`/notebooks/${slug}`)
  }

  return (
    <div className="space-y-10 animate-fade-in p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* Recommended for You Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Recommended for You</h2>
        
        {/* TASK 2: IMAGE-ONLY CARD DESIGN */}
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {allCourses.slice(0, 6).map((course, idx) => (
            <div 
              key={idx}
              onClick={() => handleCourseClick(course.title)}
              className="relative min-w-[260px] h-[180px] rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] shrink-0"
            >
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 text-white z-10 drop-shadow-md">
                <h3 className="text-xl font-bold tracking-tight">{course.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Courses Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">All Courses (Filtered by {userLevel})</h2>
        </div>

        {/* TASK 8: DISPLAY COURSES */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => (
              <div 
                key={idx}
                onClick={() => handleCourseClick(course.title)}
                className="relative h-[180px] rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03]"
              >
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                <div className="absolute bottom-4 left-4 text-white z-10 drop-shadow-md">
                  <h3 className="text-xl font-bold tracking-tight">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-white/70 uppercase font-bold tracking-widest bg-white/10 w-fit px-2 py-0.5 rounded">
                    <span>{course.level} Level</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TASK 9: EMPTY STATE */
          <div className="p-12 text-center bg-card border border-border rounded-2xl text-muted-foreground flex flex-col items-center justify-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Start your learning journey by exploring new topics 🚀
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
