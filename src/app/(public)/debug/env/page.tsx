'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface EnvInfo {
  environment: string
  timestamp: string
  safeVariables: Record<string, string>
  sensitiveVariables: Record<string, boolean> | null
  showSensitive: boolean
  note: string
}

export default function EnvDebugPage() {
  const [envInfo, setEnvInfo] = useState<EnvInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEnvInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug/env')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch environment info')
      }
      const data = await response.json()
      setEnvInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnvInfo()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Debug</CardTitle>
            <CardDescription>Loading environment information...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Debug</CardTitle>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error}
            </p>
            <Button onClick={fetchEnvInfo} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Environment Variables Debug</CardTitle>
              <CardDescription>
                Check which environment variables are currently being used
              </CardDescription>
            </div>
            <Button onClick={fetchEnvInfo} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {envInfo && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-2">Environment</h3>
                <Badge variant={envInfo.environment === 'production' ? 'default' : 'secondary'}>
                  {envInfo.environment}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(envInfo.timestamp).toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Safe Variables (Values Shown)</h3>
                <div className="space-y-2">
                  {Object.entries(envInfo.safeVariables).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-4 p-3 bg-muted/50 rounded-md">
                      <code className="text-sm font-mono text-primary min-w-[200px]">{key}</code>
                      <code className="text-sm font-mono flex-1 break-all">
                        {value === '(not set)' ? (
                          <span className="text-muted-foreground italic">{value}</span>
                        ) : (
                          value
                        )}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {envInfo.sensitiveVariables && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Sensitive Variables (Existence Only)</h3>
                  <p className="text-xs text-muted-foreground mb-3">{envInfo.note}</p>
                  <div className="space-y-2">
                    {Object.entries(envInfo.sensitiveVariables).map(([key, exists]) => (
                      <div key={key} className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                        <code className="text-sm font-mono text-primary min-w-[200px]">{key}</code>
                        <Badge variant={exists ? 'default' : 'secondary'}>
                          {exists ? 'Set' : 'Not Set'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!envInfo.showSensitive && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Sensitive Variables</h3>
                  <div className="p-4 bg-muted/50 rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      {envInfo.note}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      To view sensitive variables, set <code className="bg-background px-1 py-0.5 rounded">ALLOW_ENV_DEBUG=true</code> in your environment variables.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2">Client-Side Values</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-md">
                    <code className="text-sm font-mono text-primary min-w-[200px]">window.location.origin</code>
                    <code className="text-sm font-mono flex-1">
                      {typeof window !== 'undefined' ? window.location.origin : 'N/A (SSR)'}
                    </code>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-md">
                    <code className="text-sm font-mono text-primary min-w-[200px]">process.env.NEXT_PUBLIC_APP_URL</code>
                    <code className="text-sm font-mono flex-1">
                      {process.env.NEXT_PUBLIC_APP_URL || '(not set in client)'}
                    </code>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

