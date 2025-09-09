#!/bin/bash

echo "🚀 DispatchTracker - Production Deployment with Build Fixes"
echo "=========================================================="
echo ""

cd /c/Projects/DispatchTracker

echo "🏗️ Testing build with applied fixes..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL! Deploying to production..."
    echo ""
    
    echo "📝 Committing fixes..."
    git add .
    git commit -m "🔧 PRODUCTION DEPLOYMENT: Build fixes applied

✅ Fixed FileMaker 401 build errors with dynamic API routes
✅ Fixed Next.js viewport metadata warnings  
✅ Prevented static generation of FileMaker API calls
🔍 FileMaker auth verified - credentials correct
📈 Ready for enhanced integration deployment

Build changes:
- Added dynamic rendering to /api/filemaker and /api/jobs
- Moved viewport from metadata to separate export
- FileMaker API now only called at runtime, not build time"

    echo ""
    echo "🌐 Pushing to production..."
    git push origin master
    
    echo ""
    echo "🎯 DEPLOYMENT COMPLETE!"
    echo ""
    echo "Next steps:"
    echo "1. Monitor Vercel deployment at www.pepmovetracker.info"
    echo "2. Test FileMaker integration in production"
    echo "3. Verify 51 vehicles are tracking properly"
    echo "4. Check schedule hygiene with real customer data"
    echo ""
    echo "FileMaker endpoints to test:"
    echo "- GET /api/jobs?limit=10&hygiene=true"
    echo "- POST /api/jobs {\"testFieldAccess\":true}"
    echo "- GET /api/tracking"
    
else
    echo ""
    echo "❌ BUILD FAILED - Cannot deploy"
    echo "Check the build output above for remaining issues"
fi

echo ""
echo "Run this script to test FileMaker connectivity:"
echo "node test-filemaker-access.js"
