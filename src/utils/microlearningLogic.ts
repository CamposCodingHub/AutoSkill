import { MicroLesson, LearningPath } from '../types/gamification';

// Base de dados de micro-aulas
const MICRO_LESSONS: MicroLesson[] = [
  {
    id: 'micro-1',
    moduleId: 1,
    originalLessonId: '1',
    title: 'O que é um motor de combustão interna?',
    content: [
      'Um motor de combustão interna converte energia química em energia mecânica.',
      'O processo ocorre dentro de câmaras de combustão.',
      'Existem motores a gasolina, diesel e híbridos.',
      'O ciclo básico envolve admissão, compressão, combustão e escape.'
    ],
    duration: 5,
    difficulty: 'beginner',
    tags: ['motor', 'básico', 'combustão'],
    prerequisites: [],
    quiz: {
      question: 'Qual é a função principal de um motor de combustão interna?',
      options: ['Armazenar energia', 'Converter energia química em mecânica', 'Gerar eletricidade', 'Resfriar o veículo'],
      correct: 1
    },
    completed: false
  },
  {
    id: 'micro-2',
    moduleId: 1,
    originalLessonId: '1',
    title: 'Componentes básicos do motor',
    content: [
      'Blocos do motor: bloco, cabeçote, cárter.',
      'Sistema de lubrificação: bomba de óleo, filtro, galerias.',
      'Sistema de arrefecimento: radiador, bomba d\'água, termostato.',
      'Sistema de ignição: velas, bobinas, cabos.'
    ],
    duration: 7,
    difficulty: 'beginner',
    tags: ['motor', 'componentes', 'sistemas'],
    prerequisites: ['micro-1'],
    quiz: {
      question: 'Qual componente é responsável pelo lubrificação do motor?',
      options: ['Radiador', 'Bomba de óleo', 'Termostato', 'Vela'],
      correct: 1
    },
    completed: false
  },
  {
    id: 'micro-3',
    moduleId: 2,
    originalLessonId: '1',
    title: 'Como funciona a bateria automotiva',
    content: [
      'A bateria fornece energia para partida e sistemas elétricos.',
      'Baterias de chumbo-ácido são as mais comuns.',
      'Voltagem nominal: 12V.',
      'Células conectadas em série para aumentar voltagem.'
    ],
    duration: 5,
    difficulty: 'beginner',
    tags: ['elétrica', 'bateria', 'básico'],
    prerequisites: [],
    quiz: {
      question: 'Qual é a voltagem nominal de uma bateria automotiva padrão?',
      options: ['6V', '12V', '24V', '48V'],
      correct: 1
    },
    completed: false
  },
  {
    id: 'micro-4',
    moduleId: 2,
    originalLessonId: '2',
    title: 'Alternador: como funciona',
    content: [
      'O alternador gera eletricidade enquanto o motor funciona.',
      'Converte energia mecânica em elétrica.',
      'Carrega a bateria e alimenta sistemas elétricos.',
      'Regulador de voltagem mantém saída estável (13.8-14.4V).'
    ],
    duration: 6,
    difficulty: 'intermediate',
    tags: ['elétrica', 'alternador', 'geração'],
    prerequisites: ['micro-3'],
    quiz: {
      question: 'Qual é a voltagem de saída ideal do alternador?',
      options: ['10-11V', '12-13V', '13.8-14.4V', '15-16V'],
      correct: 2
    },
    completed: false
  },
  {
    id: 'micro-5',
    moduleId: 5,
    originalLessonId: '1',
    title: 'Sistema de injeção eletrônica: básico',
    content: [
      'Injeção eletrônica substituiu carburadores.',
      'ECU controla quantidade de combustível injetado.',
      'Sensores fornecem dados para cálculo preciso.',
      'Injetores pulverizam combustível no coletor.'
    ],
    duration: 8,
    difficulty: 'intermediate',
    tags: ['injeção', 'ECU', 'sensores'],
    prerequisites: ['micro-1'],
    quiz: {
      question: 'Qual componente controla a injeção eletrônica?',
      options: ['Carburador', 'ECU', 'Alternador', 'Radiador'],
      correct: 1
    },
    completed: false
  },
  {
    id: 'micro-6',
    moduleId: 5,
    originalLessonId: '2',
    title: 'Sensores do sistema de injeção',
    content: [
      'MAF: mede fluxo de ar admitido.',
      'MAP: pressão absoluta no coletor.',
      'TPS: posição da borboleta.',
      'O2: oxigênio no escapamento (lambda).'
    ],
    duration: 7,
    difficulty: 'intermediate',
    tags: ['injeção', 'sensores', 'diagnóstico'],
    prerequisites: ['micro-5'],
    quiz: {
      question: 'Qual sensor mede o fluxo de ar admitido?',
      options: ['MAP', 'MAF', 'TPS', 'O2'],
      correct: 1
    },
    completed: false
  },
  {
    id: 'micro-7',
    moduleId: 8,
    originalLessonId: '1',
    title: 'Introdução ao CAN Bus',
    content: [
      'CAN Bus é uma rede de comunicação veicular.',
      'Permite comunicação entre ECUs.',
      'Velocidade típica: 500 kbps (CAN High-Speed).',
      'Protocolo serial robusto para ambientes automotivos.'
    ],
    duration: 10,
    difficulty: 'advanced',
    tags: ['CAN Bus', 'rede', 'comunicação'],
    prerequisites: ['micro-5'],
    quiz: {
      question: 'Qual é a velocidade típica do CAN High-Speed?',
      options: ['125 kbps', '250 kbps', '500 kbps', '1 Mbps'],
      correct: 2
    },
    completed: false
  },
  {
    id: 'micro-8',
    moduleId: 8,
    originalLessonId: '2',
    title: 'Diagnosticando problemas no CAN Bus',
    content: [
      'Use osciloscópio para verificar sinais CAN-H e CAN-L.',
      'Verifique terminação (120 ohms entre H e L).',
      'Códigos de falha U indicam problemas de rede.',
      'Isolamento de ECUs para identificar origem do problema.'
    ],
    duration: 10,
    difficulty: 'advanced',
    tags: ['CAN Bus', 'diagnóstico', 'osciloscópio'],
    prerequisites: ['micro-7'],
    quiz: {
      question: 'Qual deve ser a resistência de terminação do CAN Bus?',
      options: ['60 ohms', '120 ohms', '240 ohms', '500 ohms'],
      correct: 1
    },
    completed: false
  }
];

