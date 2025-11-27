"use client"

import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
  className?: string
}

export function FollowButton({ className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  const handleToggle = (value: string) => {
    // ToggleGroup with type="single" allows deselecting
    if (value === "following") {
      setIsFollowing(true)
      // TODO: Add follow API call
    } else {
      // When value is empty (deselected), set to not following
      setIsFollowing(false)
      // TODO: Add unfollow API call
    }
  }

  return (
    <ToggleGroup
      type="single"
      value={isFollowing ? "following" : ""}
      onValueChange={handleToggle}
      className={cn("w-full", className)}
    >
      <ToggleGroupItem
        value="following"
        variant="outline"
        className={cn(
          "w-full justify-center",
          "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
        )}
      >
        {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

