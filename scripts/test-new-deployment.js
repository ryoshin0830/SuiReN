const fetch = require('node-fetch');

async function testNewDeployment() {
  const url = 'https://suisui-6on5izx0d-shins.vercel.app';
  
  console.log('Testing new deployment:', url);
  
  try {
    // Test debug endpoint
    const debugResponse = await fetch(`${url}/api/debug`);
    const debugData = await debugResponse.json();
    console.log('\nDebug endpoint:');
    console.log('- Database connected:', debugData.database.connected);
    console.log('- Content count:', debugData.database.contentCount);
    console.log('- Level count:', debugData.database.levelCount);
    
    // Test contents endpoint
    const contentsResponse = await fetch(`${url}/api/contents`);
    const contentsData = await contentsResponse.json();
    console.log('\nContents endpoint:');
    console.log('- Status:', contentsResponse.status);
    console.log('- Contents returned:', Array.isArray(contentsData) ? contentsData.length : 'Error');
    
    // Test reading page
    const readingResponse = await fetch(`${url}/reading`);
    console.log('\nReading page:');
    console.log('- Status:', readingResponse.status);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNewDeployment();