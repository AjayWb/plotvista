#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 PlotVista Quick Test Runner');
console.log('Running critical tests only for faster feedback\n');

const tests = [
  {
    name: 'TypeScript check',
    command: 'npx tsc --noEmit --skipLibCheck',
    critical: true
  },
  {
    name: 'Core functionality tests',
    command: 'npx vitest run --config vitest.config.fast.ts',
    critical: true
  },
  {
    name: 'Build validation',
    command: 'npm run build',
    critical: false
  }
];

let hasFailures = false;

tests.forEach(test => {
  try {
    console.log(`\n🔄 Running: ${test.name}`);
    console.log(`   Command: ${test.command}`);
    
    const start = Date.now();
    execSync(test.command, { stdio: 'inherit' });
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    
    console.log(`✅ PASSED (${duration}s)`);
  } catch (error) {
    console.log('❌ FAILED');
    if (test.critical) {
      hasFailures = true;
    }
  }
});

console.log('\n' + '-'.repeat(60) + '\n');

if (hasFailures) {
  console.log('❌ Critical tests FAILED - Fix before deployment');
  process.exit(1);
} else {
  console.log('✅ All tests PASSED - Ready to deploy!');
  console.log('\nFor full test suite, run: npm run test:run');
}