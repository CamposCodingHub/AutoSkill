import PDFDocument from 'pdfkit';
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

export async function generateCertificatePDF(data: CertificateData, outputPath?: string): Promise<string | Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const chunks: Buffer[] = [];

      if (outputPath) {
        const { createWriteStream } = await import('fs');
        const stream = createWriteStream(outputPath);
        doc.pipe(stream);
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', (error: Error) => reject(error));
      } else {
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
      }

      const width = doc.page.width;
      const height = doc.page.height;

      // Fundo com gradiente sutil
      doc.rect(0, 0, width, height).fill('#f8f9fa');

      // Borda externa escura (#1c3b40) - 12px
      doc.rect(12, 12, width - 24, height - 24).lineWidth(12).fillAndStroke('#1c3b40', '#1c3b40');

      // Borda interna dourada (#d4af37) - 3px
      doc.rect(24, 24, width - 48, height - 48).lineWidth(3).stroke('#d4af37');

      // Borda interna secundária azul (#2563eb) - 1.5px
      doc.rect(30, 30, width - 60, height - 60).lineWidth(1.5).stroke('#2563eb');

      // Selo/Logo no canto superior direito
      doc.fontSize(14).font('Helvetica-Bold').fill('#1c3b40');
      doc.text('AUTOSKILL', width - 100, 45, { align: 'center' });
      doc.fontSize(11).font('Helvetica').fill('#666666');
      doc.text('Cursos Técnicos Automotivos', width - 100, 62, { align: 'center' });

      // TÍTULO CENTRAL - 42px, dourado
      doc.fontSize(42).font('Helvetica-Bold').fill('#d4af37');
      doc.text('CERTIFICADO DE CONCLUSÃO', width / 2, 80, { align: 'center' });

      // TEXTO "Este certificado é conferido com orgulho a" - 16px
      doc.fontSize(16).font('Helvetica').fill('#333333');
      doc.text('Este certificado é conferido com orgulho a', width / 2, 140, { align: 'center' });

      // NOME - 36px, bold
      doc.fontSize(36).font('Helvetica-Bold').fill('#000000');
      doc.text(data.userName.toUpperCase(), width / 2, 180, { align: 'center' });

      // Texto "por ter concluído com êxito" - 16px
      doc.fontSize(16).font('Helvetica').fill('#333333');
      doc.text('por ter concluído com êxito o módulo de formação técnica', width / 2, 240, { align: 'center' });

      // MÓDULO - 24px, bold
      doc.fontSize(24).font('Helvetica-Bold').fill('#000000');
      doc.text(`MÓDULO: ${data.certificationName.toUpperCase()}`, width / 2, 280, { align: 'center' });

      // DESCRIÇÃO - 14px, texto multilinha
      const linhas = [
        'A AutoSkill reconhece a dedicação e desempenho exemplar.',
        'Este certificado valida o conhecimento técnico adquirido.',
        `Pontuação: ${data.finalScore}%`
      ];

      doc.fontSize(14).font('Helvetica').fill('#555555');
      const descricaoY = 340;
      linhas.forEach((linha, index) => {
        doc.text(linha, width / 2, descricaoY + (index * 24), { align: 'center' });
      });

      // DATA - 14px
      const formattedDate = data.completionDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      doc.fontSize(14).font('Helvetica').fill('#333333');
      doc.text(`Mirassol - SP, ${formattedDate}`, width / 2, 440, { align: 'center' });

      // Linha de assinatura
      const sigY = 490;
      doc.moveTo(width / 2 - 120, sigY).lineTo(width / 2 + 120, sigY).lineWidth(1).stroke('#000000');

      // ASSINATURA - 14px
      doc.fontSize(14).font('Helvetica').fill('#333333');
      doc.text('Douglas Campos', width / 2, sigY + 10, { align: 'center' });
      doc.fontSize(12).font('Helvetica').fill('#555555');
      doc.text('CEO & Diretor Técnico - AutoSkill', width / 2, sigY + 28, { align: 'center' });

      // QR Code para verificação
      if (data.verificationCode) {
        const qrSize = 100;
        const qrX = width - 120;
        const qrY = height - 140;

        const baseUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:3001';
        const qrDataUrl = await QRCode.toDataURL(`${baseUrl}/api/certifications/verify/${data.verificationCode}`, {
          width: 200,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' }
        });

        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

        doc.fontSize(10).font('Helvetica').fill('#666666');
        doc.text('Escaneie para verificar', qrX + qrSize / 2, qrY + qrSize + 8, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
