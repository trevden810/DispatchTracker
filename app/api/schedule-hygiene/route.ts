// DispatchTracker - Schedule Hygiene API Route
// Automated schedule monitoring and alert system

import { NextResponse } from 'next/server'
import { Job, ScheduleHygieneIssue, ApiResponse } from '@/lib/types'
import { analyzeFleetScheduleHygiene, getActionableItems } from '@/lib/schedule-hygiene'

/**
 * Get comprehensive schedule hygiene analysis
 */
export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const severityFilter = searchParams.get('severity') as 'info' | 'warning' | 'critical' | null
    const typeFilter = searchParams.get('type') as string | null
    const actionableOnly = searchParams.get('actionable') === 'true'
    
    console.log('🔍 Analyzing fleet schedule hygiene...')
    
    // Fetch jobs with enhanced fields from our jobs API
    const jobsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/jobs?hygiene=true&active=true`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    
    if (!jobsResponse.ok) {
      throw new Error(`Failed to fetch jobs: ${jobsResponse.status}`)
    }
    
    const jobsData = await jobsResponse.json()
    
    if (!jobsData.success || !jobsData.data) {
      throw new Error('Invalid jobs response')
    }
    
    const jobs: Job[] = jobsData.data
    console.log(`📊 Analyzing ${jobs.length} jobs for schedule hygiene...`)
    
    // Perform comprehensive schedule hygiene analysis
    const analysis = analyzeFleetScheduleHygiene(jobs)
    const actionableItems = getActionableItems(jobs)
    
    // Apply filters if specified
    let filteredIssues = analysis.allIssues
    
    if (severityFilter) {
      filteredIssues = filteredIssues.filter(issue => issue.severity === severityFilter)
    }
    
    if (typeFilter) {
      filteredIssues = filteredIssues.filter(issue => issue.type === typeFilter)
    }
    
    if (actionableOnly) {
      filteredIssues = filteredIssues.filter(issue => issue.actionNeeded)
    }
    
    const processingTime = Date.now() - startTime
    console.log(`⚡ Schedule hygiene analysis completed in ${processingTime}ms`)
    
    return NextResponse.json({
      success: true,
      data: {
        summary: analysis.summary,
        statistics: {
          totalJobs: analysis.totalJobs,
          totalIssues: analysis.totalIssues,
          issuesByType: analysis.issuesByType,
          issuesBySeverity: analysis.issuesBySeverity,
          criticalCount: analysis.criticalIssues.length,
          actionableCount: filteredIssues.filter(i => i.actionNeeded).length
        },
        issues: filteredIssues,
        criticalIssues: analysis.criticalIssues,
        actionableItems: {
          urgentUpdates: actionableItems.urgentUpdates.length,
          overdueJobs: actionableItems.overdueJobs.length,
          longIdleJobs: actionableItems.longIdleJobs.length,
          missingData: actionableItems.missingData.length,
          details: actionableItems
        },
        filters: {
          severity: severityFilter,
          type: typeFilter,
          actionableOnly
        }
      },
      timestamp: new Date().toISOString(),
      processingTime
    } satisfies ApiResponse<any>)
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Schedule hygiene analysis error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze schedule hygiene',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        processingTime
      } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}

/**
 * Get alerts for specific dispatcher dashboard
 */
export async function POST(request: Request) {
  try {
    const { alertType, threshold } = await request.json()
    
    console.log(`🚨 Generating ${alertType} alerts...`)
    
    // Fetch current jobs
    const jobsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/jobs?active=true`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
    const jobsData = await jobsResponse.json()
    const jobs: Job[] = jobsData.data || []
    
    let alerts: any[] = []
    
    switch (alertType) {
      case 'overdue':
        alerts = jobs
          .filter(job => job.dueDate && new Date(job.dueDate) < new Date())
          .map(job => ({
            jobId: job.id,
            type: 'overdue',
            severity: 'critical',
            message: `Job ${job.id} is overdue (due: ${job.dueDate})`,
            job,
            timestamp: new Date().toISOString()
          }))
        break
        
      case 'idle':
        const hoursThreshold = threshold || 4
        alerts = jobs
          .filter(job => job.arrivalTime && !job.completionTime)
          .map(job => {
            const arrivalDate = new Date(job.arrivalTime!)
            const hoursAtSite = (Date.now() - arrivalDate.getTime()) / (1000 * 60 * 60)
            return { job, hoursAtSite }
          })
          .filter(({ hoursAtSite }) => hoursAtSite > hoursThreshold)
          .map(({ job, hoursAtSite }) => ({
            jobId: job.id,
            type: 'long_idle',
            severity: hoursAtSite > 8 ? 'critical' : 'warning',
            message: `Driver has been at job ${job.id} for ${Math.round(hoursAtSite)} hours`,
            job,
            timestamp: new Date().toISOString()
          }))
        break
        
      case 'status_lag':
        alerts = jobs
          .filter(job => job.completionTime && ['Active', 'In Progress'].includes(job.status))
          .map(job => ({
            jobId: job.id,
            type: 'status_lag',
            severity: 'warning',
            message: `Job ${job.id} completed but status not updated`,
            job,
            timestamp: new Date().toISOString()
          }))
        break
        
      default:
        return NextResponse.json({ error: 'Invalid alert type' }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        alertType,
        count: alerts.length,
        alerts: alerts.slice(0, 50), // Limit to 50 most recent
        threshold,
        generatedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Alert generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate alerts',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
