// ローカルでVercel APIの動作を確認
const http = require('http');

async function testAPI() {
  console.log('=== ローカルAPIテスト ===\n');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/levels',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('ステータスコード:', res.statusCode);
        console.log('レスポンス:', data);
        
        if (res.statusCode === 500) {
          console.log('\n500エラーが発生しました。');
          console.log('サーバーログを確認してください。');
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('リクエストエラー:', error);
      reject(error);
    });

    req.end();
  });
}

// 開発サーバーが起動している前提で実行
setTimeout(() => {
  testAPI().catch(console.error);
}, 2000);