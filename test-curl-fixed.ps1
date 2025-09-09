# Fixed curl tests for enhanced FileMaker integration
Write-Host "🧪 Testing Enhanced FileMaker Integration..." -ForegroundColor Green

# Test 1: Field Access Test (fixed JSON escaping)
Write-Host "`n🔍 Testing FileMaker Field Access..." -ForegroundColor Yellow
$body = '{"testFieldAccess": true}'
curl.exe -X POST http://localhost:3002/api/jobs -H "Content-Type: application/json" -d $body

Write-Host "`n"

# Test 2: Enhanced Job Data  
Write-Host "🔍 Testing Enhanced Job Data..." -ForegroundColor Yellow
curl.exe "http://localhost:3002/api/jobs?limit=3&geocode=true"

Write-Host "`n"

# Test 3: Simple GET test to verify server is working
Write-Host "🔧 Testing Basic Server Response..." -ForegroundColor Yellow
curl.exe "http://localhost:3002/api/jobs"

Write-Host "`n🎉 Tests complete!" -ForegroundColor Green
