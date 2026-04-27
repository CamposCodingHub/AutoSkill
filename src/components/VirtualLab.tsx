import React, { useState, useEffect } from 'react';
import { VirtualLabComponent, LabSession } from '../types/gamification';

interface VirtualLabProps {
  userId: string;
}

const VirtualLab: React.FC<VirtualLabProps> = ({ userId }) => {
  const [activeComponent, setActiveComponent] = useState<VirtualLabComponent | null>(null);
  const [labSessions, setLabSessions] = useState<LabSession[]>([]);
  const [currentSession, setCurrentSession] = useState<LabSession | null>(null);
  const [is3DLoaded, setIs3DLoaded] = useState(false);

  // Componentes virtuais mock
  const virtualComponents: VirtualLabComponent[] = [
    {
      id: 'engine-1',
      name: 'Motor V6 - Diagnóstico de Combustão',
      type: 'engine',
      modelUrl: '/models/engine-v6.glb',
      interactivePoints: [
        { id: 'spark-plug-1', position: { x: 0, y: 1, z: 0 }, label: 'Vela 1', description: 'Vela de ignição cilindro 1' },
        { id: 'spark-plug-2', position: { x: 0.5, y: 1, z: 0 }, label: 'Vela 2', description: 'Vela de ignição cilindro 2' },
        { id: 'injector-1', position: { x: 0, y: 0.5, z: 0.2 }, label: 'Injetor 1', description: 'Injetor de combustível' },
        { id: 'sensor-knock', position: { x: -0.3, y: 0.8, z: 0 }, label: 'Sensor Knock', description: 'Sensor de detonação' }
      ],
      diagnosticTests: [
        {
          id: 'test-1',
          name: 'Teste de Compressão',
          procedure: ['Remover velas', 'Conectar manômetro', 'Girar motor', 'Ler pressão'],
          expectedResults: 'Pressão entre 150-180 PSI em todos os cilindros'
        },
        {
          id: 'test-2',
          name: 'Teste de Injeção',
          procedure: ['Conectar scanner', 'Verificar códigos', 'Testar balanceamento', 'Analisar padrão'],
          expectedResults: 'Injeção balanceada com variação <5%'
        }
      ]
    },
    {
      id: 'electrical-1',
      name: 'Sistema Elétrico - Multímetro Virtual',
      type: 'electrical',
      modelUrl: '/models/electrical-system.glb',
      interactivePoints: [
        { id: 'battery', position: { x: -1, y: 0, z: 0 }, label: 'Bateria', description: 'Bateria 12V 60Ah' },
        { id: 'alternator', position: { x: 0, y: 0.5, z: 0 }, label: 'Alternador', description: 'Alternador 120A' },
        { id: 'fuse-box', position: { x: 1, y: 0.2, z: 0 }, label: 'Caixa de Fusíveis', description: 'Central elétrica' },
        { id: 'starter', position: { x: 0.5, y: -0.3, z: 0 }, label: 'Motor de Partida', description: 'Motor de partida 2kW' }
      ],
      diagnosticTests: [
        {
          id: 'test-3',
          name: 'Teste de Carga da Bateria',
          procedure: ['Conectar multímetro', 'Medir tensão em repouso', 'Medir tensão com motor ligado', 'Verificar queda de tensão'],
          expectedResults: '12.6V repouso, 13.8-14.4V com motor ligado'
        },
        {
          id: 'test-4',
          name: 'Teste de Alternador',
          procedure: ['Medir tensão de saída', 'Verificar amperagem', 'Testar diodo retificador', 'Verificar regulador'],
          expectedResults: 'Saída 13.8-14.4V, amperagem conforme especificação'
        }
      ]
    },
    {
      id: 'brake-1',
      name: 'Sistema de Freios - ABS Virtual',
      type: 'brake',
      modelUrl: '/models/brake-system.glb',
      interactivePoints: [
        { id: 'abs-module', position: { x: 0, y: 0.5, z: 0 }, label: 'Módulo ABS', description: 'Módulo de controle ABS' },
        { id: 'wheel-sensor-fl', position: { x: -0.8, y: 0, z: 0.5 }, label: 'Sensor FL', description: 'Sensor roda dianteira esquerda' },
        { id: 'wheel-sensor-fr', position: { x: 0.8, y: 0, z: 0.5 }, label: 'Sensor FR', description: 'Sensor roda dianteira direita' },
        { id: 'master-cylinder', position: { x: 0, y: 1, z: -0.5 }, label: 'Cilindro Mestre', description: 'Cilindro mestre com reservatório' }
      ],
      diagnosticTests: [
        {
          id: 'test-5',
          name: 'Teste de Sensores ABS',
          procedure: ['Conectar scanner', 'Verificar velocidade de cada roda', 'Testar em movimento', 'Comparar leituras'],
          expectedResults: 'Todos os sensores com leituras consistentes'
        },
        {
          id: 'test-6',
          name: 'Teste de Pressão de Freio',
          procedure: ['Conectar manômetros', 'Testar pedal', 'Verificar distribuição', 'Testar ABS'],
          expectedResults: 'Pressão uniforme em todas as rodas'
        }
      ]
    }
  ];

  const startLabSession = (componentId: string) => {
    const component = virtualComponents.find(c => c.id === componentId);
    if (!component) return;

    const session: LabSession = {
      id: `lab-session-${Date.now()}`,
      userId,
      componentId,
      startTime: new Date(),
      completedTests: [],
      score: 0,
      timeSpent: 0,
      mistakes: []
    };

    setCurrentSession(session);
    setActiveComponent(component);
    setIs3DLoaded(true);
  };

  const completeTest = (testId: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      completedTests: [...currentSession.completedTests, testId],
      score: currentSession.score + 25
    };

    setCurrentSession(updatedSession);
  };

  const endLabSession = () => {
    if (!currentSession) return;

    const completedSession = {
      ...currentSession,
      endTime: new Date(),
      timeSpent: Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000)
    };

    setLabSessions([...labSessions, completedSession]);
    setCurrentSession(null);
    setActiveComponent(null);
    setIs3DLoaded(false);
  };

  return (
    <div className="virtual-lab bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-purple-600 dark:text-purple-400">🔬 Laboratório Virtual 3D</h2>

      {!activeComponent ? (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Selecione um Componente para Simular</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {virtualComponents.map(component => (
              <div
                key={component.id}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
                onClick={() => startLabSession(component.id)}
              >
                <div className="text-4xl mb-3">
                  {component.type === 'engine' ? '⚙️' : 
                   component.type === 'electrical' ? '⚡' :
                   component.type === 'brake' ? '🛑' :
                   component.type === 'suspension' ? '🔧' : '🔄'}
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{component.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {component.diagnosticTests.length} testes diagnósticos disponíveis
                </p>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  {component.interactivePoints.length} pontos interativos
                </div>
              </div>
            ))}
          </div>

          {/* Histórico de Sessões */}
          {labSessions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Histórico de Sessões</h3>
              <div className="space-y-2">
                {labSessions.slice(-5).map(session => {
                  const component = virtualComponents.find(c => c.id === session.componentId);
                  return (
                    <div
                      key={session.id}
                      className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            {component?.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {session.completedTests.length} testes completados
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600 dark:text-purple-400">
                            {session.score} pts
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.floor(session.timeSpent / 60)}min
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Header da Sessão */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{activeComponent.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentSession?.completedTests.length || 0} / {activeComponent.diagnosticTests.length} testes completados
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {currentSession?.score || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pontos</div>
              </div>
              <button
                onClick={endLabSession}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Encerrar Sessão
              </button>
            </div>
          </div>

          {/* Área 3D (Placeholder) */}
          <div className="bg-gray-900 dark:bg-black rounded-lg h-96 mb-4 flex items-center justify-center relative overflow-hidden">
            {is3DLoaded ? (
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <div className="text-white text-lg mb-2">Visualização 3D Interativa</div>
                <div className="text-gray-400 text-sm">
                  Clique nos pontos interativos para explorar o componente
                </div>
                <div className="mt-4 flex justify-center space-x-2">
                  {activeComponent.interactivePoints.map(point => (
                    <button
                      key={point.id}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                    >
                      {point.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Carregando modelo 3D...</div>
            )}
          </div>

          {/* Testes Diagnósticos */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Testes Diagnósticos</h4>
            <div className="space-y-3">
              {activeComponent.diagnosticTests.map(test => (
                <div
                  key={test.id}
                  className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm ${
                    currentSession?.completedTests.includes(test.id)
                      ? 'border-2 border-green-500'
                      : 'border-2 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200">{test.name}</h5>
                    {currentSession?.completedTests.includes(test.id) ? (
                      <span className="text-green-500 text-xl">✓</span>
                    ) : (
                      <button
                        onClick={() => completeTest(test.id)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Iniciar
                      </button>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Procedimento:</div>
                    <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                      {test.procedure.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Resultado Esperado:</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{test.expectedResults}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualLab;
