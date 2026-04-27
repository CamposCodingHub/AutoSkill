import { OnboardingStep } from '../types/gamification';

// Passos de onboarding
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'step-1',
    title: 'Bem-vindo ao AutoSkill!',
    description: 'Vamos te guiar pelos primeiros passos para você começar sua jornada de aprendizado automotivo.',
    action: 'Começar Tour',
    targetTab: 'home',
    completed: false,
    order: 1
  },
  {
    id: 'step-2',
    title: 'Conheça o Dashboard',
    description: 'O dashboard é sua página inicial. Aqui você vê seu progresso, estatísticas e acesso rápido a todas as funcionalidades.',
    action: 'Explorar Dashboard',
    targetTab: 'home',
    completed: false,
    order: 2
  },
  {
    id: 'step-3',
    title: 'Comece com Microlearning',
    description: 'As micro-aulas são lições rápidas de 5-10 minutos. Perfeitas para aprender em qualquer lugar!',
    action: 'Ver Micro-aulas',
    targetTab: 'microlearning',
    completed: false,
    order: 3
  },
  {
    id: 'step-4',
    title: 'Complete sua Primeira Aula',
    description: 'Navegue pelos módulos e complete sua primeira aula para ganhar XP e desbloquear conquistas.',
    action: 'Ir para Aulas',
    targetTab: 'lessons',
    completed: false,
    order: 4
  },
  {
    id: 'step-5',
    title: 'Explore a Gamificação',
    description: 'Ganhe XP, suba de nível, complete desafios e conquiste badges. A gamificação torna o aprendizado mais divertido!',
    action: 'Ver Gamificação',
    targetTab: 'gamification',
    completed: false,
    order: 5
  },
  {
    id: 'step-6',
    title: 'Conheça a IA de Diagnóstico',
    description: 'Nosso assistente virtual de IA pode ajudar você a diagnosticar problemas automotivos. Experimente!',
    action: 'Testar IA',
    targetTab: 'diagnostic',
    completed: false,
    order: 6
  },
  {
    id: 'step-7',
    title: 'Junte-se à Comunidade',
    description: 'Participe do fórum, entre em grupos de estudo e conecte-se com outros estudantes.',
    action: 'Acessar Comunidade',
    targetTab: 'community',
    completed: false,
    order: 7
  },
  {
    id: 'step-8',
    title: 'Configure seu Perfil',
    description: 'Personalize suas preferências, adicione suas redes sociais e configure notificações.',
    action: 'Configurar Perfil',
    targetTab: 'settings',
    completed: false,
    order: 8
  }
];

let completedSteps: string[] = [];
let onboardingSkipped = false;

// Obter todos os passos de onboarding
export const getOnboardingSteps = (): OnboardingStep[] => {
  return ONBOARDING_STEPS.map(step => ({
    ...step,
    completed: completedSteps.includes(step.id)
  }));
};

// Obter passo atual
export const getCurrentStep = (): OnboardingStep | null => {
  const steps = getOnboardingSteps();
  const firstIncomplete = steps.find(s => !s.completed);
  return firstIncomplete || null;
};

// Completar passo
export const completeOnboardingStep = (stepId: string): boolean => {
  const step = ONBOARDING_STEPS.find(s => s.id === stepId);
  if (!step) return false;

  if (!completedSteps.includes(stepId)) {
    completedSteps.push(stepId);
    saveOnboardingProgress();
  }

  return true;
};

// Verificar se onboarding está completo
export const isOnboardingComplete = (): boolean => {
  return completedSteps.length === ONBOARDING_STEPS.length || onboardingSkipped;
};

// Pular onboarding
export const skipOnboarding = (): void => {
  onboardingSkipped = true;
  saveOnboardingProgress();
};

// Resetar onboarding
export const resetOnboarding = (): void => {
  completedSteps = [];
  onboardingSkipped = false;
  saveOnboardingProgress();
};

// Obter progresso do onboarding
export const getOnboardingProgress = (): number => {
  if (onboardingSkipped) return 100;
  return Math.round((completedSteps.length / ONBOARDING_STEPS.length) * 100);
};

// Salvar progresso no localStorage
const saveOnboardingProgress = (): void => {
  try {
    localStorage.setItem('autoskill_onboarding', JSON.stringify({
      completedSteps,
      skipped: onboardingSkipped
    }));
  } catch (error) {
    console.error('Erro ao salvar progresso de onboarding:', error);
  }
};

// Carregar progresso do localStorage
export const loadOnboardingProgress = (): void => {
  try {
    const stored = localStorage.getItem('autoskill_onboarding');
    if (stored) {
      const data = JSON.parse(stored);
      completedSteps = data.completedSteps || [];
      onboardingSkipped = data.skipped || false;
    }
  } catch (error) {
    console.error('Erro ao carregar progresso de onboarding:', error);
  }
};
