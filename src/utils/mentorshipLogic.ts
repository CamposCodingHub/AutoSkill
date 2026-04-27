import { Mentor, MentoringSession, MentoringRequest, MentorshipMatch } from '../types/gamification';

// Base de dados mock de mentores (em produção, viria de backend)
const MOCK_MENTORS: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Carlos Silva',
    email: 'carlos.silva@email.com',
    specializations: ['Elétrica', 'Injeção Eletrônica', 'Diagnóstico'],
    experience: 15,
    certifications: ['ASE Master', 'Bosch Certified', 'Ford Specialist'],
    bio: 'Especialista em diagnóstico avançado com 15 anos de experiência em concessionárias premium.',
    availability: 'available',
    rating: 4.8,
    sessionsCompleted: 234,
    studentsMentored: 45,
    hourlyRate: 150,
    languages: ['Português', 'Inglês', 'Espanhol'],
    profileImage: '/mentors/carlos.jpg'
  },
  {
    id: 'mentor-2',
    name: 'Ana Rodrigues',
    email: 'ana.rodrigues@email.com',
    specializations: ['Veículos Híbridos', 'Elétricos', 'Baterias HV'],
    experience: 12,
    certifications: ['Tesla Certified', 'Toyota Hybrid Specialist', 'SAE J1772'],
    bio: 'Pioneira em veículos elétricos e híbridos no Brasil, com experiência em fabricação e pós-venda.',
    availability: 'available',
    rating: 4.9,
    sessionsCompleted: 189,
    studentsMentored: 38,
    hourlyRate: 180,
    languages: ['Português', 'Inglês'],
    profileImage: '/mentors/ana.jpg'
  },
  {
    id: 'mentor-3',
    name: 'Roberto Mendes',
    email: 'roberto.mendes@email.com',
    specializations: ['Transmissão', 'Freios', 'Suspensão'],
    experience: 20,
    certifications: ['ASE Master', 'ZF Specialist', 'Brembo Certified'],
    bio: 'Especialista em sistemas de transmissão e freios com experiência em corridas e veículos de alto desempenho.',
    availability: 'busy',
    rating: 4.7,
    sessionsCompleted: 312,
    studentsMentored: 67,
    hourlyRate: 200,
    languages: ['Português', 'Inglês'],
    profileImage: '/mentors/roberto.jpg'
  },
  {
    id: 'mentor-4',
    name: 'Juliana Costa',
    email: 'juliana.costa@email.com',
    specializations: ['Ar Condicionado', 'Climatização', 'Diagnóstico'],
    experience: 8,
    certifications: ['ASE', 'Delphi Certified', 'Honeywell Specialist'],
    bio: 'Especialista em sistemas de climatização automotiva com foco em diagnóstico preciso.',
    availability: 'available',
    rating: 4.6,
    sessionsCompleted: 156,
    studentsMentored: 32,
    hourlyRate: 120,
    languages: ['Português'],
    profileImage: '/mentors/juliana.jpg'
  },
  {
    id: 'mentor-5',
    name: 'Pedro Almeida',
    email: 'pedro.almeida@email.com',
    specializations: ['CAN Bus', 'Redes Veiculares', 'Programação'],
    experience: 10,
    certifications: ['Vector CANoe', 'ISO 14229', 'UDS Specialist'],
    bio: 'Engenheiro de software automotivo especializado em redes CAN e protocolos de diagnóstico.',
    availability: 'available',
    rating: 4.9,
    sessionsCompleted: 98,
    studentsMentored: 21,
    hourlyRate: 220,
    languages: ['Português', 'Inglês', 'Espanhol'],
    profileImage: '/mentors/pedro.jpg'
  }
];

// Armazenamento local de sessões e requisições
let mentoringSessions: MentoringSession[] = [];
let mentoringRequests: MentoringRequest[] = [];

// Obter todos os mentores disponíveis
export const getAvailableMentors = (): Mentor[] => {
  return MOCK_MENTORS.filter(m => m.availability === 'available');
};

