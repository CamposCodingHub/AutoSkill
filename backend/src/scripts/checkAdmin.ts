import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@autoskill.com' }
    })

    if (!admin) {
      console.log('❌ Usuário admin@autoskill.com NÃO encontrado no banco de dados')
      return
    }

    console.log('✅ Usuário admin@autoskill.com encontrado:')
    console.log('   ID:', admin.id)
    console.log('   Nome:', admin.name)
    console.log('   Email:', admin.email)
    console.log('   Role:', admin.role)
    console.log('   Senha (hash):', admin.password.substring(0, 20) + '...')

    // Verificar se a senha 123admin corresponde ao hash
    const isValid = await bcrypt.compare('123admin', admin.password)
    console.log('   Senha "123admin" válida?', isValid ? '✅ Sim' : '❌ Não')

  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
