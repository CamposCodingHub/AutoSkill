import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listCertificates() {
  try {
    const certificates = await prisma.certificationProgress.findMany({
      where: { status: 'completed' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        certification: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    console.log('=== CERTIFICADOS EMITIDOS ===\n');
    
    certificates.forEach((cert, index) => {
      console.log(`${index + 1}. ${cert.user.name} (${cert.user.email})`);
      console.log(`   Certificação: ${cert.certification.name}`);
      console.log(`   Pontuação: ${cert.finalExamScore}%`);
      console.log(`   Código de Verificação: ${cert.verificationCode || 'N/A'}`);
      console.log(`   Data: ${cert.completedAt?.toLocaleDateString('pt-BR')}`);
      console.log(`   PDF: ${cert.certificateUrl || 'Não gerado'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Erro ao listar certificados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listCertificates();
