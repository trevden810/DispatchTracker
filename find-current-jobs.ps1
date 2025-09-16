# DispatchTracker: Find Current Jobs Fix
# Query FileMaker for today's/current jobs instead of historical data

Write-Host "Finding Current Jobs in FileMaker Database" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Gray

Write-Host "Problem: Getting 2022-2023 historical jobs instead of current jobs" -ForegroundColor Yellow
Write-Host "Solution: Query for current date range and active statuses" -ForegroundColor Green

# Get today's date in various formats
$today = Get-Date
$todayISO = $today.ToString("yyyy-MM-dd")
$todayUS = $today.ToString("MM/dd/yyyy")
$todayShort = $today.ToString("M/d/yyyy")

Write-Host ""
Write-Host "Testing different date queries to find current jobs..." -ForegroundColor Cyan
Write-Host "Today's date: $todayISO ($todayUS)" -ForegroundColor Gray

# Test 1: Jobs from this year
Write-Host ""
Write-Host "Test 1: Jobs from 2025..." -ForegroundColor Cyan
try {
    $url2025 = "https://www.pepmovetracker.info/api/jobs?limit=20"
    $jobs2025 = Invoke-RestMethod -Uri $url2025 -Method GET -TimeoutSec 15
    
    # Filter for 2025 jobs
    $current2025 = $jobs2025.data | Where-Object { $_.date -like "*2025*" }
    Write-Host "  Jobs from 2025: $($current2025.Count)" -ForegroundColor Gray
    
    if ($current2025.Count -gt 0) {
        Write-Host "  SUCCESS: Found 2025 jobs!" -ForegroundColor Green
        $current2025[0..2] | ForEach-Object {
            Write-Host "    Job $($_.id): $($_.date) - $($_.status) - $($_.customer)" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Try different sorting/filtering
Write-Host ""
Write-Host "Test 2: Recent jobs (no filters)..." -ForegroundColor Cyan
try {
    $recentUrl = "https://www.pepmovetracker.info/api/jobs"
    $recentJobs = Invoke-RestMethod -Uri $recentUrl -Method GET -TimeoutSec 15
    
    # Sort by date and find most recent
    $sortedJobs = $recentJobs.data | Sort-Object { [DateTime]::Parse($_.date) } -Descending
    
    Write-Host "  Most recent job dates:" -ForegroundColor Gray
    $sortedJobs[0..4] | ForEach-Object {
        Write-Host "    $($_.date) - $($_.status) - Job $($_.id)" -ForegroundColor DarkGray
    }
    
    # Look for jobs from this week/month
    $thisWeek = $sortedJobs | Where-Object { 
        $jobDate = [DateTime]::Parse($_.date)
        $jobDate -gt (Get-Date).AddDays(-7)
    }
    Write-Host "  Jobs from this week: $($thisWeek.Count)" -ForegroundColor Gray
    
} catch {
    Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check what "External" status means (seen in deployment logs)
Write-Host ""
Write-Host "Test 3: Jobs with 'External' status..." -ForegroundColor Cyan
try {
    $allJobs = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/jobs" -Method GET -TimeoutSec 15
    
    $externalJobs = $allJobs.data | Where-Object { $_.status -eq "External" }
    Write-Host "  Jobs with 'External' status: $($externalJobs.Count)" -ForegroundColor Gray
    
    if ($externalJobs.Count -gt 0) {
        Write-Host "  External jobs found:" -ForegroundColor Green
        $externalJobs[0..2] | ForEach-Object {
            Write-Host "    Job $($_.id): $($_.date) - $($_.customer)" -ForegroundColor DarkGray
            Write-Host "      RouteId: '$($_.routeId)', TruckId: '$($_.truckId)'" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Look for jobs that might be current based on other criteria
Write-Host ""
Write-Host "Test 4: Jobs with route assignments (might be current)..." -ForegroundColor Cyan
try {
    $allJobs = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/jobs" -Method GET -TimeoutSec 15
    
    $jobsWithRoutes = $allJobs.data | Where-Object { 
        $_.routeId -and $_.routeId -ne "" -and $_.routeId -ne "null" 
    }
    
    Write-Host "  Jobs with route assignments: $($jobsWithRoutes.Count)" -ForegroundColor Gray
    
    if ($jobsWithRoutes.Count -gt 0) {
        Write-Host "  Route-assigned jobs:" -ForegroundColor Yellow
        $jobsWithRoutes[0..4] | ForEach-Object {
            Write-Host "    Job $($_.id): Route $($_.routeId) - $($_.date) - $($_.status)" -ForegroundColor DarkGray
        }
        
        # Check if any of these are recent
        $recentRouteJobs = $jobsWithRoutes | Where-Object {
            $_.date -like "*2025*" -or $_.date -like "*2024*"
        }
        Write-Host "  Recent route jobs (2024-2025): $($recentRouteJobs.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "ANALYSIS COMPLETE" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Gray
Write-Host "Next steps based on results:" -ForegroundColor White
Write-Host "1. If we found 2025 jobs: Update query to get current jobs" -ForegroundColor Gray
Write-Host "2. If External status has current jobs: Use External instead of Active" -ForegroundColor Gray
Write-Host "3. If route jobs are current: Use route-based correlation" -ForegroundColor Gray
Write-Host "4. If no current jobs found: May need different FileMaker layout/database" -ForegroundColor Gray

Write-Host ""
Write-Host "Current jobs search complete!" -ForegroundColor Green
