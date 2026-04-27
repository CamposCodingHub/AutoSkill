import { useProgressStore } from '../stores/useProgressStore'

interface ProgressIndicatorProps {
  moduleId: number
  lessonId: number
  totalLessons: number
}

export default function ProgressIndicator({ moduleId, lessonId, totalLessons }: ProgressIndicatorProps) {
  const { isLessonCompleted } = useProgressStore()
  
  const completedLessons = Array.from({ length: totalLessons }, (_, i) => i + 1)
    .filter(id => isLessonCompleted(moduleId, id))
  
  const progressPercentage = (completedLessons.length / totalLessons) * 100
  const isCurrentLessonCompleted = isLessonCompleted(moduleId, lessonId)
  
  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-1">
        <h3 className="text-xs sm:text-sm font-semibold text-indigo-800 dark:text-indigo-300">
          📊 Seu Progresso
        </h3>
        <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-400">
          {completedLessons.length} / {totalLessons} aulas concluídas
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 mb-2 sm:mb-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="h-full bg-white bg-opacity-30 animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex gap-0.5 sm:gap-1 justify-center flex-wrap">
        {Array.from({ length: totalLessons }, (_, i) => i + 1).map(id => (
          <div
            key={id}
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              id === lessonId
                ? isCurrentLessonCompleted
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-orange-500 text-white scale-110 ring-2 ring-orange-300'
                : isLessonCompleted(moduleId, id)
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}
          >
            {isLessonCompleted(moduleId, id) ? '✓' : id}
          </div>
        ))}
      </div>
      
      {progressPercentage === 100 && (
        <div className="mt-2 sm:mt-3 text-center">
          <p className="text-xs sm:text-sm font-bold text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
            🎉 Módulo Concluído! Parabéns!
          </p>
        </div>
      )}
    </div>
  )
}
