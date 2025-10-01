#!/usr/bin/env node
// Pre-deployment TypeScript check script
// Run with: node scripts/check-types.js

const { execSync } = require('child_process');

console.log('🔍 Running TypeScript type check...\n');

try {
  execSync('npx tsc --noEmit', {
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  
  console.log('\n✅ No TypeScript errors found!');
  console.log('✅ Safe to deploy\n');
  process.exit(0);
  
} catch (error) {
  console.log('\n❌ TypeScript errors found!');
  console.log('❌ Fix errors before deploying\n');
  process.exit(1);
}
