const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

async function convertModernSvgToPng() {
  const svgDir = path.join('logos-modern', 'svg');
  const pngDir = path.join('logos-modern', 'png');
  
  try {
    const files = await fs.readdir(svgDir);
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    
    console.log(`Converting ${svgFiles.length} modern SVG files to PNG...`);
    
    for (const file of svgFiles) {
      const svgPath = path.join(svgDir, file);
      const pngPath = path.join(pngDir, file.replace('.svg', '.png'));
      
      const svgContent = await fs.readFile(svgPath, 'utf8');
      
      // サイズを判定（正方形か長方形か）
      const widthMatch = svgContent.match(/width="(\d+)"/);
      const heightMatch = svgContent.match(/height="(\d+)"/);
      const width = widthMatch ? parseInt(widthMatch[1]) : 300;
      const height = heightMatch ? parseInt(heightMatch[1]) : 100;
      
      // アスペクト比を保持しながらリサイズ
      const scale = 2; // 高解像度化
      
      await sharp(Buffer.from(svgContent))
        .png()
        .resize(width * scale, height * scale, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toFile(pngPath);
      
      console.log(`Converted: ${file}`);
    }
    
    console.log('All modern SVG files converted to PNG successfully!');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

convertModernSvgToPng();