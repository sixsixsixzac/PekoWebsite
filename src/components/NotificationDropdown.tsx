"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: "info" | "success" | "warning" | "error"
  read?: boolean
}

interface NotificationDropdownProps {
  notifications?: Notification[]
  unreadCount?: number
  onMarkAllAsRead?: () => void
  viewAllUrl?: string
}

const defaultNotifications: Notification[] = [
  {
    id: "1",
    title: "ประกาศใหม่",
    description: "มีประกาศใหม่ที่คุณอาจสนใจ",
    time: "2 ชั่วโมงที่แล้ว",
    type: "info",
    read: false,
  },
  {
    id: "2",
    title: "อัปเดตระบบ",
    description: "ระบบได้รับการอัปเดตแล้ว",
    time: "1 วันที่แล้ว",
    type: "success",
    read: false,
  },
  {
    id: "3",
    title: "แจ้งเตือน",
    description: "คุณมีข้อความใหม่",
    time: "3 วันที่แล้ว",
    type: "warning",
    read: true,
  },
]

const typeColors = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
}

export function NotificationDropdown({
  notifications = defaultNotifications,
  unreadCount,
  onMarkAllAsRead,
  viewAllUrl = "/notifications",
}: NotificationDropdownProps) {
  const displayUnreadCount = unreadCount ?? notifications.filter((n) => !n.read).length
  const hasUnread = displayUnreadCount > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden md:flex relative cursor-pointer">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>การแจ้งเตือน</span>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={onMarkAllAsRead}
            >
              อ่านทั้งหมด
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              ไม่มีการแจ้งเตือน
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem
                  className={`flex flex-col items-start p-3 cursor-pointer hover:bg-accent ${
                    !notification.read ? "bg-accent/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2 w-full">
                    <div
                      className={`h-2 w-2 ${typeColors[notification.type]} rounded-full mt-1.5 flex-shrink-0`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                {index < notifications.length - 1 && <DropdownMenuSeparator />}
              </div>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center cursor-pointer">
          <Link href={viewAllUrl} className="w-full text-center text-sm">
            ดูการแจ้งเตือนทั้งหมด
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

