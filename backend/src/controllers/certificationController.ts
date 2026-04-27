import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { generateCertificatePDF } from '../services/certificateService';
import path from 'path';
import fs from 'fs';

// Criar certificação (admin)
export const createCertification = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, level, modules, minQuizScore, minFinalScore, minStudyHours } = req.body;

    const certification = await prisma.certification.create({
      data: {
        name,
        description,
        level,
        modules,
        minQuizScore: minQuizScore || 70,
        minFinalScore: minFinalScore || 70,
        minStudyHours: minStudyHours || 10,
      },
    });

    res.json(certification);
  } catch (error) {
    console.error('Erro ao criar certificação:', error);
    res.status(500).json({ error: 'Erro ao criar certificação' });
  }
};

// Listar todas as certificações
export const getCertifications = async (req: AuthRequest, res: Response) => {
  try {
    const certifications = await prisma.certification.findMany({
      where: { enabled: true },
      orderBy: { level: 'asc' },
    });

    res.json(certifications);
  } catch (error) {
    console.error('Erro ao buscar certificações:', error);
    res.status(500).json({ error: 'Erro ao buscar certificações' });
  }
};

// Buscar progresso do usuário em certificações
export const getUserCertificationProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const progress = await prisma.certificationProgress.findMany({
      where: { userId },
      include: {
        certification: true,
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('Erro ao buscar progresso de certificações:', error);
    res.status(500).json({ error: 'Erro ao buscar progresso de certificações' });
  }
};

// Verificar elegibilidade para certificação
export const checkEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { certificationId } = req.params;

    // Buscar certificação
    const certification = await prisma.certification.findUnique({
      where: { id: certificationId },
    });

    if (!certification) {
      return res.status(404).json({ error: 'Certificação não encontrada' });
    }

    // Buscar progresso do usuário
    const userProgress = await prisma.progress.findUnique({
      where: { userId },
    });

    if (!userProgress) {
      return res.status(404).json({ error: 'Progresso do usuário não encontrado' });
    }

    // Buscar gamificação para horas de estudo
    const gamification = await prisma.gamification.findUnique({
      where: { userId },
    });

    // Calcular módulos completados
    const completedLessons = userProgress.completedLessons as any;
    const requiredModules = certification.modules as number[];
    const completedModules: number[] = [];

    requiredModules.forEach(moduleId => {
      const moduleLessons = Object.keys(completedLessons).filter(key => key.startsWith(`${moduleId}-`));
      if (moduleLessons.length > 0) {
        completedModules.push(moduleId);
      }
    });

    // Calcular média dos quizzes
    const quizProgress = userProgress.lessonQuizProgress as any;
    let totalCorrect = 0;
    let totalAnswered = 0;

    Object.values(quizProgress).forEach((progress: any) => {
      if (progress) {
        totalCorrect += progress.correct || 0;
        totalAnswered += progress.answered || 0;
      }
    });

    const averageQuizScore = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    // Verificar elegibilidade
    const isEligible =
      completedModules.length >= requiredModules.length &&
      averageQuizScore >= certification.minQuizScore &&
      (gamification?.weeklyXP || 0) >= certification.minStudyHours * 50; // Assumindo 50 XP por hora

    res.json({
      eligible: isEligible,
      completedModules,
      requiredModules,
      averageQuizScore,
      minQuizScore: certification.minQuizScore,
      studyHours: (gamification?.weeklyXP || 0) / 50,
      minStudyHours: certification.minStudyHours,
    });
  } catch (error) {
    console.error('Erro ao verificar elegibilidade:', error);
    res.status(500).json({ error: 'Erro ao verificar elegibilidade' });
  }
};

