"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle, Pin } from "lucide-react"

interface PostCardProps {
  post: any
  onUpvote: (postId: string) => Promise<void>
  onViewDetails: (postId: string) => void
  isTeacher?: boolean
  userUpvoted?: boolean
}

export function PostCard({
  post,
  onUpvote,
  onViewDetails,
  isTeacher,
  userUpvoted
}: PostCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false)

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsUpvoting(true)
    await onUpvote(post.id)
    setIsUpvoting(false)
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(post.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {post.is_pinned && (
              <div className="flex items-center gap-2 mb-2">
                <Pin className="h-4 w-4 text-primary" fill="currentColor" />
                <Badge variant="outline" className="text-xs">Pinned</Badge>
              </div>
            )}
            <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              by {post.created_by_name} {post.topic && `• ${post.topic}`}
            </p>
          </div>
          <Badge
            variant={post.status === "answered" ? "default" : "secondary"}
            className="shrink-0"
          >
            {post.status === "answered" ? "✓ Answered" : "Open"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2 text-foreground mb-4">{post.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={`flex items-center gap-2 text-sm transition-colors ${
                userUpvoted
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${userUpvoted ? "fill-current" : ""}`} />
              {post.upvotes_count || 0}
            </button>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {post.responses_count || 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
