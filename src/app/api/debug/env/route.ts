import { NextResponse } from 'next/server'

/**
 * Debug endpoint to check which environment variables are being used
 * Only shows non-sensitive variables for security
 */
export async function GET() {
  const isDev = process.env.NODE_ENV === 'development'
  const allowFullDebug = process.env.ALLOW_ENV_DEBUG === 'true'

  // List of safe environment variables to show (non-sensitive)
  // These are always shown, even in production
  const safeEnvVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL',
    'NEXTAUTH_URL',
    'APP_PORT',
    'TZ',
    'NEXT_PUBLIC_API_URL',
    'DOCKER_BUILD',
  ]

  const envInfo: Record<string, string | undefined> = {}
  
  safeEnvVars.forEach((key) => {
    const value = process.env[key]
    envInfo[key] = value || '(not set)'
  })

  // Sensitive variables - only show existence if in dev or explicitly enabled
  const sensitiveVars = [
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'PAYMENT_USERNAME',
    'PAYMENT_PASSWORD',
    'PROMPTPAY_ID',
  ]

  const sensitiveInfo: Record<string, boolean> = {}
  
  // Only show sensitive variable info if in dev or explicitly enabled
  if (isDev || allowFullDebug) {
    sensitiveVars.forEach((key) => {
      sensitiveInfo[key] = !!process.env[key]
    })
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    safeVariables: envInfo,
    sensitiveVariables: Object.keys(sensitiveInfo).length > 0 ? sensitiveInfo : null,
    showSensitive: isDev || allowFullDebug,
    note: isDev || allowFullDebug
      ? 'Sensitive variables are shown as true/false (exists/not exists) for security'
      : 'Sensitive variables are hidden. Set ALLOW_ENV_DEBUG=true to see them.',
  })
}

