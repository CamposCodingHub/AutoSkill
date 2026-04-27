import React, { useState, useEffect } from 'react';
import { Symptom, DiagnosticResult, DiagnosticSession, AIAssistantMessage } from '../types/gamification';
import {
  getAllSymptoms,
  getSymptomsByCategory,
  searchSymptoms,
  createDiagnosticSession,
  getDiagnosticSessions,
  generateAIResponse,
  addAssistantMessage,
  getAssistantMessages,
  clearAssistantMessages,
  getDiagnosticTips,
  loadDiagnosticData
} from '../utils/diagnosticAI';

interface DiagnosticAIProps {
  userId: string;
}

const DiagnosticAI: React.FC<DiagnosticAIProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'diagnosis' | 'history' | 'tips'>('assistant');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [currentSession, setCurrentSession] = useState<DiagnosticSession | null>(null);
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [messages, setMessages] = useState<AIAssistantMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState({ make: '', model: '', year: '' });
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    loadDiagnosticData();
    setSymptoms(getAllSymptoms());
    setSessions(getDiagnosticSessions(userId));
    setMessages(getAssistantMessages());
  }, [userId]);

  const handleSelectSymptom = (symptom: Symptom) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleRemoveSymptom = (symptomId: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId));
  };

  const handleRunDiagnosis = () => {
    if (selectedSymptoms.length === 0 || !vehicleInfo.make || !vehicleInfo.model) {
      alert('Selecione pelo menos um sintoma e preencha as informações do veículo');
      return;
    }

    const session = createDiagnosticSession(
      userId,
      {
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: parseInt(vehicleInfo.year) || 2020
      },
      selectedSymptoms
    );

    setCurrentSession(session);
    setSessions(getDiagnosticSessions(userId));
    setActiveTab('diagnosis');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMsg = addAssistantMessage('user', inputMessage);
    setMessages([...messages, userMsg]);

    const aiResponse = generateAIResponse(inputMessage, currentSession || undefined);
    const assistantMsg = addAssistantMessage('assistant', aiResponse);
    
    setTimeout(() => {
      setMessages(prev => [...prev, assistantMsg]);
    }, 500);

    setInputMessage('');
  };

  const handleClearChat = () => {
    clearAssistantMessages();
    setMessages([]);
  };

  const filteredSymptoms = searchQuery
    ? searchSymptoms(searchQuery)
    : filterCategory
    ? getSymptomsByCategory(filterCategory)
    : symptoms;

  return (
    <div className="diagnostic-ai bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-cyan-600 dark:text-cyan-400">🤖 IA de Diagnóstico</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {(['assistant', 'diagnosis', 'history', 'tips'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-cyan-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-cyan-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'assistant' ? '💬 Assistente' : 
             tab === 'diagnosis' ? '🔍 Diagnóstico' :
             tab === 'history' ? '📋 Histórico' :
             '💡 Dicas'}
          </button>
        ))}
      </div>

      {/* Assistente Virtual */}
      {activeTab === 'assistant' && (
        <div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md mb-4 h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                <div className="text-4xl mb-2">🤖</div>
                <div>Olá! Sou seu assistente de diagnóstico automotivo.</div>
                <div className="text-sm mt-2">Descreva os sintomas do veículo e eu ajudarei a identificar o problema.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Descreva os sintomas..."
              className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
            <button
              onClick={handleSendMessage}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg"
            >
              Enviar
            </button>
            <button
              onClick={handleClearChat}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Diagnóstico */}
      {activeTab === 'diagnosis' && (
        <div>
          {!currentSession ? (
            <div>
              {/* Informações do Veículo */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md mb-4">
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Informações do Veículo</h3>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Marca (ex: VW)"
                    value={vehicleInfo.make}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  />
                  <input
                    type="text"
                    placeholder="Modelo (ex: Golf)"
                    value={vehicleInfo.model}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  />
                  <input
                    type="text"
                    placeholder="Ano (ex: 2020)"
                    value={vehicleInfo.year}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>

              {/* Sintomas Selecionados */}
              {selectedSymptoms.length > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md mb-4">
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Sintomas Selecionados</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map(symptom => (
                      <span
                        key={symptom.id}
                        className="bg-cyan-100 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {symptom.description}
                        <button
                          onClick={() => handleRemoveSymptom(symptom.id)}
                          className="ml-2 text-cyan-600 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seleção de Sintomas */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Selecionar Sintomas</h3>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                  >
                    <option value="">Todas as Categorias</option>
                    <option value="engine">Motor</option>
                    <option value="electrical">Elétrica</option>
                    <option value="brake">Freios</option>
                    <option value="transmission">Transmissão</option>
                    <option value="cooling">Arrefecimento</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Buscar sintomas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 mb-3"
                />
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredSymptoms.map(symptom => (
                    <button
                      key={symptom.id}
                      onClick={() => handleSelectSymptom(symptom)}
                      disabled={selectedSymptoms.find(s => s.id === symptom.id) !== undefined}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedSymptoms.find(s => s.id === symptom.id)
                          ? 'bg-cyan-100 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-300 cursor-not-allowed'
                          : 'bg-gray-50 dark:bg-gray-600 hover:bg-cyan-50 dark:hover:bg-cyan-900 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm">{symptom.description}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          symptom.severity === 'critical' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300' :
                          symptom.severity === 'high' ? 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300' :
                          symptom.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                          'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                        }`}>
                          {symptom.severity}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRunDiagnosis}
                disabled={selectedSymptoms.length === 0 || !vehicleInfo.make || !vehicleInfo.model}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                🔍 Executar Diagnóstico
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Resultados do Diagnóstico</h3>
                  <button
                    onClick={() => setCurrentSession(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Novo Diagnóstico
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Veículo</div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {currentSession.vehicleInfo.make} {currentSession.vehicleInfo.model} ({currentSession.vehicleInfo.year})
                  </div>
                </div>

                <div className="mb-4 p-3 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Confiança da IA</div>
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {currentSession.confidence}%
                  </div>
                </div>

                <div className="space-y-3">
                  {currentSession.results.map((result, index) => (
                    <div
                      key={result.id}
                      className="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg border-l-4 border-cyan-500"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{result.problem}</h4>
                        <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                          {result.probability}%
                        </span>
                      </div>

                      <div className="mb-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Causas Possíveis</div>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {result.possibleCauses.map((cause, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2">•</span>
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Testes Recomendados</div>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {result.recommendedTests.map((test, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2">✓</span>
                              {test}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-between text-sm">
                        {result.estimatedCost && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Custo estimado: </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">R$ {result.estimatedCost}</span>
                          </div>
                        )}
                        {result.estimatedTime && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Tempo: </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{result.estimatedTime}h</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                          result.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                          result.difficulty === 'hard' ? 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300' :
                          'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                        }`}>
                          {result.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Histórico */}
      {activeTab === 'history' && (
        <div>
          {sessions.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <div className="text-4xl mb-2">📋</div>
              <div>Nenhum diagnóstico realizado ainda</div>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {session.vehicleInfo.make} {session.vehicleInfo.model} ({session.vehicleInfo.year})
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {session.symptoms.length} sintomas • {new Date(session.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                        {session.confidence}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Confiança</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {session.symptoms.slice(0, 3).map(s => (
                      <span key={s.id} className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {s.description}
                      </span>
                    ))}
                    {session.symptoms.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">+{session.symptoms.length - 3}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dicas */}
      {activeTab === 'tips' && (
        <div>
          <div className="space-y-3">
            {getDiagnosticTips().map(tip => (
              <div
                key={tip.id}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{tip.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    tip.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                    tip.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                    'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
                  }`}>
                    {tip.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{tip.description}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Categoria: {tip.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticAI;
