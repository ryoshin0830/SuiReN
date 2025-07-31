const puppeteer = require('puppeteer');
const path = require('path');

async function convertModernHtmlToPdf() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // HTMLファイルのパスを取得
    const htmlPath = path.resolve(path.join('logos-modern', 'report.html'));
    const pdfPath = path.join('logos-modern', 'SuiReN_Modern_Logo_Report.pdf');
    
    // HTMLファイルを開く
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0'
    });
    
    // 画像が読み込まれるまで待つ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // PDFとして保存
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    console.log(`Modern PDF created successfully at: ${pdfPath}`);
    
  } catch (error) {
    console.error('Error converting to PDF:', error);
  } finally {
    await browser.close();
  }
}

convertModernHtmlToPdf();