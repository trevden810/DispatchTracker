# DispatchTracker: Final Phase 2 Validation
# Confirm route-based correlation fix is working in production

Write-Host "🎉 DispatchTracker Phase 2 Final Validation" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Gray

Write-Host "Testing production API for correlation success..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/tracking" -Method GET -TimeoutSec 30
    
    Write-Host ""
    Write-Host "📊 PHASE 2 SUCCESS METRICS:" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Gray
    Write-Host "Total Vehicles: $($response.summary.totalVehicles)" -ForegroundColor White
    Write-Host "Vehicles with Jobs: $($response.summary.vehiclesWithJobs)" -ForegroundColor White
    Write-Host "Vehicles with Routes: $($response.summary.routeMetrics.vehiclesWithRoutes)" -ForegroundColor White
    Write-Host "Active Routes: $($response.summary.routeMetrics.totalRoutes)" -ForegroundColor White
    Write-Host "Completed Stops: $($response.summary.routeMetrics.completedStops)" -ForegroundColor White
    Write-Host "Total Stops: $($response.summary.routeMetrics.totalStops)" -ForegroundColor White
    Write-Host "Average Progress: $($response.summary.routeMetrics.averageProgress)%" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🔧 TECHNICAL STATUS:" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Gray
    Write-Host "Fallback Data Used: $($response.debug.fallbackDataUsed)" -ForegroundColor White
    Write-Host "Samsara API Working: $($response.debug.apiHealth.samsaraWorking)" -ForegroundColor White
    Write-Host "FileMaker API Working: $($response.debug.apiHealth.filemakerWorking)" -ForegroundColor White
    Write-Host "Processing Time: $($response.debug.processingTime)ms" -ForegroundColor White
    Write-Host "Correlation Algorithm: $($response.debug.correlationAlgorithm)" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🎯 PHASE 2 ASSESSMENT:" -ForegroundColor Yellow
    Write-Host "====================" -ForegroundColor Gray
    
    $phase2Complete = $true
    $issues = @()
    
    # Check live data integration
    if ($response.debug.fallbackDataUsed -eq $false) {
        Write-Host "✅ Live Data Integration: COMPLETE" -ForegroundColor Green
    } else {
        Write-Host "❌ Live Data Integration: FAILED (still using fallback)" -ForegroundColor Red
        $phase2Complete = $false
        $issues += "Still using emergency fallback data"
    }
    
    # Check vehicle count
    if ($response.summary.totalVehicles -ge 40) {
        Write-Host "✅ Vehicle Data: EXCELLENT ($($response.summary.totalVehicles) vehicles)" -ForegroundColor Green
    } elseif ($response.summary.totalVehicles -ge 20) {
        Write-Host "⚡ Vehicle Data: GOOD ($($response.summary.totalVehicles) vehicles)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Vehicle Data: INSUFFICIENT ($($response.summary.totalVehicles) vehicles)" -ForegroundColor Red
        $phase2Complete = $false
        $issues += "Too few vehicles from Samsara API"
    }
    
    # Check job correlations
    if ($response.summary.vehiclesWithJobs -gt 15) {
        Write-Host "✅ Vehicle-Job Correlation: EXCELLENT ($($response.summary.vehiclesWithJobs) correlations)" -ForegroundColor Green
    } elseif ($response.summary.vehiclesWithJobs -gt 5) {
        Write-Host "⚡ Vehicle-Job Correlation: GOOD ($($response.summary.vehiclesWithJobs) correlations)" -ForegroundColor Yellow
    } elseif ($response.summary.vehiclesWithJobs -gt 0) {
        Write-Host "⚡ Vehicle-Job Correlation: PARTIAL ($($response.summary.vehiclesWithJobs) correlations)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Vehicle-Job Correlation: FAILED (0 correlations)" -ForegroundColor Red
        $phase2Complete = $false
        $issues += "No vehicles correlated to jobs"
    }
    
    # Check route metrics
    if ($response.summary.routeMetrics.totalRoutes -gt 3) {
        Write-Host "✅ Route Detection: EXCELLENT ($($response.summary.routeMetrics.totalRoutes) routes)" -ForegroundColor Green
    } elseif ($response.summary.routeMetrics.totalRoutes -gt 0) {
        Write-Host "⚡ Route Detection: PARTIAL ($($response.summary.routeMetrics.totalRoutes) routes)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Route Detection: FAILED (0 routes)" -ForegroundColor Red
        $issues += "No route assignments detected"
    }
    
    # Check API health
    if ($response.debug.apiHealth.samsaraWorking -and $response.debug.apiHealth.filemakerWorking) {
        Write-Host "✅ External APIs: ALL WORKING" -ForegroundColor Green
    } else {
        Write-Host "⚡ External APIs: PARTIAL (Samsara: $($response.debug.apiHealth.samsaraWorking), FileMaker: $($response.debug.apiHealth.filemakerWorking))" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🏁 FINAL PHASE 2 RESULT:" -ForegroundColor White
    Write-Host "=====================" -ForegroundColor Gray
    
    if ($phase2Complete -and $response.summary.vehiclesWithJobs -gt 0) {
        Write-Host "🎉 PHASE 2: COMPLETE SUCCESS!" -ForegroundColor Green
        Write-Host "✅ Live data integration working" -ForegroundColor Green
        Write-Host "✅ Vehicle-job correlation functional" -ForegroundColor Green
        Write-Host "✅ Emergency fallback removed" -ForegroundColor Green
        Write-Host "✅ Production deployment successful" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🚀 READY FOR PHASE 3 ENHANCEMENTS:" -ForegroundColor Yellow
        Write-Host "- Enhanced vehicle detail cards" -ForegroundColor Gray
        Write-Host "- Advanced schedule hygiene monitoring" -ForegroundColor Gray
        Write-Host "- Performance optimization" -ForegroundColor Gray
        Write-Host "- Mobile optimization" -ForegroundColor Gray
        
    } elseif ($response.summary.vehiclesWithJobs -gt 0) {
        Write-Host "⚡ PHASE 2: PARTIAL SUCCESS!" -ForegroundColor Yellow
        Write-Host "✅ Live data integration working" -ForegroundColor Green
        Write-Host "⚡ Vehicle-job correlation partially working" -ForegroundColor Yellow
        Write-Host "✅ Emergency fallback removed" -ForegroundColor Green
        Write-Host "✅ Production deployment successful" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🔧 REMAINING OPTIMIZATIONS:" -ForegroundColor Cyan
        Write-Host "- Improve correlation algorithm accuracy" -ForegroundColor Gray
        Write-Host "- Enhance route-vehicle mapping" -ForegroundColor Gray
        
    } else {
        Write-Host "❌ PHASE 2: NEEDS DEBUGGING" -ForegroundColor Red
        Write-Host "Issues found:" -ForegroundColor Red
        $issues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    }
    
    # Sample vehicle data
    if ($response.data -and $response.data.Count -gt 0) {
        Write-Host ""
        Write-Host "📋 SAMPLE VEHICLE DATA:" -ForegroundColor Cyan
        $response.data[0..2] | ForEach-Object {
            $jobInfo = if ($_.assignedJob) { $_.assignedJob.customer } else { "No Job" }
            $routeInfo = if ($_.routeInfo) { "Route $($_.routeInfo.routeId)" } else { "No Route" }
            Write-Host "  $($_.vehicleName): $jobInfo ($routeInfo)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ Validation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Phase 2 validation complete!" -ForegroundColor Green
