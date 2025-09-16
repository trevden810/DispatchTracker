# DispatchTracker: FileMaker Production Debug
# Diagnose why FileMaker API fails in production but works locally

Write-Host "🔍 FileMaker API Production Debugging" -ForegroundColor Red
Write-Host "====================================" -ForegroundColor Gray

Write-Host "Issue: FileMaker API works locally but fails in production" -ForegroundColor Yellow
Write-Host "Impact: 0 vehicle-job correlations despite 50 vehicles from Samsara" -ForegroundColor Yellow

Write-Host ""
Write-Host "Step 1: Test local FileMaker API..." -ForegroundColor Cyan
try {
    $localJobs = Invoke-RestMethod -Uri "http://localhost:3002/api/jobs?limit=5" -Method GET -TimeoutSec 10
    Write-Host "✅ Local FileMaker API: Working ($($localJobs.count) jobs)" -ForegroundColor Green
} catch {
    Write-Host "❌ Local FileMaker API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 2: Test production FileMaker API directly..." -ForegroundColor Cyan
try {
    $prodJobs = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/jobs?limit=5" -Method GET -TimeoutSec 15
    Write-Host "✅ Production FileMaker API: Working ($($prodJobs.count) jobs)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Sample job data from production:" -ForegroundColor Green
    $prodJobs.data[0..2] | ForEach-Object {
        Write-Host "  Job $($_.id): Customer='$($_.customer)', RouteId='$($_.routeId)'" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Production FileMaker API: Failed - $($_.Exception.Message)" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "🔧 LIKELY CAUSES:" -ForegroundColor Yellow
    Write-Host "1. Environment variables not set in Vercel production" -ForegroundColor Gray
    Write-Host "2. Network restrictions (Vercel → FileMaker server)" -ForegroundColor Gray
    Write-Host "3. FileMaker server blocking Vercel IP addresses" -ForegroundColor Gray
    Write-Host "4. Different base URL needed for production" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 3: Test production vehicle API..." -ForegroundColor Cyan
try {
    $prodVehicles = Invoke-RestMethod -Uri "https://www.pepmovetracker.info/api/vehicles" -Method GET -TimeoutSec 10
    Write-Host "✅ Production Samsara API: Working ($($prodVehicles.count) vehicles)" -ForegroundColor Green
} catch {
    Write-Host "❌ Production Samsara API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 TROUBLESHOOTING RECOMMENDATIONS:" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Gray

Write-Host ""
Write-Host "If FileMaker API works locally but fails in production:" -ForegroundColor Cyan
Write-Host "1. Check Vercel environment variables:" -ForegroundColor Gray
Write-Host "   - FILEMAKER_USERNAME" -ForegroundColor Gray
Write-Host "   - FILEMAKER_PASSWORD" -ForegroundColor Gray
Write-Host "   - FILEMAKER_BASE_URL" -ForegroundColor Gray

Write-Host ""
Write-Host "2. Test FileMaker server accessibility:" -ForegroundColor Gray
Write-Host "   curl -X POST 'https://modd.mainspringhost.com/fmi/data/vLatest/databases/PEP2_1/sessions'" -ForegroundColor Gray

Write-Host ""
Write-Host "3. Check Vercel deployment logs:" -ForegroundColor Gray
Write-Host "   - Look for FileMaker connection errors" -ForegroundColor Gray
Write-Host "   - Check for timeout or network issues" -ForegroundColor Gray

Write-Host ""
Write-Host "4. Quick fix options:" -ForegroundColor Gray
Write-Host "   A. Re-deploy with verified environment variables" -ForegroundColor Gray
Write-Host "   B. Test with alternative FileMaker endpoint" -ForegroundColor Gray
Write-Host "   C. Add network debugging to FileMaker API route" -ForegroundColor Gray

Write-Host ""
Write-Host "FileMaker debugging complete!" -ForegroundColor Green
