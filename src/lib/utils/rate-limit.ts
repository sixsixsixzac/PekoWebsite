import { redis } from '@/lib/redis/client'

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed
   */
  maxRequests: number
  /**
   * Time window in seconds
   */
  windowSeconds: number
  /**
   * Identifier for the rate limit (e.g., user ID, IP address)
   */
  identifier: string
  /**
   * Prefix for the Redis key
   */
  keyPrefix?: string
}

interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean
  /**
   * Number of requests remaining in the current window
   */
  remaining: number
  /**
   * Time in seconds until the rate limit resets
   */
  resetIn: number
}

/**
 * Rate limiting utility using Redis
 * Implements a sliding window rate limiter
 */
export async function rateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { maxRequests, windowSeconds, identifier, keyPrefix = 'ratelimit' } =
    options

  const key = `${keyPrefix}:${identifier}`
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000

  try {
    // Ensure Redis is connected
    if (!redis.isOpen) {
      await redis.connect()
    }

    // Use Redis sorted set to track requests in the time window
    // Score is the timestamp, member is a unique request ID
    const requestId = `${now}-${Math.random()}`

    // Add current request to the sorted set
    await redis.zAdd(key, {
      score: now,
      value: requestId,
    })

    // Remove requests outside the time window
    await redis.zRemRangeByScore(key, 0, windowStart)

    // Count requests in the current window
    const count = await redis.zCard(key)

    // Set expiration on the key (windowSeconds + 1 second buffer)
    await redis.expire(key, windowSeconds + 1)

    const allowed = count <= maxRequests
    const remaining = Math.max(0, maxRequests - count)
    const resetIn = windowSeconds

    return {
      allowed,
      remaining,
      resetIn,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // On Redis error, allow the request (fail open)
    // In production, you might want to fail closed instead
    return {
      allowed: true,
      remaining: maxRequests,
      resetIn: windowSeconds,
    }
  }
}

/**
 * Check if a request is rate limited
 * Returns true if rate limited (should block), false if allowed
 */
export async function isRateLimited(
  options: RateLimitOptions
): Promise<boolean> {
  const result = await rateLimit(options)
  return !result.allowed
}

