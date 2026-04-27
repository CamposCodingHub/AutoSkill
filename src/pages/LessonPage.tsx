import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import TextRenderer from '../components/renderers/TextRenderer'
import CalloutRenderer from '../components/renderers/CalloutRenderer'
import TableRenderer from '../components/renderers/TableRenderer'
import ListRenderer from '../components/renderers/ListRenderer'
import QuizRenderer from '../components/renderers/QuizRenderer'
import SimulatorRenderer from '../components/simulators/SimulatorRenderer'
import ProgressIndicator from '../components/ProgressIndicator'
import { useProgressStore } from '../stores/useProgressStore'

// Tipos de bloco de conteúdo suportados
interface ContentBlock {
  type: 'text' | 'callout' | 'table' | 'list' | 'quiz' | 'example' | 'simulator' | 'video'
  [key: string]: any
}

interface LessonData {
  title: string
  videoUrl?: string
  content: ContentBlock[]
}

interface LessonInfo {
  id: number
  title: string
  slug: string
}

interface ModuleIndex {
  id: number
  title: string
  icon: string
  description: string
  lessons: LessonInfo[]
}

// Componente simples para blocos do tipo "example"
function ExampleRenderer({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-3 sm:p-4 my-3 sm:my-4 rounded-lg border-l-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-500 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up">
      <strong className="block text-yellow-700 dark:text-yellow-300 mb-1 sm:mb-2 text-base sm:text-lg"> {title}</strong>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{value}</p>
    </div>
  )
}

