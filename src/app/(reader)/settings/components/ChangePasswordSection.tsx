"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ChangePasswordSectionProps {
  onChange?: (passwordData: PasswordData) => void
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
  optional?: boolean
}

const requiredPasswordRequirements: PasswordRequirement[] = [
  {
    label: "อย่างน้อย 8 ตัวอักษร",
    test: (password) => password.length >= 8
  },
  {
    label: "มีตัวอักษรพิมพ์ใหญ่",
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: "มีตัวอักษรพิมพ์เล็ก",
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: "มีตัวเลข",
    test: (password) => /[0-9]/.test(password)
  }
]

const optionalPasswordRequirement: PasswordRequirement = {
  label: "มีอักขระพิเศษ",
  test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  optional: true
}

const allPasswordRequirements: PasswordRequirement[] = [
  ...requiredPasswordRequirements,
  optionalPasswordRequirement
]

function calculatePasswordStrength(password: string): { score: number; percentage: number; label: string; color: string } {
  if (!password) {
    return { score: 0, percentage: 0, label: "", color: "" }
  }

  const metRequirements = requiredPasswordRequirements.filter(req => req.test(password)).length
  const percentage = (metRequirements / requiredPasswordRequirements.length) * 100

  let label = ""
  let color = ""

  if (percentage < 40) {
    label = "อ่อนแอ"
    color = "bg-red-500"
  } else if (percentage < 60) {
    label = "ปานกลาง"
    color = "bg-yellow-500"
  } else if (percentage < 80) {
    label = "ดี"
    color = "bg-blue-500"
  } else {
    label = "แข็งแกร่ง"
    color = "bg-green-500"
  }

  return { score: metRequirements, percentage, label, color }
}

export function ChangePasswordSection({
  onChange,
}: ChangePasswordSectionProps) {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(passwordData.newPassword)
  }, [passwordData.newPassword])

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    const updated = {
      ...passwordData,
      [field]: value
    }
    setPasswordData(updated)
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSubmit = () => {
    if (onChange) {
      onChange(passwordData)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          เปลี่ยนรหัสผ่าน
        </CardTitle>
        <CardDescription>
          เปลี่ยนรหัสผ่านของบัญชีของคุณ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">รหัสผ่านปัจจุบัน</Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showPasswords.currentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("currentPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPasswords.currentPassword ? "Hide password" : "Show password"}
            >
              {showPasswords.currentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPasswords.newPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("newPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPasswords.newPassword ? "Hide password" : "Show password"}
            >
              {showPasswords.newPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {passwordData.newPassword && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      passwordStrength.color
                    )}
                    style={{ width: `${passwordStrength.percentage}%` }}
                  />
                </div>
                {passwordStrength.label && (
                  <span
                    className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      passwordStrength.percentage < 40 && "text-red-500",
                      passwordStrength.percentage >= 40 &&
                        passwordStrength.percentage < 60 &&
                        "text-yellow-500",
                      passwordStrength.percentage >= 60 &&
                        passwordStrength.percentage < 80 &&
                        "text-blue-500",
                      passwordStrength.percentage >= 80 && "text-green-500"
                    )}
                  >
                    {passwordStrength.label}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-medium text-muted-foreground">
                  ข้อกำหนดรหัสผ่าน:
                </p>
                <div className="space-y-1">
                  {allPasswordRequirements.map((requirement, index) => {
                    const isMet = requirement.test(passwordData.newPassword)
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs"
                      >
                        {isMet ? (
                          <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span
                          className={cn(
                            isMet
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {requirement.label}
                          {requirement.optional && (
                            <span className="text-muted-foreground/70 ml-1">
                              (ไม่บังคับ)
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showPasswords.confirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              placeholder="ยืนยันรหัสผ่านใหม่"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirmPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPasswords.confirmPassword ? "Hide password" : "Show password"}
            >
              {showPasswords.confirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <Button onClick={handleSubmit}>เปลี่ยนรหัสผ่าน</Button>
      </CardContent>
    </Card>
  )
}


