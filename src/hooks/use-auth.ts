"use client"

import { useSession } from 'next-auth/react'

/**
 * Client-side auth hook - Similar to Laravel's auth()->check()
 * 
 * Usage in Client Components:
 * ```tsx
 * import { useAuth } from '@/hooks/use-auth'
 * 
 * function MyComponent() {
 *   const { check, user } = useAuth()
 *   const isAuthenticated = check()
 *   // ...
 * }
 * ```
 */
export function useAuth() {
  const { data: session, status } = useSession()

  return {
    /**
     * Check if user is authenticated (similar to Laravel's auth()->check())
     * @returns boolean
     */
    check(): boolean {
      return !!session?.user
    },

    /**
     * Get current authenticated user (similar to Laravel's auth()->user())
     * @returns User | null
     */
    user() {
      return session?.user || null
    },

    /**
     * Check if session is loading
     * @returns boolean
     */
    loading(): boolean {
      return status === 'loading'
    }
  }
}





