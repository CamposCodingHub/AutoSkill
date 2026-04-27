import { ServiceOffer, ServiceRequest, ServiceReview } from '../types/gamification';

// Base de dados mock de ofertas
const MOCK_OFFERS: ServiceOffer[] = [
  {
    id: 'offer-1',
    providerId: 'prov-1',
    providerName: 'Oficina Premium Auto',
    title: 'Diagnóstico Completo com Scanner',
    description: 'Diagnóstico profissional com scanner de última geração. Inclui leitura de códigos, testes ao vivo e relatório detalhado.',
    category: 'diagnostic',
    location: { city: 'São Paulo', state: 'SP', address: 'Av. Paulista, 1000' },
    price: 150,
    priceType: 'fixed',
    availability: 'immediate',
    rating: 4.8,
    reviews: 127,
    verified: true,
    certifications: ['ASE Master', 'Bosch Certified'],
    images: ['/offers/diag-1.jpg'],
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'offer-2',
    providerId: 'prov-2',
    providerName: 'Mecânica João Silva',
    title: 'Troca de Óleo e Filtros',
    description: 'Troca de óleo sintético premium com substituição de filtros de óleo, ar e cabine. Verificação de fluidos inclusa.',
    category: 'maintenance',
    location: { city: 'Rio de Janeiro', state: 'RJ' },
    price: 200,
    priceType: 'fixed',
    availability: 'within_24h',
    rating: 4.5,
    reviews: 89,
    verified: true,
    certifications: ['ASE'],
    images: ['/offers/oil-1.jpg'],
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: 'offer-3',
    providerId: 'prov-3',
    providerName: 'Auto Elétrica Express',
    title: 'Reparo de Sistema Elétrico',
    description: 'Diagnóstico e reparo de problemas elétricos. Alternadores, baterias, partida e iluminação.',
    category: 'repair',
    location: { city: 'Belo Horizonte', state: 'MG' },
    price: 80,
    priceType: 'hourly',
    availability: 'immediate',
    rating: 4.7,
    reviews: 203,
    verified: true,
    certifications: ['Delphi Certified'],
    images: ['/offers/electrical-1.jpg'],
    createdAt: new Date(Date.now() - 259200000)
  },
  {
    id: 'offer-4',
    providerId: 'prov-4',
    providerName: 'Restauração Clássicos',
    title: 'Restauração de Veículos Clássicos',
    description: 'Restauração completa de veículos clássicos e antigos. Trabalho artesanal com peças originais.',
    category: 'restoration',
    location: { city: 'Curitiba', state: 'PR' },
    price: 5000,
    priceType: 'quote',
    availability: 'flexible',
    rating: 5.0,
    reviews: 45,
    verified: true,
    certifications: ['ASE Master', 'Classic Car Specialist'],
    images: ['/offers/restoration-1.jpg'],
    createdAt: new Date(Date.now() - 604800000)
  },
  {
    id: 'offer-5',
    providerId: 'prov-5',
    providerName: 'Performance Tuning',
    title: 'Chip de Potência e Remapeamento',
    description: 'Remapeamento de ECU para aumento de potência e torque. Programação personalizada conforme veículo.',
    category: 'modification',
    location: { city: 'São Paulo', state: 'SP' },
    price: 800,
    priceType: 'fixed',
    availability: 'within_week',
    rating: 4.6,
    reviews: 67,
    verified: true,
    certifications: ['ECU Tuning Certified'],
    images: ['/offers/tuning-1.jpg'],
    createdAt: new Date(Date.now() - 345600000)
  }
];

// Armazenamento local
let serviceRequests: ServiceRequest[] = [];
let serviceReviews: ServiceReview[] = [];

// Obter todas as ofertas
export const getAllOffers = (): ServiceOffer[] => {
  return MOCK_OFFERS;
};

// Filtrar ofertas por categoria
export const getOffersByCategory = (category: string): ServiceOffer[] => {
  return MOCK_OFFERS.filter(o => o.category === category);
};

// Filtrar ofertas por localização
export const getOffersByLocation = (city: string, state: string): ServiceOffer[] => {
  return MOCK_OFFERS.filter(o => 
    o.location.city.toLowerCase().includes(city.toLowerCase()) ||
    o.location.state.toLowerCase().includes(state.toLowerCase())
  );
};

