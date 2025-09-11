# Quick test to see if dev server is running and investigate truck assignments

Write-Host "Testing local development server..." -ForegroundColor Cyan

# First check if dev server is running
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3002/api/vehicles" -Method GET -TimeoutSec 5
    Write-Host "Dev server is running" -ForegroundColor Green
    
    # Test jobs API with simple URL
    $jobsUrl = "http://localhost:3002/api/jobs"
    $jobsResponse = Invoke-RestMethod -Uri $jobsUrl -Method GET -TimeoutSec 10
    
    Write-Host "Jobs API Response:" -ForegroundColor Green
    Write-Host "  Success: $($jobsResponse.success)" -ForegroundColor Gray
    Write-Host "  Job Count: $($jobsResponse.count)" -ForegroundColor Gray
    
    # Show first few jobs to see truck assignments
    Write-Host ""
    Write-Host "First 3 jobs:" -ForegroundColor Cyan
    $jobsResponse.data[0..2] | ForEach-Object {
        Write-Host "  Job $($_.id): truckId='$($_.truckId)', customer='$($_.customer)'" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Dev server not running: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Start dev server with: npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Local test complete!" -ForegroundColor Green
