import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signUpSchema } from '@/lib/validations/auth'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { validateDisplayName, containsProfanity } from '@/lib/utils/text-validation'
import { rateLimit } from '@/lib/utils/rate-limit'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'

    // Rate limiting: 5 signups per 15 minutes per IP
    const rateLimitResult = await rateLimit({
      identifier: `signup:${ipAddress}`,
      maxRequests: 5,
      windowSeconds: 15 * 60, // 15 minutes
      keyPrefix: 'ratelimit:signup',
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `กรุณารอ ${Math.ceil(rateLimitResult.resetIn / 60)} นาทีก่อนลองอีกครั้ง`,
          retryAfter: rateLimitResult.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.resetIn.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': (Date.now() + rateLimitResult.resetIn * 1000).toString(),
          },
        }
      )
    }

    // Validate input using schema
    const validationResult = signUpSchema.safeParse(body)
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const { username, nickName, email, password } = validationResult.data

    // Validate username for profanity
    if (containsProfanity(username)) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้มีคำต้องห้าม กรุณาเลือกชื่อผู้ใช้อื่น' },
        { status: 400 }
      )
    }

    // Validate display name (nickName)
    const displayNameValidation = validateDisplayName(nickName)
    if (!displayNameValidation.isValid) {
      return NextResponse.json(
        { error: displayNameValidation.error },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await prisma.userProfile.findFirst({
      where: { uName: username },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.userProfile.findFirst({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate UUID
    const uuid = randomUUID()

    // Create user
    const newUser = await prisma.userProfile.create({
      data: {
        uuid,
        uName: username,
        displayName: nickName,
        email,
        pWord: hashedPassword,
        userImg: 'none.png',
        level: 0,
        uStatus: 1,
        point: 0,
        sales: 0,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'สมัครสมาชิกสำเร็จ',
        user: {
          uuid: newUser.uuid,
          username: newUser.uName,
          displayName: newUser.displayName,
          email: newUser.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Sign up error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Handle Prisma unique constraint errors
    if (errorMessage.includes('Unique constraint') || errorMessage.includes('Duplicate entry')) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      },
      { status: 500 }
    )
  }
}

