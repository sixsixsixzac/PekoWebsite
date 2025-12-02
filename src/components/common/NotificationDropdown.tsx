"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { filter } from "rxjs/operators"
import { Subscription } from "rxjs"
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
import { useWebSocket } from "@/hooks/use-websocket"
import type { WebSocketMessage } from "@/lib/websocket/types"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: "info" | "success" | "warning" | "error"
  read?: boolean
  timestamp?: number
}

interface NotificationDropdownProps {
  viewAllUrl?: string
}

const typeColors = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
}

/**
 * Format timestamp to relative time in Thai
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return "เมื่อสักครู่"
  } else if (minutes < 60) {
    return `${minutes} นาทีที่แล้ว`
  } else if (hours < 24) {
    return `${hours} ชั่วโมงที่แล้ว`
  } else if (days < 7) {
    return `${days} วันที่แล้ว`
  } else {
    const date = new Date(timestamp)
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }
}

/**
 * Convert WebSocket message data to Notification format
 */
function parseNotificationMessage(
  message: WebSocketMessage,
  index: number
): Notification | null {
  if (message.type !== "message" || message.channel !== "notifications") {
    return null
  }

  const data = message.data as {
    title?: string
    message?: string
    type?: string
    timestamp?: number
  }

  if (!data) {
    return null
  }

  const notificationType =
    (data.type as "info" | "success" | "warning" | "error") || "info"

  return {
    id: `notification-${message.timestamp || Date.now()}-${index}`,
    title: data.title || "การแจ้งเตือน",
    description: data.message || "",
    time: formatRelativeTime(data.timestamp || message.timestamp || Date.now()),
    type: notificationType,
    read: false,
    timestamp: data.timestamp || message.timestamp || Date.now(),
  }
}

export function NotificationDropdown({
  viewAllUrl = "/notifications",
}: NotificationDropdownProps) {
  const { messages$, status: wsStatus, subscribe, connect, disconnect } = useWebSocket({
    autoConnect: false,
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const messageSubscriptionRef = useRef<Subscription | null>(null)

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Subscribe to notifications channel when connected
  useEffect(() => {
    if (wsStatus === "connected") subscribe("notifications")

  }, [wsStatus, subscribe])

  // Listen for new notifications from WebSocket using RxJS
  useEffect(() => {
    if (!messages$ || wsStatus !== "connected") return


    // Subscribe to notification messages using RxJS operators
    messageSubscriptionRef.current = messages$.pipe(
      filter(
        (message): message is WebSocketMessage =>
          message.type === "message" && message.channel === "notifications"
      )
    ).subscribe((message) => {
      setNotifications((prev) => {
        const notification = parseNotificationMessage(message, prev.length)
        if (!notification) return prev


        // Check if notification already exists (prevent duplicates)
        const exists = prev.some(
          (n) =>
            n.timestamp === notification.timestamp &&
            n.title === notification.title &&
            n.description === notification.description
        )
        if (exists) return prev
        return [notification, ...prev]
      })
    })

    return () => {
      messageSubscriptionRef.current?.unsubscribe()
      messageSubscriptionRef.current = null
    }
  }, [messages$, wsStatus])

  const handleMarkAllAsRead = useCallback(() => {
    const allIds = new Set(notifications.map((n) => n.id))
    setReadIds(allIds)
  }, [notifications])

  const handleNotificationClick = useCallback((id: string) => {
    setReadIds((prev) => new Set(prev).add(id))
  }, [])

  const unreadNotifications = notifications.filter((n) => !readIds.has(n.id))
  const hasUnread = unreadNotifications.length > 0

  // Sort notifications by timestamp (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = a.timestamp || 0
    const timeB = b.timestamp || 0
    return timeB - timeA
  })

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex relative cursor-pointer">
          <Bell className="h-5 w-5" />
          {hasUnread && unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
              {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 overflow-x-hidden">
        <DropdownMenuLabel className="flex items-center justify-between gap-2 min-w-0">
          <span className="truncate">การแจ้งเตือน</span>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs flex-shrink-0"
              onClick={handleMarkAllAsRead}
            >
              อ่านทั้งหมด
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto overflow-x-hidden">
          {sortedNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              ไม่มีการแจ้งเตือน
            </div>
          ) : (
            sortedNotifications.map((notification, index) => {
              const isUnread = !readIds.has(notification.id)
              return (
                <div key={notification.id}>
                  <DropdownMenuItem
                    className={`flex flex-col items-start p-3 cursor-pointer hover:bg-accent min-w-0 ${isUnread ? "bg-accent/50" : ""
                      }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start gap-2 w-full min-w-0">
                      <div
                        className={`h-2 w-2 ${typeColors[notification.type]} rounded-full mt-1.5 flex-shrink-0`}
                      ></div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium truncate w-full">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  {index < sortedNotifications.length - 1 && <DropdownMenuSeparator />}
                </div>
              )
            })
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center cursor-pointer min-w-0">
          <Link href={viewAllUrl} className="w-full text-center text-sm truncate">
            ดูการแจ้งเตือนทั้งหมด
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