// Obter mentor por ID
export const getMentorById = (mentorId: string): Mentor | undefined => {
  return MOCK_MENTORS.find(m => m.id === mentorId);
};

// Filtrar mentores por especialização
export const filterMentorsBySpecialization = (specialization: string): Mentor[] => {
  return MOCK_MENTORS.filter(m => 
    m.specializations.some(s => s.toLowerCase().includes(specialization.toLowerCase()))
  );
};

// Calcular compatibilidade entre aluno e mentor
export const calculateCompatibility = (
  studentId: string,
  studentSpecializations: string[],
  studentLevel: string,
  mentor: Mentor
): MentorshipMatch => {
  let score = 0;
  const reasons: string[] = [];
  const recommendedTopics: string[] = [];

  // Pontuação por especialização matching
  const matchingSpecializations = studentSpecializations.filter(s =>
    mentor.specializations.some(ms => ms.toLowerCase().includes(s.toLowerCase()))
  );
  
  if (matchingSpecializations.length > 0) {
    score += 30;
    reasons.push(`Especializações compatíveis: ${matchingSpecializations.join(', ')}`);
    recommendedTopics.push(...matchingSpecializations);
  }

  // Pontuação por rating do mentor
  if (mentor.rating >= 4.5) {
    score += 25;
    reasons.push('Mentor com avaliação excelente');
  } else if (mentor.rating >= 4.0) {
    score += 15;
    reasons.push('Mentor com boa avaliação');
  }

  // Pontuação por experiência
  if (mentor.experience >= 10) {
    score += 20;
    reasons.push('Mentor com ampla experiência');
  } else if (mentor.experience >= 5) {
    score += 10;
    reasons.push('Mentor com experiência sólida');
  }

  // Pontuação por disponibilidade
  if (mentor.availability === 'available') {
    score += 15;
    reasons.push('Mentor disponível imediatamente');
  }

  // Pontuação por número de sessões (indica experiência em mentoria)
  if (mentor.sessionsCompleted >= 100) {
    score += 10;
    reasons.push('Experiência comprovada em mentoria');
  }

  // Adicionar tópicos recomendados baseados nas especializações do mentor
  if (recommendedTopics.length === 0) {
    recommendedTopics.push(...mentor.specializations.slice(0, 2));
  }

  return {
    studentId,
    mentorId: mentor.id,
    compatibilityScore: Math.min(score, 100),
    reasons,
    recommendedTopics
  };
};

// Encontrar melhores mentores para um aluno
export const findBestMentors = (
  studentId: string,
  studentSpecializations: string[],
  studentLevel: string,
  limit: number = 5
): MentorshipMatch[] => {
  const matches = MOCK_MENTORS.map(mentor =>
    calculateCompatibility(studentId, studentSpecializations, studentLevel, mentor)
  );

  return matches
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);
};

// Criar requisição de mentoria
export const createMentoringRequest = (
  studentId: string,
  mentorId: string,
  topic: string,
  description: string,
  preferredDate: Date
): MentoringRequest => {
  const request: MentoringRequest = {
    id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    studentId,
    mentorId,
    topic,
    description,
    preferredDate,
    status: 'pending',
    createdAt: new Date()
  };

  mentoringRequests.push(request);
  saveRequestsToStorage();

  return request;
};

// Aceitar requisição de mentoria
export const acceptMentoringRequest = (requestId: string): MentoringSession | null => {
  const requestIndex = mentoringRequests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) return null;

  const request = mentoringRequests[requestIndex];
  request.status = 'accepted';
  mentoringRequests[requestIndex] = request;

  // Criar sessão de mentoria
  const session: MentoringSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mentorId: request.mentorId,
    studentId: request.studentId,
    scheduledDate: request.preferredDate,
    duration: 60, // 1 hora padrão
    status: 'scheduled',
    topic: request.topic,
    notes: request.description
  };

  mentoringSessions.push(session);
  saveSessionsToStorage();
  saveRequestsToStorage();

  return session;
};

