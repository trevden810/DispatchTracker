#!/usr/bin/env node
// Pre-deployment TypeScript Check
// Run: node check-typescript.js

const { execSync } = require('child_process');

console.log('🔍 DispatchTracker - Pre-deployment TypeScript Check');
console.log('=' .repeat(60));

try {
  console.log('\n📋 Running TypeScript compilation check...');
  
  // Check TypeScript compilation
  execSync('npx tsc --noEmit', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ TypeScript compilation successful!');
  
  console.log('\n🔧 Running Next.js build check...');
  
  // Try a build check (without full build)
  execSync('npm run build', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Next.js build successful!');
  
  console.log('\n' + '=' .repeat(60));
  console.log('🚀 ALL CHECKS PASSED - Ready for deployment!');
  console.log('   Run: git push origin master');
  console.log('   Then deploy via Vercel');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.log('\n🔧 Common fixes:');
  console.log('   1. Check TypeScript interfaces in lib/types.ts');
  console.log('   2. Verify all imports are correct');
  console.log('   3. Ensure all referenced files exist');
  console.log('   4. Fix any type mismatches');
  
  process.exit(1);
}
