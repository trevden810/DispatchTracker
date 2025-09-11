# DispatchTracker: Production Deployment (PowerShell Compatible)

Write-Host "Deploying route-based correlation fix to production..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Gray

Set-Location "C:\Projects\DispatchTracker"

# Step 1: Check git status
Write-Host "Step 1: Checking git status..." -ForegroundColor Cyan
git status

# Step 2: Add all changes
Write-Host ""
Write-Host "Step 2: Adding changes to git..." -ForegroundColor Cyan
git add .

# Step 3: Commit changes
Write-Host ""
Write-Host "Step 3: Committing changes..." -ForegroundColor Cyan
git commit -m "Fix: Enhanced route-based vehicle-job correlation"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️ Commit failed or no changes to commit" -ForegroundColor Yellow
}

# Step 4: Deploy to production
Write-Host ""
Write-Host "Step 4: Deploying to Vercel production..." -ForegroundColor Cyan
npx vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment initiated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Step 5: Wait and test
Write-Host ""
Write-Host "Step 5: Waiting for deployment to propagate..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host "Testing production deployment..." -ForegroundColor Yellow
try {
    $prodTest = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/tracking" -Method GET -TimeoutSec 30
    
    Write-Host "Production Test Results:" -ForegroundColor Green
    Write-Host "  Success: $($prodTest.success)" -ForegroundColor Gray
    Write-Host "  Total Vehicles: $($prodTest.summary.totalVehicles)" -ForegroundColor Gray
    Write-Host "  Vehicles with Jobs: $($prodTest.summary.vehiclesWithJobs)" -ForegroundColor Gray
    Write-Host "  Vehicles with Routes: $($prodTest.summary.routeMetrics.vehiclesWithRoutes)" -ForegroundColor Gray
    Write-Host "  Fallback Data Used: $($prodTest.debug.fallbackDataUsed)" -ForegroundColor Gray
    
    if ($prodTest.summary.vehiclesWithJobs -gt 0) {
        Write-Host "🎉 SUCCESS: Vehicle-job correlation working!" -ForegroundColor Green
        git tag route-correlation-fix
        Write-Host "✅ Tagged as 'route-correlation-fix'" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Still no vehicle-job correlations - may need debugging" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Production test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
