import { Symptom, DiagnosticResult, DiagnosticSession, AIAssistantMessage, DiagnosticTip } from '../types/gamification';

// Base de conhecimento de sintomas
const SYMPTOMS_DATABASE: Symptom[] = [
  // Motor
  {
    id: 'sym-1',
    description: 'Motor falhando em marcha lenta',
    category: 'engine',
    severity: 'medium',
    relatedSystems: ['injeção', 'ignição', 'ar']
  },
  {
    id: 'sym-2',
    description: 'Motor superaquecendo',
    category: 'cooling',
    severity: 'high',
    relatedSystems: ['radiador', 'termostato', 'bomba água']
  },
  {
    id: 'sym-3',
    description: 'Perda de potência ao acelerar',
    category: 'engine',
    severity: 'medium',
    relatedSystems: ['combustível', 'turbo', 'injeção']
  },
  {
    id: 'sym-4',
    description: 'Barulho anormal no motor',
    category: 'engine',
    severity: 'high',
    relatedSystems: ['válvulas', 'bielas', 'pistões']
  },
  {
    id: 'sym-5',
    description: 'Consumo excessivo de combustível',
    category: 'engine',
    severity: 'low',
    relatedSystems: ['injeção', 'sensores', 'filtro ar']
  },
  // Elétrica
  {
    id: 'sym-6',
    description: 'Bateria descarregando rapidamente',
    category: 'electrical',
    severity: 'high',
    relatedSystems: ['alternador', 'bateria', 'regulador']
  },
  {
    id: 'sym-7',
    description: 'Luzes do painel acesas',
    category: 'electrical',
    severity: 'medium',
    relatedSystems: ['ECU', 'sensores', 'códigos falha']
  },
  {
    id: 'sym-8',
    description: 'Faróis fracos ou piscando',
    category: 'electrical',
    severity: 'low',
    relatedSystems: ['alternador', 'bateria', 'fusíveis']
  },
  // Freios
  {
    id: 'sym-9',
    description: 'Pedal de freio muito baixo',
    category: 'brake',
    severity: 'high',
    relatedSystems: ['pastilhas', 'disco', 'fluido', 'cilindro mestre']
  },
  {
    id: 'sym-10',
    description: 'Vibração ao frear',
    category: 'brake',
    severity: 'medium',
    relatedSystems: ['discos', 'pastilhas', 'suspensão']
  },
  {
    id: 'sym-11',
    description: 'Barulho ao frear',
    category: 'brake',
    severity: 'medium',
    relatedSystems: ['pastilhas', 'pinças', 'discos']
  },
  // Transmissão
  {
    id: 'sym-12',
    description: 'Dificuldade para engatar marchas',
    category: 'transmission',
    severity: 'high',
    relatedSystems: ['embreagem', 'caixa', 'óleo']
  },
  {
    id: 'sym-13',
    description: 'Troca de marchas brusca',
    category: 'transmission',
    severity: 'medium',
    relatedSystems: ['caixa automática', 'sensores', 'óleo']
  },
  {
    id: 'sym-14',
    description: 'Vazamento de óleo da transmissão',
    category: 'transmission',
    severity: 'high',
    relatedSystems: ['retentores', 'juntas', 'caixa']
  }
];

