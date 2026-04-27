import React, { useState, useEffect } from 'react';

interface Certification {
  id: string;
  name: string;
  description: string;
  level: string;
  modules: number[];
  minQuizScore: number;
  minFinalScore: number;
  minStudyHours: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  progress?: any[];
}

interface CertificationsTabProps {
  onNavigateToIssued?: () => void;
}

const CertificationsTab: React.FC<CertificationsTabProps> = ({ onNavigateToIssued }) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedCertification, setSelectedCertification] = useState<string>('');
  const [finalScore, setFinalScore] = useState<number>(100);

  const token = localStorage.getItem('autoskill_token');

  useEffect(() => {
    loadCertifications();
    loadUsers();
  }, []);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/certifications/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCertifications(data);
      }
    } catch (error) {
      console.error('Erro ao carregar certificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveCert = async (cert: Certification) => {
    try {
      const url = selectedCert 
        ? `http://localhost:3001/api/certifications/${cert.id}`
        : 'http://localhost:3001/api/certifications';
      
      const method = selectedCert ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cert),
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedCert(null);
        showMessage('success', 'Certificação salva com sucesso!');
        loadCertifications();
      } else {
        showMessage('error', 'Erro ao salvar certificação');
      }
    } catch (error) {
      console.error('Erro ao salvar certificação:', error);
      showMessage('error', 'Erro ao salvar certificação');
    }
  };

  const handleDeleteCert = async (certId: string) => {
    if (confirm('Tem certeza que deseja deletar esta certificação?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/certifications/${certId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          showMessage('success', 'Certificação deletada com sucesso!');
          loadCertifications();
        } else {
          showMessage('error', 'Erro ao deletar certificação');
        }
      } catch (error) {
        console.error('Erro ao deletar certificação:', error);
        showMessage('error', 'Erro ao deletar certificação');
      }
    }
  };

  const handleToggleCert = async (certId: string) => {
    const cert = certifications.find(c => c.id === certId);
    if (cert) {
      try {
        const response = await fetch(`http://localhost:3001/api/certifications/${certId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ...cert, enabled: !cert.enabled }),
        });

        if (response.ok) {
          loadCertifications();
        }
      } catch (error) {
        console.error('Erro ao alternar certificação:', error);
      }
    }
  };

  const handleIssueManual = async () => {
    if (!selectedUser || !selectedCertification) {
      showMessage('error', 'Selecione um usuário e uma certificação');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/certifications/admin/issue-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser,
          certificationId: selectedCertification,
          finalExamScore: finalScore,
        }),
      });

      if (response.ok) {
        showMessage('success', 'Certificado emitido com sucesso!');
        setShowIssueModal(false);
        setSelectedUser('');
        setSelectedCertification('');
        setFinalScore(100);
        loadCertifications();
      } else {
        showMessage('error', 'Erro ao emitir certificado');
      }
    } catch (error) {
      console.error('Erro ao emitir certificado manualmente:', error);
      showMessage('error', 'Erro ao emitir certificado');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return '#22c55e';
      case 'intermediate': return '#3b82f6';
      case 'advanced': return '#f97316';
      case 'expert': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'basic': return 'Básico';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      case 'expert': return 'Especialista';
      default: return level;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🎓 Certificações</h3>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h4 className="text-md font-semibold text-gray-800 dark:text-white">
            Certificações ({certifications.length})
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigateToIssued?.()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              📋 Certificados Emitidos
            </button>
            <button
              onClick={() => setShowIssueModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              📜 Emitir Manualmente
            </button>
            <button
              onClick={() => {
                setSelectedCert(null);
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Nova Certificação
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: getLevelColor(cert.level) }}
                  >
                    🎓
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleCert(cert.id)}
                      className={`text-lg ${cert.enabled ? 'text-green-600' : 'text-gray-400'}`}
                      title={cert.enabled ? 'Desativar' : 'Ativar'}
                    >
                      {cert.enabled ? '🔔' : '🔕'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCert(cert);
                        setShowModal(true);
                      }}
                      className="text-green-600 hover:text-green-800"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCert(cert.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h5 className="font-medium text-gray-800 dark:text-white mb-1">{cert.name}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{cert.description}</p>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div>• Nível: {getLevelLabel(cert.level)}</div>
                  <div>• Módulos: {cert.modules.length}</div>
                  <div>• Quiz mínimo: {cert.minQuizScore}%</div>
                  <div>• Prova final: {cert.minFinalScore}%</div>
                  <div>• Horas de estudo: {cert.minStudyHours}h</div>
                </div>
                {!cert.enabled && (
                  <div className="mt-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 inline-block">
                    Desativado
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {selectedCert ? 'Editar Certificação' : 'Nova Certificação'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const cert: Certification = {
                id: selectedCert?.id || '',
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                level: formData.get('level') as string,
                modules: (formData.get('modules') as string).split(',').map(m => parseInt(m.trim())).filter(n => !isNaN(n)),
                minQuizScore: parseInt(formData.get('minQuizScore') as string) || 70,
                minFinalScore: parseInt(formData.get('minFinalScore') as string) || 70,
                minStudyHours: parseInt(formData.get('minStudyHours') as string) || 10,
                enabled: selectedCert?.enabled ?? true,
                createdAt: selectedCert?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              handleSaveCert(cert);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  name="name"
                  defaultValue={selectedCert?.name}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  name="description"
                  defaultValue={selectedCert?.description}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nível</label>
                <select
                  name="level"
                  defaultValue={selectedCert?.level || 'basic'}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="basic">Básico</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                  <option value="expert">Especialista</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Módulos (separados por vírgula)</label>
                <input
                  name="modules"
                  defaultValue={selectedCert?.modules.join(', ') || ''}
                  placeholder="1, 2, 3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pontuação Mínima no Quiz (%)</label>
                <input
                  name="minQuizScore"
                  type="number"
                  defaultValue={selectedCert?.minQuizScore || 70}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pontuação Mínima na Prova Final (%)</label>
                <input
                  name="minFinalScore"
                  type="number"
                  defaultValue={selectedCert?.minFinalScore || 70}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horas Mínimas de Estudo</label>
                <input
                  name="minStudyHours"
                  type="number"
                  defaultValue={selectedCert?.minStudyHours || 10}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCert(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Emissão Manual */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📜 Emitir Certificado Manualmente</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuário</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Selecione um usuário</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificação</label>
                <select
                  value={selectedCertification}
                  onChange={(e) => setSelectedCertification(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Selecione uma certificação</option>
                  {certifications.length === 0 ? (
                    <option disabled>Nenhuma certificação disponível</option>
                  ) : (
                    certifications.map((cert) => (
                      <option key={cert.id} value={cert.id}>
                        {cert.name} ({getLevelLabel(cert.level)})
                      </option>
                    ))
                  )}
                </select>
                {certifications.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Crie uma certificação primeiro</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pontuação da Prova Final (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={finalScore}
                  onChange={(e) => setFinalScore(parseInt(e.target.value) || 100)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleIssueManual}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Emitir
                </button>
                <button
                  onClick={() => {
                    setShowIssueModal(false);
                    setSelectedUser('');
                    setSelectedCertification('');
                    setFinalScore(100);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
        <h4 className="text-md font-semibold text-green-800 dark:text-green-200 mb-2">ℹ️ Informações</h4>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
          <li>• As certificações são salvas no banco de dados</li>
          <li>• Usuários desbloqueiam certificações ao atingir os requisitos</li>
          <li>• Certificações desativadas não serão concedidas automaticamente</li>
          <li>• Use "Emitir Manualmente" para conceder certificados sem verificação de requisitos</li>
        </ul>
      </div>
    </div>
  );
};

export default CertificationsTab;
