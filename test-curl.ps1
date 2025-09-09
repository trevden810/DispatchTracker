# Simple curl-based tests for enhanced FileMaker integration
Write-Host "🧪 Testing Enhanced FileMaker Integration..." -ForegroundColor Green

# Test 1: Field Access Test
Write-Host "`n🔍 Testing FileMaker Field Access..." -ForegroundColor Yellow
curl.exe -X POST http://localhost:3002/api/jobs -H "Content-Type: application/json" -d '{\"testFieldAccess\": true}'

Write-Host "`n"

# Test 2: Enhanced Job Data  
Write-Host "🔍 Testing Enhanced Job Data..." -ForegroundColor Yellow
curl.exe "http://localhost:3002/api/jobs?limit=3&geocode=true"

Write-Host "`n"

# Test 3: Vehicle Tracking
Write-Host "🎯 Testing Enhanced Vehicle Tracking..." -ForegroundColor Yellow
curl.exe "http://localhost:3002/api/tracking" 

Write-Host "`n🎉 Tests complete!" -ForegroundColor Green