// Base de conhecimento de diagnósticos
const DIAGNOSTICS_DATABASE: Record<string, DiagnosticResult[]> = {
  'engine': [
    {
      id: 'diag-1',
      problem: 'Falha na bobina de ignição',
      probability: 75,
      category: 'engine',
      possibleCauses: [
        'Bobina queimada',
        'Vela de ignição desgastada',
        'Cabos de ignição danificados'
      ],
      recommendedTests: [
        'Teste de faísca',
        'Leitura de códigos de falha com scanner',
        'Teste de compressão'
      ],
      estimatedCost: 150,
      estimatedTime: 2,
      difficulty: 'medium'
    },
    {
      id: 'diag-2',
      problem: 'Injetor sujo ou defeituoso',
      probability: 60,
      category: 'engine',
      possibleCauses: [
        'Acúmulo de resíduos',
        'Falha elétrica no injetor',
        'Pressão de combustível inadequada'
      ],
      recommendedTests: [
        'Teste de balanceamento de injetores',
        'Verificação de pressão da bomba',
        'Limpeza de injetores'
      ],
      estimatedCost: 300,
      estimatedTime: 3,
      difficulty: 'medium'
    },
    {
      id: 'diag-3',
      problem: 'Sensor MAF defeituoso',
      probability: 45,
      category: 'engine',
      possibleCauses: [
        'Sensor sujo',
        'Falha elétrica',
        'Cabos danificados'
      ],
      recommendedTests: [
        'Limpeza do sensor MAF',
        'Teste com multímetro',
        'Leitura de dados ao vivo'
      ],
      estimatedCost: 200,
      estimatedTime: 1,
      difficulty: 'easy'
    }
  ],
  'electrical': [
    {
      id: 'diag-4',
      problem: 'Alternador defeituoso',
      probability: 80,
      category: 'electrical',
      possibleCauses: [
        'Diodo retificador queimado',
        'Escovas desgastadas',
        'Rolamento danificado'
      ],
      recommendedTests: [
        'Teste de tensão de saída',
        'Teste de amperagem',
        'Verificação do regulador de voltagem'
      ],
      estimatedCost: 400,
      estimatedTime: 2,
      difficulty: 'medium'
    },
    {
      id: 'diag-5',
      problem: 'Bateria com vida útil esgotada',
      probability: 65,
      category: 'electrical',
      possibleCauses: [
        'Idade avançada da bateria',
        'Células sulfatadas',
        'Curto interno'
      ],
      recommendedTests: [
        'Teste de carga',
        'Teste de densidade',
        'Verificação de tensão em repouso'
      ],
      estimatedCost: 250,
      estimatedTime: 0.5,
      difficulty: 'easy'
    }
  ],
  'brake': [
    {
      id: 'diag-6',
      problem: 'Pastilhas de freio desgastadas',
      probability: 85,
      category: 'brake',
      possibleCauses: [
        'Uso normal',
        'Condução agressiva',
        'Pastilhas de baixa qualidade'
      ],
      recommendedTests: [
        'Inspeção visual das pastilhas',
        'Medição da espessura',
        'Verificação dos discos'
      ],
      estimatedCost: 200,
      estimatedTime: 1,
      difficulty: 'easy'
    },
    {
      id: 'diag-7',
      problem: 'Disco de freio empenado',
      probability: 55,
      category: 'brake',
      possibleCauses: [
        'Superaquecimento',
        'Montagem incorreta',
        'Desgaste irregular'
      ],
      recommendedTests: [
        'Medição de empenamento',
        'Verificação de espessura',
        'Teste de runout'
      ],
      estimatedCost: 350,
      estimatedTime: 2,
      difficulty: 'medium'
    }
  ],
  'transmission': [
    {
      id: 'diag-8',
      problem: 'Disco de embreagem desgastado',
      probability: 70,
      category: 'transmission',
      possibleCauses: [
        'Uso normal',
        'Condução com embreagem "arrastada"',
        'Defeito no sistema hidráulico'
      ],
      recommendedTests: [
        'Teste de embreagem',
        'Verificação do cilindro mestre',
        'Inspeção do disco'
      ],
      estimatedCost: 500,
      estimatedTime: 4,
      difficulty: 'hard'
    },
    {
      id: 'diag-9',
      problem: 'Nível baixo de óleo da transmissão',
      probability: 60,
      category: 'transmission',
      possibleCauses: [
        'Vazamento',
        'Queima de óleo',
        'Não realizou manutenção'
      ],
      recommendedTests: [
        'Verificação do nível',
        'Inspeção de vazamentos',
        'Análise do óleo'
      ],
      estimatedCost: 100,
      estimatedTime: 0.5,
      difficulty: 'easy'
    }
  ],
  'cooling': [
    {
      id: 'diag-10',
      problem: 'Termostato travado fechado',
      probability: 65,
      category: 'cooling',
      possibleCauses: [
        'Termostato defeituoso',
        'Depósitos no sistema',
        'Mola quebrada'
      ],
      recommendedTests: [
        'Teste de temperatura',
        'Verificação de fluxo',
        'Inspeção visual'
      ],
      estimatedCost: 150,
      estimatedTime: 1,
      difficulty: 'easy'
    },
    {
      id: 'diag-11',
      problem: 'Bomba d\'água defeituosa',
      probability: 55,
      category: 'cooling',
      possibleCauses: [
        'Rolamento desgastado',
        'Hélice danificada',
        'Vazamento pela vedação'
      ],
      recommendedTests: [
        'Teste de pressão',
        'Verificação de vazamento',
        'Inspeção visual'
      ],
      estimatedCost: 300,
      estimatedTime: 2,
      difficulty: 'medium'
    }
  ]
};

