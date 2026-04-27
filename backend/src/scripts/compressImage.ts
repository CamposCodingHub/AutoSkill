import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'src/assets/welcome-image.png';
const outputPath = 'src/assets/welcome-image-compressed.png';

async function compressImage() {
  try {
    await sharp(inputPath)
      .resize(300, 200, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 60, compressionLevel: 9 })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    console.log(`Imagem comprimida com sucesso!`);
    console.log(`Tamanho original: ${fs.statSync(inputPath).size} bytes`);
    console.log(`Tamanho comprimido: ${stats.size} bytes`);
    console.log(`Redução: ${((1 - stats.size / fs.statSync(inputPath).size) * 100).toFixed(2)}%`);
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
  }
}

compressImage();
