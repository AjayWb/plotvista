#!/usr/bin/env node

/**
 * PlotVista Test Automation Script
 * 
 * This script runs comprehensive tests before deployment and after changes
 * to prevent regressions and ensure functionality.
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import chalk from 'chalk'

const TESTS = {
  lint: {
    command: 'npm run lint',
    description: 'Code linting and style checks',
    critical: true
  },
  typecheck: {
    command: 'npx tsc --noEmit',
    description: 'TypeScript type checking',
    critical: true
  },
  unit: {
    command: 'npm run test:run',
    description: 'Unit and integration tests',
    critical: true
  },
  build: {
    command: 'npm run build',
    description: 'Production build test',
    critical: true
  }
}

const BUSINESS_RULES_CHECKLIST = [
  'Available → Booked requires name/phone',
  'Available → Agreement requires name/phone',
  'Available → Registration requires name/phone',
  'Booked plots can have multiple customers',
  'Agreement/Registration allows only 1 customer',
  'Phone numbers are validated (10 digits)',
  'Duplicate phone numbers are prevented',
  'Client selection works for multiple bookings',
  'All 360 plots are visible',
  'Login works with correct password',
  'Manager permissions are enforced'
]

function runCommand(command, description) {
  console.log(chalk.blue(`\n🔄 Running: ${description}`))
  console.log(chalk.gray(`   Command: ${command}`))
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    })
    
    console.log(chalk.green('✅ PASSED'))
    if (output.trim()) {
      console.log(chalk.gray(output.trim()))
    }
    return true
  } catch (error) {
    console.log(chalk.red('❌ FAILED'))
    console.log(chalk.red(error.stdout || error.message))
    return false
  }
}

function checkTestCoverage() {
  console.log(chalk.blue('\n📊 Checking test coverage...'))
  
  try {
    // Run tests with coverage
    execSync('npm run test:coverage', { stdio: 'pipe' })
    
    // Read coverage report if available
    try {
      const coverage = readFileSync('./coverage/coverage-summary.json', 'utf8')
      const data = JSON.parse(coverage)
      
      const totalCoverage = data.total
      console.log(chalk.green('📈 Coverage Report:'))
      console.log(`   Lines: ${totalCoverage.lines.pct}%`)
      console.log(`   Statements: ${totalCoverage.statements.pct}%`)
      console.log(`   Functions: ${totalCoverage.functions.pct}%`)
      console.log(`   Branches: ${totalCoverage.branches.pct}%`)
      
      if (totalCoverage.lines.pct < 80) {
        console.log(chalk.yellow('⚠️  Coverage below 80% - consider adding more tests'))
      }
    } catch {
      console.log(chalk.gray('   Coverage report not available'))
    }
    
    return true
  } catch (error) {
    console.log(chalk.red('❌ Coverage check failed'))
    return false
  }
}

function displayBusinessRules() {
  console.log(chalk.blue('\n📋 Business Rules Validation Checklist:'))
  BUSINESS_RULES_CHECKLIST.forEach((rule, index) => {
    console.log(chalk.gray(`   ${index + 1}. ${rule}`))
  })
  console.log(chalk.yellow('\n⚠️  Manual testing required for business rules'))
}

async function main() {
  console.log(chalk.bold.blue('\n🚀 PlotVista Test Suite Runner\n'))
  console.log('This script validates all functionality before deployment.\n')
  
  let allPassed = true
  let criticalFailures = []
  
  // Run all tests
  for (const [key, test] of Object.entries(TESTS)) {
    const passed = runCommand(test.command, test.description)
    
    if (!passed) {
      allPassed = false
      if (test.critical) {
        criticalFailures.push(test.description)
      }
    }
  }
  
  // Check coverage
  const coveragePassed = checkTestCoverage()
  if (!coveragePassed) {
    allPassed = false
  }
  
  // Display business rules checklist
  displayBusinessRules()
  
  // Final report
  console.log(chalk.blue('\n📋 Test Summary:'))
  
  if (allPassed) {
    console.log(chalk.green('✅ All automated tests PASSED!'))
    console.log(chalk.green('✅ Ready for deployment'))
  } else {
    console.log(chalk.red('❌ Some tests FAILED'))
    
    if (criticalFailures.length > 0) {
      console.log(chalk.red('\n🚨 CRITICAL FAILURES:'))
      criticalFailures.forEach(failure => {
        console.log(chalk.red(`   • ${failure}`))
      })
      console.log(chalk.red('\n🛑 DO NOT DEPLOY - Fix critical issues first'))
      process.exit(1)
    } else {
      console.log(chalk.yellow('\n⚠️  Non-critical issues found - review before deployment'))
    }
  }
  
  console.log(chalk.blue('\n🎯 Next Steps:'))
  console.log('1. Fix any failed tests')
  console.log('2. Run manual business rule validation')
  console.log('3. Test critical user flows manually')
  console.log('4. Deploy with confidence!')
  
  console.log(chalk.gray('\n📖 For detailed test reports, run: npm run test:ui'))
}

main().catch(console.error)