// Dicas de diagnóstico
const DIAGNOSTIC_TIPS: DiagnosticTip[] = [
  {
    id: 'tip-1',
    title: 'Sempre comece com o básico',
    description: 'Verifique fluidos, níveis e conexões antes de testes complexos. Muitos problemas são resolvidos com manutenção básica.',
    category: 'general',
    difficulty: 'beginner',
    relatedSymptoms: ['sym-1', 'sym-5', 'sym-8']
  },
  {
    id: 'tip-2',
    title: 'Use um scanner OBD-II',
    description: 'Códigos de falha podem direcionar seu diagnóstico. Sempre leia os códigos antes de começar testes manuais.',
    category: 'electrical',
    difficulty: 'intermediate',
    relatedSymptoms: ['sym-7', 'sym-2', 'sym-3']
  },
  {
    id: 'tip-3',
    title: 'Verifique o histórico do veículo',
    description: 'Reparos recentes podem estar relacionados ao problema atual. Conheça o histórico de manutenção.',
    category: 'general',
    difficulty: 'beginner',
    relatedSymptoms: ['sym-1', 'sym-4', 'sym-12']
  },
  {
    id: 'tip-4',
    title: 'Teste uma coisa de cada vez',
    description: 'Não substitua múltiplos componentes simultaneamente. Teste e isole o problema sistematicamente.',
    category: 'general',
    difficulty: 'intermediate',
    relatedSymptoms: ['sym-2', 'sym-6', 'sym-9']
  }
];

// Armazenamento de sessões e mensagens
let diagnosticSessions: DiagnosticSession[] = [];
let assistantMessages: AIAssistantMessage[] = [];

// Obter todos os sintomas disponíveis
export const getAllSymptoms = (): Symptom[] => {
  return SYMPTOMS_DATABASE;
};

// Filtrar sintomas por categoria
export const getSymptomsByCategory = (category: string): Symptom[] => {
  return SYMPTOMS_DATABASE.filter(s => s.category === category);
};

// Buscar sintomas por descrição
export const searchSymptoms = (query: string): Symptom[] => {
  const lowerQuery = query.toLowerCase();
  return SYMPTOMS_DATABASE.filter(s =>
    s.description.toLowerCase().includes(lowerQuery) ||
    s.relatedSystems.some(sys => sys.toLowerCase().includes(lowerQuery))
  );
};

// Analisar sintomas e gerar diagnósticos
export const analyzeSymptoms = (symptoms: Symptom[]): DiagnosticResult[] => {
  const results: DiagnosticResult[] = [];
  const categories = new Set(symptoms.map(s => s.category));

  categories.forEach(category => {
    const categoryDiagnostics = DIAGNOSTICS_DATABASE[category] || [];
    
    categoryDiagnostics.forEach(diag => {
      // Calcular probabilidade baseada nos sintomas
      let calculatedProbability = diag.probability;
      
      // Aumentar probabilidade se sintomas relacionados
      const relatedSymptoms = symptoms.filter(s => 
        s.category === category || s.relatedSystems.some(sys => 
          diag.possibleCauses.some(cause => cause.toLowerCase().includes(sys.toLowerCase()))
        ))
      );
      
      if (relatedSymptoms.length > 1) {
        calculatedProbability = Math.min(calculatedProbability + (relatedSymptoms.length * 10), 95);
      }

      // Ajustar severidade baseada nos sintomas
      const highSeveritySymptoms = symptoms.filter(s => s.severity === 'high' || s.severity === 'critical');
      if (highSeveritySymptoms.length > 0) {
        calculatedProbability = Math.min(calculatedProbability + 15, 95);
      }

      results.push({
        ...diag,
        probability: calculatedProbability
      });
    });
  });

  // Ordenar por probabilidade
  return results.sort((a, b) => b.probability - a.probability).slice(0, 5);
};

// Criar sessão de diagnóstico
export const createDiagnosticSession = (
  userId: string,
  vehicleInfo: { make: string; model: string; year: number; vin?: string },
  symptoms: Symptom[]
): DiagnosticSession => {
  const results = analyzeSymptoms(symptoms);
  
  // Calcular confiança baseada na quantidade e qualidade dos sintomas
  const confidence = Math.min(
    (symptoms.length * 15) + 
    (symptoms.filter(s => s.severity === 'high' || s.severity === 'critical').length * 10),
    95
  );

  const session: DiagnosticSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    vehicleInfo,
    symptoms,
    results,
    timestamp: new Date(),
    confidence
  };

  diagnosticSessions.push(session);
  saveSessionsToStorage();

  return session;
};

// Obter sessões de diagnóstico do usuário
export const getDiagnosticSessions = (userId: string): DiagnosticSession[] => {
  return diagnosticSessions.filter(s => s.userId === userId);
};

