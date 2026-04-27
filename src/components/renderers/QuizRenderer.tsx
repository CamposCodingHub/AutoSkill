import { useState, useEffect } from 'react'
import { useProgressStore } from '../../stores/useProgressStore'

interface QuizRendererProps {
    question: string
    options: string[]
    correct: number
    moduleId: number
    lessonId: number
    totalQuizzes: number
}

export default function QuizRenderer({ question, options, correct, moduleId, lessonId, totalQuizzes }: QuizRendererProps) {
    const { saveQuizAnswer, getQuizAnswer } = useProgressStore()
    const [selected, setSelected] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const saved = getQuizAnswer(moduleId, lessonId)
        if (saved !== null) {
            setSelected(saved)
            setSubmitted(true)
        }
    }, [moduleId, lessonId, getQuizAnswer])

    const handleSubmit = () => {
        if (selected !== null) {
            saveQuizAnswer(moduleId, lessonId, selected, correct, totalQuizzes)
            setSubmitted(true)
        }
    }

    const isCorrect = submitted && selected === correct

    return (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-indigo-200 shadow-lg animate-fade-in-up">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                📝 Quiz Interativo
            </h3>
            <p className="mb-4 sm:mb-6 text-base sm:text-lg text-gray-800 dark:text-gray-200">{question}</p>
            <div className="space-y-2 sm:space-y-3">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => !submitted && setSelected(idx)}
                        className={`block w-full text-left p-3 sm:p-4 rounded-lg transition-all transform hover:scale-[1.02] ${
                            submitted
                                ? idx === correct
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-2 border-green-500 shadow-md'
                                    : idx === selected
                                        ? 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900 border-2 border-red-500 shadow-md'
                                        : 'bg-white dark:bg-gray-700 border-2 border-gray-200 opacity-75'
                                : selected === idx
                                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 border-2 border-indigo-500 shadow-md'
                                    : 'bg-white dark:bg-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900'
                        }`}
                        disabled={submitted}
                    >
                        <span className="flex items-center gap-2 sm:gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                submitted
                                    ? idx === correct
                                        ? 'bg-green-500 text-white'
                                        : idx === selected
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                    : selected === idx
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-gray-200 text-gray-600'
                            }`}>
                                {idx === correct && submitted ? '✓' : idx === selected && !submitted ? '•' : String.fromCharCode(65 + idx)}
                            </span>
                            {opt}
                        </span>
                    </button>
                ))}
            </div>
            {!submitted && (
                <button
                    onClick={handleSubmit}
                    disabled={selected === null}
                    className="mt-4 sm:mt-6 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                    🚀 Enviar resposta
                </button>
            )}
            {submitted && (
                <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border-2 ${
                    isCorrect 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-green-500' 
                        : 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900 border-red-500'
                }`}>
                    {isCorrect ? (
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <span className="text-xl sm:text-2xl">🎉</span>
                            <p className="font-bold text-sm sm:text-base">Excelente! Resposta correta!</p>
                        </div>
                    ) : (
                        <div className="space-y-1 sm:space-y-2">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                <span className="text-xl sm:text-2xl">💡</span>
                                <p className="font-bold text-sm sm:text-base">Vamos revisar...</p>
                            </div>
                            <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">
                                A resposta correta é: <strong>{options[correct]}</strong>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}