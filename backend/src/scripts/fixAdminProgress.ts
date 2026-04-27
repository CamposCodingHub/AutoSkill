import prisma from '../utils/prisma';

async function fixAdminProgress() {
  try {
    console.log('=== CRIANDO PROGRESSO PARA ADMIN ===\n');

    // Buscar o usuário admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@autoskill.com' }
    });

    if (!admin) {
      console.log('❌ Usuário admin@autoskill.com não encontrado');
      return;
    }

    // Verificar se já tem progresso
    const existingProgress = await prisma.progress.findUnique({
      where: { userId: admin.id }
    });

    if (existingProgress) {
      console.log('✅ Progresso já existe para o admin');
      return;
    }

    // Criar progresso
    await prisma.progress.create({
      data: {
        userId: admin.id,
        completedLessons: {},
        quizAnswers: {},
        lessonQuizProgress: {},
      },
    });

    console.log('✅ Progresso criado com sucesso para o admin');
  } catch (error) {
    console.error('Erro ao criar progresso:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminProgress();
