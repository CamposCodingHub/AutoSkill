import React, { useState, useEffect } from 'react';
import { MicroLesson, LearningPath } from '../types/gamification';
import {
  getAllMicroLessons,
  getMicroLessonsByModule,
  searchMicroLessons,
  getMicroLessonById,
  completeMicroLesson,
  isMicroLessonCompleted,
  getCompletedMicroLessons,
  getAllLearningPaths,
  getRecommendedMicroLessons,
  getMicroLessonsByTag,
  getTotalStudyTime,
  loadMicrolearningProgress
} from '../utils/microlearningLogic';

interface MicrolearningProps {
  userId: string;
}

const Microlearning: React.FC<MicrolearningProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'paths' | 'completed'>('lessons');
  const [microLessons, setMicroLessons] = useState<MicroLesson[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [completedLessons, setCompletedLessons] = useState<MicroLesson[]>([]);
  const [recommendedLessons, setRecommendedLessons] = useState<MicroLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<MicroLesson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState<number>(0);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);

  useEffect(() => {
    loadMicrolearningProgress();
    setMicroLessons(getAllMicroLessons());
    setLearningPaths(getAllLearningPaths());
    setCompletedLessons(getCompletedMicroLessons());
    setRecommendedLessons(getRecommendedMicroLessons());
  }, []);

  const handleCompleteLesson = (lessonId: string) => {
    completeMicroLesson(lessonId);
    setMicroLessons(getAllMicroLessons());
    setCompletedLessons(getCompletedMicroLessons());
    setLearningPaths(getAllLearningPaths());
    setRecommendedLessons(getRecommendedMicroLessons());
    setSelectedLesson(null);
  };

  const handleQuizSubmit = () => {
    if (selectedLesson && quizAnswer !== null) {
      const correct = quizAnswer === selectedLesson.quiz?.correct;
      setQuizCorrect(correct);
      setShowQuizResult(true);

      if (correct) {
        handleCompleteLesson(selectedLesson.id);
      }
    }
  };

  const filteredLessons = searchQuery
    ? searchMicroLessons(searchQuery)
    : filterModule
    ? getMicroLessonsByModule(filterModule)
    : filterDifficulty
    ? microLessons.filter(m => m.difficulty === filterDifficulty)
    : microLessons;

  return (
    <div className="microlearning bg-gradient-to-br from-lime-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-lime-600 dark:text-lime-400">⚡ Microlearning</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-2 sm:p-4 text-center shadow-md">
          <div className="text-2xl sm:text-3xl font-bold text-lime-600 dark:text-lime-400">{completedLessons.length}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completadas</div>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg p-2 sm:p-4 text-center shadow-md">
          <div className="text-2xl sm:text-3xl font-bold text-lime-600 dark:text-lime-400">{getTotalStudyTime()}min</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tempo de Estudo</div>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg p-2 sm:p-4 text-center shadow-md">
          <div className="text-2xl sm:text-3xl font-bold text-lime-600 dark:text-lime-400">{microLessons.length}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Disponível</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 sm:space-x-2 mb-4 sm:mb-6 overflow-x-auto pb-1">
        {(['lessons', 'paths', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
              activeTab === tab
                ? 'bg-lime-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-lime-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab === 'lessons' ? '📚 Micro-aulas' : tab === 'paths' ? '🛤️ Caminhos' : '✅ Completadas'}
          </button>
        ))}
      </div>

      {/* Micro-aulas */}
      {activeTab === 'lessons' && !selectedLesson && (
        <div>
          {/* Recomendadas */}
          {recommendedLessons.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">🎯 Recomendadas para Você</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedLessons.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-all border-2 border-lime-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{lesson.title}</h4>
                      <span className="text-xs bg-lime-100 dark:bg-lime-800 text-lime-700 dark:text-lime-300 px-2 py-1 rounded">
                        {lesson.duration}min
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {lesson.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Módulo {lesson.moduleId} • {lesson.difficulty}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="flex space-x-2 mb-4">
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(parseInt(e.target.value))}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value={0}>Todos os Módulos</option>
              <option value={1}>Módulo 1</option>
              <option value={2}>Módulo 2</option>
              <option value={5}>Módulo 5</option>
              <option value={8}>Módulo 8</option>
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="">Todas Dificuldades</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
            <input
              type="text"
              placeholder="Buscar micro-aulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            />
          </div>

          {/* Lista de Micro-aulas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map(lesson => (
              <div
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-all ${
                  isMicroLessonCompleted(lesson.id) ? 'border-2 border-green-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{lesson.title}</h4>
                  {isMicroLessonCompleted(lesson.id) && (
                    <span className="text-xl">✅</span>
                  )}
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs bg-lime-100 dark:bg-lime-800 text-lime-700 dark:text-lime-300 px-2 py-1 rounded">
                    {lesson.duration}min
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    lesson.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                    lesson.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                    'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                  }`}>
                    {lesson.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {lesson.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Módulo {lesson.moduleId}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visualização de Micro-aula */}
      {activeTab === 'lessons' && selectedLesson && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{selectedLesson.title}</h3>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs bg-lime-100 dark:bg-lime-800 text-lime-700 dark:text-lime-300 px-2 py-1 rounded">
                  {selectedLesson.duration}min
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  selectedLesson.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                  selectedLesson.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                  'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                }`}>
                  {selectedLesson.difficulty}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedLesson(null);
                setShowQuizResult(false);
                setQuizAnswer(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Conteúdo */}
          <div className="space-y-3 mb-6">
            {selectedLesson.content.map((item, index) => (
              <div key={index} className="flex items-start">
                <span className="text-lime-500 mr-2 mt-1">•</span>
                <p className="text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedLesson.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Quiz */}
          {selectedLesson.quiz && !isMicroLessonCompleted(selectedLesson.id) && (
            <div className="bg-lime-50 dark:bg-lime-900/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">📝 Quiz Rápido</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{selectedLesson.quiz.question}</p>
              
              {!showQuizResult ? (
                <div className="space-y-2">
                  {selectedLesson.quiz.options.map((option, index) => (
                    <label key={index} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="quiz"
                        value={index}
                        checked={quizAnswer === index}
                        onChange={() => setQuizAnswer(index)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                  <button
                    onClick={handleQuizSubmit}
                    disabled={quizAnswer === null}
                    className="mt-3 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Verificar Resposta
                  </button>
                </div>
              ) : (
                <div>
                  {quizCorrect ? (
                    <div className="text-green-600 dark:text-green-400 font-semibold mb-2">
                      ✅ Resposta Correta! Micro-aula completada.
                    </div>
                  ) : (
                    <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
                      ❌ Resposta Incorreta. Tente novamente.
                    </div>
                  )}
                  {!quizCorrect && (
                    <button
                      onClick={() => {
                        setShowQuizResult(false);
                        setQuizAnswer(null);
                      }}
                      className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg"
                    >
                      Tentar Novamente
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {isMicroLessonCompleted(selectedLesson.id) && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 text-center">
              ✅ Esta micro-aula já foi completada
            </div>
          )}
        </div>
      )}

      {/* Caminhos de Aprendizado */}
      {activeTab === 'paths' && (
        <div className="space-y-4">
          {learningPaths.map(path => (
            <div
              key={path.id}
              className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{path.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{path.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  path.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                  path.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
                  'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                }`}>
                  {path.difficulty}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progresso</span>
                  <span>{Math.round(path.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-lime-500 h-2 rounded-full transition-all"
                    style={{ width: `${path.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  {path.microLessons.length} micro-aulas
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {path.estimatedDuration} min
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completadas */}
      {activeTab === 'completed' && (
        <div>
          {completedLessons.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              <div className="text-4xl mb-2">📚</div>
              <div>Nenhuma micro-aula completada ainda</div>
            </div>
          ) : (
            <div className="space-y-3">
              {completedLessons.map(lesson => (
                <div
                  key={lesson.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md border-2 border-green-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{lesson.title}</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Módulo {lesson.moduleId} • {lesson.duration}min
                      </div>
                    </div>
                    <span className="text-xl">✅</span>
                  </div>
                  {lesson.completedAt && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Completada em {new Date(lesson.completedAt).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Microlearning;
