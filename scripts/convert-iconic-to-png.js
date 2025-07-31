const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

async function convertIconicSvgToPng() {
  const svgDir = path.join('logos-iconic', 'svg');
  const pngDir = path.join('logos-iconic', 'png');
  
  try {
    const files = await fs.readdir(svgDir);
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    
    console.log(`Converting ${svgFiles.length} iconic SVG files to PNG...`);
    
    for (const file of svgFiles) {
      const svgPath = path.join(svgDir, file);
      const pngPath = path.join(pngDir, file.replace('.svg', '.png'));
      
      const svgContent = await fs.readFile(svgPath, 'utf8');
      
      // 高解像度化（2倍）
      await sharp(Buffer.from(svgContent))
        .png()
        .resize(400, 400, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toFile(pngPath);
      
      console.log(`Converted: ${file}`);
    }
    
    console.log('All iconic SVG files converted to PNG successfully!');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

convertIconicSvgToPng();