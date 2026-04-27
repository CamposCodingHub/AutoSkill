import React, { useState, useEffect } from 'react';
import modules from '../../data/modules.json';

interface Quiz {
  question: string;
  options: string[];
  correct: number;
}

interface ModuleQuiz {
  moduleId: number;
  moduleName: string;
  lessons: {
    lessonId: number;
    lessonTitle: string;
    quizzes: Quiz[];
  }[];
}

const AnswerKeyTab: React.FC = () => {
  const [quizData, setQuizData] = useState<ModuleQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllQuizzes();
  }, []);

  const loadAllQuizzes = async () => {
    try {
      setLoading(true);
      const allQuizzes: ModuleQuiz[] = [];

      for (const module of modules) {
        const moduleQuizzes: ModuleQuiz = {
          moduleId: module.id,
          moduleName: module.title,
          lessons: []
        };

        for (const lesson of module.lessons) {
          try {
            const lessonData = await import(`../../data/modulo${module.id}/aula${lesson.id}.json`);
            const quizzes = lessonData.default.content.filter((item: any) => item.type === 'quiz');
            
            if (quizzes.length > 0) {
              moduleQuizzes.lessons.push({
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                quizzes: quizzes.map((q: any) => ({
                  question: q.question,
                  options: q.options,
                  correct: q.correct
                }))
              });
            }
          } catch (error) {
            console.error(`Erro ao carregar aula ${module.id}-${lesson.id}:`, error);
          }
        }

        if (moduleQuizzes.lessons.length > 0) {
          allQuizzes.push(moduleQuizzes);
        }
      }

      setQuizData(allQuizzes);
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleLesson = (key: string) => {
    setExpandedLessons(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredData = quizData.filter(module => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      module.moduleName.toLowerCase().includes(searchLower) ||
      module.lessons.some(lesson => 
        lesson.lessonTitle.toLowerCase().includes(searchLower) ||
        lesson.quizzes.some(quiz => quiz.question.toLowerCase().includes(searchLower))
      )
    );
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📋 Gabarito de Quizzes</h3>
        <div className="text-center py-8 text-gray-500">Carregando gabarito...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📋 Gabarito de Quizzes</h3>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por módulo, aula ou pergunta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ <strong>Aviso:</strong> Este gabarito contém todas as respostas corretas dos quizzes. Use apenas para fins administrativos e verificação.
        </p>
      </div>

      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum resultado encontrado</div>
        ) : (
          filteredData.map((module) => (
            <div key={module.moduleId} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleModule(module.moduleId)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <span className="font-medium text-gray-800 dark:text-white">{module.moduleName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {module.lessons.length} aulas com quizzes
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {expandedModules[module.moduleId] ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {expandedModules[module.moduleId] && (
                <div className="p-4 space-y-3">
                  {module.lessons.map((lesson) => {
                    const lessonKey = `${module.moduleId}-${lesson.lessonId}`;
                    return (
                      <div key={lessonKey} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleLesson(lessonKey)}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Aula {lesson.lessonId}: {lesson.lessonTitle}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {lesson.quizzes.length} perguntas
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {expandedLessons[lessonKey] ? '▼' : '▶'}
                            </span>
                          </div>
                        </button>

                        {expandedLessons[lessonKey] && (
                          <div className="p-4 space-y-4">
                            {lesson.quizzes.map((quiz, index) => (
                              <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start gap-2 mb-3">
                                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Q{index + 1}</span>
                                  <p className="text-sm text-gray-800 dark:text-white">{quiz.question}</p>
                                </div>
                                <div className="space-y-2 mb-3">
                                  {quiz.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`p-2 rounded text-sm ${
                                        optIndex === quiz.correct
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>{optIndex === quiz.correct ? '✅' : '○'}</span>
                                        <span>{option}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Resposta correta: opção {quiz.correct + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">📊 Estatísticas</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Total de Módulos</div>
            <div className="font-bold text-gray-800 dark:text-white">{quizData.length}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Aulas com Quizzes</div>
            <div className="font-bold text-gray-800 dark:text-white">
              {quizData.reduce((acc, m) => acc + m.lessons.length, 0)}
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Total de Perguntas</div>
            <div className="font-bold text-gray-800 dark:text-white">
              {quizData.reduce((acc, m) => acc + m.lessons.reduce((acc2, l) => acc2 + l.quizzes.length, 0), 0)}
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Média por Aula</div>
            <div className="font-bold text-gray-800 dark:text-white">
              {quizData.length > 0 && quizData.reduce((acc, m) => acc + m.lessons.length, 0) > 0
                ? (quizData.reduce((acc, m) => acc + m.lessons.reduce((acc2, l) => acc2 + l.quizzes.length, 0), 0) / 
                   quizData.reduce((acc, m) => acc + m.lessons.length, 0)).toFixed(1)
                : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerKeyTab;