// Caminhos de aprendizado
const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-1',
    name: 'Fundamentos de Motor',
    description: 'Aprenda os conceitos básicos de motores de combustão interna',
    microLessons: ['micro-1', 'micro-2'],
    estimatedDuration: 12,
    difficulty: 'beginner',
    category: 'engine',
    progress: 0
  },
  {
    id: 'path-2',
    name: 'Sistema Elétrico Básico',
    description: 'Entenda como funciona o sistema elétrico automotivo',
    microLessons: ['micro-3', 'micro-4'],
    estimatedDuration: 11,
    difficulty: 'beginner',
    category: 'electrical',
    progress: 0
  },
  {
    id: 'path-3',
    name: 'Injeção Eletrônica',
    description: 'Domine o sistema de injeção eletrônica e seus sensores',
    microLessons: ['micro-5', 'micro-6'],
    estimatedDuration: 15,
    difficulty: 'intermediate',
    category: 'injection',
    progress: 0
  },
  {
    id: 'path-4',
    name: 'Redes Veiculares CAN Bus',
    description: 'Aprenda sobre comunicação veicular e diagnóstico de redes',
    microLessons: ['micro-7', 'micro-8'],
    estimatedDuration: 20,
    difficulty: 'advanced',
    category: 'network',
    progress: 0
  }
];

// Armazenamento local
let completedMicroLessons: string[] = [];

// Obter todas as micro-aulas
export const getAllMicroLessons = (): MicroLesson[] => {
  return MICRO_LESSONS;
};

// Obter micro-aulas por módulo
export const getMicroLessonsByModule = (moduleId: number): MicroLesson[] => {
  return MICRO_LESSONS.filter(m => m.moduleId === moduleId);
};

