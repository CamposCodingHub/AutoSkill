import React, { useState, useEffect } from 'react';
import { ServiceOffer, ServiceRequest } from '../types/gamification';
import {
  getAllOffers,
  getOffersByCategory,
  searchOffers,
  createServiceRequest,
  getUserRequests,
  getOpenRequests,
  addProposalToRequest,
  updateRequestStatus,
  loadMarketplaceData
} from '../utils/marketplaceLogic';

interface ServiceMarketplaceProps {
  userId: string;
  userName: string;
}

const ServiceMarketplace: React.FC<ServiceMarketplaceProps> = ({ userId, userName }) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'requests' | 'my-requests'>('offers');
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [openRequests, setOpenRequests] = useState<ServiceRequest[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'diagnostic',
    city: '',
    state: '',
    budgetMin: '',
    budgetMax: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  useEffect(() => {
    loadMarketplaceData();
    setOffers(getAllOffers());
    setMyRequests(getUserRequests(userId));
    setOpenRequests(getOpenRequests());
  }, [userId]);

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.description || !newRequest.city || !newRequest.state) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const budget = newRequest.budgetMin && newRequest.budgetMax
      ? { min: parseInt(newRequest.budgetMin), max: parseInt(newRequest.budgetMax) }
      : undefined;

    createServiceRequest(
      userId,
      newRequest.title,
      newRequest.description,
      newRequest.category,
      { city: newRequest.city, state: newRequest.state },
      budget,
      newRequest.urgency
    );

    setMyRequests(getUserRequests(userId));
    setOpenRequests(getOpenRequests());
    setShowCreateRequest(false);
    setNewRequest({
      title: '',
      description: '',
      category: 'diagnostic',
      city: '',
      state: '',
      budgetMin: '',
      budgetMax: '',
      urgency: 'medium'
    });
  };

  const filteredOffers = searchQuery
    ? searchOffers(searchQuery)
    : filterCategory
    ? getOffersByCategory(filterCategory)
    : offers;

  return (
    <div className="service-marketplace bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-rose-600 dark:text-rose-400">🏪 Marketplace de Serviços</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {(['offers', 'requests', 'my-requests'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-rose-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'offers' ? '📋 Ofertas' : tab === 'requests' ? '🔍 Demandas' : '📝 Minhas Requisições'}
          </button>
        ))}
      </div>

      {/* Ofertas */}
      {activeTab === 'offers' && (
        <div>
          <div className="flex space-x-2 mb-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="">Todas as Categorias</option>
              <option value="diagnostic">Diagnóstico</option>
              <option value="repair">Reparo</option>
              <option value="maintenance">Manutenção</option>
              <option value="modification">Modificação</option>
              <option value="restoration">Restauração</option>
            </select>
            <input
              type="text"
              placeholder="Buscar serviços..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOffers.map(offer => (
              <div
                key={offer.id}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-all"
              >
                {offer.verified && (
                  <div className="flex items-center mb-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      ✓ Verificado
                    </span>
                  </div>
                )}

                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{offer.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {offer.description}
                </p>

                <div className="mb-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Prestador</div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">{offer.providerName}</div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Localização</div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    {offer.location.city}, {offer.location.state}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Preço</div>
                    <div className="font-bold text-rose-600 dark:text-rose-400">
                      {offer.priceType === 'fixed' ? `R$ ${offer.price}` :
                       offer.priceType === 'hourly' ? `R$ ${offer.price}/h` :
                       'Sob Orçamento'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200 ml-1">{offer.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">({offer.reviews})</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    offer.availability === 'immediate' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                    offer.availability === 'within_24h' ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' :
                    offer.availability === 'within_week' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {offer.availability === 'immediate' ? 'Imediato' :
                     offer.availability === 'within_24h' ? '24h' :
                     offer.availability === 'within_week' ? '1 semana' :
                     'Flexível'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-300">
                    {offer.category}
                  </span>
                </div>

                {offer.certifications.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Certificações</div>
                    <div className="flex flex-wrap gap-1">
                      {offer.certifications.slice(0, 2).map(cert => (
                        <span key={cert} className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-lg transition">
                  Contatar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demandas */}
      {activeTab === 'requests' && (
        <div>
          <button
            onClick={() => setShowCreateRequest(true)}
            className="mb-4 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg"
          >
            + Criar Requisição
          </button>

          {openRequests.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <div className="text-4xl mb-2">🔍</div>
              <div>Nenhuma demanda aberta no momento</div>
            </div>
          ) : (
            <div className="space-y-3">
              {openRequests.map(request => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{request.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{request.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      request.urgency === 'urgent' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300' :
                      request.urgency === 'high' ? 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300' :
                      request.urgency === 'medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                      'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                    }`}>
                      {request.urgency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      {request.location.city}, {request.location.state}
                    </div>
                    {request.budget && (
                      <div className="text-gray-800 dark:text-gray-200">
                        R$ {request.budget.min} - R$ {request.budget.max}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {request.proposals.length} propostas • {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Minhas Requisições */}
      {activeTab === 'my-requests' && (
        <div>
          <button
            onClick={() => setShowCreateRequest(true)}
            className="mb-4 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg"
          >
            + Nova Requisição
          </button>

          {myRequests.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <div className="text-4xl mb-2">📝</div>
              <div>Você ainda não criou nenhuma requisição</div>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map(request => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{request.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{request.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      request.status === 'open' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                      request.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' :
                      request.status === 'completed' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                      'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                    }`}>
                      {request.status === 'open' ? 'Aberto' :
                       request.status === 'in_progress' ? 'Em Progresso' :
                       request.status === 'completed' ? 'Completo' :
                       'Cancelado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      {request.location.city}, {request.location.state}
                    </div>
                    <div className="text-gray-800 dark:text-gray-200">
                      {request.proposals.length} propostas
                    </div>
                  </div>

                  <div className="mt-3 flex space-x-2">
                    {request.status === 'open' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'in_progress')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 rounded text-sm"
                      >
                        Aceitar Proposta
                      </button>
                    )}
                    {request.status === 'in_progress' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'completed')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded text-sm"
                      >
                        Marcar Completo
                      </button>
                    )}
                    <button
                      onClick={() => updateRequestStatus(request.id, 'cancelled')}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1 rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Criar Requisição */}
      {showCreateRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Criar Requisição de Serviço</h3>
              <button
                onClick={() => setShowCreateRequest(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Título</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  placeholder="Ex: Diagnóstico de motor VW Golf"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Descrição</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  rows={3}
                  placeholder="Descreva o serviço que você precisa..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Categoria</label>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="diagnostic">Diagnóstico</option>
                  <option value="repair">Reparo</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="modification">Modificação</option>
                  <option value="restoration">Restauração</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={newRequest.city}
                    onChange={(e) => setNewRequest({ ...newRequest, city: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Estado</label>
                  <input
                    type="text"
                    value={newRequest.state}
                    onChange={(e) => setNewRequest({ ...newRequest, state: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    placeholder="SP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Orçamento Mín (opcional)</label>
                  <input
                    type="number"
                    value={newRequest.budgetMin}
                    onChange={(e) => setNewRequest({ ...newRequest, budgetMin: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Orçamento Máx (opcional)</label>
                  <input
                    type="number"
                    value={newRequest.budgetMax}
                    onChange={(e) => setNewRequest({ ...newRequest, budgetMax: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Urgência</label>
                <select
                  value={newRequest.urgency}
                  onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <button
                onClick={handleCreateRequest}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg font-semibold"
              >
                Criar Requisição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceMarketplace;
