import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

interface CertificateData {
  userName: string;
  certificationName: string;
  certificationLevel: string;
  completionDate: Date;
  finalScore: number;
  modules: number[];
  verificationCode?: string;
}

export async function generateCertificatePDF(data: CertificateData, outputPath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Gerar QR Code
      let qrCodeUrl = '';
      if (data.verificationCode) {
        qrCodeUrl = await QRCode.toDataURL(`http://localhost:3001/api/certifications/verify/${data.verificationCode}`, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      }

      // Ler template HTML
      const templatePath = path.join(__dirname, '../../templates/certificate.html');
      let html = fs.readFileSync(templatePath, 'utf-8');

      // Formatar data
      const formattedDate = data.completionDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      // Substituir placeholders
      html = html.replace('{{userName}}', data.userName.toUpperCase());
      html = html.replace('{{certificationName}}', data.certificationName.toUpperCase());
      html = html.replace('{{finalScore}}', data.finalScore.toString());
      html = html.replace('{{completionDate}}', formattedDate);
      html = html.replace('{{qrCodeUrl}}', qrCodeUrl);

      // Lançar Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Definir conteúdo HTML
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Gerar PDF
      await page.pdf({
        path: outputPath,
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      });

      await browser.close();

      resolve(outputPath);
    } catch (error) {
      reject(error);
    }
  });
}
