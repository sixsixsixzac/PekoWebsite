"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

interface GoogleAccountSectionProps {
  isConnected?: boolean
  onConnect?: () => void
}

export function GoogleAccountSection({
  isConnected = false,
  onConnect,
}: GoogleAccountSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          เชื่อมบัญชี Google
        </CardTitle>
        <CardDescription>
          เชื่อมต่อบัญชี Google ของคุณเพื่อเข้าสู่ระบบได้ง่ายขึ้น
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {isConnected ? "เชื่อมต่อแล้ว" : "ยังไม่ได้เชื่อมต่อ"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isConnected
                ? "บัญชี Google ของคุณเชื่อมต่อแล้ว"
                : "เชื่อมต่อบัญชี Google เพื่อความสะดวกในการเข้าสู่ระบบ"}
            </p>
          </div>
          <Button
            variant={isConnected ? "outline" : "default"}
            onClick={onConnect}
          >
            {isConnected ? "ยกเลิกการเชื่อมต่อ" : "เชื่อมต่อ Google"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


