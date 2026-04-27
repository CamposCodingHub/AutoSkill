import prisma from '../utils/prisma';

async function seedCertifications() {
  try {
    console.log('Iniciando seed de certificações...');

    const certifications = [
      {
        name: 'Mecânica Básica',
        description: 'Certificação em mecânica automotiva básica, cobrindo fundamentos de manutenção e diagnóstico.',
        level: 'basic',
        modules: [1],
        minQuizScore: 70,
        minFinalScore: 70,
        minStudyHours: 10,
        enabled: true,
      },
      {
        name: 'Mecânica Intermediária',
        description: 'Certificação em mecânica automotiva intermediária, com foco em sistemas avançados e reparos complexos.',
        level: 'intermediate',
        modules: [1, 2],
        minQuizScore: 75,
        minFinalScore: 75,
        minStudyHours: 20,
        enabled: true,
      },
      {
        name: 'Mecânica Avançada',
        description: 'Certificação em mecânica automotiva avançada, incluindo diagnósticos eletrônicos e sistemas híbridos.',
        level: 'advanced',
        modules: [1, 2, 3],
        minQuizScore: 80,
        minFinalScore: 80,
        minStudyHours: 40,
        enabled: true,
      },
      {
        name: 'Especialista em Diagnóstico',
        description: 'Certificação de especialista em diagnóstico eletrônico automotivo e sistemas de injeção.',
        level: 'expert',
        modules: [1, 2, 3, 4],
        minQuizScore: 85,
        minFinalScore: 85,
        minStudyHours: 60,
        enabled: true,
      },
    ];

    for (const cert of certifications) {
      const existing = await prisma.certification.findFirst({
        where: { name: cert.name },
      });

      if (!existing) {
        await prisma.certification.create({
          data: cert,
        });
        console.log(`✅ Criada certificação: ${cert.name}`);
      } else {
        console.log(`⏭️  Certificação já existe: ${cert.name}`);
      }
    }

    console.log('Seed de certificações concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer seed de certificações:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedCertifications();
