# DispatchTracker: Test Promising Layouts for Current Data
# Test jobs_current, jobs_active, jobs_dispatch for 2025 data

Write-Host "Testing Promising Layouts for Current Jobs" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Gray

Write-Host "Discovery: Found multiple accessible layouts!" -ForegroundColor Yellow
Write-Host "- jobs_current, jobs_active, jobs_dispatch, jobs_daily, fleet_jobs" -ForegroundColor Gray
Write-Host "Testing each for current (2025) job data..." -ForegroundColor Green

$promisingLayouts = @(
    @{name="jobs_current"; priority="HIGH"},
    @{name="jobs_active"; priority="HIGH"}, 
    @{name="jobs_dispatch"; priority="HIGH"},
    @{name="jobs_daily"; priority="MEDIUM"},
    @{name="fleet_jobs"; priority="MEDIUM"}
)

foreach ($layoutInfo in $promisingLayouts) {
    $layout = $layoutInfo.name
    $priority = $layoutInfo.priority
    
    Write-Host ""
    Write-Host "Testing $layout ($priority priority)..." -ForegroundColor Cyan
    
    try {
        $testUrl = "https://www.pepmovetracker.info/api/jobs?layout=$layout" + "&limit=10"
        $result = Invoke-RestMethod -Uri $testUrl -Method GET -TimeoutSec 15
        
        if ($result.success -and $result.data -and $result.data.Count -gt 0) {
            Write-Host "  SUCCESS: $($result.count) jobs found" -ForegroundColor Green
            
            # Analyze the data
            Write-Host "  Job analysis:" -ForegroundColor Yellow
            
            # Check first few jobs
            $result.data[0..2] | ForEach-Object {
                Write-Host "    Job $($_.id): $($_.date) - $($_.status) - $($_.customer)" -ForegroundColor Gray
                Write-Host "      TruckId: '$($_.truckId)', RouteId: '$($_.routeId)', StopOrder: '$($_.stopOrder)'" -ForegroundColor DarkGray
            }
            
            # Check for 2025 data
            $jobs2025 = $result.data | Where-Object { $_.date -like "*2025*" }
            $jobs2024 = $result.data | Where-Object { $_.date -like "*2024*" }
            Write-Host "    Jobs from 2025: $($jobs2025.Count)" -ForegroundColor $(if($jobs2025.Count -gt 0){"Green"}else{"Gray"})
            Write-Host "    Jobs from 2024: $($jobs2024.Count)" -ForegroundColor $(if($jobs2024.Count -gt 0){"Green"}else{"Gray"})
            
            # Check assignments
            $withTrucks = $result.data | Where-Object { $_.truckId -and $_.truckId -ne "" -and $_.truckId -ne "null" }
            $withRoutes = $result.data | Where-Object { $_.routeId -and $_.routeId -ne "" -and $_.routeId -ne "null" }
            Write-Host "    Jobs with truck assignments: $($withTrucks.Count)" -ForegroundColor $(if($withTrucks.Count -gt 0){"Green"}else{"Gray"})
            Write-Host "    Jobs with route assignments: $($withRoutes.Count)" -ForegroundColor $(if($withRoutes.Count -gt 0){"Green"}else{"Gray"})
            
            # Check status distribution
            $statusGroups = $result.data | Group-Object -Property status
            Write-Host "    Status distribution:" -ForegroundColor Yellow
            $statusGroups | ForEach-Object { 
                $statusColor = if($_.Name -in @("External", "Active", "Pending", "In Progress", "Assigned", "Scheduled")){"Green"}else{"Gray"}
                Write-Host "      $($_.Name): $($_.Count)" -ForegroundColor $statusColor
            }
            
            # Determine if this layout is promising
            $isPromising = ($jobs2025.Count -gt 0) -or ($jobs2024.Count -gt 0) -or ($withTrucks.Count -gt 0) -or 
                          ($result.data | Where-Object { $_.status -in @("External", "Active", "Pending", "In Progress") }).Count -gt 0
            
            if ($isPromising) {
                Write-Host "  *** PROMISING LAYOUT FOUND! ***" -ForegroundColor Green
                Write-Host "  Layout '$layout' has current/actionable data" -ForegroundColor Green
            }
            
        } else {
            Write-Host "  No data in $layout layout" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "COMPREHENSIVE LAYOUT ANALYSIS COMPLETE" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Gray

Write-Host ""
Write-Host "RECOMMENDATIONS BASED ON RESULTS:" -ForegroundColor White
Write-Host "1. If any layout has 2025 jobs: Switch to that layout immediately" -ForegroundColor Gray
Write-Host "2. If any layout has truck assignments: Use for correlation" -ForegroundColor Gray
Write-Host "3. If any layout has 'External' status: Try that for active jobs" -ForegroundColor Gray
Write-Host "4. If still no current data: Implement demo mode with route data" -ForegroundColor Gray

Write-Host ""
Write-Host "Next step: Update FILEMAKER_JOBS_LAYOUT environment variable" -ForegroundColor Cyan
Write-Host "to the most promising layout and re-deploy" -ForegroundColor Cyan

Write-Host ""
Write-Host "Layout analysis complete!" -ForegroundColor Green
