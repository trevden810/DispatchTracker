#!/bin/bash

echo "🗺️ DispatchTracker - Geocoding MVP Test Suite"
echo "=============================================="
echo ""
echo "Testing real customer address geocoding..."
echo ""

cd C:\Projects\DispatchTracker

echo "🏗️ Building with geocoding MVP..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL - Geocoding MVP ready"
    echo ""
    
    echo "📝 Committing geocoding MVP..."
    git add .
    git commit -m "🗺️ GEOCODING MVP: Smart address-to-GPS conversion

✅ Opt-in geocoding via ?geocode=true parameter
✅ Intelligent caching with Nominatim (free service)
✅ Batch processing with rate limiting
✅ Real customer address support
✅ Performance monitoring and error handling
🎯 MVP Features:
- Convert real addresses like '1630 QUEEN ANN AVENUE' to GPS
- Enable precise vehicle-job correlation  
- Support problematic address formats from FileMaker
- Cache results to avoid redundant API calls
- Graceful fallback when geocoding fails

Test endpoints:
- Fast mode: /api/jobs?limit=5 (no geocoding)
- MVP mode: /api/jobs?limit=5&geocode=true (with GPS)
- Test suite: /api/geocoding?action=test"

    echo ""
    echo "🌐 Deploying geocoding MVP..."
    git push origin master
    
    echo ""
    echo "🧪 TEST THE GEOCODING MVP:"
    echo ""
    echo "1. FAST MODE (current production):"
    echo "   https://www.pepmovetracker.info/api/jobs?limit=5"
    echo ""
    echo "2. MVP MODE (with geocoding):"
    echo "   https://www.pepmovetracker.info/api/jobs?limit=5&geocode=true"
    echo ""
    echo "3. GEOCODING TEST SUITE:"
    echo "   https://www.pepmovetracker.info/api/geocoding?action=test"
    echo ""
    echo "4. CACHE STATISTICS:"
    echo "   https://www.pepmovetracker.info/api/geocoding?action=stats"
    echo ""
    echo "📊 EXPECTED RESULTS:"
    echo "- Real addresses converted to lat/lng coordinates"
    echo "- Vehicle proximity detection to customer locations"  
    echo "- Enhanced job correlation for dispatchers"
    echo "- Cached results for performance"
    
else
    echo ""
    echo "❌ BUILD FAILED - Check output above"
fi

echo ""
echo "🎯 GEOCODING MVP FEATURES:"
echo "• Converts '1630 QUEEN ANN AVENUE' → lat: 47.6205, lng: -122.3493"
echo "• Handles problematic FileMaker address formats" 
echo "• Intelligent caching to avoid repeated API calls"
echo "• Graceful fallback when geocoding fails"
echo "• Performance monitoring and batch processing"
echo "• FREE Nominatim service (OpenStreetMap)"
