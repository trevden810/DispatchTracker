// DispatchTracker - Schedule Hygiene Analysis Utilities
// Automated detection of job status and timing discrepancies

import { Job, ScheduleHygieneIssue } from './types'

/**
 * Analyze a job for schedule hygiene issues
 */
export function analyzeJobScheduleHygiene(job: Job): ScheduleHygieneIssue[] {
  const issues: ScheduleHygieneIssue[] = []
  const now = new Date()
  const currentTime = now.toISOString()

  // Issue 1: Job has arrival time but is not completed
  if (job.arrivalTime && !job.completionTime) {
    const completedStatuses = ['Complete', 'Done', 'Delivered', 'Completed', 'Re-scheduled', 'Attempted', 'Canceled']
    
    if (!completedStatuses.includes(job.status)) {
      const arrivalDate = new Date(job.arrivalTime)
      const hoursAtSite = (now.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60)
      
      issues.push({
        jobId: job.id,
        type: 'incomplete_after_arrival',
        severity: hoursAtSite > 4 ? 'critical' : hoursAtSite > 2 ? 'warning' : 'info',
        message: `Driver arrived ${formatTimeAgo(arrivalDate)} but job status is "${job.status}"`,
        job,
        detectedAt: currentTime,
        actionNeeded: hoursAtSite > 2
      })
    }
  }

  // Issue 2: Job is completed but status hasn't been updated
  if (job.completionTime) {
    const pendingStatuses = ['Active', 'In Progress', 'Assigned', 'Dispatched', 'En Route']
    
    if (pendingStatuses.includes(job.status)) {
      const completionDate = new Date(job.completionTime)
      const hoursSinceCompletion = (now.getTime() - completionDate.getTime()) / (1000 * 60 * 60)
      
      issues.push({
        jobId: job.id,
        type: 'status_lag',
        severity: hoursSinceCompletion > 2 ? 'critical' : 'warning',
        message: `Job completed ${formatTimeAgo(completionDate)} but status is still "${job.status}"`,
        job,
        detectedAt: currentTime,
        actionNeeded: true
      })
    }
  }

  // Issue 3: Job is past due date and still active
  if (job.dueDate) {
    const dueDate = new Date(job.dueDate)
    const activeStatuses = ['Active', 'In Progress', 'Assigned', 'Dispatched', 'En Route']
    
    if (now > dueDate && activeStatuses.includes(job.status)) {
      const hoursOverdue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60)
      
      issues.push({
        jobId: job.id,
        type: 'overdue',
        severity: hoursOverdue > 24 ? 'critical' : hoursOverdue > 4 ? 'warning' : 'info',
        message: `Job was due ${formatTimeAgo(dueDate)} but status is "${job.status}"`,
        job,
        detectedAt: currentTime,
        actionNeeded: hoursOverdue > 4
      })
    }
  }

  // Issue 4: Missing critical data
  if (job.status === 'Active' || job.status === 'In Progress') {
    if (!job.address) {
      issues.push({
        jobId: job.id,
        type: 'missing_data',
        severity: 'warning',
        message: 'Active job is missing customer address',
        job,
        detectedAt: currentTime,
        actionNeeded: true
      })
    }
    
    if (!job.dueDate) {
      issues.push({
        jobId: job.id,
        type: 'missing_data',
        severity: 'info',
        message: 'Active job is missing due date',
        job,
        detectedAt: currentTime,
        actionNeeded: false
      })
    }
  }

  // Issue 5: Long idle time at customer location (if we have both arrival and it's been a while)
  if (job.arrivalTime && !job.completionTime) {
    const arrivalDate = new Date(job.arrivalTime)
    const hoursAtLocation = (now.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursAtLocation > 6) { // More than 6 hours at location
      issues.push({
        jobId: job.id,
        type: 'long_idle',
        severity: hoursAtLocation > 12 ? 'critical' : 'warning',
        message: `Driver has been at location for ${Math.round(hoursAtLocation)} hours`,
        job,
        detectedAt: currentTime,
        actionNeeded: hoursAtLocation > 8
      })
    }
  }

  return issues
}

