'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AssignmentsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to enhanced cards interface
    router.replace('/cards')
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-lime-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="loading-ring h-12 w-12 mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Redirecting to Fleet Cards</h2>
        <p className="text-gray-500">Job assignments are now integrated into the enhanced cards interface...</p>
      </div>
    </div>
  )
}