// Componente para renderizar vídeos
function VideoRenderer({ url }: { url: string }) {
  if (!url) return null;

  // Converter URL do YouTube para formato embed
  let embedUrl = url;
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId[1]}`;
    }
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden shadow-lg">
      <div className="relative pt-[56.25%]">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Vídeo da aula"
        />
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { moduleId, lessonId } = useParams()
  const [lessonData, setLessonData] = useState<LessonData | null>(null)
  const [moduleIndex, setModuleIndex] = useState<ModuleIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [showResetModal, setShowResetModal] = useState(false)
  const [quizKey, setQuizKey] = useState(0)
  const { isLessonCompleted, initializeLessonQuizzes, getLessonQuizProgress, resetLessonQuiz } = useProgressStore()

  useEffect(() => {
    const loadData = async () => {
      if (!moduleId || !lessonId) {
        setLoading(false)
        return
      }

      try {
        const indexModule = await import(`../data/modulo${moduleId}/index.json`)
        setModuleIndex(indexModule.default)

        const lessonModule = await import(`../data/modulo${moduleId}/aula${lessonId}.json`)
        setLessonData(lessonModule.default)
        
        // Conta o número de quizzes na aula e inicializa
        const quizCount = lessonModule.default.content.filter((block: ContentBlock) => block.type === 'quiz').length
        initializeLessonQuizzes(Number(moduleId), Number(lessonId), quizCount)
      } catch (err) {
        console.error('Erro ao carregar dados da aula:', err)
        setLessonData(null)
        setModuleIndex(null)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [moduleId, lessonId, initializeLessonQuizzes])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">Carregando aula...</div>
      </Layout>
    )
  }

  if (!lessonData || !moduleIndex) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500">Aula não encontrada</h1>
          <Link to={`/modulo/${moduleId}`} className="text-orange-500 underline mt-4 inline-block">
            Voltar para o módulo
          </Link>
        </div>
      </Layout>
    )
  }

  const currentLessonId = Number(lessonId)
  const lessons = moduleIndex.lessons
  const currentIndex = lessons.findIndex(l => l.id === currentLessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
  const isCompleted = isLessonCompleted(Number(moduleId), currentLessonId)

  const renderBlock = (block: ContentBlock, idx: number) => {
    switch (block.type) {
      case 'text':
        return <TextRenderer key={idx} content={block.value} />
      case 'callout':
        return (
          <CalloutRenderer
            key={idx}
            title={block.title}
            text={block.text}
            style={block.style}
          />
        )
      case 'table':
        return (
          <TableRenderer
            key={idx}
            headers={block.headers}
            rows={block.rows}
          />
        )
      case 'list':
        return (
          <ListRenderer
            key={idx}
            items={block.items}
            ordered={block.ordered || false}
          />
        )
      case 'quiz':
        // Não renderiza quizzes aqui - serão renderizados no final
        return null
      case 'example':
        return (
          <ExampleRenderer
            key={idx}
            title={block.title}
            value={block.value}
          />
        )
      case 'simulator':
        return (
          <SimulatorRenderer
            key={idx}
            name={block.name}
            config={block.config}
          />
        )
      case 'video':
        return (
          <VideoRenderer
            key={idx}
            url={block.url}
          />
        )
      default:
        return null
    }
  }

  const renderQuiz = (block: ContentBlock, idx: number) => {
    if (block.type === 'quiz') {
      const totalQuizzes = lessonData?.content.filter((b: ContentBlock) => b.type === 'quiz').length || 0
      return (
        <QuizRenderer
          key={`${idx}-${quizKey}`}
          question={block.question}
          options={block.options}
          correct={block.correct}
          moduleId={Number(moduleId)}
          lessonId={currentLessonId}
          totalQuizzes={totalQuizzes}
        />
      )
    }
    return null
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        {/* Breadcrumb e navegação */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <Link to={`/modulo/${moduleId}`} className="text-orange-500 hover:underline text-sm sm:text-base">
            ← Voltar para {moduleIndex.title}
          </Link>
          <div className="text-xs sm:text-sm text-gray-500">
            Aula {currentLessonId} de {lessons.length}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{lessonData.title}</h1>

        {/* Vídeo principal da aula (se houver) */}
        {lessonData.videoUrl && <VideoRenderer url={lessonData.videoUrl} />}

        {/* Indicador de Progresso */}
        <ProgressIndicator 
          moduleId={Number(moduleId)} 
          lessonId={currentLessonId} 
          totalLessons={lessons.length}
        />

        {/* Conteúdo principal */}
        <div className="prose dark:prose-invert max-w-none">
          {lessonData.content.map(renderBlock)}
        </div>

        {/* Seção de Quiz - sempre no final */}
        <div className="mt-8 sm:mt-12 space-y-6 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            🎯 Teste seu conhecimento
          </h2>
          
          {/* Barra de progresso dos quizzes */}
          {lessonData.content.filter((b: ContentBlock) => b.type === 'quiz').length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Progresso dos Quizzes
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {getLessonQuizProgress(Number(moduleId), currentLessonId).answered} / {lessonData.content.filter((b: ContentBlock) => b.type === 'quiz').length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(getLessonQuizProgress(Number(moduleId), currentLessonId).answered / lessonData.content.filter((b: ContentBlock) => b.type === 'quiz').length) * 100}%` }}
                >
                  <div className="h-full bg-white bg-opacity-30 animate-pulse"></div>
                </div>
              </div>
              {isCompleted && (
                <div className="mt-2 text-center text-green-600 dark:text-green-400 font-semibold text-sm">
                  ✅ Aula concluída!
                </div>
              )}
            </div>
          )}
          
          {lessonData.content.map(renderQuiz)}
        </div>

        {/* Botões de navegação */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {prevLesson ? (
              <Link
                to={`/modulo/${moduleId}/aula/${prevLesson.id}`}
                className="px-3 sm:px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 transition text-sm sm:text-base text-center"
              >
                ← Aula anterior: {prevLesson.title}
              </Link>
            ) : (
              <div></div>
            )}
            {lessonData.content.filter((b: ContentBlock) => b.type === 'quiz').length > 0 && (
              <button
                onClick={() => setShowResetModal(true)}
                className="px-3 sm:px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition text-sm sm:text-base text-center"
              >
                🔄 Reiniciar Quiz
              </button>
            )}
          </div>

          {nextLesson ? (
            <Link
              to={`/modulo/${moduleId}/aula/${nextLesson.id}`}
              className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm sm:text-base text-center"
            >
              Próxima aula: {nextLesson.title} →
            </Link>
          ) : (
            <Link
              to={`/modulo/${moduleId}`}
              className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm sm:text-base text-center"
            >
              Finalizar módulo →
            </Link>
          )}
        </div>

        {/* Modal de confirmação de reset */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔄</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Reiniciar Quiz</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Tem certeza que deseja reiniciar o quiz desta aula? Todas as suas respostas serão apagadas e você precisará responder novamente.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    resetLessonQuiz(Number(moduleId), currentLessonId);
                    setQuizKey(prev => prev + 1);
                    setShowResetModal(false);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
                >
                  Sim, reiniciar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}