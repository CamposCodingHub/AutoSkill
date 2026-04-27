import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';

async function resetAdminPassword() {
  try {
    // Buscar o usuário admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@autoskill.com' }
    });

    if (!admin) {
      console.log('Usuário admin@autoskill.com não encontrado. Criando novo admin...');
      
      // Criar novo admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@autoskill.com',
          password: hashedPassword,
          name: 'Administrador',
          role: 'admin'
        }
      });
      
      console.log('Novo admin criado com sucesso!');
      console.log('Email: admin@autoskill.com');
      console.log('Senha: admin123');
    } else {
      // Resetar senha do admin existente
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@autoskill.com' },
        data: { password: hashedPassword }
      });
      
      console.log('Senha do admin resetada com sucesso!');
      console.log('Email: admin@autoskill.com');
      console.log('Senha: admin123');
    }
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
