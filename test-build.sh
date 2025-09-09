#!/bin/bash

# Quick deployment test script
cd C:\Projects\DispatchTracker

echo "🏗️ Testing build with fixes applied..."
echo "1. Dynamic API routes to prevent build-time FileMaker calls"
echo "2. Fixed viewport metadata warnings"
echo ""

echo "Running npm run build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL - Ready for deployment"
    echo ""
    echo "Key fixes applied:"
    echo "- Added 'export const dynamic = \"force-dynamic\"' to API routes"
    echo "- Moved viewport from metadata to separate export"
    echo "- FileMaker API will only be called at runtime, not build time"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push changes"
    echo "2. Deploy to production"
    echo "3. Test FileMaker authentication in production environment"
else
    echo ""
    echo "❌ BUILD FAILED - Check output above for details"
fi
