/**
 * Test script to check why different domains show different content counts
 * This will help debug the issue where:
 * - https://suisui-1ljghgoa8-shins.vercel.app shows 0 contents
 * - https://gorilla.eastlinker.com shows 5 contents
 */

const fetch = require('node-fetch');

const DOMAINS = [
  'https://suisui-1ljghgoa8-shins.vercel.app',
  'https://gorilla.eastlinker.com'
];

async function testDomain(domain) {
  console.log(`\n=== Testing ${domain} ===`);
  
  try {
    // Test 1: Check debug endpoint
    console.log('\n1. Testing /api/debug endpoint:');
    const debugResponse = await fetch(`${domain}/api/debug`);
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('Debug info:', JSON.stringify(debugData, null, 2));
    } else {
      console.log(`Debug endpoint failed: ${debugResponse.status} ${debugResponse.statusText}`);
    }
    
    // Test 2: Check contents endpoint
    console.log('\n2. Testing /api/contents endpoint:');
    const contentsResponse = await fetch(`${domain}/api/contents`);
    if (contentsResponse.ok) {
      const contents = await contentsResponse.json();
      console.log(`Contents count: ${contents.length}`);
      if (contents.length > 0) {
        console.log('First content:', contents[0]);
      }
    } else {
      console.log(`Contents endpoint failed: ${contentsResponse.status} ${contentsResponse.statusText}`);
      const errorText = await contentsResponse.text();
      console.log('Error response:', errorText);
    }
    
    // Test 3: Check response headers
    console.log('\n3. Response headers from /api/contents:');
    const headers = {};
    contentsResponse.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Headers:', JSON.stringify(headers, null, 2));
    
  } catch (error) {
    console.error('Error testing domain:', error.message);
  }
}

async function main() {
  console.log('Starting domain comparison test...\n');
  console.log('This test will help identify why different domains show different content counts.');
  
  for (const domain of DOMAINS) {
    await testDomain(domain);
  }
  
  console.log('\n=== Test Complete ===');
}

// Check if node-fetch is installed
try {
  require.resolve('node-fetch');
  main();
} catch (e) {
  console.log('node-fetch is not installed. Installing it first...');
  console.log('Run: npm install node-fetch@2');
}