// Buscar ofertas
export const searchOffers = (query: string): ServiceOffer[] => {
  const lowerQuery = query.toLowerCase();
  return MOCK_OFFERS.filter(o =>
    o.title.toLowerCase().includes(lowerQuery) ||
    o.description.toLowerCase().includes(lowerQuery) ||
    o.providerName.toLowerCase().includes(lowerQuery)
  );
};

// Criar requisição de serviço
export const createServiceRequest = (
  userId: string,
  title: string,
  description: string,
  category: string,
  location: { city: string; state: string },
  budget?: { min: number; max: number },
  urgency: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): ServiceRequest => {
  const request: ServiceRequest = {
    id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title,
    description,
    category,
    location,
    budget,
    urgency,
    status: 'open',
    createdAt: new Date(),
    proposals: []
  };

  serviceRequests.push(request);
  saveRequestsToStorage();

  return request;
};

// Obter requisições do usuário
export const getUserRequests = (userId: string): ServiceRequest[] => {
  return serviceRequests.filter(r => r.userId === userId);
};

// Obter requisições por categoria
export const getRequestsByCategory = (category: string): ServiceRequest[] => {
  return serviceRequests.filter(r => r.category === category);
};

// Obter requisições abertas
export const getOpenRequests = (): ServiceRequest[] => {
  return serviceRequests.filter(r => r.status === 'open');
};

// Adicionar proposta a requisição
export const addProposalToRequest = (requestId: string, offerId: string): boolean => {
  const requestIndex = serviceRequests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) return false;

  if (!serviceRequests[requestIndex].proposals.includes(offerId)) {
    serviceRequests[requestIndex].proposals.push(offerId);
    saveRequestsToStorage();
  }

  return true;
};

// Atualizar status de requisição
export const updateRequestStatus = (
  requestId: string,
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
): boolean => {
  const requestIndex = serviceRequests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) return false;

  serviceRequests[requestIndex].status = status;
  saveRequestsToStorage();

  return true;
};

// Adicionar avaliação
export const addReview = (
  offerId: string,
  userId: string,
  userName: string,
  rating: number,
  comment: string
): ServiceReview => {
  const review: ServiceReview = {
    id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    offerId,
    userId,
    userName,
    rating,
    comment,
    createdAt: new Date()
  };

  serviceReviews.push(review);
  saveReviewsToStorage();

  return review;
};

// Obter avaliações de uma oferta
export const getReviewsForOffer = (offerId: string): ServiceReview[] => {
  return serviceReviews.filter(r => r.offerId === offerId);
};

// Calcular média de avaliações de uma oferta
export const getAverageRatingForOffer = (offerId: string): number => {
  const reviews = getReviewsForOffer(offerId);
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((total, r) => total + r.rating, 0);
  return sum / reviews.length;
};

// Obter avaliações do usuário
export const getUserReviews = (userId: string): ServiceReview[] => {
  return serviceReviews.filter(r => r.userId === userId);
};

// Salvar requisições no localStorage
const saveRequestsToStorage = (): void => {
  try {
    localStorage.setItem('autoskill_service_requests', JSON.stringify(serviceRequests));
  } catch (error) {
    console.error('Erro ao salvar requisições de serviço:', error);
  }
};

// Salvar avaliações no localStorage
const saveReviewsToStorage = (): void => {
  try {
    localStorage.setItem('autoskill_service_reviews', JSON.stringify(serviceReviews));
  } catch (error) {
    console.error('Erro ao salvar avaliações de serviço:', error);
  }
};

// Carregar dados do localStorage
export const loadMarketplaceData = (): void => {
  try {
    const storedRequests = localStorage.getItem('autoskill_service_requests');
    if (storedRequests) {
      serviceRequests = JSON.parse(storedRequests);
      serviceRequests = serviceRequests.map(r => ({
        ...r,
        createdAt: new Date(r.createdAt)
      }));
    }

    const storedReviews = localStorage.getItem('autoskill_service_reviews');
    if (storedReviews) {
      serviceReviews = JSON.parse(storedReviews);
      serviceReviews = serviceReviews.map(r => ({
        ...r,
        createdAt: new Date(r.createdAt)
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar dados do marketplace:', error);
  }
};