// Rejeitar requisição de mentoria
export const rejectMentoringRequest = (requestId: string): boolean => {
  const requestIndex = mentoringRequests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) return false;

  mentoringRequests[requestIndex].status = 'rejected';
  saveRequestsToStorage();

  return true;
};

// Obter requisições pendentes de um mentor
export const getPendingRequestsForMentor = (mentorId: string): MentoringRequest[] => {
  return mentoringRequests.filter(r => r.mentorId === mentorId && r.status === 'pending');
};

// Obter requisições de um aluno
export const getRequestsForStudent = (studentId: string): MentoringRequest[] => {
  return mentoringRequests.filter(r => r.studentId === studentId);
};

// Obter sessões de mentoria de um aluno
export const getSessionsForStudent = (studentId: string): MentoringSession[] => {
  return mentoringSessions.filter(s => s.studentId === studentId);
};

// Obter sessões de mentoria de um mentor
export const getSessionsForMentor = (mentorId: string): MentoringSession[] => {
  return mentoringSessions.filter(s => s.mentorId === mentorId);
};

// Iniciar sessão de mentoria
export const startMentoringSession = (sessionId: string): boolean => {
  const sessionIndex = mentoringSessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return false;

  mentoringSessions[sessionIndex].status = 'in_progress';
  saveSessionsToStorage();

  return true;
};

// Completar sessão de mentoria
export const completeMentoringSession = (
  sessionId: string,
  notes?: string,
  recordingUrl?: string
): boolean => {
  const sessionIndex = mentoringSessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return false;

  mentoringSessions[sessionIndex].status = 'completed';
  mentoringSessions[sessionIndex].notes = notes;
  mentoringSessions[sessionIndex].recordingUrl = recordingUrl;
  saveSessionsToStorage();

  return true;
};

// Avaliar sessão de mentoria
export const rateMentoringSession = (
  sessionId: string,
  studentRating?: number,
  mentorRating?: number,
  feedback?: string
): boolean => {
  const sessionIndex = mentoringSessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return false;

  mentoringSessions[sessionIndex].studentRating = studentRating;
  mentoringSessions[sessionIndex].mentorRating = mentorRating;
  mentoringSessions[sessionIndex].feedback = feedback;
  saveSessionsToStorage();

  return true;
};

// Cancelar sessão de mentoria
export const cancelMentoringSession = (sessionId: string): boolean => {
  const sessionIndex = mentoringSessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return false;

  mentoringSessions[sessionIndex].status = 'cancelled';
  saveSessionsToStorage();

  return true;
};

// Salvar sessões no localStorage
const saveSessionsToStorage = (): void => {
  try {
    localStorage.setItem('autoskill_mentoring_sessions', JSON.stringify(mentoringSessions));
  } catch (error) {
    console.error('Erro ao salvar sessões de mentoria:', error);
  }
};

// Salvar requisições no localStorage
const saveRequestsToStorage = (): void => {
  try {
    localStorage.setItem('autoskill_mentoring_requests', JSON.stringify(mentoringRequests));
  } catch (error) {
    console.error('Erro ao salvar requisições de mentoria:', error);
  }
};

// Carregar sessões do localStorage
export const loadMentoringData = (): void => {
  try {
    const storedSessions = localStorage.getItem('autoskill_mentoring_sessions');
    if (storedSessions) {
      mentoringSessions = JSON.parse(storedSessions);
      mentoringSessions = mentoringSessions.map(s => ({
        ...s,
        scheduledDate: new Date(s.scheduledDate)
      }));
    }

    const storedRequests = localStorage.getItem('autoskill_mentoring_requests');
    if (storedRequests) {
      mentoringRequests = JSON.parse(storedRequests);
      mentoringRequests = mentoringRequests.map(r => ({
        ...r,
        preferredDate: new Date(r.preferredDate),
        createdAt: new Date(r.createdAt)
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar dados de mentoria:', error);
  }
};
