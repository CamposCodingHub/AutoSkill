import React, { useState, useEffect } from 'react';
import { Mentor, MentoringSession, MentoringRequest } from '../types/gamification';
import {
  getAvailableMentors,
  getMentorById,
  filterMentorsBySpecialization,
  findBestMentors,
  createMentoringRequest,
  getRequestsForStudent,
  getSessionsForStudent,
  acceptMentoringRequest,
  rejectMentoringRequest,
  loadMentoringData
} from '../utils/mentorshipLogic';

interface MentorshipSystemProps {
  userId: string;
  userSpecializations?: string[];
  userLevel?: string;
}

const MentorshipSystem: React.FC<MentorshipSystemProps> = ({
  userId,
  userSpecializations = [],
  userLevel = 'beginner'
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'requests' | 'sessions' | 'matches'>('browse');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requests, setRequests] = useState<MentoringRequest[]>([]);
  const [sessions, setSessions] = useState<MentoringSession[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadMentoringData();
    setMentors(getAvailableMentors());
    setRequests(getRequestsForStudent(userId));
    setSessions(getSessionsForStudent(userId));
    
    if (userSpecializations.length > 0) {
      const bestMatches = findBestMentors(userId, userSpecializations, userLevel);
      setMatches(bestMatches);
    }
  }, [userId, userSpecializations, userLevel]);

  const handleRequestMentoring = (mentorId: string, topic: string, description: string, preferredDate: Date) => {
    createMentoringRequest(userId, mentorId, topic, description, preferredDate);
    setRequests(getRequestsForStudent(userId));
    setActiveTab('requests');
  };

  const filteredMentors = filter 
    ? filterMentorsBySpecialization(filter)
    : mentors;

  return (
    <div className="mentorship-system bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-teal-600 dark:text-teal-400">🤝 Sistema de Mentoria</h2>

      {/* Tabs de Navegação */}
      <div className="flex space-x-2 mb-6">
        {(['browse', 'matches', 'requests', 'sessions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-teal-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'browse' ? '🔍 Explorar Mentores' : 
             tab === 'matches' ? '⭐ Recomendados' :
             tab === 'requests' ? '📋 Requisições' :
             '📅 Minhas Sessões'}
          </button>
        ))}
      </div>

      {/* Filtro de Especialização */}
      {activeTab === 'browse' && (
        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="">Todas as Especializações</option>
            <option value="Elétrica">Elétrica</option>
            <option value="Injeção">Injeção Eletrônica</option>
            <option value="Híbridos">Veículos Híbridos</option>
            <option value="Elétricos">Veículos Elétricos</option>
            <option value="Transmissão">Transmissão</option>
            <option value="Freios">Freios</option>
            <option value="Suspensão">Suspensão</option>
            <option value="CAN Bus">CAN Bus</option>
            <option value="Diagnóstico">Diagnóstico</option>
          </select>
        </div>
      )}

      {/* Conteúdo das Tabs */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMentors.map(mentor => (
            <div
              key={mentor.id}
              className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedMentor(mentor)}
            >
              <div className="flex items-start mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-3">
                  {mentor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{mentor.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{mentor.rating}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                      ({mentor.sessionsCompleted} sessões)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Especializações</div>
                <div className="flex flex-wrap gap-1">
                  {mentor.specializations.slice(0, 3).map(spec => (
                    <span key={spec} className="text-xs bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300 px-2 py-1 rounded">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Experiência</div>
                <div className="text-sm text-gray-800 dark:text-gray-200">{mentor.experience} anos</div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  mentor.availability === 'available' 
                    ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' 
                    : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {mentor.availability === 'available' ? '✓ Disponível' : '⏳ Ocupado'}
                </span>
                {mentor.hourlyRate && (
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                    R$ {mentor.hourlyRate}/h
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <div className="text-4xl mb-2">🎯</div>
              <div>Adicione suas especializações para ver recomendações personalizadas</div>
            </div>
          ) : (
            matches.map((match, index) => {
              const mentor = getMentorById(match.mentorId);
              if (!mentor) return null;

              return (
                <div
                  key={match.mentorId}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-3">
                        {mentor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{mentor.name}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {mentor.specializations.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {match.compatibilityScore}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Compatibilidade</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Por que combinam:</div>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {match.reasons.slice(0, 3).map((reason, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tópicos Recomendados:</div>
                    <div className="flex flex-wrap gap-1">
                      {match.recommendedTopics.map(topic => (
                        <span key={topic} className="text-xs bg-cyan-100 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg transition"
                  >
                    Solicitar Mentoria
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <div className="text-4xl mb-2">📋</div>
              <div>Nenhuma requisição de mentoria</div>
            </div>
          ) : (
            requests.map(request => {
              const mentor = getMentorById(request.mentorId);
              if (!mentor) return null;

              return (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{request.topic}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Mentor: {mentor.name}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      request.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                      request.status === 'accepted' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                      request.status === 'rejected' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      {request.status === 'pending' ? '⏳ Pendente' :
                       request.status === 'accepted' ? '✓ Aceita' :
                       request.status === 'rejected' ? '✗ Rejeitada' :
                       '✓ Completa'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {request.description}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Data preferida: {new Date(request.preferredDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <div className="text-4xl mb-2">📅</div>
              <div>Nenhuma sessão de mentoria agendada</div>
            </div>
          ) : (
            sessions.map(session => {
              const mentor = getMentorById(session.mentorId);
              if (!mentor) return null;

              return (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{session.topic}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Mentor: {mentor.name}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      session.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' :
                      session.status === 'in_progress' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                      session.status === 'completed' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                      'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                    }`}>
                      {session.status === 'scheduled' ? '📅 Agendada' :
                       session.status === 'in_progress' ? '🔴 Em Progresso' :
                       session.status === 'completed' ? '✓ Completa' :
                       '✗ Cancelada'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {session.notes}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Data: {new Date(session.scheduledDate).toLocaleString('pt-BR')} • Duração: {session.duration} min
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal de Detalhes do Mentor */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-4">
                  {selectedMentor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{selectedMentor.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{selectedMentor.rating}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                      ({selectedMentor.sessionsCompleted} sessões • {selectedMentor.studentsMentored} alunos)
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sobre</div>
              <p className="text-gray-700 dark:text-gray-300">{selectedMentor.bio}</p>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Especializações</div>
              <div className="flex flex-wrap gap-2">
                {selectedMentor.specializations.map(spec => (
                  <span key={spec} className="bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Certificações</div>
              <div className="flex flex-wrap gap-2">
                {selectedMentor.certifications.map(cert => (
                  <span key={cert} className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Experiência</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{selectedMentor.experience} anos</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Idiomas</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {selectedMentor.languages.join(', ')}
                </div>
              </div>
            </div>

            {selectedMentor.hourlyRate && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Taxa Horária</div>
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  R$ {selectedMentor.hourlyRate}/hora
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedMentor(null);
                // Aqui seria aberto um modal para criar requisição
              }}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg transition font-semibold"
              disabled={selectedMentor.availability !== 'available'}
            >
              {selectedMentor.availability === 'available' ? 'Solicitar Mentoria' : 'Mentor Indisponível'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipSystem;
