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
  progress?: any[];
}

const IssuedCertificatesPage: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProgress, setEditingProgress] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    userName: '',
    finalExamScore: 100,
    completedAt: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProgress, setDeletingProgress] = useState<any>(null);

  const token = localStorage.getItem('autoskill_token');

  useEffect(() => {
    loadCertifications();
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

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const getLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      basic: 'Básico',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
      expert: 'Especialista',
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      basic: 'bg-green-100 text-green-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-purple-100 text-purple-800',
      expert: 'bg-orange-100 text-orange-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const handleCopyLink = (url: string) => {
    const fullUrl = `http://localhost:3001${url}`;
    navigator.clipboard.writeText(fullUrl);
    showMessage('success', 'Link copiado para a área de transferência!');
  };

  const handleShare = (certName: string, userName: string, score: number, url: string) => {
    if (navigator.share) {
      navigator.share({
        title: `Certificado: ${certName}`,
        text: `${userName} obteve o certificado de ${certName} com pontuação de ${score}%`,
        url: `http://localhost:3001${url}`,
      });
    } else {
      showMessage('error', 'Compartilhamento não suportado neste navegador');
    }
  };

  const handleEdit = (progress: any) => {
    setEditingProgress(progress);
    setEditFormData({
      userName: progress.user.name,
      finalExamScore: progress.finalExamScore,
      completedAt: new Date(progress.completedAt).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProgress) return;

    try {
      const response = await fetch(`http://localhost:3001/api/certifications/progress/${editingProgress.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userName: editFormData.userName,
          finalExamScore: editFormData.finalExamScore,
          completedAt: editFormData.completedAt
        }),
      });

      if (response.ok) {
        showMessage('success', 'Certificado atualizado com sucesso!');
        setShowEditModal(false);
        loadCertifications();
      } else {
        showMessage('error', 'Erro ao atualizar certificado');
      }
    } catch (error) {
      console.error('Erro ao atualizar certificado:', error);
      showMessage('error', 'Erro ao atualizar certificado');
    }
  };

  const handleDelete = async (progressId: string) => {
    const progress = deletingProgress;
    if (!progress) return;

    try {
      const response = await fetch(`http://localhost:3001/api/certifications/progress/${progressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showMessage('success', 'Certificado excluído com sucesso!');
        setShowDeleteModal(false);
        setDeletingProgress(null);
        loadCertifications();
      } else {
        showMessage('error', 'Erro ao excluir certificado');
      }
    } catch (error) {
      console.error('Erro ao excluir certificado:', error);
      showMessage('error', 'Erro ao excluir certificado');
    }
  };

  // Filtrar certificados e progressos
  const filteredCertifications = certifications.filter(cert => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      cert.name.toLowerCase().includes(searchLower) ||
      (cert.progress && cert.progress.some((p: any) => 
        p.user.name.toLowerCase().includes(searchLower) ||
        p.user.email.toLowerCase().includes(searchLower)
      ))
    );
  });

  const totalCertificates = filteredCertifications.reduce((sum, cert) => sum + (cert.progress?.length || 0), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📋 Certificados Emitidos</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {totalCertificates} certificado(s)
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Barra de busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome, email ou certificação..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : (
        <div className="space-y-4">
          {filteredCertifications.map((cert) => (
            <div key={cert.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
              {/* Header da certificação */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {cert.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{cert.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(cert.level)}`}>
                        {getLevelLabel(cert.level)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {cert.progress?.length || 0} certificado(s)
                  </div>
                </div>
              </div>

              {/* Lista de certificados emitidos */}
              {cert.progress && cert.progress.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cert.progress
                    .filter((progress: any) => {
                      if (!searchTerm) return true;
                      const searchLower = searchTerm.toLowerCase();
                      return (
                        progress.user.name.toLowerCase().includes(searchLower) ||
                        progress.user.email.toLowerCase().includes(searchLower)
                      );
                    })
                    .map((progress: any) => (
                    <div key={progress.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {progress.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-white">{progress.user.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{progress.user.email}</div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>📊 {progress.finalExamScore}%</span>
                              <span>📅 {new Date(progress.completedAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {progress.certificateUrl ? (
                            <>
                              <a
                                href={`http://localhost:3001${progress.certificateUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                              >
                                📥 Baixar
                              </a>
                              <button
                                onClick={() => {
                                  setDeletingProgress(progress);
                                  setShowDeleteModal(true);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                              >
                                🗑️ Excluir
                              </button>
                              <button
                                onClick={() => handleEdit(progress)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => handleCopyLink(progress.certificateUrl)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                              >
                                📋 Copiar
                              </button>
                              <button
                                onClick={() => handleShare(cert.name, progress.user.name, progress.finalExamScore, progress.certificateUrl)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                              >
                                📤 Compartilhar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(progress)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingProgress(progress);
                                  setShowDeleteModal(true);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                              >
                                🗑️ Excluir
                              </button>
                              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-2">
                                PDF não gerado
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p>Nenhum certificado emitido para esta certificação</p>
                </div>
              )}
            </div>
          ))}

          {filteredCertifications.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg">Nenhum certificado encontrado</p>
              <p className="text-sm mt-2">Tente ajustar os termos da busca</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && editingProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">✏️ Editar Certificado</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Aluno
                </label>
                <input
                  type="text"
                  value={editFormData.userName}
                  onChange={(e) => setEditFormData({ ...editFormData, userName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pontuação Final (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.finalExamScore}
                  onChange={(e) => setEditFormData({ ...editFormData, finalExamScore: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Emissão
                </label>
                <input
                  type="date"
                  value={editFormData.completedAt}
                  onChange={(e) => setEditFormData({ ...editFormData, completedAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Salvar Alterações
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && deletingProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Excluir Certificado
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tem certeza que deseja excluir o certificado de <strong>{deletingProgress.user.name}</strong>?
                <br />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Esta ação não pode ser desfeita.
                </span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingProgress(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deletingProgress.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuedCertificatesPage;
