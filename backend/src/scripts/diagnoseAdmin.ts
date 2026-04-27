import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';

async function diagnoseAdmin() {
  try {
    console.log('=== DIAGNÓSTICO DO ADMIN ===\n');

    // Buscar o usuário admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@autoskill.com' }
    });

    if (!admin) {
      console.log('❌ Usuário admin@autoskill.com NÃO existe no banco de dados');
      console.log('Solução: Criar novo admin');
      return;
    }

    console.log('✅ Usuário admin@autoskill.com encontrado');
    console.log('ID:', admin.id);
    console.log('Nome:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Senha (hash):', admin.password.substring(0, 50) + '...');
    console.log('Avatar:', admin.avatar ? 'Sim' : 'Não');
    console.log('Bio:', admin.bio || 'Não definida');
    console.log('Phone:', admin.phone || 'Não definido');
    console.log('Criado em:', admin.createdAt);

    // Testar hash da senha
    console.log('\n=== TESTE DE SENHA ===\n');
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    console.log('Senha testada:', testPassword);
    console.log('Hash válido:', isValid ? '✅ SIM' : '❌ NÃO');

    if (!isValid) {
      console.log('\n❌ O hash da senha está incorreto!');
      console.log('Solução: Resetar a senha novamente');
    } else {
      console.log('\n✅ O hash da senha está correto');
      console.log('O problema pode estar no frontend ou na requisição');
    }

    // Verificar se tem progresso e gamificação
    console.log('\n=== VERIFICAR DADOS RELACIONADOS ===\n');
    
    const progress = await prisma.progress.findUnique({
      where: { userId: admin.id }
    });
    console.log('Progresso:', progress ? '✅ Existe' : '❌ Não existe');

    const gamification = await prisma.gamification.findUnique({
      where: { userId: admin.id }
    });
    console.log('Gamificação:', gamification ? '✅ Existe' : '❌ Não existe');

  } catch (error) {
    console.error('Erro ao diagnosticar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseAdmin();
