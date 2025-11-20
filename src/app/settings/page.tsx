"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, Lock, Camera } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPoints: true,
  })

  const handleSave = () => {
    toast.success("บันทึกการตั้งค่าสำเร็จ")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ตั้งค่า</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            จัดการการตั้งค่าบัญชีของคุณ
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2 sm:py-2.5">
              โปรไฟล์
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2 sm:py-2.5">
              การแจ้งเตือน
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm py-2 sm:py-2.5">
              ความเป็นส่วนตัว
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm py-2 sm:py-2.5">
              ความปลอดภัย
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  ข้อมูลโปรไฟล์
                </CardTitle>
                <CardDescription>อัปเดตข้อมูลส่วนตัวของคุณ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>
                      <User className="h-10 w-10 sm:h-12 sm:w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Camera className="mr-2 h-4 w-4" />
                      เปลี่ยนรูปโปรไฟล์
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG หรือ GIF สูงสุด 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">ชื่อเล่น</Label>
                    <Input id="nickname" placeholder="ชื่อเล่น" defaultValue="Nickname" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input id="email" type="email" placeholder="email@example.com" defaultValue="user@example.com" disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">เกี่ยวกับฉัน</Label>
                  <Textarea
                    id="bio"
                    placeholder="บอกเล่าเกี่ยวกับตัวคุณ..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button variant="outline" className="w-full sm:w-auto">ยกเลิก</Button>
                  <Button onClick={handleSave} className="w-full sm:w-auto">บันทึก</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  การแจ้งเตือน
                </CardTitle>
                <CardDescription>จัดการการแจ้งเตือนที่คุณต้องการรับ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">อีเมลแจ้งเตือน</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      รับการแจ้งเตือนผ่านอีเมล
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                    className="sm:flex-shrink-0"
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">การแจ้งเตือนแบบ Push</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      รับการแจ้งเตือนแบบ Push บนอุปกรณ์ของคุณ
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                    className="sm:flex-shrink-0"
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">การแจ้งเตือนผ่าน SMS</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      รับการแจ้งเตือนผ่านข้อความ SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, sms: checked })
                    }
                    className="sm:flex-shrink-0"
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">อีเมลการตลาด</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      รับอีเมลเกี่ยวกับผลิตภัณฑ์และข้อเสนอพิเศษ
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketing: checked })
                    }
                    className="sm:flex-shrink-0"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button variant="outline" className="w-full sm:w-auto">ยกเลิก</Button>
                  <Button onClick={handleSave} className="w-full sm:w-auto">บันทึก</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ความเป็นส่วนตัว
                </CardTitle>
                <CardDescription>ควบคุมการมองเห็นข้อมูลของคุณ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">การมองเห็นโปรไฟล์</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) =>
                      setPrivacy({ ...privacy, profileVisibility: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">สาธารณะ</SelectItem>
                      <SelectItem value="friends">เพื่อนเท่านั้น</SelectItem>
                      <SelectItem value="private">ส่วนตัว</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    ใครสามารถดูโปรไฟล์ของคุณได้
                  </p>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">แสดงอีเมล</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      อนุญาตให้ผู้อื่นเห็นอีเมลของคุณ
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, showEmail: checked })
                    }
                    className="sm:flex-shrink-0"
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">แสดงคะแนน</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      แสดงคะแนนของคุณในโปรไฟล์
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showPoints}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, showPoints: checked })
                    }
                    className="sm:flex-shrink-0"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button variant="outline" className="w-full sm:w-auto">ยกเลิก</Button>
                  <Button onClick={handleSave} className="w-full sm:w-auto">บันทึก</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  ความปลอดภัย
                </CardTitle>
                <CardDescription>จัดการความปลอดภัยของบัญชีของคุณ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm sm:text-base">
                    รหัสผ่านปัจจุบัน
                  </Label>
                  <Input id="current-password" type="password" placeholder="••••••••" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm sm:text-base">
                    รหัสผ่านใหม่
                  </Label>
                  <Input id="new-password" type="password" placeholder="••••••••" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm sm:text-base">
                    ยืนยันรหัสผ่านใหม่
                  </Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-sm sm:text-base">การยืนยันตัวตนสองขั้นตอน</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        เพิ่มความปลอดภัยให้กับบัญชีของคุณ
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      เปิดใช้งาน
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <Button variant="outline" className="w-full sm:w-auto">ยกเลิก</Button>
                  <Button onClick={handleSave} className="w-full sm:w-auto">บันทึก</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

