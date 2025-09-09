# DispatchTracker - PowerShell Testing Scripts
# Windows PowerShell-compatible API testing commands

Write-Host "🧪 Testing Enhanced FileMaker Integration..." -ForegroundColor Green
Write-Host ("=" * 50)

# Test 1: Enhanced Field Access
Write-Host "`n🔍 Testing FileMaker Field Access..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/jobs" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"testFieldAccess": true}'
    
    if ($response.success) {
        Write-Host "✅ Field access test PASSED" -ForegroundColor Green
        Write-Host "`n📋 ORIGINAL FIELDS:" -ForegroundColor Cyan
        $response.field_status.original_fields | Format-Table -AutoSize
        
        Write-Host "🆕 ENHANCED FIELDS:" -ForegroundColor Cyan
        $response.field_status.enhanced_fields | Format-Table -AutoSize
        
        Write-Host "📊 SAMPLE DATA:" -ForegroundColor Cyan
        $response.field_status.sample_data | Format-List
    } else {
        Write-Host "❌ Field access test FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Enhanced Job Data
Write-Host "`n🔍 Testing Enhanced Job Data..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/jobs?limit=5&geocode=true&hygiene=true" `
        -Method GET
    
    if ($response.success) {
        Write-Host "✅ Retrieved $($response.count) enhanced jobs" -ForegroundColor Green
        
        if ($response.data.Count -gt 0) {
            $sampleJob = $response.data[0]
            Write-Host "`n📋 SAMPLE ENHANCED JOB:" -ForegroundColor Cyan
            Write-Host "  Job ID: $($sampleJob.id)"
            Write-Host "  Status: $($sampleJob.status)"
            
            # Handle null values with if-else instead of null coalescing
            $customer = if ($sampleJob.customer) { $sampleJob.customer } else { 'N/A' }
            $address = if ($sampleJob.address) { $sampleJob.address } else { 'N/A' }
            $arrivalTime = if ($sampleJob.arrivalTime) { $sampleJob.arrivalTime } else { 'N/A' }
            $completionTime = if ($sampleJob.completionTime) { $sampleJob.completionTime } else { 'N/A' }
            $dueDate = if ($sampleJob.dueDate) { $sampleJob.dueDate } else { 'N/A' }
            
            Write-Host "  Customer: $customer"
            Write-Host "  Address: $address"
            Write-Host "  Arrival Time: $arrivalTime"
            Write-Host "  Completion Time: $completionTime"
            Write-Host "  Due Date: $dueDate"
            
            if ($sampleJob.location) {
                Write-Host "  Geocoded Location: $($sampleJob.location.lat), $($sampleJob.location.lng)"
                Write-Host "  Location Source: $($sampleJob.location.source)"
            }
        }
        
        if ($response.hygiene) {
            Write-Host "`n🔍 SCHEDULE HYGIENE ANALYSIS:" -ForegroundColor Cyan
            Write-Host "  $($response.hygiene.summary)"
            Write-Host "  Critical Issues: $($response.hygiene.criticalIssues.Count)"
            Write-Host "  Total Issues: $($response.hygiene.totalIssues)"
        }
    } else {
        Write-Host "❌ Enhanced job data test FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Schedule Hygiene
Write-Host "`n🔍 Testing Schedule Hygiene Monitoring..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/schedule-hygiene" `
        -Method GET
    
    if ($response.success) {
        Write-Host "✅ Schedule hygiene monitoring ACTIVE" -ForegroundColor Green
        Write-Host "`n📊 HYGIENE SUMMARY:" -ForegroundColor Cyan
        Write-Host "  $($response.data.summary)"
        
        Write-Host "`n📈 STATISTICS:" -ForegroundColor Cyan
        Write-Host "  Total Jobs Analyzed: $($response.data.statistics.totalJobs)"
        Write-Host "  Total Issues Found: $($response.data.statistics.totalIssues)"
        Write-Host "  Critical Issues: $($response.data.statistics.criticalCount)"
        Write-Host "  Actionable Items: $($response.data.statistics.actionableCount)"
    } else {
        Write-Host "❌ Schedule hygiene test FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Enhanced Tracking
Write-Host "`n🎯 Testing Enhanced Vehicle Tracking..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/tracking" `
        -Method GET
    
    if ($response.success) {
        Write-Host "✅ Enhanced tracking test PASSED" -ForegroundColor Green
        Write-Host "`n📊 TRACKING SUMMARY:" -ForegroundColor Cyan
        Write-Host "  Total Vehicles: $($response.summary.totalVehicles)"
        Write-Host "  Vehicles with Jobs: $($response.summary.vehiclesWithJobs)"
        Write-Host "  Vehicles with Real Addresses: $($response.summary.vehiclesWithAddresses)"
        Write-Host "  Vehicles at Job Sites: $($response.summary.vehiclesAtJobs)"
        
        if ($response.summary.scheduleIssues) {
            Write-Host "`n🚨 SCHEDULE ISSUES:" -ForegroundColor Cyan
            Write-Host "  Critical: $($response.summary.scheduleIssues.critical)"
            Write-Host "  Warnings: $($response.summary.scheduleIssues.warning)"
            Write-Host "  Action Needed: $($response.summary.scheduleIssues.actionNeeded)"
        }
    } else {
        Write-Host "❌ Enhanced tracking test FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Enhanced FileMaker Integration Testing Complete!" -ForegroundColor Green
Write-Host ("=" * 50)
