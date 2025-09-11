# DispatchTracker - Pre-deployment TypeScript Check (PowerShell)
# Run: .\check-typescript.ps1

Write-Host "🔍 DispatchTracker - Pre-deployment TypeScript Check" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

try {
    Write-Host "`n📋 Running TypeScript compilation check..." -ForegroundColor Yellow
    
    # Check TypeScript compilation
    $tscResult = & npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "TypeScript compilation failed: $tscResult"
    }
    
    Write-Host "✅ TypeScript compilation successful!" -ForegroundColor Green
    
    Write-Host "`n🔧 Running Next.js build check..." -ForegroundColor Yellow
    
    # Try a build check
    $buildResult = & npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Next.js build failed: $buildResult"
    }
    
    Write-Host "✅ Next.js build successful!" -ForegroundColor Green
    
    Write-Host ("`n" + "=" * 60) -ForegroundColor Gray
    Write-Host "🚀 ALL CHECKS PASSED - Ready for deployment!" -ForegroundColor Green
    Write-Host "   Run: git push origin master" -ForegroundColor White
    Write-Host "   Then deploy via Vercel" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔧 Common fixes:" -ForegroundColor Yellow
    Write-Host "   1. Check TypeScript interfaces in lib/types.ts" -ForegroundColor White
    Write-Host "   2. Verify all imports are correct" -ForegroundColor White
    Write-Host "   3. Ensure all referenced files exist" -ForegroundColor White
    Write-Host "   4. Fix any type mismatches" -ForegroundColor White
    
    exit 1
}
