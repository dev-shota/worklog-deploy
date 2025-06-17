#!/usr/bin/env node
/**
 * WorkLog API Endpoint Testing Script
 * Tests all API endpoints with PostgreSQL backend
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Test configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_USER = { id: 'admin', pass: 'password' };

let authToken = null;
let testEntryId = null;

// Test utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data: data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
};

// Test cases
const testSuite = {
  async testDatabaseConnection() {
    log('\\n=== 🗄️ Database Connection Test ===', 'cyan');
    
    try {
      // This is an indirect test via login endpoint
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(TEST_USER)
      });
      
      if (result.ok) {
        log('✅ PostgreSQL connection successful', 'green');
        return true;
      } else {
        log('❌ Database connection failed', 'red');
        log(`   Error: ${result.data.error}`, 'red');
        return false;
      }
    } catch (error) {
      log('❌ Database connection test failed', 'red');
      log(`   Error: ${error.message}`, 'red');
      return false;
    }
  },

  async testAuthLogin() {
    log('\\n=== 🔐 Authentication: Login Test ===', 'cyan');
    
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_USER)
    });

    if (result.ok && result.data.success && result.data.data.token) {
      authToken = result.data.data.token;
      log('✅ Login successful', 'green');
      log(`   Token: ${authToken.substring(0, 20)}...`, 'blue');
      return true;
    } else {
      log('❌ Login failed', 'red');
      log(`   Status: ${result.status}`, 'red');
      log(`   Error: ${result.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  },

  async testAuthAccount() {
    log('\\n=== 👤 Authentication: Account Test ===', 'cyan');
    
    const result = await apiRequest('/auth/account');

    if (result.ok && result.data.success) {
      log('✅ Account info retrieved', 'green');
      log(`   Company: ${result.data.data.companyName}`, 'blue');
      log(`   Login ID: ${result.data.data.loginId}`, 'blue');
      return true;
    } else {
      log('❌ Account info failed', 'red');
      log(`   Status: ${result.status}`, 'red');
      log(`   Error: ${result.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  },

  async testEntriesEmpty() {
    log('\\n=== 📋 Entries: Empty List Test ===', 'cyan');
    
    const result = await apiRequest('/entries');

    if (result.ok && result.data.success) {
      const entries = result.data.data;
      log('✅ Entries list retrieved', 'green');
      log(`   Count: ${entries.length}`, 'blue');
      return true;
    } else {
      log('❌ Entries list failed', 'red');
      log(`   Status: ${result.status}`, 'red');
      log(`   Error: ${result.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  },

  async testEntriesCreate() {
    log('\\n=== ➕ Entries: Create Test ===', 'cyan');
    
    const testEntry = {
      name: 'テスト太郎',
      date: '2025-01-17',
      day_of_week: '金曜日',
      site_name: 'テスト現場',
      work_description: 'PostgreSQLテスト作業',
      start_time: '09:00',
      end_time: '17:00',
      total_hours: '8.0'
    };

    const result = await apiRequest('/entries', {
      method: 'POST',
      body: JSON.stringify(testEntry)
    });

    if (result.ok && result.data.success) {
      testEntryId = result.data.data.id;
      log('✅ Entry created successfully', 'green');
      log(`   ID: ${testEntryId}`, 'blue');
      log(`   Name: ${result.data.data.name}`, 'blue');
      return true;
    } else {
      log('❌ Entry creation failed', 'red');
      log(`   Status: ${result.status}`, 'red');
      log(`   Error: ${result.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  },

  async testEntriesNames() {
    log('\\n=== 🏷️ Entries: Names Autocomplete Test ===', 'cyan');
    
    const result = await apiRequest('/entries/names');

    if (result.ok && result.data.success) {
      const names = result.data.data;
      log('✅ Names retrieved', 'green');
      log(`   Names: ${names.join(', ')}`, 'blue');
      return true;
    } else {
      log('❌ Names retrieval failed', 'red');
      log(`   Status: ${result.status}`, 'red');
      log(`   Error: ${result.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  },

  async testEntriesDelete() {
    log('\\n=== 🗑️ Entries: Delete Test ===', 'cyan');
    
    if (!testEntryId) {
      log('⚠️ No test entry ID available for deletion', 'yellow');
      return false;
    }

    const result = await apiRequest(`/entries/${testEntryId}`, {
      method: 'DELETE'
    });

    if (result.ok && result.data.success) {
      log('✅ Entry deleted successfully', 'green');
      return true;
    } else {
      log('❌ Entry deletion failed', 'red');
      log(`   Status: ${result.status}`, 'red');
      log(`   Error: ${result.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  },

  async testAuthLogout() {
    log('\\n=== 🚪 Authentication: Logout Test ===', 'cyan');
    
    const result = await apiRequest('/auth/logout', {
      method: 'POST'
    });

    if (result.ok && result.data.success) {
      log('✅ Logout successful', 'green');
      authToken = null;
      return true;
    } else {
      log('❌ Logout failed', 'red');
      log(`   Status: ${result.status}`, 'red');
      log(`   Error: ${result.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  }
};

// Run all tests
async function runAllTests() {
  log('🧪 WorkLog API Testing Suite Starting...', 'bright');
  log('='.repeat(50), 'blue');

  const tests = [
    { name: 'Database Connection', fn: testSuite.testDatabaseConnection },
    { name: 'Auth Login', fn: testSuite.testAuthLogin },
    { name: 'Auth Account', fn: testSuite.testAuthAccount },
    { name: 'Entries Empty', fn: testSuite.testEntriesEmpty },
    { name: 'Entries Create', fn: testSuite.testEntriesCreate },
    { name: 'Entries Names', fn: testSuite.testEntriesNames },
    { name: 'Entries Delete', fn: testSuite.testEntriesDelete },
    { name: 'Auth Logout', fn: testSuite.testAuthLogout }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(`❌ Test '${test.name}' threw error: ${error.message}`, 'red');
      failed++;
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  log('\\n' + '='.repeat(50), 'blue');
  log('🎯 Test Results Summary:', 'bright');
  log(`✅ Passed: ${passed}`, passed > 0 ? 'green' : 'reset');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  log(`📊 Total: ${passed + failed}`, 'blue');
  
  if (failed === 0) {
    log('\\n🎉 All tests passed! PostgreSQL API is working correctly.', 'green');
    process.exit(0);
  } else {
    log('\\n⚠️ Some tests failed. Check the output above for details.', 'yellow');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    log(`\\n💥 Test suite crashed: ${error.message}`, 'red');
    process.exit(1);
  });
}