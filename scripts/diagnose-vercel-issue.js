const fetch = require('node-fetch');

async function diagnoseVercelIssue() {
  const domains = [
    'https://suisui-1ljghgoa8-shins.vercel.app',
    'https://gorilla.eastlinker.com'
  ];

  console.log('=== Vercel Domain Diagnosis ===\n');

  for (const domain of domains) {
    console.log(`\n--- Testing: ${domain} ---`);
    
    try {
      // Test debug endpoint
      console.log('\n1. Debug endpoint:');
      const debugResponse = await fetch(`${domain}/api/debug`);
      const debugData = await debugResponse.json();
      console.log('Database connected:', debugData.database.connected);
      console.log('Content count:', debugData.database.contentCount);
      console.log('Level count:', debugData.database.levelCount);
      console.log('Has levels table:', debugData.database.hasLevelTable);
      if (debugData.database.error) {
        console.log('Database error:', debugData.database.error);
      }
      
      // Test contents endpoint
      console.log('\n2. Contents endpoint:');
      const contentsResponse = await fetch(`${domain}/api/contents`);
      const contentsData = await contentsResponse.json();
      console.log('Status:', contentsResponse.status);
      console.log('Contents returned:', Array.isArray(contentsData) ? contentsData.length : 'Error');
      if (contentsData.error) {
        console.log('Error:', contentsData.error);
      }
      
      // Test levels endpoint
      console.log('\n3. Levels endpoint:');
      const levelsResponse = await fetch(`${domain}/api/levels`);
      const levelsData = await levelsResponse.json();
      console.log('Status:', levelsResponse.status);
      console.log('Levels returned:', Array.isArray(levelsData) ? levelsData.length : 'Error');
      if (levelsData.error) {
        console.log('Error:', levelsData.error);
      }
      
    } catch (error) {
      console.error('Failed to fetch from domain:', error.message);
    }
  }
  
  console.log('\n\n=== Diagnosis Complete ===');
  console.log('\nTo fix this issue:');
  console.log('1. Check Vercel dashboard for environment variables');
  console.log('2. Ensure DATABASE_URL is the same for both deployments');
  console.log('3. Run "npx prisma migrate deploy" to apply migrations');
  console.log('4. If needed, run "node scripts/migrate-levels.js" to populate levels');
}

// Run if called directly
if (require.main === module) {
  diagnoseVercelIssue().catch(console.error);
}

module.exports = { diagnoseVercelIssue };