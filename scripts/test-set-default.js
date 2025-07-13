// デフォルトレベル設定のテスト
const http = require('http');

async function testSetDefault() {
  console.log('=== デフォルトレベル設定のテスト ===\n');
  
  // 1. 現在のレベル一覧を取得
  console.log('1. 現在のレベル一覧:');
  const levels = await fetchAPI('/api/levels', 'GET');
  console.log(JSON.stringify(levels, null, 2));
  
  // 2. intermediateをデフォルトに設定
  console.log('\n2. intermediateをデフォルトに設定:');
  const result = await fetchAPI('/api/levels/intermediate/set-default', 'PUT');
  console.log('結果:', result);
  
  // 3. 設定後のレベル一覧を確認
  console.log('\n3. 設定後のレベル一覧:');
  const updatedLevels = await fetchAPI('/api/levels', 'GET');
  console.log(JSON.stringify(updatedLevels, null, 2));
}

function fetchAPI(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          console.error('パースエラー:', data);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

testSetDefault().catch(console.error);