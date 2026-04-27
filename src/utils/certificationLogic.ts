import { Certification, UserCertification, ExamAttempt } from '../types/gamification';

// Certificações disponíveis
export const AVAILABLE_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-electrical-basic',
    name: 'Certificação em Elétrica Básica',
    description: 'Domine os fundamentos de eletricidade automotiva, circuitos e medições.',
    issuer: 'AutoSkill Institute',
    category: 'electrical',
    level: 'basic',
    requirements: ['Completar Módulos 1-3', 'Mínimo 80% de acertos nos quizzes'],
    modulesRequired: [1, 2, 3],
    examDuration: 60,
    passingScore: 80,
    validityPeriod: 24,
    price: 0
  },
  {
    id: 'cert-diagnostic-intermediate',
    name: 'Certificação em Diagnóstico Intermediário',
    description: 'Habilidades avançadas em diagnóstico de sistemas eletrônicos.',
    issuer: 'AutoSkill Institute',
    category: 'diagnostic',
    level: 'intermediate',
    requirements: ['Completar Módulos 4-10', 'Certificação Elétrica Básica'],
    modulesRequired: [4, 5, 6, 7, 8, 9, 10],
    examDuration: 90,
    passingScore: 75,
    validityPeriod: 36,
    price: 199
  },
  {
    id: 'cert-hybrid-advanced',
    name: 'Certificação em Veículos Híbridos',
    description: 'Especialização em sistemas híbridos e alta tensão.',
    issuer: 'AutoSkill Institute',
    category: 'hybrid',
    level: 'advanced',
    requirements: ['Completar Módulos 11-15', 'Certificação Diagnóstico Intermediário'],
    modulesRequired: [11, 12, 13, 14, 15],
    examDuration: 120,
    passingScore: 85,
    validityPeriod: 24,
    price: 299
  },
  {
    id: 'cert-ev-expert',
    name: 'Certificação em Veículos Elétricos',
    description: 'Domínio completo de BEVs, baterias e sistemas de propulsão elétrica.',
    issuer: 'AutoSkill Institute',
    category: 'ev',
    level: 'expert',
    requirements: ['Completar Módulos 16-20', 'Certificação Híbridos'],
    modulesRequired: [16, 17, 18, 19, 20],
    examDuration: 150,
    passingScore: 90,
    validityPeriod: 18,
    price: 399
  },
  {
    id: 'cert-network-master',
    name: 'Certificação em Redes Veiculares',
    description: 'Especialista em CAN Bus, LIN, Ethernet e protocolos automotivos.',
    issuer: 'AutoSkill Institute',
    category: 'diagnostic',
    level: 'advanced',
    requirements: ['Completar Módulos 8-12', 'Experiência prática com scanners'],
    modulesRequired: [8, 9, 10, 11, 12],
    examDuration: 100,
    passingScore: 80,
    validityPeriod: 36,
    price: 249
  }
];

// Armazenamento local
let userCertifications: UserCertification[] = [];
let examAttempts: ExamAttempt[] = [];

// Obter todas as certificações disponíveis
export const getAllCertifications = (): Certification[] => {
  return AVAILABLE_CERTIFICATIONS;
};

// Obter certificação por ID
export const getCertificationById = (certId: string): Certification | undefined => {
  return AVAILABLE_CERTIFICATIONS.find(c => c.id === certId);
};

// Obter certificações do usuário
export const getUserCertifications = (userId: string): UserCertification[] => {
  return userCertifications.filter(c => c.userId === userId);
};

