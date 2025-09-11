# DispatchTracker Phase 2: Live Data Integration Deployment
# Removes emergency fallback and enables live-only operation

Write-Host "🎯 DispatchTracker Phase 2: Live Data Integration Deployment" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Gray
Write-Host "Transitioning from emergency fallback to live API integration" -ForegroundColor Yellow
Write-Host ""

# Set execution policy and change to project directory
Set-Location "C:\Projects\DispatchTracker"

# Step 1: Backup current working state
Write-Host "📦 Step 1: Creating Phase 1 backup..." -ForegroundColor Cyan

git add .
git commit -m "Phase 1 Complete: Emergency fallback working, ready for live data transition"
git tag phase-1-complete

Write-Host "✅ Phase 1 state backed up with tag 'phase-1-complete'" -ForegroundColor Green

# Step 2: Pre-deployment validation
Write-Host ""
Write-Host "🔍 Step 2: Pre-deployment API validation..." -ForegroundColor Cyan

# Test individual API endpoints
Write-Host "Testing Samsara vehicles API..." -ForegroundColor Yellow
try {
    $vehiclesTest = Invoke-RestMethod -Uri "http://localhost:3002/api/vehicles" -Method GET -TimeoutSec 10
    if ($vehiclesTest.success) {
        Write-Host "✅ Vehicles API: $($vehiclesTest.count) vehicles" -ForegroundColor Green
    } else {
        Write-Host "❌ Vehicles API failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Vehicles API connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Testing FileMaker jobs API..." -ForegroundColor Yellow
try {
    $jobsTest = Invoke-RestMethod -Uri "http://localhost:3002/api/jobs?active=true&limit=5" -Method GET -TimeoutSec 10
    if ($jobsTest.success) {
        Write-Host "✅ Jobs API: $($jobsTest.count) jobs" -ForegroundColor Green
    } else {
        Write-Host "❌ Jobs API failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Jobs API connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Testing current tracking API (should show fallback)..." -ForegroundColor Yellow
try {
    $trackingTest = Invoke-RestMethod -Uri "http://localhost:3002/api/tracking" -Method GET -TimeoutSec 15
    if ($trackingTest.debug.fallbackDataUsed) {
        Write-Host "✅ Currently using fallback data - ready for transition" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Already using live data or API failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Tracking API connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Deploy live-only tracking route
Write-Host ""
Write-Host "🚀 Step 3: Deploying live-only tracking route..." -ForegroundColor Cyan

# Create backup of current tracking route
Copy-Item "app\api\tracking\route.ts" "app\api\tracking\route.ts.phase1.backup"
Write-Host "✅ Current tracking route backed up" -ForegroundColor Green

# Apply the new live-only tracking route
Copy-Item "app\api\tracking\route.ts.phase2" "app\api\tracking\route.ts"
Write-Host "✅ Live-only tracking route deployed" -ForegroundColor Green

# Step 4: Build and test
Write-Host ""
Write-Host "🔨 Step 4: Building and testing..." -ForegroundColor Cyan

# Run TypeScript compilation check
Write-Host "Checking TypeScript compilation..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript compilation failed:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    Write-Host "Rolling back to Phase 1..." -ForegroundColor Yellow
    Copy-Item "app\api\tracking\route.ts.phase1.backup" "app\api\tracking\route.ts"
    Write-Host "Rollback complete. Please fix TypeScript errors before proceeding." -ForegroundColor Red
    exit 1
}

# Start development server for testing
Write-Host "Starting development server for testing..." -ForegroundColor Yellow
$devProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Live data validation
Write-Host ""
Write-Host "✅ Step 5: Live data validation..." -ForegroundColor Cyan

Write-Host "Testing live tracking endpoint..." -ForegroundColor Yellow
try {
    $liveTrackingTest = Invoke-RestMethod -Uri "http://localhost:3002/api/tracking" -Method GET -TimeoutSec 20
    
    if ($liveTrackingTest.success) {
        Write-Host "✅ Live tracking API working" -ForegroundColor Green
        Write-Host "   Vehicles: $($liveTrackingTest.summary.totalVehicles)" -ForegroundColor Gray
        Write-Host "   With Jobs: $($liveTrackingTest.summary.vehiclesWithJobs)" -ForegroundColor Gray
        Write-Host "   Fallback Used: $($liveTrackingTest.debug.fallbackDataUsed)" -ForegroundColor Gray
        Write-Host "   Samsara Working: $($liveTrackingTest.debug.apiHealth.samsaraWorking)" -ForegroundColor Gray
        Write-Host "   FileMaker Working: $($liveTrackingTest.debug.apiHealth.filemakerWorking)" -ForegroundColor Gray
        
        if ($liveTrackingTest.debug.fallbackDataUsed -eq $false -and $liveTrackingTest.summary.totalVehicles -gt 0) {
            Write-Host "🎉 SUCCESS: Using live data only!" -ForegroundColor Green
        } elseif ($liveTrackingTest.debug.fallbackDataUsed -eq $false -and $liveTrackingTest.summary.totalVehicles -eq 0) {
            Write-Host "⚠️ Live mode active but no vehicles found" -ForegroundColor Yellow
        } else {
            Write-Host "⚠️ Still using fallback data" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Live tracking API failed:" -ForegroundColor Red
        Write-Host $liveTrackingTest.error -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Live tracking test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Stop the development server
Write-Host "Stopping development server..." -ForegroundColor Yellow
Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue

# Step 6: User confirmation for production deployment
Write-Host ""
Write-Host "🌐 Step 6: Production deployment confirmation..." -ForegroundColor Cyan

$continue = Read-Host "Deploy to production? (y/N)"
if ($continue -ne 'y' -and $continue -ne 'Y') {
    Write-Host "Deployment cancelled. To rollback changes:" -ForegroundColor Yellow
    Write-Host "Copy-Item 'app\api\tracking\route.ts.phase1.backup' 'app\api\tracking\route.ts'" -ForegroundColor Gray
    exit 0
}

Write-Host "Committing Phase 2 changes..." -ForegroundColor Yellow
git add .
git commit -m "Phase 2: Live data integration - removed emergency fallback"

Write-Host "Deploying to Vercel production..." -ForegroundColor Yellow
npx vercel --prod

Write-Host "✅ Deployment initiated" -ForegroundColor Green

# Step 7: Production validation
Write-Host ""
Write-Host "🔍 Step 7: Production validation..." -ForegroundColor Cyan

Write-Host "Waiting for deployment to propagate..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "Testing production endpoint..." -ForegroundColor Yellow
try {
    $prodTest = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/tracking" -Method GET -TimeoutSec 30
    
    if ($prodTest.success) {
        Write-Host "✅ Production deployment successful" -ForegroundColor Green
        Write-Host "   Live vehicles: $($prodTest.summary.totalVehicles)" -ForegroundColor Gray
        Write-Host "   API health: Samsara=$($prodTest.debug.apiHealth.samsaraWorking), FileMaker=$($prodTest.debug.apiHealth.filemakerWorking)" -ForegroundColor Gray
        Write-Host "   Fallback used: $($prodTest.debug.fallbackDataUsed)" -ForegroundColor Gray
        Write-Host "   Processing time: $($prodTest.debug.processingTime)ms" -ForegroundColor Gray
        
        if ($prodTest.debug.fallbackDataUsed -eq $false -and $prodTest.summary.totalVehicles -gt 0) {
            Write-Host "🎉 PHASE 2 SUCCESS: Live fleet tracking operational!" -ForegroundColor Green
            git tag phase-2-complete
            Write-Host "✅ Tagged as 'phase-2-complete'" -ForegroundColor Green
        } elseif ($prodTest.debug.fallbackDataUsed -eq $false -and $prodTest.summary.totalVehicles -eq 0) {
            Write-Host "⚠️ Live mode active but no data - check API connectivity" -ForegroundColor Yellow
        } else {
            Write-Host "⚠️ Live data not fully operational" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Production deployment failed" -ForegroundColor Red
        Write-Host "Error: $($prodTest.error)" -ForegroundColor Red
        Write-Host "Consider rolling back to phase-1-complete" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Production test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Consider rolling back to phase-1-complete" -ForegroundColor Yellow
}

# Step 8: Summary and next steps
Write-Host ""
Write-Host "📊 Phase 2 Deployment Summary:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Gray

if ($prodTest -and $prodTest.success -and $prodTest.debug.fallbackDataUsed -eq $false) {
    Write-Host "🎯 STATUS: PHASE 2 COMPLETE" -ForegroundColor Green
    Write-Host "✅ Emergency fallback removed" -ForegroundColor Green
    Write-Host "✅ Live API integration operational" -ForegroundColor Green
    Write-Host "✅ Production deployment successful" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🚀 Ready for Phase 3 enhancements:" -ForegroundColor Yellow
    Write-Host "   - Enhanced vehicle detail cards with flip animations" -ForegroundColor Gray
    Write-Host "   - Advanced schedule hygiene monitoring" -ForegroundColor Gray
    Write-Host "   - Performance optimization and caching" -ForegroundColor Gray
    Write-Host "   - Real dispatcher workflow validation" -ForegroundColor Gray
    Write-Host "   - Mobile optimization for field supervisors" -ForegroundColor Gray
    
} else {
    Write-Host "⚠️ STATUS: PHASE 2 INCOMPLETE" -ForegroundColor Yellow
    Write-Host "Issues detected - manual review required" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "🔧 Next actions:" -ForegroundColor Yellow
    Write-Host "   1. Debug API connectivity issues" -ForegroundColor Gray
    Write-Host "   2. Verify Samsara and FileMaker credentials" -ForegroundColor Gray
    Write-Host "   3. Check production network access" -ForegroundColor Gray
    Write-Host "   4. Test individual API endpoints manually" -ForegroundColor Gray
    Write-Host "   5. Consider temporary rollback if needed" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 Management commands:" -ForegroundColor Cyan
Write-Host "Rollback to Phase 1: git checkout phase-1-complete" -ForegroundColor Gray
Write-Host "Quick rollback: Copy-Item 'app\api\tracking\route.ts.phase1.backup' 'app\api\tracking\route.ts'" -ForegroundColor Gray
Write-Host "View logs: npm run dev (then check console)" -ForegroundColor Gray

Write-Host ""
Write-Host "🎯 Production URLs:" -ForegroundColor Green
Write-Host "Dashboard: https://www.pepmovetracker.info" -ForegroundColor Gray
Write-Host "API Health: https://www.pepmovetracker.info/api/tracking" -ForegroundColor Gray

Write-Host ""
Write-Host "Phase 2 deployment complete!" -ForegroundColor Green
