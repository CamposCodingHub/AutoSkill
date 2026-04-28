import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
import { useProgressStore } from '../stores/useProgressStore';
import modules from '../data/modules.json';

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
}

interface CertificationProgress {
  id: string;
  status: string;
  completedModules: number[];
  averageQuizScore: number;
  finalExamScore: number;
  studyHours: number;
  certificateUrl: string;
  completedAt: string;
  certification: Certification;
}

const CertificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { completedLessons } = useProgressStore();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [progress, setProgress] = useState<CertificationProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  const token = localStorage.getItem('autoskill_token');

  useEffect(() => {
    loadCertifications();
    loadProgress();
  }, []);

  const loadCertifications = async () => {
    try {
      const response = await fetch(`${API_URL}/certifications`, {
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
    }
  };

  const loadProgress = async () => {
    try {
      const response = await fetch(`${API_URL}/certifications/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (certId: string) => {
    try {
      const response = await fetch(`${API_URL}/certifications/${certId}/eligibility`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEligibility(data);
      }
    } catch (error) {
      console.error('Erro ao verificar elegibilidade:', error);
    }
  };

  const handleIssueCertificate = async (finalExamScore: number) => {
    if (!selectedCert) return;

    try {
      const response = await fetch(`${API_URL}/certifications/${selectedCert.id}/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ finalExamScore }),
      });

      if (response.ok) {
        setShowExamModal(false);
        loadProgress();
        alert('Certificado emitido com sucesso!');
      } else {
        alert('Erro ao emitir certificado');
      }
    } catch (error) {
      console.error('Erro ao emitir certificado:', error);
      alert('Erro ao emitir certificado');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'eligible': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'eligible': return 'Elegível';
      case 'in_progress': return 'Em Progresso';
      default: return status;
    }
  };

  const ProgressBar = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-300">{label}</span>
          <span className="font-medium text-gray-800 dark:text-white">{value} / {max}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {percentage.toFixed(0)}% completo
        </div>
      </div>
    );
  };

  const guideSteps = [
    {
      title: "📚 Complete os Módulos",
      description: "Estude todos os módulos necessários para a certificação. Cada módulo contém aulas importantes sobre eletricidade automotiva.",
      icon: "📚",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "✅ Faça os Quizzes",
      description: "Após cada aula, faça o quiz para testar seu conhecimento. Você precisa atingir uma pontuação média mínima.",
      icon: "✅",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "⏱️ Acumule Horas de Estudo",
      description: "Dedique tempo aos estudos. O sistema rastreia suas horas de estudo automaticamente.",
      icon: "⏱️",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "📝 Faça a Prova Final",
      description: "Quando atingir todos os requisitos, você será elegível para fazer a prova final da certificação.",
      icon: "📝",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "🎓 Receba seu Certificado",
      description: "Ao passar na prova final, você receberá um certificado PDF oficial da AutoSkill.",
      icon: "🎓",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Carregando...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">🎓 Certificações</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Acompanhe seu progresso</p>
            </div>
            <button
              onClick={() => setShowGuideModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <span>💡</span>
              <span>Como Funciona</span>
            </button>
          </div>
        </div>

        {/* Barras de Progresso por Nível */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Progresso por Nível</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['basic', 'intermediate', 'advanced', 'expert'].map((level) => {
              // Calcular progresso baseado em módulos completados usando completedLessons
              const levelCerts = certifications.filter(c => c.level === level && c.enabled);
              let totalModules = 0;
              let completedModules = 0;
              
              levelCerts.forEach(cert => {
                totalModules += cert.modules.length;
                cert.modules.forEach(moduleId => {
                  // Verificar se o módulo tem aulas completadas usando completedLessons
                  const moduleLessons = Object.keys(completedLessons).filter(key => 
                    key.startsWith(`${moduleId}-`) && completedLessons[key]
                  );
                  if (moduleLessons.length > 0) {
                    completedModules++;
                  }
                });
              });
              
              const percentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
              
              return (
                <div key={level} className="text-center">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 capitalize">
                    {level === 'basic' ? 'Básico' : level === 'intermediate' ? 'Intermediário' : level === 'advanced' ? 'Avançado' : 'Especialista'}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getLevelColor(level),
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {completedModules}/{totalModules} módulos ({percentage.toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificações Disponíveis */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Certificações Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.filter(c => c.enabled).map((cert) => {
              const certProgress = progress.find(p => p.certification.id === cert.id);
              return (
                <div key={cert.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl"
                      style={{ backgroundColor: getLevelColor(cert.level) }}
                    >
                      🎓
                    </div>
                    {certProgress && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(certProgress.status)}`}>
                        {getStatusLabel(certProgress.status)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">{cert.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{cert.description}</p>
                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div>• Nível: {getLevelLabel(cert.level)}</div>
                    <div>• Módulos: {cert.modules.length}</div>
                    <div>• Quiz mínimo: {cert.minQuizScore}%</div>
                    <div>• Prova final: {cert.minFinalScore}%</div>
                    <div>• Horas de estudo: {cert.minStudyHours}h</div>
                  </div>
                  {certProgress?.status === 'completed' ? (
                    <button
                      onClick={() => window.open(`${API_BASE}${certProgress.certificateUrl}`, '_blank')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      📄 Baixar Certificado
                    </button>
                  ) : certProgress?.status === 'eligible' ? (
                    <button
                      onClick={() => {
                        setSelectedCert(cert);
                        setShowExamModal(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      📝 Fazer Prova Final
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCert(cert);
                        checkEligibility(cert.id);
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      📊 Ver Progresso
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificações Concluídas */}
        {progress.filter(p => p.status === 'completed').length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Certificações Conquistadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progress.filter(p => p.status === 'completed').map((prog) => (
                <div key={prog.id} className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl"
                      style={{ backgroundColor: getLevelColor(prog.certification.level) }}
                    >
                      🏆
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">{prog.certification.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Concluído em: {new Date(prog.completedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <div>• Pontuação: {prog.finalExamScore}%</div>
                    <div>• Média de quizzes: {prog.averageQuizScore?.toFixed(1)}%</div>
                  </div>
                  <button
                    onClick={() => window.open(`${API_BASE}${prog.certificateUrl}`, '_blank')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    📄 Baixar Certificado
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Elegibilidade */}
        {selectedCert && eligibility && !showExamModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-md w-full p-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                Progresso: {selectedCert.name}
              </h2>
              
              <div className="space-y-3">
                <ProgressBar
                  value={eligibility.completedModules.length}
                  max={eligibility.requiredModules.length}
                  label="Módulos"
                  color={eligibility.completedModules.length >= eligibility.requiredModules.length ? '#22c55e' : '#3b82f6'}
                />
                <ProgressBar
                  value={eligibility.averageQuizScore}
                  max={100}
                  label="Quizzes"
                  color={eligibility.averageQuizScore >= eligibility.minQuizScore ? '#22c55e' : '#ef4444'}
                />
                <ProgressBar
                  value={eligibility.studyHours}
                  max={eligibility.minStudyHours}
                  label="Horas"
                  color={eligibility.studyHours >= eligibility.minStudyHours ? '#22c55e' : '#ef4444'}
                />
                
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-600 text-center">
                  <span className={`text-sm font-bold ${eligibility.eligible ? 'text-green-600' : 'text-red-600'}`}>
                    {eligibility.eligible ? '✅ Elegível' : '❌ Não Elegível'}
                  </span>
                </div>

                {eligibility.eligible && (
                  <button
                    onClick={() => setShowExamModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    📝 Fazer Prova Final
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedCert(null);
                    setEligibility(null);
                  }}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium py-1.5 px-4 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Prova Final */}
        {showExamModal && selectedCert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Prova Final: {selectedCert.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Digite sua pontuação na prova final (mínimo: {selectedCert.minFinalScore}%)
              </p>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Sua pontuação"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white mb-4"
                id="finalExamScore"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const score = parseInt((document.getElementById('finalExamScore') as HTMLInputElement).value);
                    if (score >= 0 && score <= 100) {
                      handleIssueCertificate(score);
                    } else {
                      alert('Pontuação inválida');
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Enviar
                </button>
                <button
                  onClick={() => {
                    setShowExamModal(false);
                    setSelectedCert(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal do Guia Interativo */}
        {showGuideModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-md w-full p-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                💡 Como Conquistar uma Certificação
              </h2>
              
              {/* Passo Atual */}
              <div className={`p-3 rounded-lg ${guideSteps[guideStep].bgColor} border-2 border-current mb-3`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${guideSteps[guideStep].color} text-white`}>
                    {guideSteps[guideStep].icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">{guideSteps[guideStep].title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Passo {guideStep + 1} de {guideSteps.length}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">{guideSteps[guideStep].description}</p>
              </div>

              {/* Progresso do Guia */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${((guideStep + 1) / guideSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setGuideStep(Math.max(0, guideStep - 1))}
                  disabled={guideStep === 0}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setGuideStep(Math.min(guideSteps.length - 1, guideStep + 1))}
                  disabled={guideStep === guideSteps.length - 1}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                >
                  Próximo →
                </button>
              </div>
              <button
                onClick={() => {
                  setShowGuideModal(false);
                  setGuideStep(0);
                }}
                className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-1.5 px-4 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default CertificationsPage;