/**
 * Analyze all jobs and return comprehensive hygiene report
 */
export function analyzeFleetScheduleHygiene(jobs: Job[]): {
  totalJobs: number
  totalIssues: number
  issuesByType: Record<string, number>
  issuesBySeverity: Record<string, number>
  criticalIssues: ScheduleHygieneIssue[]
  allIssues: ScheduleHygieneIssue[]
  summary: string
} {
  const allIssues: ScheduleHygieneIssue[] = []
  
  jobs.forEach(job => {
    const jobIssues = analyzeJobScheduleHygiene(job)
    allIssues.push(...jobIssues)
  })

  const criticalIssues = allIssues.filter(issue => issue.severity === 'critical')
  const issuesByType = allIssues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const issuesBySeverity = allIssues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Generate summary
  let summary = `Analyzed ${jobs.length} jobs. `
  if (allIssues.length === 0) {
    summary += "✅ No schedule hygiene issues detected!"
  } else {
    summary += `Found ${allIssues.length} total issues: `
    if (criticalIssues.length > 0) {
      summary += `${criticalIssues.length} critical, `
    }
    if (issuesBySeverity.warning) {
      summary += `${issuesBySeverity.warning} warnings, `
    }
    if (issuesBySeverity.info) {
      summary += `${issuesBySeverity.info} informational.`
    }
  }

  return {
    totalJobs: jobs.length,
    totalIssues: allIssues.length,
    issuesByType,
    issuesBySeverity,
    criticalIssues,
    allIssues,
    summary
  }
}

/**
 * Get schedule status for a specific job
 */
export function getJobScheduleStatus(job: Job): {
  type: 'normal' | 'incomplete_after_arrival' | 'status_lag' | 'overdue' | 'missing_data' | 'long_idle'
  severity: 'info' | 'warning' | 'critical'
  message: string
  actionNeeded?: boolean
} {
  const issues = analyzeJobScheduleHygiene(job)
  
  if (issues.length === 0) {
    return {
      type: 'normal',
      severity: 'info',
      message: 'No schedule issues detected',
      actionNeeded: false
    }
  }

  // Return the most severe issue
  const criticalIssue = issues.find(i => i.severity === 'critical')
  const warningIssue = issues.find(i => i.severity === 'warning')
  const primaryIssue = criticalIssue || warningIssue || issues[0]

  return {
    type: primaryIssue.type,
    severity: primaryIssue.severity,
    message: primaryIssue.message,
    actionNeeded: primaryIssue.actionNeeded
  }
}

/**
 * Format time difference in human-readable format
 */
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m ago`
  } else {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  }
}

/**
 * Get actionable items for dispatchers
 */
export function getActionableItems(jobs: Job[]): {
  urgentUpdates: Job[]      // Jobs needing immediate status updates
  overdueJobs: Job[]        // Jobs past their due date
  longIdleJobs: Job[]       // Jobs with drivers idle too long
  missingData: Job[]        // Jobs missing critical information
} {
  const allIssues = jobs.flatMap(job => 
    analyzeJobScheduleHygiene(job).map(issue => ({ ...issue, job }))
  )

  return {
    urgentUpdates: allIssues
      .filter(issue => issue.type === 'status_lag' && issue.severity === 'critical')
      .map(issue => issue.job),
    
    overdueJobs: allIssues
      .filter(issue => issue.type === 'overdue')
      .map(issue => issue.job),
    
    longIdleJobs: allIssues
      .filter(issue => issue.type === 'long_idle' || 
        (issue.type === 'incomplete_after_arrival' && issue.severity === 'critical'))
      .map(issue => issue.job),
    
    missingData: allIssues
      .filter(issue => issue.type === 'missing_data')
      .map(issue => issue.job)
  }
}
