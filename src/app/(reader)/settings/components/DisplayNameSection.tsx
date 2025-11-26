"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Loader2 } from "lucide-react"
import { validateDisplayName } from "@/lib/utils/text-validation"
import { toast } from "sonner"

interface DisplayNameSectionProps {
  initialDisplayName?: string
  onSave?: (displayName: string) => void
}

export function DisplayNameSection({
  initialDisplayName = "",
  onSave,
}: DisplayNameSectionProps) {
  const { data: session, update: updateSession } = useSession()
  const [displayName, setDisplayName] = useState("")
  const [currentDisplayName, setCurrentDisplayName] = useState(initialDisplayName || "")
  const [error, setError] = useState<string | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (initialDisplayName) {
      setCurrentDisplayName(initialDisplayName)
    }
  }, [initialDisplayName])

  const handleChange = (value: string) => {
    setDisplayName(value)
    if (error) {
      setError(undefined)
    }
  }

  const handleBlur = () => {
    const validation = validateDisplayName(displayName)
    if (!validation.isValid) {
      setError(validation.error)
    } else {
      setError(undefined)
    }
  }

  const handleSave = async () => {
    const trimmedName = displayName.trim()

    if (trimmedName === currentDisplayName) {
      setError(undefined)
      return
    }

    const validation = validateDisplayName(trimmedName)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    setIsSaving(true)
    setError(undefined)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: trimmedName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        console.error("Failed to save display name:", errorMessage, response.status)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const savedDisplayName = data.displayName

      setCurrentDisplayName(savedDisplayName)
      setDisplayName("")

      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: savedDisplayName,
        },
      })

      toast.success("บันทึกชื่อแสดงผลสำเร็จ")

      if (onSave) {
        onSave(savedDisplayName)
      }
    } catch (error) {
      console.error("Error saving display name:", error)
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        toast.error("กรุณาเข้าสู่ระบบเพื่อบันทึกชื่อแสดงผล")
      } else if (error instanceof Error && error.message) {
        setError(error.message)
        toast.error(error.message)
      } else {
        toast.error("ไม่สามารถบันทึกชื่อแสดงผลได้")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          ชื่อแสดงผล
        </CardTitle>
        <CardDescription>
          ชื่อที่ใช้แสดงบนเว็บไซต์
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display-name">ชื่อแสดงผล</Label>
          <Input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="กรอกชื่อแสดงผล"
            className={`max-w-md ${error ? "border-destructive" : ""}`}
            aria-invalid={!!error}
            aria-describedby={error ? "display-name-error" : undefined}
            disabled={isSaving}
          />
          {error && (
            <p
              id="display-name-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={
            !!error ||
            !displayName.trim() ||
            isSaving ||
            displayName.trim() === currentDisplayName
          }
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            "บันทึกการเปลี่ยนแปลง"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}