// Gerar resposta da IA assistente
export const generateAIResponse = (userMessage: string, context?: DiagnosticSession): string => {
  const lowerMessage = userMessage.toLowerCase();

  // Respostas baseadas em palavras-chave
  if (lowerMessage.includes('motor') && lowerMessage.includes('aquec')) {
    return 'O superaquecimento do motor pode ser causado por vários fatores. Recomendo verificar: 1) Nível de líquido de arrefecimento, 2) Funcionamento do termostato, 3) Bomba d\'água, 4) Radiador. Não continue dirigindo com o motor superaquecendo para evitar danos graves.';
  }

  if (lowerMessage.includes('freio') && (lowerMessage.includes('barulho') || lowerMessage.includes('vibração'))) {
    return 'Barulho ou vibração ao frear geralmente indica pastilhas desgastadas ou discos empenados. Recomendo: 1) Inspecionar visualmente as pastilhas, 2) Medir a espessura dos discos, 3) Verificar se há desgaste irregular. Se as pastilhas estiverem muito finas (<3mm), substitua imediatamente.';
  }

  if (lowerMessage.includes('bateria') || lowerMessage.includes('carga')) {
    return 'Problemas de bateria podem ser causados por: 1) Bateria antiga (vida útil 3-5 anos), 2) Alternador defeituoso não carregando, 3) Drenagem de corrente parásita. Teste a bateria com um multímetro (deve mostrar 12.6V em repouso) e verifique a tensão com o motor ligado (deve ser 13.8-14.4V).';
  }

  if (lowerMessage.includes('injeção') || lowerMessage.includes('falha')) {
    return 'Falhas no sistema de injeção podem ser causadas por: 1) Injetores sujos ou defeituosos, 2) Sensor MAF ou MAP com problema, 3) Bomba de combustível, 4) Filtro de combustível obstruído. Recomendo usar um scanner para ler códigos de falha e verificar os dados ao vivo dos sensores.';
  }

  if (lowerMessage.includes('transmissão') || lowerMessage.includes('marcha')) {
    return 'Problemas na transmissão requerem atenção imediata. Possíveis causas: 1) Nível baixo de óleo, 2) Embreagem desgastada (manual), 3) Solenoides defeituosos (automática), 4) Problemas na ECU. Verifique o nível do óleo primeiro e procure um especialista se o problema persistir.';
  }

  // Resposta genérica com contexto
  if (context) {
    return `Baseado nos sintomas que você descreveu (${context.symptoms.map(s => s.description).join(', ')}), os diagnósticos mais prováveis são: ${context.results.slice(0, 2).map(r => `${r.problem} (${r.probability}%)`).join(', ')}. Recomendo começar pelos testes sugeridos para o diagnóstico de maior probabilidade.`;
  }

  return 'Posso ajudar você a diagnosticar problemas automotivos. Descreva os sintomas que você está observando (ex: "motor falhando em marcha lenta", "barulho ao frear", "bateria descarregando") e fornecerei possíveis causas e testes recomendados.';
};

// Adicionar mensagem ao chat
export const addAssistantMessage = (role: 'user' | 'assistant', content: string): AIAssistantMessage => {
  const message: AIAssistantMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date()
  };

  assistantMessages.push(message);
  saveMessagesToStorage();

  return message;
};

// Obter histórico de mensagens
export const getAssistantMessages = (): AIAssistantMessage[] => {
  return assistantMessages;
};

// Limpar histórico de mensagens
export const clearAssistantMessages = (): void => {
  assistantMessages = [];
  saveMessagesToStorage();
};

// Obter dicas de diagnóstico
export const getDiagnosticTips = (category?: string): DiagnosticTip[] => {
  if (category) {
    return DIAGNOSTIC_TIPS.filter(t => t.category === category);
  }
  return DIAGNOSTIC_TIPS;
};

// Obter dicas relacionadas a sintomas
export const getTipsForSymptoms = (symptomIds: string[]): DiagnosticTip[] => {
  return DIAGNOSTIC_TIPS.filter(t =>
    t.relatedSymptoms.some(id => symptomIds.includes(id))
  );
};

// Salvar sessões no localStorage
const saveSessionsToStorage = (): void => {
  try {
    localStorage.setItem('autoskill_diagnostic_sessions', JSON.stringify(diagnosticSessions));
  } catch (error) {
    console.error('Erro ao salvar sessões de diagnóstico:', error);
  }
};

// Salvar mensagens no localStorage
const saveMessagesToStorage = (): void => {
  try {
    localStorage.setItem('autoskill_assistant_messages', JSON.stringify(assistantMessages));
  } catch (error) {
    console.error('Erro ao salvar mensagens do assistente:', error);
  }
};

// Carregar dados do localStorage
export const loadDiagnosticData = (): void => {
  try {
    const storedSessions = localStorage.getItem('autoskill_diagnostic_sessions');
    if (storedSessions) {
      diagnosticSessions = JSON.parse(storedSessions);
      diagnosticSessions = diagnosticSessions.map(s => ({
        ...s,
        timestamp: new Date(s.timestamp)
      }));
    }

    const storedMessages = localStorage.getItem('autoskill_assistant_messages');
    if (storedMessages) {
      assistantMessages = JSON.parse(storedMessages);
      assistantMessages = assistantMessages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar dados de diagnóstico:', error);
  }
};
