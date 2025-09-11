# DispatchTracker: FileMaker Truck Assignment Investigation
# Test the actual FileMaker field names for truck assignments

Write-Host "🔍 Investigating FileMaker truck assignment fields..." -ForegroundColor Cyan

Set-Location "C:\Projects\DispatchTracker"

Write-Host "Testing FileMaker field access..." -ForegroundColor Yellow

# Test the raw FileMaker response to see actual field names
$testBody = @{
    testFieldAccess = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/jobs" -Method POST -Body $testBody -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "FileMaker Field Test Results:" -ForegroundColor Green
    Write-Host "Raw field keys found:" -ForegroundColor Cyan
    $response.raw_field_keys | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    
    Write-Host ""
    Write-Host "Truck ID field status:" -ForegroundColor Cyan
    Write-Host "  *kf*trucks_id: $($response.field_status.original_fields.trucks_id)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Sample job data:" -ForegroundColor Cyan
    Write-Host "  Job ID: $($response.field_status.sample_data.job_id)" -ForegroundColor Gray
    Write-Host "  Truck ID: $($response.field_status.sample_data.truck_id)" -ForegroundColor Gray
    Write-Host "  Customer: $($response.field_status.sample_data.customer)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ FileMaker test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying direct jobs API..." -ForegroundColor Yellow
    
    try {
        $jobsResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/jobs?active=true&limit=3" -Method GET -TimeoutSec 15
        
        Write-Host "Direct jobs API response:" -ForegroundColor Green
        $jobsResponse.data | ForEach-Object {
            Write-Host "  Job $($_.id): truckId='$($_.truckId)', customer='$($_.customer)'" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Direct jobs API also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Investigation complete!" -ForegroundColor Green
