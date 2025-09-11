# Quick TypeScript validation
Write-Host "🔍 Testing TypeScript compilation..." -ForegroundColor Yellow

try {
    $result = & npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript compilation successful!" -ForegroundColor Green
        Write-Host "🚀 Ready to commit and deploy!" -ForegroundColor Cyan
    } else {
        Write-Host "❌ TypeScript errors found:" -ForegroundColor Red
        Write-Output $result
    }
} catch {
    Write-Host "❌ Error running TypeScript check: $($_.Exception.Message)" -ForegroundColor Red
}
