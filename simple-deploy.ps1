# DispatchTracker Phase 2: Simple Deployment
Write-Host "DispatchTracker Phase 2: Live Data Integration" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Gray

Set-Location "C:\Projects\DispatchTracker"

# Step 1: Backup
Write-Host "Step 1: Creating backup..." -ForegroundColor Cyan
git add .
git commit -m "Phase 1 Complete - Ready for Phase 2"
git tag phase-1-complete
Write-Host "Backup complete" -ForegroundColor Green

# Step 2: Apply live route
Write-Host "Step 2: Applying live-only route..." -ForegroundColor Cyan
Copy-Item "app\api\tracking\route.ts" "app\api\tracking\route.ts.backup"
Copy-Item "app\api\tracking\route.ts.phase2" "app\api\tracking\route.ts"
Write-Host "Live route applied" -ForegroundColor Green

# Step 3: Test build
Write-Host "Step 3: Testing build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful" -ForegroundColor Green
} else {
    Write-Host "Build failed - rolling back" -ForegroundColor Red
    Copy-Item "app\api\tracking\route.ts.backup" "app\api\tracking\route.ts"
    exit 1
}

# Step 4: Ready for deployment
Write-Host "Step 4: Ready for deployment" -ForegroundColor Cyan
$deploy = Read-Host "Deploy to production? (y/N)"

if ($deploy -eq 'y') {
    Write-Host "Deploying..." -ForegroundColor Yellow
    git add .
    git commit -m "Phase 2: Live data integration"
    npx vercel --prod
    Write-Host "Deployment complete!" -ForegroundColor Green
} else {
    Write-Host "Deployment skipped" -ForegroundColor Yellow
}

Write-Host "Phase 2 script complete!" -ForegroundColor Green
