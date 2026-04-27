import React, { useState, useEffect } from 'react';
import { Certification, UserCertification, ExamAttempt } from '../types/gamification';
import {
  getAllCertifications,
  getUserCertifications,
  checkEligibility,
  startExam,
  submitExam,
  getExamAttempts,
  getAttemptsForCertification,
  isCertificationExpired,
  renewCertification,
  loadCertificationData
} from '../utils/certificationLogic';

interface CertificationSystemProps {
  userId: string;
  completedModules: number[];
}

const CertificationSystem: React.FC<CertificationSystemProps> = ({ userId, completedModules }) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'my-certs' | 'exam'>('available');
  const [currentExam, setCurrentExam] = useState<ExamAttempt | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examTime, setExamTime] = useState(0);

  useEffect(() => {
    loadCertificationData();
    setCertifications(getAllCertifications());
    setUserCertifications(getUserCertifications(userId));
  }, [userId]);

  // Timer do exame
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentExam && activeTab === 'exam') {
      interval = setInterval(() => {
        setExamTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentExam, activeTab]);

  const startCertificationExam = (certId: string) => {
    const cert = certifications.find(c => c.id === certId);
    if (!cert) return;

    const eligibility = checkEligibility(userId, certId, completedModules);
    if (!eligibility.eligible) {
      alert(`Não elegível: ${eligibility.reasons.join('\n')}`);
      return;
    }

    const attempt = startExam(userId, certId);
    setCurrentExam(attempt);
    setExamAnswers({});
    setExamTime(0);
    setActiveTab('exam');
  };

  const handleAnswer = (questionId: string, answer: number) => {
    setExamAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitExamHandler = () => {
    if (!currentExam) return;

    const result = submitExam(currentExam.id, examAnswers);
    if (result) {
      setCurrentExam(null);
      setExamAnswers({});
      setExamTime(0);
      setUserCertifications(getUserCertifications(userId));
      setActiveTab('my-certs');

      if (result.passed) {
        alert(`🎉 Parabéns! Você passou com ${result.score.toFixed(1)}%`);
      } else {
        alert(`Infelizmente não passou. Sua nota: ${result.score.toFixed(1)}%. Nota mínima: ${certifications.find(c => c.id === result.certificationId)?.passingScore}%`);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="certification-system bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-emerald-600 dark:text-emerald-400">🎓 Certificações Industriais</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {(['available', 'my-certs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-emerald-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'available' ? '📜 Disponíveis' : '🏅 Minhas Certificações'}
          </button>
        ))}
      </div>

      {/* Certificações Disponíveis */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map(cert => {
            const eligibility = checkEligibility(userId, cert.id, completedModules);
            const attempts = getAttemptsForCertification(userId, cert.id);
            const hasPassed = attempts.some(a => a.passed);

            return (
              <div
                key={cert.id}
                className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md ${
                  hasPassed ? 'border-2 border-emerald-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      cert.level === 'basic' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                      cert.level === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                      cert.level === 'advanced' ? 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300' :
                      'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                    }`}>
                      {cert.level}
                    </span>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-2">{cert.name}</h3>
                  </div>
                  {hasPassed && (
                    <span className="text-2xl">✅</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{cert.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Emissor:</span>
                    <span className="font-medium">{cert.issuer}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Duração do Exame:</span>
                    <span className="font-medium">{cert.examDuration} min</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Nota Mínima:</span>
                    <span className="font-medium">{cert.passingScore}%</span>
                  </div>
                  {cert.price !== undefined && (
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Preço:</span>
                      <span className="font-medium">{cert.price === 0 ? 'Grátis' : `R$ ${cert.price}`}</span>
                    </div>
                  )}
                  {cert.validityPeriod && (
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Validade:</span>
                      <span className="font-medium">{cert.validityPeriod} meses</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Requisitos:</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {cert.requirements.map((req, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {!eligibility.eligible && (
                  <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/30 rounded text-xs text-red-600 dark:text-red-400">
                    {eligibility.reasons.join(', ')}
                  </div>
                )}

                <button
                  onClick={() => startCertificationExam(cert.id)}
                  disabled={!eligibility.eligible || hasPassed}
                  className={`w-full mt-4 py-2 rounded-lg transition ${
                    hasPassed
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : !eligibility.eligible
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {hasPassed ? '✓ Já Obtida' : !eligibility.eligible ? 'Não Elegível' : 'Iniciar Exame'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Minhas Certificações */}
      {activeTab === 'my-certs' && (
        <div>
          {userCertifications.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <div className="text-4xl mb-2">🎓</div>
              <div>Nenhuma certificação obtida ainda</div>
            </div>
          ) : (
            <div className="space-y-4">
              {userCertifications.map(userCert => {
                const cert = certifications.find(c => c.id === userCert.certificationId);
                const isExpired = isCertificationExpired(userCert);
                const attempts = getAttemptsForCertification(userId, userCert.certificationId);

                return (
                  <div
                    key={userCert.id}
                    className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md ${
                      isExpired ? 'border-2 border-red-500' : 'border-2 border-emerald-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{cert?.name}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Emitido por: {cert?.issuer}
                        </div>
                      </div>
                      <span className={`text-2xl ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isExpired ? '⚠️' : '✅'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Nota Obtida</div>
                        <div className="font-bold text-gray-800 dark:text-gray-200">{userCert.score.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Data de Emissão</div>
                        <div className="font-bold text-gray-800 dark:text-gray-200">
                          {new Date(userCert.issueDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {userCert.expiryDate && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Validade</div>
                          <div className={`font-bold ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {new Date(userCert.expiryDate).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Tentativas</div>
                        <div className="font-bold text-gray-800 dark:text-gray-200">{attempts.length}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition text-sm"
                      >
                        📄 Ver Certificado
                      </button>
                      {isExpired && (
                        <button
                          onClick={() => renewCertification(userCert.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition text-sm"
                        >
                          🔄 Renovar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Exame em Progresso */}
      {activeTab === 'exam' && currentExam && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {certifications.find(c => c.id === currentExam.certificationId)?.name}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Exame em andamento
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatTime(examTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tempo decorrido</div>
            </div>
          </div>

          {/* Questões Mock */}
          <div className="space-y-4 mb-6">
            {[1, 2, 3, 4, 5].map(q => (
              <div key={q} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Questão {q}: Qual é a função principal do componente X no sistema Y?
                </h4>
                <div className="space-y-2">
                  {['Opção A', 'Opção B', 'Opção C', 'Opção D'].map((opt, i) => (
                    <label key={i} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`q${q}`}
                        value={i}
                        checked={examAnswers[`q${q}`] === i}
                        onChange={() => handleAnswer(`q${q}`, i)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setCurrentExam(null);
                setActiveTab('available');
              }}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={submitExamHandler}
              disabled={Object.keys(examAnswers).length < 5}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submeter Exame
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationSystem;
