import React, { useState } from 'react';
import PasswordConfirmModal from './PasswordConfirmModal';

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

interface UsersTabProps {
  users: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  filteredUsers: User[];
}

const UsersTab: React.FC<UsersTabProps> = ({ 
  users, 
  searchTerm, 
  setSearchTerm, 
  onEditUser, 
  onDeleteUser,
  filteredUsers 
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleDeleteClick = (userId: string) => {
    setPendingAction(() => () => {
      onDeleteUser(userId);
    });
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  return (
    <div className="space-y-6">
      <PasswordConfirmModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingAction(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Confirmar Exclusão de Usuário"
        message="Esta ação é irreversível. Por favor, digite sua senha para confirmar a exclusão deste usuário."
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md">
          <div className="text-3xl font-bold text-orange-500">{users.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total de Usuários</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md">
          <div className="text-3xl font-bold text-blue-500">{users.filter(u => u.role === 'admin').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Administradores</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md">
          <div className="text-3xl font-bold text-green-500">{users.filter(u => u.role === 'user').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Usuários Comuns</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md">
          <div className="text-3xl font-bold text-purple-500">
            {users.reduce((acc, u) => acc + (u._count?.progress || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Progressos Registrados</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-4">
        <input
          type="text"
          placeholder="Buscar usuário por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuário</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Progresso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cadastro</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        {user.bio && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{user.bio}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {user._count?.progress || 0} registros
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Deletar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
