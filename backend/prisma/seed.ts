import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autoskill.com' },
    update: {},
    create: {
      email: 'admin@autoskill.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'admin',
    },
  });

  console.log('✅ Usuário admin criado:', admin.email);

  // Criar usuário de teste
  const testPassword = await bcrypt.hash('teste123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'teste@autoskill.com' },
    update: {},
    create: {
      email: 'teste@autoskill.com',
      password: testPassword,
      name: 'Usuário Teste',
      role: 'user',
    },
  });

  console.log('✅ Usuário teste criado:', testUser.email);

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
