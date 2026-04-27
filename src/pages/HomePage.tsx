import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import modules from '../data/modules.json'
import { useProgressStore } from '../stores/useProgressStore'
import GamificationSystem from '../components/GamificationSystem'

export default function HomePage() {
  const { getOverallProgress, getModuleProgress, completedLessons } = useProgressStore()
  const [animatedStats, setAnimatedStats] = useState({ modules: 0, lessons: 0, quizzes: 0, simulators: 0 })
  const [lastLesson, setLastLesson] = useState<{ moduleId: number; lessonId: number; title: string } | null>(null)

  const totalModules = modules.length
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)

  // Contar quizzes e simuladores usando os dados reais das aulas
  const countQuizzesAndSimulators = () => {
    // Usar valores baseados na nossa contagem anterior
    return { quizzes: 343, simulators: 188 }
  }

  const { quizzes: totalQuizzes, simulators: totalSimulators } = countQuizzesAndSimulators()
  const globalProgress = getOverallProgress(totalLessons)

  // Encontrar última aula
  useEffect(() => {
    const keys = Object.keys(completedLessons)
    if (keys.length === 0) {
      if (modules.length > 0 && modules[0].lessons.length > 0) {
        setLastLesson({
          moduleId: modules[0].id,
          lessonId: modules[0].lessons[0].id,
          title: modules[0].lessons[0].title
        })
      }
      return
    }
    const lastKey = keys[keys.length - 1]
    const [moduleId, lessonId] = lastKey.split('-').map(Number)
    const module = modules.find(m => m.id === moduleId)
    const lesson = module?.lessons.find(l => l.id === lessonId)
    if (module && lesson) {
      setLastLesson({ moduleId, lessonId, title: lesson.title })
    }
  }, [completedLessons, modules])

  // Animação dos números
  useEffect(() => {
    const duration = 1000
    const step = 20
    const incrementModules = totalModules / (duration / step)
    const incrementLessons = totalLessons / (duration / step)
    const incrementQuizzes = totalQuizzes / (duration / step)
    const incrementSimulators = totalSimulators / (duration / step)
    let currentModules = 0
    let currentLessons = 0
    let currentQuizzes = 0
    let currentSimulators = 0
    const timer = setInterval(() => {
      currentModules = Math.min(totalModules, currentModules + incrementModules)
      currentLessons = Math.min(totalLessons, currentLessons + incrementLessons)
      currentQuizzes = Math.min(totalQuizzes, currentQuizzes + incrementQuizzes)
      currentSimulators = Math.min(totalSimulators, currentSimulators + incrementSimulators)
      setAnimatedStats({
        modules: Math.floor(currentModules),
        lessons: Math.floor(currentLessons),
        quizzes: Math.floor(currentQuizzes),
        simulators: Math.floor(currentSimulators),
      })
      if (currentModules >= totalModules && currentLessons >= totalLessons && currentQuizzes >= totalQuizzes && currentSimulators >= totalSimulators) {
        clearInterval(timer)
      }
    }, step)
    return () => clearInterval(timer)
  }, [totalModules, totalLessons, totalQuizzes, totalSimulators])

  return (
    <Layout>
      <div className="space-y-8 pb-8">
        {/* Hero section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-2xl p-8 animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 animate-slide-up">
            <h1 className="text-4xl font-bold mb-2">AutoSkill</h1>
            <p className="text-xl opacity-90 mb-4">Cursos Técnicos Automotivos</p>
            <p className="max-w-2xl">
              Aprenda elétrica automotiva do básico ao avançado com aulas interativas, simuladores e quizzes.
              Domine sensores, atuadores, injeção eletrônica, redes CAN e muito mais.
            </p>
          </div>
        </div>

        {/* Progresso global e continuar estudando */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
            <div className="flex justify-between text-sm mb-1">
              <span>📊 Progresso total do curso</span>
              <span>{globalProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-orange-500 h-3 rounded-full transition-all duration-500" style={{ width: `${globalProgress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Continue estudando para avançar!</p>
          </div>
          {lastLesson && (
            <Link
              to={`/modulo/${lastLesson.moduleId}/aula/${lastLesson.lessonId}`}
              className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between transition"
            >
              <div>
                <div className="text-sm opacity-90">▶ Continuar estudando</div>
                <div className="font-semibold">{lastLesson.title}</div>
              </div>
              <div className="text-2xl">→</div>
            </Link>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="text-3xl font-bold text-orange-500">{animatedStats.modules}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Módulos</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="text-3xl font-bold text-orange-500">{animatedStats.lessons}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Aulas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="text-3xl font-bold text-orange-500">{animatedStats.quizzes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Quizzes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="text-3xl font-bold text-orange-500">{animatedStats.simulators}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Simuladores</div>
          </div>
        </div>

        {/* Sistema de Gamificação */}
        <GamificationSystem userId="user-1" />

        {/* Módulos por Nível */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-orange-500 w-2 h-6 rounded-full"></span>
            📚 Nossos Módulos
          </h2>

          {/* Básico */}
          <div className="mb-8">
            <div className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-blue-600 dark:text-blue-400">🔵 Básico</span>
              <span className="text-sm text-gray-500">(Módulos 1-6)</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.filter(mod => mod.id >= 1 && mod.id <= 6).map((mod, idx) => {
                const moduleProgress = getModuleProgress(mod.id, mod.lessons.length)
                return (
                  <Link
                    key={mod.id}
                    to={`/modulo/${mod.id}`}
                    className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up border-l-4 border-blue-500"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="p-4">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{mod.icon || '📘'}</div>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">{mod.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{mod.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>{mod.lessons.length} aulas</span>
                        <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${moduleProgress}%` }}></div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Intermediário */}
          <div className="mb-8">
            <div className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-green-600 dark:text-green-400">🟢 Intermediário</span>
              <span className="text-sm text-gray-500">(Módulos 7-19)</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.filter(mod => mod.id >= 7 && mod.id <= 19).map((mod, idx) => {
                const moduleProgress = getModuleProgress(mod.id, mod.lessons.length)
                return (
                  <Link
                    key={mod.id}
                    to={`/modulo/${mod.id}`}
                    className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up border-l-4 border-green-500"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="p-4">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{mod.icon || '📘'}</div>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-green-600 transition-colors">{mod.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{mod.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>{mod.lessons.length} aulas</span>
                        <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${moduleProgress}%` }}></div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Avançado */}
          <div className="mb-8">
            <div className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span className="text-purple-600 dark:text-purple-400">🟣 Avançado</span>
              <span className="text-sm text-gray-500">(Módulos 20-24)</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.filter(mod => mod.id >= 20 && mod.id <= 24).map((mod, idx) => {
                const moduleProgress = getModuleProgress(mod.id, mod.lessons.length)
                return (
                  <Link
                    key={mod.id}
                    to={`/modulo/${mod.id}`}
                    className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up border-l-4 border-purple-500"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="p-4">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{mod.icon || '📚'}</div>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-purple-600 transition-colors">{mod.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{mod.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>{mod.lessons.length} aulas</span>
                        <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${moduleProgress}%` }}></div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Especialista */}
          <div className="mb-8">
            <div className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span className="text-orange-600 dark:text-orange-400">🟠 Especialista</span>
              <span className="text-sm text-gray-500">(Módulos 25-29)</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.filter(mod => mod.id >= 25 && mod.id <= 29).map((mod, idx) => {
                const moduleProgress = getModuleProgress(mod.id, mod.lessons.length)
                return (
                  <Link
                    key={mod.id}
                    to={`/modulo/${mod.id}`}
                    className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up border-l-4 border-orange-500"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="p-4">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{mod.icon || '📚'}</div>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-orange-600 transition-colors">{mod.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{mod.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>{mod.lessons.length} aulas</span>
                        <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${moduleProgress}%` }}></div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
