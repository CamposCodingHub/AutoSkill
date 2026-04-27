import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
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
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const stream = createWriteStream(outputPath);
      doc.pipe(stream);

      const width = doc.page.width;
      const height = doc.page.height;

      // Margens padrão
      const margin = 72;
      const contentWidth = width - (margin * 2);

      // Fundo com gradiente sutil (tipo SENAI)
      doc.rect(0, 0, width, height).fill('#f8f9fa');

      // Borda externa escura (#1c3b40) - 8px
      doc.rect(8, 8, width - 16, height - 16).lineWidth(8).fillAndStroke('#1c3b40', '#1c3b40');

      // Borda interna dourada (#d4af37) - 2px
      doc.rect(16, 16, width - 32, height - 32).lineWidth(2).stroke('#d4af37');

      // Borda interna secundária azul (#2563eb) - 1px
      doc.rect(20, 20, width - 40, height - 40).lineWidth(1).stroke('#2563eb');

      // Selo/Logo no canto superior direito
      doc.fontSize(10).font('Helvetica-Bold').fill('#1c3b40');
      doc.text('AUTOSKILL', width - 80, 35, { align: 'center' });
      doc.fontSize(8).font('Helvetica').fill('#666666');
      doc.text('Cursos Técnicos Automotivos', width - 80, 48, { align: 'center' });

      // Título CERTIFICADO DE CONCLUSÃO - dourado, 28px, centralizado
      doc.fontSize(28).font('Helvetica-Bold').fill('#d4af37');
      doc.text('CERTIFICADO DE CONCLUSÃO', width / 2, 50, { align: 'center' });

      // Texto "Este certificado é conferido com orgulho a" - 12px, centralizado
      doc.fontSize(12).font('Helvetica').fill('#333333');
      doc.text('Este certificado é conferido com orgulho a', width / 2, 90, { align: 'center' });

      // Nome do aluno - 24px, bold, centralizado
      doc.fontSize(24).font('Helvetica-Bold').fill('#000000');
      doc.text(data.userName.toUpperCase(), width / 2, 130, { align: 'center' });

      // Texto "por ter concluído com êxito o módulo de formação técnica" - 12px, centralizado
      doc.fontSize(12).font('Helvetica').fill('#333333');
      doc.text('por ter concluído com êxito o módulo de formação técnica', width / 2, 170, { align: 'center' });

      // Título do módulo - 18px, bold, centralizado
      doc.fontSize(18).font('Helvetica-Bold').fill('#000000');
      doc.text(`MÓDULO: ${data.certificationName.toUpperCase()}`, width / 2, 210, { align: 'center' });

      // Descrição - 12px, centralizado, com quebras de linha
      const description = `A AutoSkill Cursos Técnicos Automotivos reconhece a dedicação e o desempenho exemplar ` +
        `na conclusão deste módulo, que abordou tópicos essenciais como diagnóstico avançado, ` +
        `sistemas eletrônicos e manutenção automotiva.\n\n` +
        `Este certificado valida o conhecimento técnico adquirido com pontuação de ${data.finalScore}%.`;
      
      doc.fontSize(12).font('Helvetica').fill('#555555');
      doc.text(description, width / 2, 250, {
        align: 'center',
        width: contentWidth,
        lineGap: 8
      });

      // Espaçador
      doc.moveDown(1);

      // Localização e data - 10px, centralizado
      const formattedDate = data.completionDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      doc.fontSize(10).font('Helvetica').fill('#333333');
      doc.text(`Mirassol - SP, ${formattedDate}`, width / 2, 320, { align: 'center' });
      
      // Espaçador para assinatura
      doc.moveDown(2);

      // Linha de assinatura
      const sigY = 380;
      doc.moveTo(width / 2 - 100, sigY).lineTo(width / 2 + 100, sigY).lineWidth(1).stroke('#000000');
      
      // Nome da assinatura - 10px, centralizado
      doc.fontSize(10).font('Helvetica').fill('#333333');
      doc.text('Douglas Campos', width / 2, sigY + 15, { align: 'center' });
      
      doc.fontSize(10).font('Helvetica').fill('#333333');
      doc.text('Diretor Técnico & CEO - AutoSkill', width / 2, sigY + 30, { align: 'center' });

      // QR Code para verificação
      if (data.verificationCode) {
        const qrSize = 60;
        const qrX = width - margin - qrSize - 10;
        const qrY = height - margin - qrSize - 10;

        // Gerar QR Code
        const qrDataUrl = await QRCode.toDataURL(`http://localhost:3001/api/certifications/verify/${data.verificationCode}`, {
          width: qrSize,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        // Converter base64 para buffer
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

        // Texto "Escaneie para verificar"
        doc.fontSize(7).font('Helvetica').fill('#666666');
        doc.text('Escaneie para verificar', qrX + qrSize / 2, qrY + qrSize + 8, { align: 'center' });
      }

      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}
