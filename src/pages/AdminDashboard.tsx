import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import Layout from '../components/Layout';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import UsersTab from '../components/admin/UsersTab';
import ContentTab from '../components/admin/ContentTab';
import GamificationTab from '../components/admin/GamificationTab';
import SettingsTab from '../components/admin/SettingsTab';
import LogsTab from '../components/admin/LogsTab';
import NotificationsTab from '../components/admin/NotificationsTab';
import CertificationsTab from '../components/admin/CertificationsTab';
import AnswerKeyTab from '../components/admin/AnswerKeyTab';
import IssuedCertificatesPage from '../components/admin/IssuedCertificatesPage';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  _count?: {
    progress: number;
    gamification: number;
  };
}

type TabType = 'analytics' | 'users' | 'content' | 'gamification' | 'settings' | 'logs' | 'notifications' | 'certifications' | 'answerkey' | 'issuedcertificates';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', role: 'user', bio: '', phone: '', avatar: '', password: '', confirmPassword: '' });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response: any = await authAPI.getAllUsers();
      // A API agora retorna { users, pagination } devido à paginação
      const usersData = Array.isArray(response) ? response : response.users;
      setUsers(usersData);
    } catch (error) {
      showMessage('error', 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await authAPI.deleteUser(userId);
      showMessage('success', 'Usuário deletado com sucesso');
      loadUsers();
    } catch (error) {
      showMessage('error', 'Erro ao deletar usuário');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      role: user.role,
      bio: user.bio || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      password: '',
      confirmPassword: ''
    });
    setAvatarPreview(user.avatar || '');
    setShowEditModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Validar senha se foi preenchida
    if (editFormData.password) {
      if (editFormData.password.length < 6) {
        showMessage('error', 'A senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (editFormData.password !== editFormData.confirmPassword) {
        showMessage('error', 'As senhas não coincidem');
        return;
      }
    }

    try {
      const updateData: any = {
        name: editFormData.name,
        role: editFormData.role,
        bio: editFormData.bio,
        phone: editFormData.phone,
        avatar: editFormData.avatar,
      };

      // Só envia senha se foi preenchida
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      await authAPI.updateUser(selectedUser.id, updateData);
      showMessage('success', 'Usuário atualizado com sucesso');
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      showMessage('error', 'Erro ao atualizar usuário');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showMessage('error', 'Por favor, selecione uma imagem');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        setEditFormData({ ...editFormData, avatar: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setEditFormData({ ...editFormData, avatar: '' });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-orange-600 dark:text-orange-400">Carregando...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">👑 Painel Administrativo</h1>
            <p className="text-gray-600 dark:text-gray-300">Gerencie usuários, conteúdo e configurações</p>
          </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md mb-6 overflow-x-auto">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'analytics' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'users' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              👥 Usuários
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'content' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              📚 Conteúdo
            </button>
            <button
              onClick={() => setActiveTab('gamification')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'gamification' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              🎮 Gamificação
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'settings' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              ⚙️ Configurações
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'logs' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              📋 Logs
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'notifications' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              📧 Notificações
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'certifications'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              🎓 Certificações
            </button>
            <button
              onClick={() => setActiveTab('answerkey')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'answerkey'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              📋 Gabarito
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' && (
          <AnalyticsTab users={users} />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            filteredUsers={filteredUsers}
          />
        )}

        {activeTab === 'content' && (
          <ContentTab />
        )}

        {activeTab === 'gamification' && (
          <GamificationTab />
        )}

        {activeTab === 'settings' && (
          <SettingsTab />
        )}

        {activeTab === 'logs' && (
          <LogsTab />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab />
        )}

        {activeTab === 'certifications' && (
          <CertificationsTab onNavigateToIssued={() => setActiveTab('issuedcertificates')} />
        )}

        {activeTab === 'issuedcertificates' && (
          <IssuedCertificatesPage />
        )}

        {activeTab === 'answerkey' && (
          <AnswerKeyTab />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Editar Usuário</h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto de Perfil</label>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                      {editFormData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="admin-avatar-upload"
                    />
                    <label
                      htmlFor="admin-avatar-upload"
                      className="block w-full text-center bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      Carregar Foto
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biografia</label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha (opcional)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Deixe em branco para não alterar"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={editFormData.confirmPassword}
                    onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
