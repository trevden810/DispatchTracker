// DispatchTracker Health Check API
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const healthData = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: 'DispatchTracker',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      apis: {
        samsara: {
          configured: !!process.env.SAMSARA_API_TOKEN,
          baseUrl: 'https://api.samsara.com'
        },
        fileMaker: {
          configured: !!(process.env.FILEMAKER_USERNAME && process.env.FILEMAKER_PASSWORD),
          baseUrl: process.env.FILEMAKER_BASE_URL || 'https://modd.mainspringhost.com'
        }
      },
      features: {
        vehicleTracking: true,
        jobManagement: true,
        geographicCorrelation: true,
        scheduleHygiene: true
      }
    }

    return NextResponse.json(healthData)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
