# DispatchTracker: Route-Based Correlation Implementation
# Fix for missing truck assignments

Write-Host "Implementing route-based vehicle-job correlation fix..." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Gray

Set-Location "C:\Projects\DispatchTracker"

# Step 1: Backup current route correlation file
Write-Host "Step 1: Backing up current route correlation..." -ForegroundColor Cyan
if (Test-Path "lib\route-correlation.ts") {
    Copy-Item "lib\route-correlation.ts" "lib\route-correlation.ts.backup"
    Write-Host "Current route correlation backed up" -ForegroundColor Green
} else {
    Write-Host "Route correlation file not found - will create new" -ForegroundColor Yellow
}

# Step 2: Test current correlation status
Write-Host ""
Write-Host "Step 2: Testing current correlation results..." -ForegroundColor Cyan
try {
    $currentResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/tracking" -Method GET -TimeoutSec 15
    
    Write-Host "Current Status:" -ForegroundColor Yellow
    Write-Host "  Total Vehicles: $($currentResponse.summary.totalVehicles)" -ForegroundColor Gray
    Write-Host "  Vehicles with Jobs: $($currentResponse.summary.vehiclesWithJobs)" -ForegroundColor Gray
    Write-Host "  Vehicles with Routes: $($currentResponse.summary.routeMetrics.vehiclesWithRoutes)" -ForegroundColor Gray
    Write-Host "  Active Routes: $($currentResponse.summary.routeMetrics.totalRoutes)" -ForegroundColor Gray
    
    if ($currentResponse.summary.vehiclesWithJobs -eq 0) {
        Write-Host "CONFIRMED: Zero vehicle-job correlations - implementing fix" -ForegroundColor Red
    }
} catch {
    Write-Host "Could not test current status: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 3: Create enhanced route correlation implementation
Write-Host ""
Write-Host "Step 3: Creating enhanced route correlation file..." -ForegroundColor Cyan

# The enhanced implementation will be added manually
Write-Host "Enhanced route correlation logic ready for implementation" -ForegroundColor Green

# Step 4: Test the fix
Write-Host ""
Write-Host "Step 4: Ready to test enhanced correlation..." -ForegroundColor Cyan
Write-Host "Manual steps required:" -ForegroundColor Yellow
Write-Host "  1. Replace lib/route-correlation.ts with enhanced version" -ForegroundColor Gray
Write-Host "  2. Test with: npm run build" -ForegroundColor Gray
Write-Host "  3. Test with: npm run dev" -ForegroundColor Gray
Write-Host "  4. Verify: curl http://localhost:3002/api/tracking" -ForegroundColor Gray

# Step 5: Deployment preparation
Write-Host ""
Write-Host "Step 5: Deployment checklist..." -ForegroundColor Cyan
Write-Host "After testing locally:" -ForegroundColor Yellow
Write-Host "  1. git add . && git commit -m 'Fix: Enhanced route-based correlation'" -ForegroundColor Gray
Write-Host "  2. npx vercel --prod" -ForegroundColor Gray
Write-Host "  3. Test production: https://www.pepmovetracker.info/api/tracking" -ForegroundColor Gray

Write-Host ""
Write-Host "Route-based correlation fix ready for implementation!" -ForegroundColor Green