// Emitir certificação
export const issueCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { certificationId } = req.params;
    const { finalExamScore } = req.body;

    // Verificar elegibilidade primeiro
    const eligibilityCheck = await checkEligibility({ userId, params: { certificationId } } as any, res as any);
    const eligibility = eligibilityCheck.json ? await eligibilityCheck.json() : null;

    if (!eligibility?.eligible) {
      return res.status(400).json({ error: 'Usuário não é elegível para esta certificação' });
    }

    // Verificar pontuação da prova final
    const certification = await prisma.certification.findUnique({
      where: { id: certificationId },
    });

    if (finalExamScore < certification.minFinalScore) {
      return res.status(400).json({ error: 'Pontuação da prova final insuficiente' });
    }

    // Criar ou atualizar progresso de certificação
    const progress = await prisma.certificationProgress.upsert({
      where: {
        userId_certificationId: {
          userId,
          certificationId,
        },
      },
      update: {
        status: 'completed',
        finalExamScore,
        completedAt: new Date(),
      },
      create: {
        userId,
        certificationId,
        status: 'completed',
        finalExamScore,
        completedAt: new Date(),
      },
    });

    // Gerar PDF do certificado
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && certification) {
        const certificatesDir = path.join(__dirname, '../../certificates');
        if (!fs.existsSync(certificatesDir)) {
          fs.mkdirSync(certificatesDir, { recursive: true });
        }

        const fileName = `certificate_${userId}_${certificationId}_${Date.now()}.pdf`;
        const filePath = path.join(certificatesDir, fileName);

        await generateCertificatePDF({
          userName: user.name,
          certificationName: certification.name,
          certificationLevel: certification.level,
          completionDate: new Date(),
          finalScore: finalExamScore,
          modules: certification.modules || [],
        }, filePath);

        // Atualizar progresso com URL do certificado
        const updatedProgress = await prisma.certificationProgress.update({
          where: {
            userId_certificationId: {
              userId,
              certificationId,
            },
          },
          data: {
            certificateUrl: `/certificates/${fileName}`,
          },
        });

        res.json(updatedProgress);
      } else {
        res.json(progress);
      }
    } catch (pdfError) {
      console.error('Erro ao gerar PDF:', pdfError);
      // Retornar progresso mesmo sem PDF
      res.json(progress);
    }
  } catch (error) {
    console.error('Erro ao emitir certificado:', error);
    res.status(500).json({ error: 'Erro ao emitir certificado' });
  }
};

