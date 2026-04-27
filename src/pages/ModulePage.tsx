import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useProgressStore } from '../stores/useProgressStore'

interface Lesson {
  id: number
  title: string
  slug: string
}

interface ModuleData {
  id: number
  title: string
  icon: string
  description: string
  lessons: Lesson[]
}

export default function ModulePage() {
  const { moduleId } = useParams()
  const [moduleData, setModuleData] = useState<ModuleData | null>(null)
  const [loading, setLoading] = useState(true)
  const { getModuleProgress, isLessonCompleted } = useProgressStore()

  useEffect(() => {
    // Carrega dinamicamente o index.json do módulo
    import(`../data/modulo${moduleId}/index.json`)
      .then(data => setModuleData(data.default))
      .catch(err => console.error('Erro ao carregar módulo:', err))
      .finally(() => setLoading(false))
  }, [moduleId])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">Carregando módulo...</div>
      </Layout>
    )
  }

  if (!moduleData) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500">Módulo não encontrado</h1>
          <Link to="/" className="text-orange-500 underline mt-4 inline-block">Voltar para o início</Link>
        </div>
      </Layout>
    )
  }

  const moduleProgress = getModuleProgress(moduleData.id, moduleData.lessons.length)

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-2 sm:px-0">
        <div className="mb-4 sm:mb-6">
          <Link to="/" className="text-orange-500 hover:underline text-sm sm:text-base">← Voltar para o início</Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <span className="text-3xl sm:text-4xl">{moduleData.icon}</span>
          <h1 className="text-2xl sm:text-3xl font-bold">{moduleData.title}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{moduleData.description}</p>

        <div className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <div className="flex justify-between text-xs sm:text-sm mb-1">
            <span>Progresso do módulo</span>
            <span>{moduleProgress}%</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${moduleProgress}%` }}></div>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">📖 Aulas</h2>
        <div className="space-y-2 sm:space-y-3">
          {moduleData.lessons.map(lesson => {
            const completed = isLessonCompleted(moduleData.id, lesson.id)
            return (
              <Link
                key={lesson.id}
                to={`/modulo/${moduleData.id}/aula/${lesson.id}`}
                className={`block bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition border-l-4 ${completed ? 'border-green-500' : 'border-orange-500'}`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">{completed ? '✅' : '📘'}</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base">{lesson.id}. {lesson.title}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}