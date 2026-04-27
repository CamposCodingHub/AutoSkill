import { LiveEvent } from '../types/gamification';

// Dados mock de eventos ao vivo
const MOCK_EVENTS: LiveEvent[] = [
  {
    id: 'event-1',
    title: 'Webinar: Diagnóstico Avançado com Scanner',
    description: 'Aprenda técnicas avançadas de diagnóstico utilizando scanners profissionais. Demonstração ao vivo de leitura de códigos e análise de dados.',
    type: 'webinar',
    instructor: 'Carlos Silva',
    instructorAvatar: '/instructors/carlos.jpg',
    scheduledDate: new Date(Date.now() + 86400000), // Amanhã
    duration: 90,
    category: 'diagnostic',
    maxParticipants: 100,
    currentParticipants: 78,
    thumbnail: '/events/webinar-1.jpg',
    tags: ['diagnóstico', 'scanner', 'avançado'],
    registered: false
  },
  {
    id: 'event-2',
    title: 'Workshop: Troca de Óleo Prática',
    description: 'Workshop prático onde você aprenderá a fazer a troca de óleo corretamente. Traça suas dúvidas e pratique com orientação especializada.',
    type: 'workshop',
    instructor: 'Maria Santos',
    instructorAvatar: '/instructors/maria.jpg',
    scheduledDate: new Date(Date.now() + 172800000), // Daqui a 2 dias
    duration: 120,
    category: 'maintenance',
    maxParticipants: 30,
    currentParticipants: 25,
    thumbnail: '/events/workshop-1.jpg',
    tags: ['manutenção', 'óleo', 'prática'],
    registered: false
  },
  {
    id: 'event-3',
    title: 'Q&A: Perguntas sobre Veículos Híbridos',
    description: 'Sessão de perguntas e respostas sobre veículos híbridos com especialista Ana Rodrigues. Tire todas as suas dúvidas!',
    type: 'qna',
    instructor: 'Ana Rodrigues',
    instructorAvatar: '/instructors/ana.jpg',
    scheduledDate: new Date(Date.now() + 259200000), // Daqui a 3 dias
    duration: 60,
    category: 'hybrid',
    maxParticipants: 50,
    currentParticipants: 42,
    thumbnail: '/events/qna-1.jpg',
    tags: ['híbridos', 'perguntas', 'especialista'],
    registered: false
  },
  {
    id: 'event-4',
    title: 'Demo: Laboratório Virtual 3D',
    description: 'Demonstração ao vivo do novo Laboratório Virtual 3D do AutoSkill. Veja como funciona e tire suas dúvidas.',
    type: 'demo',
    instructor: 'Pedro Almeida',
    instructorAvatar: '/instructors/pedro.jpg',
    scheduledDate: new Date(Date.now() + 345600000), // Daqui a 4 dias
    duration: 45,
    category: 'technology',
    maxParticipants: 200,
    currentParticipants: 156,
    thumbnail: '/events/demo-1.jpg',
    tags: ['3D', 'laboratório', 'tecnologia'],
    registered: false
  },
  {
    id: 'event-5',
    title: 'Webinar: Certificações Industriais',
    description: 'Entenda como obter certificações industriais reconhecidas no mercado. Benefícios, requisitos e processo de exame.',
    type: 'webinar',
    instructor: 'Roberto Mendes',
    instructorAvatar: '/instructors/roberto.jpg',
    scheduledDate: new Date(Date.now() + 432000000), // Daqui a 5 dias
    duration: 75,
    category: 'certification',
    maxParticipants: 150,
    currentParticipants: 98,
    thumbnail: '/events/webinar-2.jpg',
    tags: ['certificação', 'carreira', 'industrial'],
    registered: false
  }
];

let registeredEvents: string[] = [];

// Obter todos os eventos
export const getAllEvents = (): LiveEvent[] => {
  return MOCK_EVENTS.map(event => ({
    ...event,
    registered: registeredEvents.includes(event.id)
  }));
};

// Obter eventos por tipo
export const getEventsByType = (type: 'webinar' | 'workshop' | 'qna' | 'demo'): LiveEvent[] => {
  return getAllEvents().filter(e => e.type === type);
};

// Obter eventos por categoria
export const getEventsByCategory = (category: string): LiveEvent[] => {
  return getAllEvents().filter(e => e.category === category);
};

// Obter eventos futuros
export const getUpcomingEvents = (): LiveEvent[] => {
  return getAllEvents().filter(e => e.scheduledDate > new Date());
};

// Obter eventos próximos (próximos 7 dias)
export const getNearbyEvents = (): LiveEvent[] => {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return getAllEvents().filter(e => e.scheduledDate >= now && e.scheduledDate <= weekFromNow);
};

// Registrar em evento
export const registerForEvent = (eventId: string): boolean => {
  const event = MOCK_EVENTS.find(e => e.id === eventId);
  if (!event) return false;

  if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
    return false;
  }

  if (!registeredEvents.includes(eventId)) {
    registeredEvents.push(eventId);
    saveRegistrations();
  }

  return true;
};

// Cancelar registro em evento
export const unregisterFromEvent = (eventId: string): boolean => {
  const index = registeredEvents.indexOf(eventId);
  if (index === -1) return false;

  registeredEvents.splice(index, 1);
  saveRegistrations();
  return true;
};

// Verificar se usuário está registrado
export const isRegisteredForEvent = (eventId: string): boolean => {
  return registeredEvents.includes(eventId);
};

// Obter eventos registrados do usuário
export const getUserRegisteredEvents = (): LiveEvent[] => {
  return getAllEvents().filter(e => registeredEvents.includes(e.id));
};

// Salvar registros no localStorage
const saveRegistrations = (): void => {
  try {
    localStorage.setItem('autoskill_event_registrations', JSON.stringify(registeredEvents));
  } catch (error) {
    console.error('Erro ao salvar registros de eventos:', error);
  }
};

// Carregar registros do localStorage
export const loadEventData = (): void => {
  try {
    const stored = localStorage.getItem('autoskill_event_registrations');
    if (stored) {
      registeredEvents = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar dados de eventos:', error);
  }
};
