"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface StorageStatus {
  bucketExists: boolean
  bucketName: string
  totalBuckets: number
  buckets: Array<{ name: string; public: boolean }>
}

export default function StorageSetupPage() {
  const [status, setStatus] = useState<StorageStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    checkStorageStatus()
  }, [])

  async function checkStorageStatus() {
    setChecking(true)
    try {
      const [statusResponse, bucketsResponse] = await Promise.all([
        fetch('/api/storage/status'),
        fetch('/api/storage/buckets')
      ])
      
      const statusData = await statusResponse.json()
      const bucketsData = await bucketsResponse.json()
      
      setStatus({
        bucketExists: statusData.data?.bucketExists || false,
        bucketName: statusData.data?.bucketName || 'tree-media',
        totalBuckets: bucketsData.totalBuckets || 0,
        buckets: bucketsData.buckets || []
      })
    } catch (error) {
      console.error('Failed to check storage status:', error)
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  const supabaseProjectId = 'sngxobxqxklzjyrvwqor'
  const dashboardUrl = `https://supabase.com/dashboard/project/${supabaseProjectId}`
  const storageUrl = `${dashboardUrl}/storage/buckets`

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">🗄️ Storage Setup</h1>
          <p className="text-gray-600">
            Set up Supabase Storage for image uploads in your durian farm management system
          </p>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Current Status
              <Button 
                onClick={checkStorageStatus} 
                disabled={checking}
                variant="outline" 
                size="sm"
              >
                {checking ? '🔄 Checking...' : '🔄 Refresh'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading status...</div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Bucket <code>tree-media</code>:</span>
                  <Badge variant={status?.bucketExists ? "default" : "destructive"}>
                    {status?.bucketExists ? '✅ Exists' : '❌ Not Found'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Buckets:</span>
                  <Badge variant="secondary">{status?.totalBuckets || 0}</Badge>
                </div>
                {status?.buckets && status.buckets.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Existing Buckets:</p>
                    <div className="space-y-1">
                      {status.buckets.map((bucket, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <code>{bucket.name}</code>
                          <Badge variant={bucket.public ? "default" : "secondary"}>
                            {bucket.public ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {!status?.bucketExists && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">🔧 Setup Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-orange-700">
                The storage bucket <code>tree-media</code> needs to be created manually in your Supabase dashboard 
                due to security policies (Row Level Security).
              </p>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-orange-800">Step-by-Step Instructions:</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex gap-3">
                    <span className="font-mono bg-orange-100 px-2 py-1 rounded text-orange-800">1</span>
                    <div>
                      <p className="font-medium">Go to your Supabase Storage page</p>
                      <a 
                        href={storageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        🔗 {storageUrl}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="font-mono bg-orange-100 px-2 py-1 rounded text-orange-800">2</span>
                    <div>
                      <p className="font-medium">Click &quot;Create bucket&quot; or &quot;New bucket&quot;</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="font-mono bg-orange-100 px-2 py-1 rounded text-orange-800">3</span>
                    <div>
                      <p className="font-medium">Fill in the bucket details:</p>
                      <ul className="ml-4 mt-1 space-y-1 text-xs">
                        <li>• <strong>Name:</strong> <code>tree-media</code></li>
                        <li>• <strong>Public bucket:</strong> ✅ <strong>Enable</strong> (checked)</li>
                        <li>• <strong>File size limit:</strong> 10 MB (optional)</li>
                        <li>• <strong>Allowed MIME types:</strong> image/* (optional)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="font-mono bg-orange-100 px-2 py-1 rounded text-orange-800">4</span>
                    <div>
                      <p className="font-medium">Click &quot;Create bucket&quot;</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="font-mono bg-orange-100 px-2 py-1 rounded text-orange-800">5</span>
                    <div>
                      <p className="font-medium">Come back here and click &quot;🔄 Refresh&quot; to verify</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button asChild>
                  <a href={storageUrl} target="_blank" rel="noopener noreferrer">
                    🚀 Open Supabase Dashboard
                  </a>
                </Button>
                <Button variant="outline" onClick={checkStorageStatus}>
                  🔄 Check Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {status?.bucketExists && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">✅ Setup Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-green-700">
                Great! The <code>tree-media</code> bucket exists and image uploads should work.
              </p>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-green-800">Test Image Upload:</h3>
                <div className="flex gap-3">
                  <Button asChild>
                    <Link href="/logs/add-single">
                      📷 Test Single Log Upload
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/trees">
                      🌳 Go to Trees
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternative Methods */}
        <Card>
          <CardHeader>
            <CardTitle>🛠️ Alternative Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Method 2: SQL Editor</h3>
              <p className="text-sm text-gray-600 mb-2">
                If the dashboard method doesn&apos;t work, try the SQL Editor:
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                INSERT INTO storage.buckets (id, name, public, file_size_limit)<br/>
                VALUES (&apos;tree-media&apos;, &apos;tree-media&apos;, true, 10485760);
              </div>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <a href={`${dashboardUrl}/sql`} target="_blank" rel="noopener noreferrer">
                  🔗 Open SQL Editor
                </a>
              </Button>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Method 3: Contact Support</h3>
              <p className="text-sm text-gray-600">
                If both methods fail, contact Supabase support or check their documentation for storage setup.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start">
                <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                  🎛️ Supabase Dashboard
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href={storageUrl} target="_blank" rel="noopener noreferrer">
                  🗄️ Storage Buckets
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/logs/add-single">
                  📝 Tree Logging
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/">
                  🏠 Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}