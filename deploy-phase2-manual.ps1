# DispatchTracker Phase 2: Manual Deployment Steps
# Simple step-by-step approach for live data integration

Write-Host "🎯 DispatchTracker Phase 2: Manual Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Gray
Write-Host ""

# Set location
Set-Location "C:\Projects\DispatchTracker"

# Step 1: Backup current state
Write-Host "📦 Step 1: Backup current state..." -ForegroundColor Cyan
git add .
git commit -m "Phase 1 Complete: Ready for Phase 2 transition"
git tag phase-1-complete
Write-Host "✅ Backup complete" -ForegroundColor Green
Write-Host ""

# Step 2: Apply live-only tracking route
Write-Host "🚀 Step 2: Apply live-only tracking route..." -ForegroundColor Cyan
Copy-Item "app\api\tracking\route.ts" "app\api\tracking\route.ts.phase1.backup"
Copy-Item "app\api\tracking\route.ts.phase2" "app\api\tracking\route.ts"
Write-Host "✅ Live-only route applied" -ForegroundColor Green
Write-Host ""

# Step 3: Test build
Write-Host "🔨 Step 3: Test TypeScript build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed - rolling back..." -ForegroundColor Red
    Copy-Item "app\api\tracking\route.ts.phase1.backup" "app\api\tracking\route.ts"
    Write-Host "Rollback complete. Please fix errors and try again." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 4: Test locally
Write-Host "⚡ Step 4: Test locally..." -ForegroundColor Cyan
Write-Host "Starting dev server in background..." -ForegroundColor Yellow
$devProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru

Write-Host "Waiting 10 seconds for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Testing tracking endpoint..." -ForegroundColor Yellow
try {
    $testResult = Invoke-RestMethod -Uri "http://localhost:3002/api/tracking" -Method GET -TimeoutSec 15
    
    Write-Host "API Response Summary:" -ForegroundColor Cyan
    Write-Host "  Success: $($testResult.success)" -ForegroundColor Gray
    Write-Host "  Vehicles: $($testResult.summary.totalVehicles)" -ForegroundColor Gray
    Write-Host "  Fallback Used: $($testResult.debug.fallbackDataUsed)" -ForegroundColor Gray
    
    if ($testResult.debug.fallbackDataUsed -eq $false) {
        Write-Host "🎉 SUCCESS: Live data mode activated!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Still using fallback data" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Local test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Stop dev server
Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host ""

# Step 5: Deploy to production
Write-Host "🌐 Step 5: Deploy to production..." -ForegroundColor Cyan
$deploy = Read-Host "Deploy to production now? (y/N)"

if ($deploy -eq 'y' -or $deploy -eq 'Y') {
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "Phase 2: Live data integration - removed emergency fallback"
    
    Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
    npx vercel --prod
    
    Write-Host "✅ Deployment initiated" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Waiting 30 seconds for propagation..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host "Testing production..." -ForegroundColor Yellow
    try {
        $prodResult = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/tracking" -Method GET -TimeoutSec 30
        
        Write-Host "Production Test Results:" -ForegroundColor Cyan
        Write-Host "  Success: $($prodResult.success)" -ForegroundColor Gray
        Write-Host "  Vehicles: $($prodResult.summary.totalVehicles)" -ForegroundColor Gray
        Write-Host "  Fallback Used: $($prodResult.debug.fallbackDataUsed)" -ForegroundColor Gray
        Write-Host "  Processing Time: $($prodResult.debug.processingTime)ms" -ForegroundColor Gray
        
        if ($prodResult.debug.fallbackDataUsed -eq $false -and $prodResult.summary.totalVehicles -gt 0) {
            Write-Host "🎉 PHASE 2 SUCCESS: Live fleet tracking operational!" -ForegroundColor Green
            git tag phase-2-complete
        } else {
            Write-Host "⚠️ Phase 2 incomplete - may need debugging" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Production test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Deployment skipped. To deploy later:" -ForegroundColor Yellow
    Write-Host "  git add . && git commit -m 'Phase 2 ready' && npx vercel --prod" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 Rollback Commands (if needed):" -ForegroundColor Cyan
Write-Host "  Quick: Copy-Item 'app\api\tracking\route.ts.phase1.backup' 'app\api\tracking\route.ts'" -ForegroundColor Gray
Write-Host "  Git: git checkout phase-1-complete" -ForegroundColor Gray

Write-Host ""
Write-Host "🎯 Production URL: https://www.pepmovetracker.info" -ForegroundColor Green
Write-Host "Manual deployment complete!" -ForegroundColor Green
