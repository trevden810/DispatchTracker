# DispatchTracker: FileMaker Data Structure Diagnostic
# Examine actual FileMaker data to understand why correlation fails

Write-Host "🔍 FileMaker Data Structure Diagnostic" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Gray

Write-Host "Status: FileMaker API now working, but 0 correlations found" -ForegroundColor Yellow
Write-Host "Goal: Examine actual data structure and identify correlation issues" -ForegroundColor Yellow

Write-Host ""
Write-Host "Step 1: Test FileMaker API without filters..." -ForegroundColor Cyan
try {
    # Test without any filters to see all data
    $allJobs = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/jobs" -Method GET -TimeoutSec 15
    
    Write-Host "✅ Raw FileMaker Response:" -ForegroundColor Green
    Write-Host "  Success: $($allJobs.success)" -ForegroundColor Gray
    Write-Host "  Total Jobs: $($allJobs.count)" -ForegroundColor Gray
    Write-Host "  Total Records in DB: $($allJobs.totalRecords)" -ForegroundColor Gray
    
    if ($allJobs.data -and $allJobs.data.Count -gt 0) {
        Write-Host ""
        Write-Host "📊 First 3 Jobs Analysis:" -ForegroundColor Cyan
        $allJobs.data[0..2] | ForEach-Object {
            Write-Host "  Job ID: $($_.id)" -ForegroundColor White
            Write-Host "    Date: $($_.date)" -ForegroundColor Gray
            Write-Host "    Status: $($_.status)" -ForegroundColor Gray
            Write-Host "    Customer: $($_.customer)" -ForegroundColor Gray
            Write-Host "    TruckId: '$($_.truckId)'" -ForegroundColor Gray
            Write-Host "    RouteId: '$($_.routeId)'" -ForegroundColor Gray
            Write-Host "    StopOrder: '$($_.stopOrder)'" -ForegroundColor Gray
            Write-Host "    Address: $($_.address)" -ForegroundColor Gray
            Write-Host "    ---" -ForegroundColor DarkGray
        }
        
        # Analyze data patterns
        Write-Host ""
        Write-Host "🔍 Data Pattern Analysis:" -ForegroundColor Cyan
        
        # Check dates
        $currentYear = (Get-Date).Year
        $currentJobs = $allJobs.data | Where-Object { $_.date -like "*$currentYear*" -or $_.date -like "*2025*" }
        Write-Host "  Jobs from 2025: $($currentJobs.Count)" -ForegroundColor Gray
        
        # Check truck assignments
        $jobsWithTrucks = $allJobs.data | Where-Object { $_.truckId -and $_.truckId -ne "" -and $_.truckId -ne "null" }
        Write-Host "  Jobs with truck assignments: $($jobsWithTrucks.Count)" -ForegroundColor Gray
        
        # Check route assignments
        $jobsWithRoutes = $allJobs.data | Where-Object { $_.routeId -and $_.routeId -ne "" -and $_.routeId -ne "null" }
        Write-Host "  Jobs with route assignments: $($jobsWithRoutes.Count)" -ForegroundColor Gray
        
        # Check status distribution
        $statusGroups = $allJobs.data | Group-Object -Property status
        Write-Host "  Status distribution:" -ForegroundColor Gray
        $statusGroups | ForEach-Object { Write-Host "    $($_.Name): $($_.Count)" -ForegroundColor DarkGray }
        
        # Check for active/pending jobs
        $activeStatuses = @("External", "Active", "Pending", "In Progress", "Assigned", "Scheduled")
        $activeJobs = $allJobs.data | Where-Object { $activeStatuses -contains $_.status }
        Write-Host "  Active/pending jobs: $($activeJobs.Count)" -ForegroundColor Gray
        
    } else {
        Write-Host "❌ No job data returned from FileMaker" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ FileMaker API test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 2: Test specific filtering..." -ForegroundColor Cyan
try {
    # Test with active filter
    $activeJobs = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/jobs?active=true&limit=10" -Method GET -TimeoutSec 15
    
    Write-Host "Active jobs filter results:" -ForegroundColor Yellow
    Write-Host "  Count: $($activeJobs.count)" -ForegroundColor Gray
    
    if ($activeJobs.data -and $activeJobs.data.Count -gt 0) {
        Write-Host "  Sample active job:" -ForegroundColor Gray
        $sample = $activeJobs.data[0]
        Write-Host "    ID: $($sample.id), Status: $($sample.status), Date: $($sample.date)" -ForegroundColor DarkGray
    }
    
} catch {
    Write-Host "❌ Active jobs filter failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Test vehicle data for correlation..." -ForegroundColor Cyan
try {
    $vehicles = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/vehicles" -Method GET -TimeoutSec 10
    
    Write-Host "Vehicle data:" -ForegroundColor Yellow
    Write-Host "  Count: $($vehicles.count)" -ForegroundColor Gray
    
    if ($vehicles.data -and $vehicles.data.Count -gt 0) {
        Write-Host "  Sample vehicles:" -ForegroundColor Gray
        $vehicles.data[0..2] | ForEach-Object {
            Write-Host "    $($_.name) (ID: $($_.id))" -ForegroundColor DarkGray
        }
        
        # Extract vehicle numbers for correlation analysis
        Write-Host ""
        Write-Host "  Vehicle number extraction test:" -ForegroundColor Gray
        $vehicles.data[0..4] | ForEach-Object {
            $name = $_.name
            $number = $null
            
            # Test extraction patterns
            if ($name -match "(?:Truck|Vehicle)\s*[_-]?\s*(\d+)") { $number = $matches[1] }
            elseif ($name -match "^(\d+)$") { $number = $matches[1] }
            elseif ($name -match "(\d+)$") { $number = $matches[1] }
            
            Write-Host "    '$name' -> Number: $number" -ForegroundColor DarkGray
        }
    }
    
} catch {
    Write-Host "❌ Vehicle data test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 DIAGNOSTIC SUMMARY:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Gray
Write-Host "1. Check if we have current (2025) jobs" -ForegroundColor White
Write-Host "2. Verify truck/route assignments are populated" -ForegroundColor White
Write-Host "3. Confirm job status filtering logic" -ForegroundColor White
Write-Host "4. Test vehicle number extraction patterns" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Based on results above, we can identify why correlation fails:" -ForegroundColor Cyan
Write-Host "- If no 2025 jobs: Database contains only historical data" -ForegroundColor Gray
Write-Host "- If no truck assignments: Field mapping issue" -ForegroundColor Gray
Write-Host "- If no route assignments: Need route-based correlation" -ForegroundColor Gray
Write-Host "- If wrong status filtering: Adjust active job detection" -ForegroundColor Gray

Write-Host ""
Write-Host "FileMaker diagnostic complete!" -ForegroundColor Green
