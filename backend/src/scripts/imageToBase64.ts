import fs from 'fs';

const imagePath = 'src/assets/welcome-image-compressed.png';

const imageBuffer = fs.readFileSync(imagePath);
const base64 = imageBuffer.toString('base64');

console.log(base64);
