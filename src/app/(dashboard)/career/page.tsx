import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Map, TrendingUp, BookOpen, Trophy, Target, Zap, Clock, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default async function CareerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch user's completed courses
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("*, courses(title, subject)")
    .eq("user_id", user.id)
    .eq("status", "completed")

  // Fetch user's learning notes (to extract skills learned)
  const { data: userNotes } = await supabase
    .from("notes")
    .select("*, courses(subject, title)")
    .eq("user_id", user.id)
    .limit(50)

  // Calculate Career Readiness Score
  let readinessScore = 0
  const scoreBreakdown: { [key: string]: number } = {
    profileCompletion: 0,
    coursesCompleted: 0,
    skillsAcquired: 0,
    learningConsistency: 0
  }

  // Profile Completion (0-25%)
  const profileFields = [
    profile?.full_name,
    profile?.grade_level,
    profile?.career_goals,
    profile?.skills,
    profile?.interests
  ]
  const filledFields = profileFields.filter(f => f && f.length > 0).length
  scoreBreakdown.profileCompletion = Math.round((filledFields / 5) * 25)

  // Courses Completed (0-25%)
  const completedCount = userProgress?.length || 0
  scoreBreakdown.coursesCompleted = Math.min(completedCount * 5, 25)

  // Skills Acquired (0-25%) - based on unique course subjects
  const uniqueSubjects = new Set(userNotes?.map(n => n.courses?.subject)).size
  scoreBreakdown.skillsAcquired = Math.min(uniqueSubjects * 5, 25)

  // Learning Consistency (0-25%) - simple metric based on recent notes
  const recentNotes = userNotes?.filter(n => {
    const createdDate = new Date(n.created_at)
    const daysAgo = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysAgo <= 7
  }).length || 0
  scoreBreakdown.learningConsistency = Math.min(recentNotes * 3, 25)

  readinessScore = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0)

  // Extract skills from courses taken
  const skillsList = [
    "Problem Solving",
    "Critical Thinking",
    "Time Management",
    ...Array.from(new Set(userNotes?.map(n => n.courses?.subject).filter(Boolean))).slice(0, 5)
  ] as string[]

  // Milestones
  const milestones = [
    {
      icon: BookOpen,
      title: "First Course Started",
      completed: completedCount > 0,
      description: "Begin your learning journey"
    },
    {
      icon: Trophy,
      title: "5 Skills Mastered",
      completed: uniqueSubjects >= 5,
      description: "Acquire diverse skill set"
    },
    {
      icon: Award,
      title: "Profile Complete",
      completed: filledFields === 5,
      description: "Fill all profile information"
    },
    {
      icon: TrendingUp,
      title: "30-Day Streak",
      completed: false,
      description: "Learn consistently for 30 days"
    }
  ]

  // Recommended career paths based on user activity
  const recommendedPaths = [
    {
      title: "Software Developer",
      match: Math.max(40, Math.min(95, 40 + completedCount * 10)),
      skills: ["Python", "DSA", "Web Development"],
      requiredCourses: ["Python Programming", "DSA", "Web Basics"]
    },
    {
      title: "Data Scientist",
      match: Math.max(30, Math.min(95, 30 + completedCount * 8)),
      skills: ["Python", "Mathematics", "Statistics"],
      requiredCourses: ["Python Programming", "Mathematics", "ML Basics"]
    },
    {
      title: "AI/ML Engineer",
      match: Math.max(25, Math.min(95, 25 + completedCount * 12)),
      skills: ["Python", "Mathematics", "AI Basics"],
      requiredCourses: ["AI Basics", "Python Programming", "Advanced Math"]
    },
    {
      title: "Full Stack Developer",
      match: Math.max(35, Math.min(95, 35 + completedCount * 9)),
      skills: ["Web Development", "Databases", "APIs"],
      requiredCourses: ["Web Basics", "DBMS", "Backend Development"]
    }
  ]

  // Next Steps
  const nextSteps = []
  if (filledFields < 5) nextSteps.push({ step: "Complete your profile", boost: "+10%", action: "Go to Settings" })
  if (completedCount === 0) nextSteps.push({ step: "Start your first course", boost: "+5%", action: "Browse Courses" })
  if (readinessScore < 50) nextSteps.push({ step: "Complete 2 more courses", boost: "+15%", action: "Browse Courses" })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Map className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Career Roadmap</h1>
          <p className="text-muted-foreground">Track your professional growth and find your path</p>
        </div>
      </div>

      {/* Career Readiness Score */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Career Readiness Score</CardTitle>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{readinessScore}%</div>
              <p className="text-sm text-muted-foreground">Based on your progress</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={readinessScore} className="h-3" />
          
          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(scoreBreakdown).map(([key, value]) => (
              <div key={key} className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground capitalize mb-1">
                  {key.replace(/([A-Z])/g, ' $1')}
                </p>
                <p className="text-lg font-bold text-primary">{value}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Tracker */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle>Skills You've Acquired</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
          {skillsList.length === 0 && (
            <p className="text-sm text-muted-foreground">Start a course to acquire new skills</p>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle>Milestones & Achievements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {milestones.map((milestone) => {
              const IconComponent = milestone.icon
              return (
                <div
                  key={milestone.title}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    milestone.completed
                      ? "border-success bg-success/5"
                      : "border-muted bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent
                      className={`h-5 w-5 mt-1 ${
                        milestone.completed ? "text-success" : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="font-semibold">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Career Paths */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Recommended Career Paths
        </h2>
        <div className="grid gap-4">
          {recommendedPaths
            .sort((a, b) => b.match - a.match)
            .map((path) => (
              <Card key={path.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        {path.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{path.match}%</div>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">Required Courses:</p>
                    <ul className="space-y-1">
                      {path.requiredCourses.map((course) => (
                        <li key={course} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          {course}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Learning Path
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900 dark:text-amber-100">Next Steps to Improve</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextSteps.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <div>
                    <p className="font-medium">{item.step}</p>
                    <p className="text-sm text-success font-semibold">{item.boost} Readiness Boost</p>
                  </div>
                  <Button size="sm" variant="outline">
                    {item.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

