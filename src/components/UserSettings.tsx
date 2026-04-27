import React, { useState, useEffect } from 'react';
import { UserPreferences, UserProfile, Notification, UserFeedback } from '../types/gamification';

interface UserSettingsProps {
  userId: string;
  userName: string;
}

const UserSettings: React.FC<UserSettingsProps> = ({ userId, userName }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'feedback'>('profile');
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'auto',
    language: 'pt-BR',
    notifications: {
      email: true,
      push: true,
      challenges: true,
      mentorship: true,
      community: true
    },
    privacy: {
      showProfile: true,
      showProgress: true,
      showPortfolio: true
    },
    learning: {
      autoPlay: false,
      subtitles: true,
      quality: 'auto',
      reminders: true,
      reminderTime: '09:00'
    }
  });

  const [profile, setProfile] = useState<UserProfile>({
    id: userId,
    name: userName,
    email: 'usuario@exemplo.com',
    bio: 'Estudante de mecânica automotiva',
    location: 'São Paulo, SP',
    socialLinks: {},
    joinedDate: new Date('2024-01-01'),
    lastActive: new Date()
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      userId,
      type: 'challenge',
      title: 'Desafio Completado!',
      message: 'Você completou o desafio "Estudante Diário"',
      read: false,
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      id: 'notif-2',
      userId,
      type: 'achievement',
      title: 'Nova Conquista',
      message: 'Você desbloqueou "Primeiros Passos"',
      read: false,
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'notif-3',
      userId,
      type: 'system',
      title: 'Bem-vindo',
      message: 'Bem-vindo ao AutoSkill! Comece sua jornada.',
      read: true,
      createdAt: new Date(Date.now() - 172800000)
    }
  ]);

  const [feedback, setFeedback] = useState({
    type: 'improvement' as 'bug' | 'feature' | 'improvement' | 'other',
    subject: '',
    description: '',
    rating: 5
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSavePreferences = () => {
    localStorage.setItem('autoskill_user_preferences', JSON.stringify(preferences));
    alert('Preferências salvas com sucesso!');
  };

  const handleSaveProfile = () => {
    localStorage.setItem('autoskill_user_profile', JSON.stringify(profile));
    alert('Perfil atualizado com sucesso!');
  };

  const handleMarkAsRead = (notifId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleSubmitFeedback = () => {
    if (!feedback.subject || !feedback.description) {
      alert('Preencha todos os campos');
      return;
    }

    const newFeedback: UserFeedback = {
      id: `feedback-${Date.now()}`,
      userId,
      type: feedback.type,
      subject: feedback.subject,
      description: feedback.description,
      rating: feedback.rating,
      createdAt: new Date(),
      status: 'pending'
    };

    console.log('Feedback enviado:', newFeedback);
    alert('Feedback enviado com sucesso! Obrigado por sua contribuição.');
    
    setFeedback({
      type: 'improvement',
      subject: '',
      description: '',
      rating: 5
    });
  };

  return (
    <div className="user-settings bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">⚙️ Configurações</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {(['profile', 'preferences', 'notifications', 'feedback'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-gray-800 dark:bg-gray-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'profile' ? '👤 Perfil' : 
             tab === 'preferences' ? '🎨 Preferências' :
             tab === 'notifications' ? '🔔 Notificações' :
             '💬 Feedback'}
            {tab === 'notifications' && unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Perfil */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Informações do Perfil</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Nome</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Localização</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Website</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={profile.socialLinks.linkedin}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    socialLinks: { ...profile.socialLinks, linkedin: e.target.value }
                  })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">GitHub</label>
                <input
                  type="url"
                  value={profile.socialLinks.github}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    socialLinks: { ...profile.socialLinks, github: e.target.value }
                  })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Twitter</label>
                <input
                  type="url"
                  value={profile.socialLinks.twitter}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    socialLinks: { ...profile.socialLinks, twitter: e.target.value }
                  })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full bg-gray-800 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-500 text-white py-3 rounded-lg font-semibold"
            >
              Salvar Perfil
            </button>
          </div>
        </div>
      )}

      {/* Preferências */}
      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Aparência</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tema</label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Idioma</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Notificações</h3>
            
            <div className="space-y-3">
              {Object.entries(preferences.notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key === 'email' ? 'Email' :
                     key === 'push' ? 'Push' :
                     key === 'challenges' ? 'Desafios' :
                     key === 'mentorship' ? 'Mentoria' :
                     'Comunidade'}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, [key]: e.target.checked }
                    })}
                    className="w-5 h-5"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Privacidade</h3>
            
            <div className="space-y-3">
              {Object.entries(preferences.privacy).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key === 'showProfile' ? 'Mostrar Perfil' :
                     key === 'showProgress' ? 'Mostrar Progresso' :
                     'Mostrar Portfólio'}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, [key]: e.target.checked }
                    })}
                    className="w-5 h-5"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Aprendizado</h3>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Autoplay de vídeos</span>
                  <input
                    type="checkbox"
                    checked={preferences.learning.autoPlay}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      learning: { ...preferences.learning, autoPlay: e.target.checked }
                    })}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Legendas</span>
                  <input
                    type="checkbox"
                    checked={preferences.learning.subtitles}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      learning: { ...preferences.learning, subtitles: e.target.checked }
                    })}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Lembretes de estudo</span>
                  <input
                    type="checkbox"
                    checked={preferences.learning.reminders}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      learning: { ...preferences.learning, reminders: e.target.checked }
                    })}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Qualidade de Vídeo</label>
                <select
                  value={preferences.learning.quality}
                  onChange={(e) => setPreferences({ ...preferences, learning: { ...preferences.learning, quality: e.target.value as any } })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="auto">Automático</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Horário do Lembrete</label>
                <input
                  type="time"
                  value={preferences.learning.reminderTime}
                  onChange={(e) => setPreferences({ ...preferences, learning: { ...preferences.learning, reminderTime: e.target.value } })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSavePreferences}
            className="w-full bg-gray-800 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-500 text-white py-3 rounded-lg font-semibold"
          >
            Salvar Preferências
          </button>
        </div>
      )}

      {/* Notificações */}
      {activeTab === 'notifications' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notificações ({unreadCount} não lidas)
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md ${
                  !notif.read ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{notif.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notif.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Marcar como lida
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Enviar Feedback</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tipo</label>
              <select
                value={feedback.type}
                onChange={(e) => setFeedback({ ...feedback, type: e.target.value as any })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="bug">🐛 Bug</option>
                <option value="feature">✨ Nova Funcionalidade</option>
                <option value="improvement">📈 Melhoria</option>
                <option value="other">💬 Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Assunto</label>
              <input
                type="text"
                value={feedback.subject}
                onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                placeholder="Resumo do feedback"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Descrição</label>
              <textarea
                value={feedback.description}
                onChange={(e) => setFeedback({ ...feedback, description: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                rows={5}
                placeholder="Descreva seu feedback em detalhes..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Avaliação Geral</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFeedback({ ...feedback, rating })}
                    className={`text-2xl ${feedback.rating >= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmitFeedback}
              className="w-full bg-gray-800 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-500 text-white py-3 rounded-lg font-semibold"
            >
              Enviar Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
