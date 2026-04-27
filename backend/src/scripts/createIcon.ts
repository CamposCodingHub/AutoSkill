import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Criar canvas de 144x144
const canvas = createCanvas(144, 144);
const ctx = canvas.getContext('2d');

// Fundo laranja
ctx.fillStyle = '#FF6A00';
ctx.fillRect(0, 0, 144, 144);

// Texto "AS"
ctx.fillStyle = 'white';
ctx.font = 'bold 60px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('AS', 72, 72);

// Salvar como PNG
const buffer = canvas.toBuffer('image/png');
const outputPath = join(__dirname, '../../../public/icons/icon-144x144.png');
writeFileSync(outputPath, buffer);

console.log('Ícone PNG criado em:', outputPath);
