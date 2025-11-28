import { getServerSession } from 'next-auth'
import { authConfig } from './auth.config'

/**
 * Server-side auth helper class - Similar to Laravel's Auth facade
 * 
 * Usage in Server Components:
 * ```ts
 * import { Auth } from '@/lib/auth/auth'
 * 
 * const isAuthenticated = await Auth.check()
 * const user = await Auth.user()
 * ```
 */
export class Auth {
  /**
   * Check if user is authenticated (similar to Laravel's Auth::check())
   * @returns Promise<boolean>
   */
  static async check(): Promise<boolean> {
    const session = await getServerSession(authConfig)
    return !!session?.user
  }

  /**
   * Get current authenticated user (similar to Laravel's Auth::user())
   * @returns Promise<User | null>
   */
  static async user() {
    const session = await getServerSession(authConfig)
    return session?.user || null
  }

  /**
   * Require authentication, throw error if not authenticated
   * @returns Promise<User>
   * @throws Error if not authenticated
   */
  static async require() {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      throw new Error('Unauthorized')
    }
    return session.user
  }
}

