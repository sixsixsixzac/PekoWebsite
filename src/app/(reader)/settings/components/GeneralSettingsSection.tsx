"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Settings as SettingsIcon, Eye, ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function GeneralSettingsSection() {
  const { data: session, status } = useSession()
  const [buyImmediately, setBuyImmediately] = useState(false)
  const [loadFullImages, setLoadFullImages] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [previewBuyImmediately, setPreviewBuyImmediately] = useState(false)
  const [previewLoadFullImages, setPreviewLoadFullImages] = useState(false)

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated" || !session?.user?.id) {
      setIsLoading(false)
      return
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user/settings")
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
          console.error("Failed to fetch settings:", errorMessage, response.status)
          throw new Error(errorMessage)
        }
        const data = await response.json()
        const settings = data.settings || {}

        setBuyImmediately(settings.buyImmediately === true)
        setLoadFullImages(settings.loadFullImages === true)
      } catch (error) {
        console.error("Error fetching settings:", error)
        if (
          error instanceof Error &&
          !error.message.includes("401") &&
          !error.message.includes("Unauthorized")
        ) {
          toast.error("ไม่สามารถโหลดการตั้งค่าได้")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [session, status])

  const saveSetting = async (key: string, value: boolean) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settingKey: key,
          settingValue: value,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        console.error("Failed to save setting:", errorMessage, response.status)
        throw new Error(errorMessage)
      }

      toast.success("บันทึกการตั้งค่าสำเร็จ")
    } catch (error) {
      console.error("Error saving setting:", error)
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        toast.error("กรุณาเข้าสู่ระบบเพื่อบันทึกการตั้งค่า")
      } else {
        toast.error("ไม่สามารถบันทึกการตั้งค่าได้")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleBuyImmediatelyChange = (checked: boolean) => {
    setBuyImmediately(checked)
    saveSetting("buyImmediately", checked)
  }

  const handleLoadFullImagesChange = (checked: boolean) => {
    setLoadFullImages(checked)
    saveSetting("loadFullImages", checked)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          การตั้งค่าทั่วไป
        </CardTitle>
        <CardDescription>
          จัดการการตั้งค่าการใช้งานทั่วไป
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex itemscenter gap-2">
              <Label htmlFor="buy-immediately" className="text-base">
                ซื้อทันทีเมื่อเปลี่ยนตอน
              </Label>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPreviewBuyImmediately(true)}
                className="h-6 w-6"
                aria-label="ดูตัวอย่าง"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              เมื่อเปิดใช้งาน ระบบจะซื้อตอนใหม่โดยอัตโนมัติเมื่อคุณเข้าตอนนั้นๆ หรือกดปุ่มถัดไป (ใช้แต้มอัตโนมัติ)
            </p>
          </div>
          <Switch
            id="buy-immediately"
            checked={buyImmediately}
            onCheckedChange={handleBuyImmediatelyChange}
            disabled={isLoading || isSaving}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="load-full-images" className="text-base">
                โหลดภาพแบบเต็ม
              </Label>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPreviewLoadFullImages(true)}
                className="h-6 w-6"
                aria-label="ดูตัวอย่าง"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              เมื่อเปิดใช้งาน ระบบจะโหลดภาพความละเอียดสูงทั้งหมดในตอนทันที แทนการโหลดทีละภาพ
            </p>
          </div>
          <Switch
            id="load-full-images"
            checked={loadFullImages}
            onCheckedChange={handleLoadFullImagesChange}
            disabled={isLoading || isSaving}
          />
        </div>
      </CardContent>

      <Dialog open={previewBuyImmediately} onOpenChange={setPreviewBuyImmediately}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ตัวอย่าง: ซื้อทันทีเมื่อเปลี่ยนตอน</DialogTitle>
            <DialogDescription>
              ดูวิธีการทำงานของฟีเจอร์นี้
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">เมื่อปิดใช้งาน:</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span>1. คุณเข้าตอนที่ยังไม่ได้ซื้อ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 ml-4" />
                      <span>2. ระบบแสดงหน้าจอให้ซื้อ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 ml-4" />
                      <span>3. คุณต้องกดปุ่มซื้อด้วยตนเอง</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-primary">เมื่อเปิดใช้งาน:</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span>1. คุณเข้าตอนที่ยังไม่ได้ซื้อ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 ml-4 text-primary" />
                      <span className="text-primary font-medium">
                        2. ระบบซื้ออัตโนมัติทันที (ใช้แต้ม)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 ml-4 text-primary" />
                      <span className="text-primary font-medium">
                        3. คุณอ่านได้ทันทีโดยไม่ต้องกดปุ่ม
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                💡 <strong>หมายเหตุ:</strong> ระบบจะใช้แต้มของคุณอัตโนมัติเมื่อเข้าตอนที่ยังไม่ได้ซื้อ หรือกดปุ่ม "ถัดไป" ไปยังตอนที่ยังไม่ได้ซื้อ
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewLoadFullImages} onOpenChange={setPreviewLoadFullImages}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ตัวอย่าง: โหลดภาพแบบเต็ม</DialogTitle>
            <DialogDescription>
              ดูความแตกต่างระหว่างการโหลดภาพ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">เมื่อปิดใช้งาน:</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>โหลดภาพทีละภาพเมื่อเลื่อนดู</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 ml-6 animate-spin" />
                      <span className="text-xs">รอโหลดแต่ละภาพเมื่อเลื่อนถึง</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-primary">เมื่อเปิดใช้งาน:</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span className="text-primary font-medium">
                        โหลดภาพทั้งหมดในตอนทันที
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 ml-6 animate-spin text-primary" />
                      <span className="text-xs text-primary">
                        โหลดพร้อมกันทั้งหมด - อ่านได้ลื่นไหล
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                💡 <strong>หมายเหตุ:</strong> การโหลดทั้งหมดทันทีจะทำให้คุณอ่านได้ลื่นไหลขึ้น ไม่ต้องรอโหลดแต่ละภาพเมื่อเลื่อนดู
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


