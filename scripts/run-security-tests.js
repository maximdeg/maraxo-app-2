#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Running Security Test Suite...\n');

// Check if required environment variables are set
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.log('⚠️  Setting up test environment variables...');
  process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-security-testing';
  process.env.NODE_ENV = 'test';
}

try {
  // Run simple security tests first
  console.log('🧪 Running simple authentication security tests...');
  execSync('npx vitest run __tests__/security/simple-auth.test.ts --reporter=verbose', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n🛡️  Running rate limiting security tests...');
  execSync('npx vitest run __tests__/security/rate-limiting.test.ts --reporter=verbose', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ Running security pattern tests...');
  execSync('npx vitest run __tests__/security/security-patterns.test.ts --reporter=verbose', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n🎉 All security tests passed! ✅');
  console.log('\n📊 Security Test Summary:');
  console.log('  ✅ Authentication middleware protection');
  console.log('  ✅ JWT token security and validation');
  console.log('  ✅ Rate limiting implementation');
  console.log('  ✅ Input validation and sanitization');
  console.log('  ✅ Secure cookie handling');
  console.log('  ✅ Environment variable security');
  console.log('  ✅ SQL injection prevention');
  console.log('  ✅ XSS attack prevention');
  console.log('  ✅ Brute force attack prevention');
  console.log('  ✅ Token tampering prevention');

} catch (error) {
  console.error('\n❌ Security tests failed!');
  console.error('Error:', error.message);
  process.exit(1);
}
