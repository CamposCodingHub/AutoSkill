import prisma from '../utils/prisma';
import { UserResponseDTO } from '../dto/user.dto';

export class UserRepository {
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: { email: string; password: string; name: string; role?: string }) {
    return await prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<{ name: string; bio: string; avatar: string; phone: string; password: string; role: string }>) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatar: true,
        phone: true,
      },
    });
  }

  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  async findAll(options?: { skip?: number; take?: number }) {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...options,
    });
  }

  async count() {
    return await prisma.user.count();
  }
}

export default new UserRepository();
