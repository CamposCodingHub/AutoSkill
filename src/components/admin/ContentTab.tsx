import React, { useState, useEffect } from 'react';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  content: string | any[];
  quiz: Quiz[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  category: 'basico' | 'intermediario' | 'avancado' | 'especialista';
  order: number;
  lessons: Lesson[];
}

const ContentTab: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      console.log('Iniciando carregamento de módulos...');
      
      // Carregar modules.json
      const modulesResponse = await fetch('/src/data/modules.json');
      const modulesData = await modulesResponse.json();
      console.log('modules.json carregado:', modulesData.length, 'módulos');
      
      const loadedModules: Module[] = [];
      
      for (const module of modulesData) {
        const moduleId = typeof module.id === 'string' ? parseInt(module.id) : module.id;
        
        // Determinar categoria baseada no ID
        let category: 'basico' | 'intermediario' | 'avancado' | 'especialista';
        if (moduleId >= 1 && moduleId <= 6) category = 'basico';
        else if (moduleId >= 7 && moduleId <= 19) category = 'intermediario';
        else if (moduleId >= 20 && moduleId <= 24) category = 'avancado';
        else category = 'especialista';
        
        // Carregar aulas do módulo
        let moduleLessons: Lesson[] = [];
        try {
          const lessonResponse = await fetch(`/src/data/modulo${moduleId}/index.json`);
          const lessonData = await lessonResponse.json();
          moduleLessons = lessonData.lessons.map((lesson: any) => ({
            id: lesson.id.toString(),
            title: lesson.title,
            description: lesson.slug || '',
            content: '',
            quiz: []
          }));
          console.log(`Módulo ${moduleId}: ${moduleLessons.length} aulas carregadas`);
        } catch (error) {
          console.error(`Erro ao carregar aulas do módulo ${moduleId}:`, error);
        }
        
        loadedModules.push({
          id: module.id.toString(),
          title: module.title,
          description: module.description,
          category,
          order: moduleId,
          lessons: moduleLessons
        });
      }
      
      console.log('Total de módulos carregados:', loadedModules.length);
      setModules(loadedModules);
      localStorage.setItem('autoskill_content', JSON.stringify(loadedModules));
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      // Fallback para conteúdo padrão
      const defaultModules: Module[] = [
        {
          id: '1',
          title: 'Fundamentos de Mecânica',
          description: 'Introdução aos conceitos básicos de mecânica automotiva',
          category: 'basico',
          order: 1,
          lessons: [
            {
              id: '1-1',
              title: 'Introdução à Mecânica',
              description: 'Visão geral da mecânica automotiva',
              content: 'A mecânica automotiva é...',
              quiz: []
            },
            {
              id: '1-2',
              title: 'Ferramentas Básicas',
              description: 'Conhecendo as ferramentas essenciais',
              content: 'As ferramentas básicas incluem...',
              quiz: []
            }
          ]
        }
      ];
      setModules(defaultModules);
      localStorage.setItem('autoskill_content', JSON.stringify(defaultModules));
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveModule = (module: Module) => {
    try {
      const updatedModules = selectedModule
        ? modules.map(m => m.id === module.id ? module : m)
        : [...modules, { ...module, id: Date.now().toString() }];
      
      setModules(updatedModules);
      localStorage.setItem('autoskill_content', JSON.stringify(updatedModules));
      setShowModuleModal(false);
      setSelectedModule(null);
      showMessage('success', 'Módulo salvo com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao salvar módulo');
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm('Tem certeza que deseja deletar este módulo?')) {
      const updatedModules = modules.filter(m => m.id !== moduleId);
      setModules(updatedModules);
      localStorage.setItem('autoskill_content', JSON.stringify(updatedModules));
      showMessage('success', 'Módulo deletado com sucesso!');
    }
  };

  const handleEditLesson = async (lesson: Lesson) => {
    if (!selectedModule) return;
    
    setSelectedLesson(lesson);
    
    // Carregar conteúdo completo da aula
    try {
      const lessonResponse = await fetch(`/src/data/modulo${selectedModule.id}/aula${lesson.id}.json`);
      const lessonData = await lessonResponse.json();
      const contentString = JSON.stringify(lessonData, null, 2);
      setLessonContent(contentString);
      console.log('Conteúdo da aula carregado:', lesson.title);
    } catch (error) {
      console.error('Erro ao carregar conteúdo da aula:', error);
      setLessonContent(JSON.stringify(lesson.content, null, 2));
    }
    
    setShowLessonModal(true);
  };

  const handleSaveLesson = (lesson: Lesson) => {
    if (!selectedModule) return;
    
    try {
      const updatedModules = modules.map(m => {
        if (m.id === selectedModule.id) {
          const updatedLessons = selectedLesson
            ? m.lessons.map(l => l.id === lesson.id ? { ...lesson, content: lessonContent } : l)
            : [...m.lessons, { ...lesson, id: `${m.id}-${m.lessons.length + 1}`, content: lessonContent }];
          return { ...m, lessons: updatedLessons };
        }
        return m;
      });
      
      setModules(updatedModules);
      localStorage.setItem('autoskill_content', JSON.stringify(updatedModules));
      setShowLessonModal(false);
      setSelectedLesson(null);
      setLessonContent('');
      showMessage('success', 'Aula salva com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao salvar aula');
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!selectedModule) return;
    
    if (confirm('Tem certeza que deseja deletar esta aula?')) {
      const updatedModules = modules.map(m => {
        if (m.id === selectedModule.id) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      });
      
      setModules(updatedModules);
      localStorage.setItem('autoskill_content', JSON.stringify(updatedModules));
      showMessage('success', 'Aula deletada com sucesso!');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basico': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediario': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'avancado': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'especialista': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📚 Gerenciamento de Conteúdo</h3>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar de Módulos */}
          <div className="w-72 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-semibold text-gray-800 dark:text-white">Módulos</h4>
              <button
                onClick={() => {
                  setSelectedModule(null);
                  setShowModuleModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-2xl"
                title="Novo Módulo"
              >
                +
              </button>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {modules.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  Nenhum módulo criado
                </div>
              ) : (
                modules.map((module) => (
                  <div
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedModule?.id === module.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${getCategoryColor(module.category).split(' ')[0]}`}></span>
                      <h5 className="font-medium text-gray-800 dark:text-white text-sm truncate">{module.title}</h5>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {module.lessons.length} aulas
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Área Principal */}
          <div className="flex-1">
            {!selectedModule ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-lg mb-2">Selecione um módulo para gerenciar</p>
                <p className="text-sm">Ou crie um novo módulo clicando no botão +</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header do Módulo */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white">{selectedModule.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedModule.category)}`}>
                          {selectedModule.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{selectedModule.description}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Ordem: {selectedModule.order} • {selectedModule.lessons.length} aulas
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedModule(selectedModule);
                          setShowModuleModal(true);
                        }}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 text-xl"
                        title="Editar Módulo"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteModule(selectedModule.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 text-xl"
                        title="Deletar Módulo"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de Aulas */}
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold text-gray-800 dark:text-white">Aulas</h4>
                  <button
                    onClick={() => {
                      setSelectedLesson(null);
                      setShowLessonModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    + Nova Aula
                  </button>
                </div>

                {selectedModule.lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-sm">Nenhuma aula neste módulo</p>
                    <p className="text-xs mt-1">Clique em "+ Nova Aula" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedModule.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800 dark:text-white mb-1">{lesson.title}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{lesson.description}</p>
                              <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>{lesson.quiz.length} perguntas</span>
                                {lesson.videoUrl && <span>🎬 Tem vídeo</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditLesson(lesson)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 transition-colors"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 transition-colors"
                              title="Deletar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {selectedModule ? 'Editar Módulo' : 'Novo Módulo'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const module: Module = {
                id: selectedModule?.id || '',
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as any,
                order: parseInt(formData.get('order') as string) || 0,
                lessons: selectedModule?.lessons || []
              };
              handleSaveModule(module);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                <input
                  name="title"
                  defaultValue={selectedModule?.title}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  name="description"
                  defaultValue={selectedModule?.description}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                <select
                  name="category"
                  defaultValue={selectedModule?.category || 'basico'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                  <option value="especialista">Especialista</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordem</label>
                <input
                  name="order"
                  type="number"
                  defaultValue={selectedModule?.order || modules.length + 1}
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
                    setShowModuleModal(false);
                    setSelectedModule(null);
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

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {selectedLesson ? 'Editar Aula' : 'Nova Aula'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const lesson: Lesson = {
                id: selectedLesson?.id || '',
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                videoUrl: formData.get('videoUrl') as string,
                content: lessonContent,
                quiz: selectedLesson?.quiz || []
              };
              handleSaveLesson(lesson);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                <input
                  name="title"
                  defaultValue={selectedLesson?.title}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  name="description"
                  defaultValue={selectedLesson?.description}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL do Vídeo (opcional)</label>
                <input
                  name="videoUrl"
                  defaultValue={selectedLesson?.videoUrl}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Conteúdo (JSON)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Edite o conteúdo da aula em formato JSON. Clique em editar uma aula existente para carregar o conteúdo completo.
                </p>
                <textarea
                  name="content"
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  required
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
                  placeholder='{"title": "Título da Aula", "content": [...]}'
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
                    setShowLessonModal(false);
                    setSelectedLesson(null);
                    setLessonContent('');
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
    </div>
  );
};

export default ContentTab;
