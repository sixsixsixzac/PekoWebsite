'use client'

import { signIn } from 'next-auth/react'
import { useState, useRef, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff, User, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from '@/components/ui/input-group'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'

// Dynamically import ReCAPTCHA to avoid SSR issues
const ReCAPTCHA = dynamic(
  () => import('react-google-recaptcha').then((mod) => mod.default),
  {
    ssr: false,
  }
) as any

interface SignUpFormProps {
  recaptchaSiteKey?: string
}

export function SignUpForm({ recaptchaSiteKey }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [nickName, setNickName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const recaptchaRef = useRef<any>(null)
  const isProduction = process.env.NODE_ENV === 'production'

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      // Verify reCAPTCHA in production
      if (isProduction) {
        if (!recaptchaValue) {
          toast.error('กรุณาทำการยืนยัน reCAPTCHA')
          setIsLoading(false)
          return
        }
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        toast.error('รหัสผ่านไม่ตรงกัน')
        setIsLoading(false)
        return
      }

      // Basic validation
      if (!username || !nickName || !email || !password) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
        setIsLoading(false)
        return
      }

      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          nickName: nickName.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          toast.error(data.message || 'กรุณารอสักครู่ก่อนลองอีกครั้ง')
          return
        }
        
        // Handle other errors
        toast.error(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        return
      }

      // Success
      toast.success(data.message || 'สมัครสมาชิกสำเร็จ')
      
      // Reset form
      setUsername('')
      setNickName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setRecaptchaValue(null)
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }

      // Redirect to sign in page after a short delay
      setTimeout(() => {
        window.location.href = '/auth/signin'
      }, 1500)
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true)

      // Verify reCAPTCHA in production
      if (isProduction) {
        if (!recaptchaValue) {
          toast.error('กรุณาทำการยืนยัน reCAPTCHA')
          setIsGoogleLoading(false)
          return
        }
      }

      await signIn('google', {
        callbackUrl: '/',
      })
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('เข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo/logo.png"
              alt="Logo"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            สร้างบัญชีใหม่เพื่อเริ่มใช้งาน
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <InputGroup>
              <InputGroupAddon>
                <User className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="username"
                type="text"
                placeholder="กรุณากรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickName">ชื่อเล่น</Label>
            <InputGroup>
              <InputGroupAddon>
                <UserCircle className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="nickName"
                type="text"
                placeholder="กรุณากรอกชื่อเล่น"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <InputGroup>
              <InputGroupAddon>
                <Mail className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <InputGroup>
              <InputGroupAddon>
                <Lock className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="กรุณากรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isGoogleLoading}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
            <InputGroup>
              <InputGroupAddon>
                <Lock className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="กรุณายืนยันรหัสผ่าน"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading || isGoogleLoading}
                  aria-label={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {isProduction && recaptchaSiteKey && (
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={recaptchaSiteKey}
                onChange={handleRecaptchaChange}
                theme="light"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full"
          >
            {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              หรือสมัครสมาชิกด้วย
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading || isGoogleLoading}
          className="w-full"
          variant="outline"
        >
          <svg
            className="mr-2 h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {isGoogleLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิกด้วย Google'}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">มีบัญชีอยู่แล้ว? </span>
          <Link
            href="/auth/signin"
            className="font-medium text-primary hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  )
}

