# DispatchTracker: Production Live Data Verification

Write-Host "Testing Production Live Data Integration..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Gray

# Test the correct production URL from the deployment output
$productionUrl = "https://dispatch-tracker-94sawjw6v-trevor-bates-projects.vercel.app/api/tracking"

try {
    Write-Host "Fetching production tracking data..." -ForegroundColor Yellow
    $prodResponse = Invoke-RestMethod -Uri $productionUrl -Method GET -TimeoutSec 30
    
    Write-Host "Production API Response:" -ForegroundColor Green
    Write-Host "  Success: $($prodResponse.success)" -ForegroundColor Gray
    Write-Host "  Total Vehicles: $($prodResponse.summary.totalVehicles)" -ForegroundColor Gray
    Write-Host "  Vehicles with Jobs: $($prodResponse.summary.vehiclesWithJobs)" -ForegroundColor Gray
    Write-Host "  Fallback Data Used: $($prodResponse.debug.fallbackDataUsed)" -ForegroundColor Gray
    Write-Host "  Samsara Working: $($prodResponse.debug.apiHealth.samsaraWorking)" -ForegroundColor Gray
    Write-Host "  FileMaker Working: $($prodResponse.debug.apiHealth.filemakerWorking)" -ForegroundColor Gray
    Write-Host "  Processing Time: $($prodResponse.debug.processingTime)ms" -ForegroundColor Gray
    
    if ($prodResponse.debug.fallbackDataUsed -eq $false) {
        Write-Host "SUCCESS: Production using live data only!" -ForegroundColor Green
    } else {
        Write-Host "Production still using fallback data" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Sample Vehicle Data:" -ForegroundColor Cyan
    $prodResponse.data[0..2] | ForEach-Object {
        $jobCustomer = if ($_.assignedJob) { $_.assignedJob.customer } else { "No Job" }
        Write-Host "  $($_.vehicleName): Location=$($_.vehicleLocation.lat),$($_.vehicleLocation.lng), Job=$jobCustomer" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Production test failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try the alternative production URL
    Write-Host "Trying alternative production URL..." -ForegroundColor Yellow
    try {
        $altUrl = "https://www.pepmovetracker.info/api/tracking"
        $altResponse = Invoke-RestMethod -Uri $altUrl -Method GET -TimeoutSec 30
        
        Write-Host "Alternative URL worked:" -ForegroundColor Green
        Write-Host "  Success: $($altResponse.success)" -ForegroundColor Gray
        Write-Host "  Total Vehicles: $($altResponse.summary.totalVehicles)" -ForegroundColor Gray
        Write-Host "  Fallback Data Used: $($altResponse.debug.fallbackDataUsed)" -ForegroundColor Gray
        
    } catch {
        Write-Host "Alternative URL also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Production verification complete!" -ForegroundColor Green
