'use client'

import { signIn } from 'next-auth/react'
import { useState, useRef, FormEvent, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from '@/components/ui/input-group'
import dynamic from 'next/dynamic'

// Dynamically import ReCAPTCHA to avoid SSR issues
const ReCAPTCHA = dynamic(
  () => import('react-google-recaptcha').then((mod) => mod.default),
  {
    ssr: false,
  }
) as any

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const recaptchaRef = useRef<any>(null)
  const isProduction = process.env.NODE_ENV === 'production'

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail')
      if (rememberedEmail) {
        setEmail(rememberedEmail)
        setRememberMe(true)
      }
    }
  }, [])

  const handleCredentialsSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)

      // Verify reCAPTCHA in production
      if (isProduction) {
        if (!recaptchaValue) {
          alert('กรุณาทำการยืนยัน reCAPTCHA')
          setIsLoading(false)
          return
        }
      }

      // Handle remember me functionality
      if (rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('rememberedEmail', email)
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem('rememberedEmail')
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      } else if (result?.ok) {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('เข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)

      // Verify reCAPTCHA in production
      if (isProduction) {
        if (!recaptchaValue) {
          alert('กรุณาทำการยืนยัน reCAPTCHA')
          setIsGoogleLoading(false)
          return
        }
      }

      await signIn('google', {
        callbackUrl: '/',
      })
    } catch (error) {
      console.error('Sign in error:', error)
      alert('เข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง')
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
            เข้าสู่ระบบเพื่อใช้งานต่อ
          </p>
        </div>

        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={isLoading || isGoogleLoading}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                จดจำฉัน
              </Label>
            </div>
          </div>

          {isProduction && (
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
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
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              หรือเข้าสู่ระบบด้วย
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
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
          {isGoogleLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">ยังไม่มีบัญชี? </span>
          <Link
            href="/auth/signup"
            className="font-medium text-primary hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  )
}