// Verificar se usuário é elegível para certificação
export const checkEligibility = (
  userId: string,
  certificationId: string,
  completedModules: number[]
): { eligible: boolean; reasons: string[] } => {
  const certification = getCertificationById(certificationId);
  if (!certification) {
    return { eligible: false, reasons: ['Certificação não encontrada'] };
  }

  const reasons: string[] = [];

  // Verificar módulos requeridos
  const missingModules = certification.modulesRequired.filter(
    mod => !completedModules.includes(mod)
  );

  if (missingModules.length > 0) {
    reasons.push(`Complete os módulos: ${missingModules.join(', ')}`);
  }

  // Verificar certificações pré-requisitas
  if (certification.level === 'intermediate') {
    const basicCert = userCertifications.find(
      c => c.userId === userId && c.certificationId === 'cert-electrical-basic'
    );
    if (!basicCert) {
      reasons.push('Obtenha a Certificação em Elétrica Básica primeiro');
    }
  }

  if (certification.level === 'advanced') {
    const intermediateCert = userCertifications.find(
      c => c.userId === userId && c.certificationId === 'cert-diagnostic-intermediate'
    );
    if (!intermediateCert) {
      reasons.push('Obtenha a Certificação em Diagnóstico Intermediário primeiro');
    }
  }

  if (certification.level === 'expert') {
    const advancedCert = userCertifications.find(
      c => c.userId === userId && c.certificationId === 'cert-hybrid-advanced'
    );
    if (!advancedCert) {
      reasons.push('Obtenha a Certificação em Veículos Híbridos primeiro');
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
};

// Iniciar exame
export const startExam = (userId: string, certificationId: string): ExamAttempt => {
  const attempt: ExamAttempt = {
    id: `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    certificationId,
    startTime: new Date(),
    score: 0,
    passed: false,
    answers: {},
    timeSpent: 0
  };

  examAttempts.push(attempt);
  saveExamAttempts();

  return attempt;
};

// Submeter exame
export const submitExam = (
  attemptId: string,
  answers: Record<string, number>
): ExamAttempt | null => {
  const attemptIndex = examAttempts.findIndex(a => a.id === attemptId);
  if (attemptIndex === -1) return null;

  const attempt = examAttempts[attemptIndex];
  const certification = getCertificationById(attempt.certificationId);
  if (!certification) return null;

  attempt.endTime = new Date();
  attempt.answers = answers;
  attempt.timeSpent = Math.floor((attempt.endTime.getTime() - attempt.startTime.getTime()) / 1000);

  // Calcular score (simplificado - em produção seria baseado em questões reais)
  const correctAnswers = Object.values(answers).filter(a => a === 0).length;
  const totalQuestions = Object.keys(answers).length;
  attempt.score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  attempt.passed = attempt.score >= certification.passingScore;

  examAttempts[attemptIndex] = attempt;
  saveExamAttempts();

  // Se passou, emitir certificação
  if (attempt.passed) {
    issueCertification(attempt.userId, attempt.certificationId, attempt.score);
  }

  return attempt;
};

// Emitir certificação
export const issueCertification = (
  userId: string,
  certificationId: string,
  score: number
): UserCertification | null => {
  const certification = getCertificationById(certificationId);
  if (!certification) return null;

  // Verificar se já possui
  const existing = userCertifications.find(
    c => c.userId === userId && c.certificationId === certificationId
  );
  if (existing) return existing;

  const userCert: UserCertification = {
    id: `user-cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    certificationId,
    issueDate: new Date(),
    expiryDate: certification.validityPeriod 
      ? new Date(Date.now() + certification.validityPeriod * 30 * 24 * 60 * 60 * 1000)
      : undefined,
    score,
    certificateUrl: `/certificates/${userId}-${certificationId}.pdf`,
    verified: false
  };

  userCertifications.push(userCert);
  saveUserCertifications();

  return userCert;
};

// Obter tentativas de exame do usuário
export const getExamAttempts = (userId: string): ExamAttempt[] => {
  return examAttempts.filter(a => a.userId === userId);
};

// Obter tentativas por certificação
export const getAttemptsForCertification = (
  userId: string,
  certificationId: string
): ExamAttempt[] => {
  return examAttempts.filter(
    a => a.userId === userId && a.certificationId === certificationId
  );
};

// Verificar se certificação está expirada
export const isCertificationExpired = (userCert: UserCertification): boolean => {
  if (!userCert.expiryDate) return false;
  return new Date() > userCert.expiryDate;
};

// Renovar certificação
export const renewCertification = (
  userCertId: string
): UserCertification | null => {
  const certIndex = userCertifications.findIndex(c => c.id === userCertId);
  if (certIndex === -1) return null;

  const userCert = userCertifications[certIndex];
  const certification = getCertificationById(userCert.certificationId);
  if (!certification) return null;

  userCert.issueDate = new Date();
  userCert.expiryDate = certification.validityPeriod
    ? new Date(Date.now() + certification.validityPeriod * 30 * 24 * 60 * 60 * 1000)
    : undefined;

  userCertifications[certIndex] = userCert;
  saveUserCertifications();

  return userCert;
};

// Salvar certificações no localStorage
const saveUserCertifications = (): void => {
  try {
    localStorage.setItem('autoskill_user_certifications', JSON.stringify(userCertifications));
  } catch (error) {
    console.error('Erro ao salvar certificações:', error);
  }
};

// Salvar tentativas de exame
const saveExamAttempts = (): void => {
  try {
    localStorage.setItem('autoskill_exam_attempts', JSON.stringify(examAttempts));
  } catch (error) {
    console.error('Erro ao salvar tentativas de exame:', error);
  }
};

// Carregar dados do localStorage
export const loadCertificationData = (): void => {
  try {
    const storedCerts = localStorage.getItem('autoskill_user_certifications');
    if (storedCerts) {
      userCertifications = JSON.parse(storedCerts);
      userCertifications = userCertifications.map(c => ({
        ...c,
        issueDate: new Date(c.issueDate),
        expiryDate: c.expiryDate ? new Date(c.expiryDate) : undefined
      }));
    }

    const storedAttempts = localStorage.getItem('autoskill_exam_attempts');
    if (storedAttempts) {
      examAttempts = JSON.parse(storedAttempts);
      examAttempts = examAttempts.map(a => ({
        ...a,
        startTime: new Date(a.startTime),
        endTime: a.endTime ? new Date(a.endTime) : undefined
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar dados de certificação:', error);
  }
};
