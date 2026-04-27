import React from 'react';
import { useNavigate } from 'react-router-dom';

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

interface AnalyticsTabProps {
  users: User[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ users }) => {
  const navigate = useNavigate();
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalRegularUsers = users.filter(u => u.role === 'user').length;
  const totalProgress = users.reduce((acc, u) => acc + (u._count?.progress || 0), 0);

  // Usuários cadastrados nos últimos 7 dias
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newUsersLast7Days = users.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;

  // Usuários cadastrados nos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsersLast30Days = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-500">{totalUsers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total de Usuários</div>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <div className="mt-4 text-xs text-green-600 dark:text-green-400">
            +{newUsersLast7Days} nos últimos 7 dias
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-500">{totalAdmins}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Administradores</div>
            </div>
            <div className="text-4xl">👑</div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {((totalAdmins / totalUsers) * 100).toFixed(1)}% do total
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-500">{totalRegularUsers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Usuários Comuns</div>
            </div>
            <div className="text-4xl">👤</div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {((totalRegularUsers / totalUsers) * 100).toFixed(1)}% do total
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-500">{totalProgress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Progressos Registrados</div>
            </div>
            <div className="text-4xl">📊</div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {(totalProgress / totalUsers).toFixed(1)} por usuário
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">📈 Crescimento de Usuários</h3>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Analytics Avançado
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{newUsersLast7Days}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Últimos 7 dias</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{newUsersLast30Days}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Últimos 30 dias</div>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🎯 Distribuição de Usuários</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">Administradores</span>
              <span className="font-medium text-gray-800 dark:text-white">{totalAdmins} ({((totalAdmins / totalUsers) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all" 
                style={{ width: `${(totalAdmins / totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">Usuários Comuns</span>
              <span className="font-medium text-gray-800 dark:text-white">{totalRegularUsers} ({((totalRegularUsers / totalUsers) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all" 
                style={{ width: `${(totalRegularUsers / totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🕐 Usuários Recentes</h3>
        <div className="space-y-3">
          {users.slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {user.role === 'admin' ? 'Admin' : 'Usuário'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