// Obter micro-aulas por dificuldade
export const getMicroLessonsByDifficulty = (difficulty: string): MicroLesson[] => {
  return MICRO_LESSONS.filter(m => m.difficulty === difficulty);
};

// Buscar micro-aulas
export const searchMicroLessons = (query: string): MicroLesson[] => {
  const lowerQuery = query.toLowerCase();
  return MICRO_LESSONS.filter(m =>
    m.title.toLowerCase().includes(lowerQuery) ||
    m.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// Obter micro-aula por ID
export const getMicroLessonById = (id: string): MicroLesson | undefined => {
  return MICRO_LESSONS.find(m => m.id === id);
};

// Marcar micro-aula como completada
export const completeMicroLesson = (lessonId: string): boolean => {
  const lesson = getMicroLessonById(lessonId);
  if (!lesson) return false;

  lesson.completed = true;
  lesson.completedAt = new Date();
  
  if (!completedMicroLessons.includes(lessonId)) {
    completedMicroLessons.push(lessonId);
    saveProgressToStorage();
  }

  return true;
};

// Verificar se micro-aula está completada
export const isMicroLessonCompleted = (lessonId: string): boolean => {
  return completedMicroLessons.includes(lessonId);
};

// Obter micro-aulas completadas
export const getCompletedMicroLessons = (): MicroLesson[] => {
  return MICRO_LESSONS.filter(m => completedMicroLessons.includes(m.id));
};

// Obter todos os caminhos de aprendizado
export const getAllLearningPaths = (): LearningPath[] => {
  return LEARNING_PATHS.map(path => {
    const completedCount = path.microLessons.filter(id => completedMicroLessons.includes(id)).length;
    return {
      ...path,
      progress: (completedCount / path.microLessons.length) * 100
    };
  });
};

// Obter caminho de aprendizado por ID
export const getLearningPathById = (id: string): LearningPath | undefined => {
  const path = LEARNING_PATHS.find(p => p.id === id);
  if (!path) return undefined;

  const completedCount = path.microLessons.filter(id => completedMicroLessons.includes(id)).length;
  return {
    ...path,
    progress: (completedCount / path.microLessons.length) * 100
  };
};

// Obter micro-aulas recomendadas (baseado em pré-requisitos)
export const getRecommendedMicroLessons = (): MicroLesson[] => {
  return MICRO_LESSONS.filter(lesson => {
    if (lesson.completed) return false;
    
    // Verificar se todos os pré-requisitos estão completados
    const prerequisitesMet = lesson.prerequisites.every(
      prereq => completedMicroLessons.includes(prereq)
    );
    
    return prerequisitesMet;
  }).slice(0, 5);
};

// Obter micro-aulas por tag
export const getMicroLessonsByTag = (tag: string): MicroLesson[] => {
  return MICRO_LESSONS.filter(m => m.tags.includes(tag));
};

// Calcular tempo total de estudo
export const getTotalStudyTime = (): number => {
  return completedMicroLessons.reduce((total, id) => {
    const lesson = getMicroLessonById(id);
    return total + (lesson?.duration || 0);
  }, 0);
};

// Salvar progresso no localStorage
const saveProgressToStorage = (): void => {
  try {
    localStorage.setItem('autoskill_micro_lessons_progress', JSON.stringify(completedMicroLessons));
  } catch (error) {
    console.error('Erro ao salvar progresso de micro-aulas:', error);
  }
};

// Carregar progresso do localStorage
export const loadMicrolearningProgress = (): void => {
  try {
    const stored = localStorage.getItem('autoskill_micro_lessons_progress');
    if (stored) {
      completedMicroLessons = JSON.parse(stored);
      
      // Atualizar status das micro-aulas
      completedMicroLessons.forEach(id => {
        const lesson = getMicroLessonById(id);
        if (lesson) {
          lesson.completed = true;
        }
      });
    }
  } catch (error) {
    console.error('Erro ao carregar progresso de micro-aulas:', error);
  }
};

// Resetar progresso
export const resetMicrolearningProgress = (): void => {
  completedMicroLessons = [];
  MICRO_LESSONS.forEach(lesson => {
    lesson.completed = false;
    lesson.completedAt = undefined;
  });
  saveProgressToStorage();
};
