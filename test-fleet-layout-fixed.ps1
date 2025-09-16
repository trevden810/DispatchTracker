# DispatchTracker: Test jobs_api_fleet Layout (Fixed)
# Try the fleet-specific layout mentioned in admin email

Write-Host "Testing jobs_api_fleet Layout for Current Jobs" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Gray

Write-Host "Issue: jobs_api layout only has historical data (2019-2023)" -ForegroundColor Yellow
Write-Host "Solution: Try jobs_api_fleet layout mentioned in admin email" -ForegroundColor Green

Write-Host ""
Write-Host "Current environment variables:" -ForegroundColor Cyan
Write-Host "  FILEMAKER_JOBS_LAYOUT: jobs_api" -ForegroundColor Gray
Write-Host "  Testing: jobs_api_fleet" -ForegroundColor Yellow

Write-Host ""
Write-Host "Step 1: Test jobs_api_fleet layout directly..." -ForegroundColor Cyan

try {
    # Test the fleet layout by overriding the layout parameter
    $fleetUrl = "https://www.pepmovetracker.info/api/jobs?layout=jobs_api_fleet" + "&limit=20"
    $fleetJobs = Invoke-RestMethod -Uri $fleetUrl -Method GET -TimeoutSec 15
    
    Write-Host "jobs_api_fleet Results:" -ForegroundColor Green
    Write-Host "  Success: $($fleetJobs.success)" -ForegroundColor Gray
    Write-Host "  Job Count: $($fleetJobs.count)" -ForegroundColor Gray
    
    if ($fleetJobs.data -and $fleetJobs.data.Count -gt 0) {
        Write-Host ""
        Write-Host "Fleet layout job analysis:" -ForegroundColor Cyan
        
        # Check dates in fleet layout
        $fleetJobs.data[0..4] | ForEach-Object {
            Write-Host "  Job $($_.id): $($_.date) - $($_.status) - $($_.customer)" -ForegroundColor Gray
            Write-Host "    TruckId: '$($_.truckId)', RouteId: '$($_.routeId)', StopOrder: '$($_.stopOrder)'" -ForegroundColor DarkGray
        }
        
        # Check for current jobs
        $current2025 = $fleetJobs.data | Where-Object { $_.date -like "*2025*" }
        $current2024 = $fleetJobs.data | Where-Object { $_.date -like "*2024*" }
        
        Write-Host ""
        Write-Host "Date analysis:" -ForegroundColor Yellow
        Write-Host "  Jobs from 2025: $($current2025.Count)" -ForegroundColor Gray
        Write-Host "  Jobs from 2024: $($current2024.Count)" -ForegroundColor Gray
        
        # Check truck assignments
        $withTrucks = $fleetJobs.data | Where-Object { $_.truckId -and $_.truckId -ne "" }
        Write-Host "  Jobs with truck assignments: $($withTrucks.Count)" -ForegroundColor Gray
        
        # Check route assignments  
        $withRoutes = $fleetJobs.data | Where-Object { $_.routeId -and $_.routeId -ne "" }
        Write-Host "  Jobs with route assignments: $($withRoutes.Count)" -ForegroundColor Gray
        
        if ($current2025.Count -gt 0 -or $withTrucks.Count -gt 0) {
            Write-Host ""
            Write-Host "SUCCESS: Found better data in jobs_api_fleet!" -ForegroundColor Green
        }
        
    } else {
        Write-Host "No data returned from jobs_api_fleet layout" -ForegroundColor Red
    }
    
} catch {
    Write-Host "jobs_api_fleet test failed: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*layout*" -or $_.Exception.Message -like "*not found*") {
        Write-Host "Layout may not exist or need different access" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Step 2: Test other potential layouts..." -ForegroundColor Cyan

$testLayouts = @("jobs_current", "jobs_active", "jobs_dispatch", "jobs_daily", "fleet_jobs")

foreach ($layout in $testLayouts) {
    try {
        Write-Host "Testing layout: $layout" -ForegroundColor Yellow
        $testUrl = "https://www.pepmovetracker.info/api/jobs?layout=$layout" + "&limit=5"
        $testResult = Invoke-RestMethod -Uri $testUrl -Method GET -TimeoutSec 10
        
        if ($testResult.success -and $testResult.count -gt 0) {
            Write-Host "  SUCCESS $layout - $($testResult.count) jobs found" -ForegroundColor Green
        } else {
            Write-Host "  WARNING $layout - No jobs" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  FAILED $layout - Error occurred" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Step 3: Check FileMaker server capabilities..." -ForegroundColor Cyan

try {
    # Test if we can query FileMaker directly for layout info
    Write-Host "Testing FileMaker server response structure..." -ForegroundColor Yellow
    
    $basicJob = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/jobs?limit=1" -Method GET -TimeoutSec 10
    
    if ($basicJob.debug) {
        Write-Host "Debug info available:" -ForegroundColor Green
        Write-Host "  FileMaker endpoint: $($basicJob.debug.endpoint)" -ForegroundColor Gray
        Write-Host "  Layout used: $($basicJob.debug.layout)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "FileMaker server test failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "LAYOUT TESTING COMPLETE" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Gray
Write-Host "Next steps based on results:" -ForegroundColor White
Write-Host "1. If jobs_api_fleet has current data: Update environment variable" -ForegroundColor Gray
Write-Host "2. If other layout works: Switch to that layout" -ForegroundColor Gray
Write-Host "3. If no layouts have current data: Contact admin for current job location" -ForegroundColor Gray
Write-Host "4. Consider demo mode with historical route data if no current jobs exist" -ForegroundColor Gray

Write-Host ""
Write-Host "Layout testing complete!" -ForegroundColor Green
