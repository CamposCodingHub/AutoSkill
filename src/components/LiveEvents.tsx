import React, { useState, useEffect } from 'react';
import { LiveEvent } from '../types/gamification';
import {
  getAllEvents,
  getEventsByType,
  getNearbyEvents,
  registerForEvent,
  unregisterFromEvent,
  getUserRegisteredEvents,
  loadEventData
} from '../utils/eventsLogic';

interface LiveEventsProps {
  userId: string;
}

const LiveEvents: React.FC<LiveEventsProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'registered' | 'all'>('upcoming');
  const [registeredEvents, setRegisteredEvents] = useState<LiveEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    loadEventData();
    setRegisteredEvents(getUserRegisteredEvents());
  }, []);

  const handleRegister = (eventId: string) => {
    const success = registerForEvent(eventId);
    if (success) {
      setRegisteredEvents(getUserRegisteredEvents());
      alert('Registro realizado com sucesso!');
    } else {
      alert('Não foi possível registrar. O evento pode estar cheio.');
    }
  };

  const handleUnregister = (eventId: string) => {
    unregisterFromEvent(eventId);
    setRegisteredEvents(getUserRegisteredEvents());
  };

  const filteredEvents = filterType
    ? getEventsByType(filterType as any)
    : activeTab === 'upcoming'
    ? getNearbyEvents()
    : activeTab === 'registered'
    ? registeredEvents
    : getAllEvents();

  const formatEventDate = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0 && hours === 0) return 'Agora';
    if (days === 0) return `Em ${hours}h`;
    if (days === 1) return 'Amanhã';
    return `Em ${days} dias`;
  };

  return (
    <div className="live-events bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-pink-600 dark:text-pink-400">🎬 Eventos ao Vivo</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {(['upcoming', 'registered', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-pink-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'upcoming' ? '📅 Próximos' : tab === 'registered' ? '✓ Registrados' : '📋 Todos'}
          </button>
        ))}
      </div>

      {/* Filtro */}
      <div className="mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="">Todos os Tipos</option>
          <option value="webinar">Webinar</option>
          <option value="workshop">Workshop</option>
          <option value="qna">Q&A</option>
          <option value="demo">Demo</option>
        </select>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            <div className="text-4xl mb-2">🎬</div>
            <div>Nenhum evento encontrado</div>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-start">
                {/* Thumbnail */}
                <div className="w-32 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-white text-3xl mr-4 flex-shrink-0">
                  {event.type === 'webinar' ? '📹' :
                   event.type === 'workshop' ? '🔧' :
                   event.type === 'qna' ? '❓' :
                   '🎥'}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    {event.registered && (
                      <span className="text-xl">✓</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mb-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                        {event.instructor.charAt(0)}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{event.instructor}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {formatEventDate(event.scheduledDate)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {event.duration}min
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.type === 'webinar' ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' :
                        event.type === 'workshop' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                        event.type === 'qna' ? 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300' :
                        'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
                      }`}>
                        {event.type}
                      </span>
                      {event.maxParticipants && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {event.currentParticipants}/{event.maxParticipants}
                        </span>
                      )}
                    </div>

                    {event.registered ? (
                      <button
                        onClick={() => handleUnregister(event.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={!!(event.maxParticipants && event.currentParticipants >= event.maxParticipants)}
                        className={`px-3 py-1 rounded text-sm ${
                          event.maxParticipants && event.currentParticipants >= event.maxParticipants
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-pink-500 hover:bg-pink-600 text-white'
                        }`}
                      >
                        {event.maxParticipants && event.currentParticipants >= event.maxParticipants
                          ? 'Cheio'
                          : 'Registrar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {event.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveEvents;
