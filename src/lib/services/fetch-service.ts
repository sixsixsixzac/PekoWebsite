/**
 * FetchService - A clean OOP HTTP client for both server and client components
 * 
 * Features:
 * - Supports GET, POST, PUT, PATCH, DELETE
 * - Automatic base URL from NEXT_PUBLIC_API_URL
 * - JSON parsing and error handling
 * - Automatic header merging
 * - Credentials handling (cookies/sessions)
 * - Automatic token refresh on 401
 * - FormData support without overriding content-type
 * - Generic type support
 * - Singleton pattern
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  body?: unknown;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

interface FetchError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
}

class FetchService {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    // Use NEXT_PUBLIC_API_URL if available, otherwise use relative paths
    // NEXT_PUBLIC_* variables are available in both server and client components
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Get the full URL by combining base URL with endpoint
   */
  private getFullUrl(endpoint: string): string {
    // If endpoint is already a full URL, use it as-is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // If baseUrl is set, combine it with endpoint
    if (this.baseUrl) {
      const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return `${base}${path}`;
    }

    // Otherwise, use endpoint as-is (relative path)
    return endpoint;
  }

  /**
   * Refresh the authentication token/session
   * Works for both server and client components
   */
  private async refreshAuth(): Promise<void> {
    // If already refreshing, wait for the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        // Check if we're in a server or client environment
        const isServer = typeof window === 'undefined';
        
        if (isServer) {
          // Server-side: NextAuth handles refresh automatically via getServerSession
          // For server components making API calls, the session refresh happens
          // at the component level. We'll just wait a bit to allow any session
          // refresh to complete, then retry the request.
          // In practice, server-side 401s usually mean the session is invalid,
          // so we'll let the retry happen but it may still fail.
          await new Promise((resolve) => setTimeout(resolve, 100));
        } else {
          // Client-side: Refresh session via NextAuth API endpoint
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to refresh session');
          }

          // Session refreshed, NextAuth will update cookies automatically
          // Wait a brief moment for cookies to be set
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error('Failed to refresh authentication:', error);
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Create readable error messages from responses
   */
  private async createError(response: Response, data?: unknown): Promise<FetchError> {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;

    // Try to extract error message from response
    if (data) {
      if (typeof data === 'object' && data !== null) {
        const errorObj = data as Record<string, unknown>;
        if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        } else if (typeof errorObj.error === 'string') {
          errorMessage = errorObj.error;
        }
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    }

    const error = new Error(errorMessage) as FetchError;
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;

    return error;
  }

  /**
   * Core request method that handles all HTTP requests
   */
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      body,
      headers = {},
      skipAuth = false,
      skipRefresh = false,
      ...fetchOptions
    } = options;

    // Determine if body is FormData
    const isFormData = body instanceof FormData;
    
    // Prepare request body
    let requestBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (isFormData) {
        requestBody = body;
      } else {
        requestBody = JSON.stringify(body);
      }
    }

    // Prepare headers
    // Convert headers to a Record for easier manipulation
    const headersRecord: Record<string, string> = {};
    
    // Copy existing headers
    if (headers) {
      if (headers instanceof Headers) {
        headers.forEach((value, key) => {
          headersRecord[key] = value;
        });
      } else if (Array.isArray(headers)) {
        headers.forEach(([key, value]) => {
          headersRecord[key] = value;
        });
      } else {
        Object.assign(headersRecord, headers);
      }
    }

    // Add Content-Type only if not FormData (browser will set it automatically with boundary)
    if (!isFormData && body !== undefined && body !== null) {
      headersRecord['Content-Type'] = headersRecord['Content-Type'] || 'application/json';
    }

    const requestHeaders: HeadersInit = headersRecord;

    // Build full URL
    const url = this.getFullUrl(endpoint);

    // Make the request
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        credentials: 'include', // Always include credentials for cookie-based auth
        ...fetchOptions,
      });
    } catch (error) {
      // Network or other fetch errors
      throw new Error(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401 && !skipAuth && !skipRefresh) {
      try {
        await this.refreshAuth();
        
        // Retry the request once after refresh
        // Recreate the body to ensure it's not consumed
        let retryBody: BodyInit | undefined = requestBody;
        if (body !== undefined && body !== null) {
          if (body instanceof FormData) {
            // FormData can be reused, but to be safe we'll create a new one
            retryBody = body;
          } else {
            // Re-stringify JSON body
            retryBody = JSON.stringify(body);
          }
        }
        
        const retryResponse = await fetch(url, {
          method,
          headers: requestHeaders,
          body: retryBody,
          credentials: 'include',
          ...fetchOptions,
        });

        // If still 401 after refresh, throw error
        if (retryResponse.status === 401) {
          const errorData = await this.parseResponse(retryResponse);
          throw await this.createError(retryResponse, errorData);
        }

        // Use the retry response
        response = retryResponse;
      } catch (refreshError) {
        // If refresh fails, throw the original 401 error
        const errorData = await this.parseResponse(response);
        throw await this.createError(response, errorData);
      }
    }

    // Parse response
    const data = await this.parseResponse(response);

    // Handle non-2xx responses
    if (!response.ok) {
      throw await this.createError(response, data);
    }

    return data as T;
  }

  /**
   * Parse response body based on content type
   */
  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');
    
    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return null;
    }

    // Parse JSON if content-type indicates JSON
    if (contentType?.includes('application/json')) {
      try {
        return JSON.parse(text);
      } catch {
        // If JSON parsing fails, return text
        return text;
      }
    }

    // Return text for other content types
    return text;
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }

  /**
   * POST request
   */
  async post<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }
}

// Export singleton instance
export const fetchService = new FetchService();

// Export class for custom instances if needed
export { FetchService };

// Export types
export type { RequestOptions, FetchError };

