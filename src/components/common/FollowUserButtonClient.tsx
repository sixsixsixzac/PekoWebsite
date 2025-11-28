"use client";

import { useState, useTransition } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UserPlus, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUserButtonClientProps {
  targetUserUuid: string;
  initialIsFollowing: boolean;
  className?: string;
}

/**
 * Client-side FollowUserButton component
 * Handles the interactive follow/unfollow functionality
 */
export function FollowUserButtonClient({
  targetUserUuid,
  initialIsFollowing,
  className,
}: FollowUserButtonClientProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (value: string) => {
    startTransition(async () => {
      try {
        if (value === "following") {
          // Follow
          const response = await fetch("/api/user/follow", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ targetUserUuid }),
          });

          if (response.ok) {
            setIsFollowing(true);
          } else {
            const data = await response.json();
            console.error("Error following user:", data.error);
            // Revert on error
            setIsFollowing(false);
          }
        } else {
          // Unfollow (when value is empty/deselected)
          const response = await fetch("/api/user/follow", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ targetUserUuid }),
          });

          if (response.ok) {
            setIsFollowing(false);
          } else {
            const data = await response.json();
            console.error("Error unfollowing user:", data.error);
            // Revert on error
            setIsFollowing(true);
          }
        }
      } catch (error) {
        console.error("Error toggling follow status:", error);
        // Revert on error
        setIsFollowing(value === "following");
      }
    });
  };

  return (
    <ToggleGroup
      type="single"
      value={isFollowing ? "following" : ""}
      onValueChange={handleToggle}
      disabled={isPending}
      className={cn("shrink-0", className)}
    >
      <ToggleGroupItem
        value="following"
        variant="outline"
        className={cn(
          "justify-center",
          "data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:hover:bg-green-700",
          "data-[state=off]:bg-blue-600 data-[state=off]:text-white data-[state=off]:hover:bg-blue-700"
        )}
        aria-label={isFollowing ? "Unfollow this user" : "Follow this user"}
      >
        {isFollowing ? (
          <>
            <UserCheck className="size-4" aria-hidden="true" />
            <span className="text-sm sm:text-base">กำลังติดตาม</span>
          </>
        ) : (
          <>
            <UserPlus className="size-4" aria-hidden="true" />
            <span className="text-sm sm:text-base">+ ติดตาม</span>
          </>
        )}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

