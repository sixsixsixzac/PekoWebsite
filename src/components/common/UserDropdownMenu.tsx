"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, BookOpen } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoins } from "@fortawesome/free-solid-svg-icons"
import { UserRoleEnum } from "@/lib/utils/roles"
import { encodeUsername } from "@/lib/utils/username-encode"

interface UserDropdownMenuProps {
  user?: {
    display_name?: string
    email?: string
    avatar?: string
    points?: number
    role?: UserRoleEnum | number
    uuid?: string
    username?: string
  }
  onLogout?: () => void
  profileUrl?: string
  mediaUrl?: string
  settingsUrl?: string
  topupUrl?: string
  onTopup?: () => void
}

export function UserDropdownMenu({
  user,
  onLogout,
  profileUrl = "/profile",
  mediaUrl = "/media",
  settingsUrl = "/settings",
  topupUrl = "/topup",
  onTopup,
}: UserDropdownMenuProps) {
  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      // Use window.location.origin to ensure we use the correct base URL (localhost instead of 0.0.0.0)
      const callbackUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/`
        : '/'
      await signOut({ callbackUrl })
    }
  }

  if (!user) {
    return null
  }

  // Construct profile URL using username if available, otherwise use provided profileUrl
  const getProfileUrl = () => {
    if (user.username) {
      const encodedUsername = encodeUsername(user.username)
      return `/profile/${encodedUsername}`
    }
    return profileUrl
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 gap-2 px-2 cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.display_name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block">{user.display_name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.display_name} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5 flex-1">
              <p className="text-sm font-medium leading-none">
                {user.display_name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-2 mx-2 my-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 rounded-md border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                <FontAwesomeIcon icon={faCoins} className="text-yellow-600 dark:text-yellow-400 text-xs mr-1" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                  {user.points?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
            {onTopup ? (
              <Button
                variant="default"
                size="sm"
                onClick={onTopup}
                className="h-7 px-2 text-xs"
              >
                เติมเงิน
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                asChild
                className="h-7 px-2 text-xs"
              >
                <Link href={topupUrl}>
                  เติมเงิน
                </Link>
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={getProfileUrl()}
            className="flex items-center transition-colors hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            โปรไฟล์
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={mediaUrl}
            className="flex items-center transition-colors hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            ชั้นหนังสือ
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={settingsUrl}
            className="flex items-center transition-colors hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            ตั้งค่า
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className=" transition-colors hover:bg-destructive/10 hover:text-destructive rounded-sm cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

