import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import path from 'path';

interface CertificateData {
  userName: string;
  certificationName: string;
  certificationLevel: string;
  completionDate: Date;
  finalScore: number;
  modules: number[];
}

export async function generateCertificatePDF(data: CertificateData, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const stream = createWriteStream(outputPath);
      doc.pipe(stream);

      const width = doc.page.width;
      const height = doc.page.height;

      // Fundo branco
      doc.rect(0, 0, width, height).fill('#ffffff');

      // Borda externa escura (#1c3b40) - 15px
      doc.rect(15, 15, width - 30, height - 30).lineWidth(15).fillAndStroke('#1c3b40', '#1c3b40');

      // Borda interna dourada (#d4af37) - 3px
      doc.rect(30, 30, width - 60, height - 60).lineWidth(3).stroke('#d4af37');

      // Título CERTIFICADO - dourado, 50px, letter-spacing: 2px
      doc.fontSize(50).font('Helvetica-Bold').fill('#d4af37');
      doc.text('CERTIFICADO', width / 2, 80, { align: 'center', characterSpacing: 2 });

      // Subtítulo - dourado, 24px, letter-spacing: 1px
      doc.fontSize(24).font('Helvetica-Bold').fill('#d4af37');
      doc.text('DE CONCLUSÃO DE MÓDULO', width / 2, 125, { align: 'center', characterSpacing: 1 });

      // Texto padrão - "Este certificado é conferido com orgulho a"
      doc.fontSize(16).font('Helvetica').fill('#333333');
      doc.text('Este certificado é conferido com orgulho a', width / 2, 170, { align: 'center' });

      // Linha para o nome (60% da largura)
      const lineY = 195;
      doc.moveTo(width * 0.2, lineY).lineTo(width * 0.8, lineY).lineWidth(1).stroke('#000000');

      // Nome do aluno (altura 40px)
      doc.fontSize(32).font('Helvetica-Bold').fill('#000000');
      doc.text(data.userName.toUpperCase(), width / 2, lineY - 15, { align: 'center' });

      // Texto padrão - "por ter concluído com êxito o módulo de formação técnica"
      doc.fontSize(16).font('Helvetica').fill('#333333');
      doc.text('por ter concluído com êxito o módulo de formação técnica', width / 2, lineY + 40, { align: 'center' });

      // Título do módulo - 22px, bold, margin-top 30px
      const moduleTitleY = lineY + 80;
      doc.fontSize(22).font('Helvetica-Bold').fill('#000000');
      doc.text(`MÓDULO: ${data.certificationName.toUpperCase()}`, width / 2, moduleTitleY, { align: 'center' });

      // Descrição - 14px, padding 0 40px, line-height 1.5
      const description = `A AutoSkill Cursos Técnicos Automotivos reconhece a dedicação e o desempenho exemplar na conclusão deste módulo, ` +
        `que abordou tópicos essenciais como diagnóstico avançado, sistemas eletrônicos e manutenção automotiva. ` +
        `Este certificado valida o conhecimento técnico adquirido com pontuação de ${data.finalScore}%.`;
      
      doc.fontSize(14).font('Helvetica').fill('#555555');
      doc.text(description, width * 0.15, moduleTitleY + 30, {
        align: 'center',
        width: width * 0.7,
        lineGap: 7
      });

      // Rodapé - margin-top 60px, padding 0 50px
      const footerY = moduleTitleY + 130;
      const formattedDate = data.completionDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      // Bloco DATA - width 30%
      const dataX = width * 0.25;
      doc.moveTo(dataX - 60, footerY).lineTo(dataX + 60, footerY).lineWidth(1).stroke('#000000');
      doc.fontSize(12).font('Helvetica-Bold').fill('#333333');
      doc.text('DATA', dataX, footerY + 15, { align: 'center' });
      doc.fontSize(11).font('Helvetica').fill('#333333');
      doc.text(formattedDate, dataX, footerY - 10, { align: 'center' });

      // Bloco ASSINATURA - width 30%
      const sigX = width * 0.75;
      doc.moveTo(sigX - 60, footerY).lineTo(sigX + 60, footerY).lineWidth(1).stroke('#000000');
      
      // Nome da assinatura em itálico (simulando Brush Script MT, 28px)
      doc.fontSize(28).font('Helvetica-Oblique').fill('#000000');
      doc.text('Douglas de Campos', sigX, footerY - 15, { align: 'center' });
      
      doc.fontSize(12).font('Helvetica-Bold').fill('#333333');
      doc.text('ASSINATURA', sigX, footerY + 15, { align: 'center' });
      doc.fontSize(12).font('Helvetica-Bold').fill('#333333');
      doc.text('DIRETOR TÉCNICO & CEO, AUTOSKILL', sigX, footerY + 30, { align: 'center' });

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
