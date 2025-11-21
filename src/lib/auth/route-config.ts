import type { UserRole } from '@/lib/utils/roles'

export interface RouteConfig {
    /** Route path to protect (string or RegExp) */
    path: string | RegExp
    /** Required roles for this route (user must have at least one) */
    roles?: UserRole[]
    /** Require authentication (any logged-in user) */
    requireAuth?: boolean
}

/**
 * Helper function to create route patterns more easily.
 * Use asterisk as a wildcard to match any path segment.
 * Example: routePattern('/manga/asterisk/asterisk') where asterisk represents *
 */
function routePattern(pattern: string): RegExp {
    // Split by * and escape each part, then join with [^/]+
    const parts = pattern.split('*')
    const escaped = parts
        .map(part => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars (excluding *)
        .join('[^/]+') // Join parts with wildcard pattern
    
    return new RegExp(`^${escaped}$`)
}


export const protectedRoutes: RouteConfig[] = [
    // Settings - requires authentication (any logged-in user)
    { path: '/settings', requireAuth: true },
    
    // Manga episode routes - requires authentication
    // Matches /manga/[uuid]/[episode] but allows /manga/[uuid] for guests
    { path: routePattern('/manga/*/*'), requireAuth: true },
    { path: routePattern('/novel/*/*'), requireAuth: true },
]

/**
 * Check if a path matches a route configuration
 */
export function matchesRoute(pathname: string, config: RouteConfig): boolean {
    if (typeof config.path === 'string') {
        // Remove trailing slash from config path for comparison
        const normalizedPath = config.path.endsWith('/') 
            ? config.path.slice(0, -1) 
            : config.path
        
        // Check exact match or if pathname starts with the normalized path followed by /
        return pathname === normalizedPath || pathname.startsWith(normalizedPath + '/')
    }
    if (config.path instanceof RegExp) {
        return config.path.test(pathname)
    }
    return false
}

/**
 * Find matching route configuration for a pathname
 */
export function findRouteConfig(pathname: string): RouteConfig | undefined {
    return protectedRoutes.find(config => matchesRoute(pathname, config))
}