// Listar certificações (admin)
export const getAllCertifications = async (req: AuthRequest, res: Response) => {
  try {
    const certifications = await prisma.certification.findMany({
      include: {
        progress: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(certifications);
  } catch (error) {
    console.error('Erro ao buscar certificações:', error);
    res.status(500).json({ error: 'Erro ao buscar certificações' });
  }
};

// Atualizar certificação (admin)
export const updateCertification = async (req: AuthRequest, res: Response) => {
  try {
    const { certificationId } = req.params;
    const { name, description, level, modules, minQuizScore, minFinalScore, minStudyHours, enabled } = req.body;

    const certification = await prisma.certification.update({
      where: { id: certificationId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(level && { level }),
        ...(modules && { modules }),
        ...(minQuizScore !== undefined && { minQuizScore }),
        ...(minFinalScore !== undefined && { minFinalScore }),
        ...(minStudyHours !== undefined && { minStudyHours }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    res.json(certification);
  } catch (error) {
    console.error('Erro ao atualizar certificação:', error);
    res.status(500).json({ error: 'Erro ao atualizar certificação' });
  }
};

// Deletar certificação (admin)
export const deleteCertification = async (req: AuthRequest, res: Response) => {
  try {
    const { certificationId } = req.params;

    await prisma.certification.delete({
      where: { id: certificationId },
    });

    res.json({ message: 'Certificação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar certificação:', error);
    res.status(500).json({ error: 'Erro ao deletar certificação' });
  }
};

// Emitir certificado manualmente (admin) - sem verificação de elegibilidade
export const issueCertificateManually = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== Emitindo certificado manualmente ===');
    const { userId, certificationId, finalExamScore } = req.body;
    console.log('Dados recebidos:', { userId, certificationId, finalExamScore });

    // Verificar se usuário e certificação existem
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    console.log('Usuário encontrado:', user ? user.name : 'NÃO');

    const certification = await prisma.certification.findUnique({
      where: { id: certificationId },
    });
    console.log('Certificação encontrada:', certification ? certification.name : 'NÃO');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (!certification) {
      return res.status(404).json({ error: 'Certificação não encontrada' });
    }

    // Gerar código de verificação único
    const verificationCode = `ASK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Criar ou atualizar progresso de certificação
    const progress = await prisma.certificationProgress.upsert({
      where: {
        userId_certificationId: {
          userId,
          certificationId,
        },
      },
      update: {
        status: 'completed',
        finalExamScore: finalExamScore || 100,
        completedAt: new Date(),
        verificationCode,
      },
      create: {
        userId,
        certificationId,
        status: 'completed',
        finalExamScore: finalExamScore || 100,
        completedAt: new Date(),
        completedModules: [],
        verificationCode,
      },
    });

    // Gerar PDF do certificado (opcional - não falhar se der erro)
    try {
      const certificatesDir = path.join(__dirname, '../../certificates');
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }

      const fileName = `certificate_${userId}_${certificationId}_${Date.now()}.pdf`;
      const filePath = path.join(certificatesDir, fileName);

      console.log('Gerando PDF em:', filePath);
      await generateCertificatePDF({
        userName: user.name,
        certificationName: certification.name,
        certificationLevel: certification.level,
        completionDate: new Date(),
        finalScore: finalExamScore || 100,
        modules: certification.modules || [],
        verificationCode,
      }, filePath);
      console.log('PDF gerado com sucesso');

      // Atualizar progresso com URL do certificado
      const updatedProgress = await prisma.certificationProgress.update({
        where: {
          userId_certificationId: {
            userId,
            certificationId,
          },
        },
        data: {
          certificateUrl: `/certificates/${fileName}`,
        },
      });

      console.log('Certificado emitido com sucesso. Código de verificação:', verificationCode);
      res.json({ ...updatedProgress, verificationCode });
    } catch (pdfError) {
      console.error('Erro ao gerar PDF (não crítico):', pdfError);
      // Retornar progresso mesmo sem PDF
      console.log('Retornando progresso sem PDF');
      res.json({ ...progress, verificationCode });
    }
  } catch (error) {
    console.error('Erro ao emitir certificado manualmente:', error);
    res.status(500).json({ error: 'Erro ao emitir certificado manualmente', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Atualizar progresso de certificação (admin)
export const updateCertificationProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userName, finalExamScore, completedAt } = req.body;

    // Buscar o progresso atual
    const progress = await prisma.certificationProgress.findUnique({
      where: { id },
      include: { user: true, certification: true },
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progresso de certificação não encontrado' });
    }

    // Atualizar o nome do usuário se necessário
    if (userName && userName !== progress.user.name) {
      await prisma.user.update({
        where: { id: progress.userId },
        data: { name: userName },
      });
    }

    // Atualizar o progresso
    const updatedProgress = await prisma.certificationProgress.update({
      where: { id },
      data: {
        finalExamScore: finalExamScore !== undefined ? finalExamScore : progress.finalExamScore,
        completedAt: completedAt ? new Date(completedAt) : progress.completedAt,
      },
      include: {
        user: true,
        certification: true,
      },
    });

    // Regenerar PDF se houver mudanças
    if (userName || finalExamScore !== undefined || completedAt) {
      try {
        const certificatesDir = path.join(__dirname, '../../certificates');
        if (!fs.existsSync(certificatesDir)) {
          fs.mkdirSync(certificatesDir, { recursive: true });
        }

        const fileName = `certificate_${progress.userId}_${progress.certificationId}_${Date.now()}.pdf`;
        const filePath = path.join(certificatesDir, fileName);

        await generateCertificatePDF({
          userName: userName || progress.user.name,
          certificationName: progress.certification.name,
          certificationLevel: progress.certification.level,
          completionDate: completedAt ? new Date(completedAt) : progress.completedAt,
          finalScore: finalExamScore !== undefined ? finalExamScore : progress.finalExamScore,
          modules: progress.certification.modules || [],
        }, filePath);

        // Atualizar URL do certificado
        const finalProgress = await prisma.certificationProgress.update({
          where: { id },
          data: {
            certificateUrl: `/certificates/${fileName}`,
          },
          include: {
            user: true,
            certification: true,
          },
        });

        res.json(finalProgress);
      } catch (pdfError) {
        console.error('Erro ao regenerar PDF:', pdfError);
        res.json(updatedProgress);
      }
    } else {
      res.json(updatedProgress);
    }
  } catch (error) {
    console.error('Erro ao atualizar progresso de certificação:', error);
    res.status(500).json({ error: 'Erro ao atualizar progresso de certificação' });
  }
};

// Deletar progresso de certificação (admin)
export const deleteCertificationProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar o progresso antes de deletar
    const progress = await prisma.certificationProgress.findUnique({
      where: { id },
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progresso de certificação não encontrado' });
    }

    // Deletar o arquivo PDF se existir
    if (progress.certificateUrl) {
      const filePath = path.join(__dirname, '../../certificates', path.basename(progress.certificateUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Deletar o progresso
    await prisma.certificationProgress.delete({
      where: { id },
    });

    res.json({ message: 'Certificado excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar progresso de certificação:', error);
    res.status(500).json({ error: 'Erro ao deletar progresso de certificação' });
  }
};

// Verificar certificado pelo código de verificação
export const verifyCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;

    const progress = await prisma.certificationProgress.findUnique({
      where: { verificationCode: code },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        certification: true,
      },
    });

    if (!progress) {
      return res.status(404).json({ 
        valid: false,
        error: 'Certificado não encontrado ou código inválido' 
      });
    }

    if (progress.status !== 'completed') {
      return res.status(400).json({ 
        valid: false,
        error: 'Certificado não está completo' 
      });
    }

    res.json({
      valid: true,
      certificate: {
        userName: progress.user.name,
        userEmail: progress.user.email,
        certificationName: progress.certification.name,
        certificationLevel: progress.certification.level,
        finalExamScore: progress.finalExamScore,
        completedAt: progress.completedAt,
        verificationCode: progress.verificationCode,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar certificado:', error);
    res.status(500).json({ error: 'Erro ao verificar certificado' });
  }
};
