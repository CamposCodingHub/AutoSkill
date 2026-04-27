import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { progressAPI, gamificationAPI } from '../services/api'

interface ProgressState {
    completedLessons: Record<string, boolean> // chave: `${moduleId}-${lessonId}`
    quizAnswers: Record<string, number> // chave: `${moduleId}-${lessonId}-quiz`, valor: índice da resposta correta
    lessonQuizProgress: Record<string, { answered: number; correct: number; total: number }> // progresso de quizzes por aula
    completeLesson: (moduleId: number, lessonId: number) => void
    isLessonCompleted: (moduleId: number, lessonId: number) => boolean
    getModuleProgress: (moduleId: number, totalLessons: number) => number
    getOverallProgress: (totalLessons: number) => number
    saveQuizAnswer: (moduleId: number, lessonId: number, answerIndex: number, correctIndex: number, totalQuizzes: number) => void
    getQuizAnswer: (moduleId: number, lessonId: number) => number | null
    isLessonFullyCompleted: (moduleId: number, lessonId: number) => boolean // todos os quizzes respondidos
    getLessonQuizProgress: (moduleId: number, lessonId: number) => { answered: number; correct: number; total: number }
    initializeLessonQuizzes: (moduleId: number, lessonId: number, totalQuizzes: number) => void // inicializa total de quizzes da aula
    resetLessonQuiz: (moduleId: number, lessonId: number) => void // reseta o quiz de uma aula para permitir refazer
    // Sincronização com API
    syncWithAPI: () => Promise<void>
    isSyncing: boolean
    // Gamificação
    gamificationProfile: {
        totalXP: number;
        currentLevel: number;
        levelProgress: number;
        streak: number;
        longestStreak: number;
        achievements: string[];
        weeklyXP: number;
        monthlyXP: number;
        lastStudyDate?: Date;
        studyHistory: Date[];
        streakFreezeAvailable: boolean;
    }
    updateGamificationProfile: (profile: Partial<ProgressState['gamificationProfile']>) => void
    getGamificationProfile: () => ProgressState['gamificationProfile']
    recordStudySession: () => void
    syncGamificationWithAPI: () => Promise<void>
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            completedLessons: {},
            quizAnswers: {},
            lessonQuizProgress: {},
            isSyncing: false,

            completeLesson: async (moduleId, lessonId) => {
                const key = `${moduleId}-${lessonId}`
                set((state) => ({
                    completedLessons: { ...state.completedLessons, [key]: true }
                }))
                
                // Sincronizar com API
                try {
                    await progressAPI.updateLessonProgress(moduleId, lessonId, true)
                } catch (error) {
                    console.error('Erro ao sincronizar com API:', error)
                }
            },

            isLessonCompleted: (moduleId, lessonId) => {
                const key = `${moduleId}-${lessonId}`
                return get().completedLessons[key] === true
            },

            isLessonFullyCompleted: (moduleId, lessonId) => {
                const key = `${moduleId}-${lessonId}`
                const progress = get().lessonQuizProgress[key]
                return progress && progress.answered === progress.total
            },

            getModuleProgress: (moduleId, totalLessons) => {
                if (totalLessons === 0) return 0
                let completed = 0
                for (let i = 1; i <= totalLessons; i++) {
                    if (get().isLessonCompleted(moduleId, i)) completed++
                }
                return Math.round((completed / totalLessons) * 100)
            },

            getOverallProgress: (totalLessons) => {
                if (totalLessons === 0) return 0
                const completedCount = Object.keys(get().completedLessons).length
                return Math.round((completedCount / totalLessons) * 100)
            },

            saveQuizAnswer: async (moduleId, lessonId, answerIndex, correctIndex, totalQuizzes) => {
                const key = `${moduleId}-${lessonId}`
                
                // Atualiza progresso do quiz localmente
                set((state) => {
                    const currentProgress = state.lessonQuizProgress[key] || { answered: 0, correct: 0, total: totalQuizzes }
                    const isCorrect = answerIndex === correctIndex
                    const newProgress = {
                        answered: currentProgress.answered + 1,
                        correct: currentProgress.correct + (isCorrect ? 1 : 0),
                        total: currentProgress.total
                    }
                    
                    // Salva a resposta do usuário
                    const quizKey = `${moduleId}-${lessonId}-quiz`
                    
                    // Verifica se aula está completa (todos os quizzes respondidos)
                    const isFullyCompleted = newProgress.answered === newProgress.total
                    if (isFullyCompleted && !get().isLessonCompleted(moduleId, lessonId)) {
                        return {
                            ...state,
                            lessonQuizProgress: { ...state.lessonQuizProgress, [key]: newProgress },
                            quizAnswers: { ...state.quizAnswers, [quizKey]: answerIndex },
                            completedLessons: { ...state.completedLessons, [`${moduleId}-${lessonId}`]: true }
                        }
                    }
                    
                    return {
                        ...state,
                        lessonQuizProgress: { ...state.lessonQuizProgress, [key]: newProgress },
                        quizAnswers: { ...state.quizAnswers, [quizKey]: answerIndex }
                    }
                })

                // Sincronizar com API
                try {
                    await progressAPI.saveQuizAnswer(moduleId, lessonId, answerIndex, correctIndex, totalQuizzes)
                } catch (error) {
                    console.error('Erro ao sincronizar quiz com API:', error)
                }
            },

            getQuizAnswer: (moduleId, lessonId) => {
                const key = `${moduleId}-${lessonId}-quiz`
                return get().quizAnswers[key] ?? null
            },

            getLessonQuizProgress: (moduleId, lessonId) => {
                const key = `${moduleId}-${lessonId}`
                return get().lessonQuizProgress[key] || { answered: 0, correct: 0, total: 0 }
            },

            initializeLessonQuizzes: (moduleId, lessonId, totalQuizzes) => {
                const key = `${moduleId}-${lessonId}`
                set((state) => {
                    // Só inicializa se ainda não existir
                    if (!state.lessonQuizProgress[key]) {
                        return {
                            ...state,
                            lessonQuizProgress: { ...state.lessonQuizProgress, [key]: { answered: 0, correct: 0, total: totalQuizzes } }
                        }
                    }
                    return state
                })
            },

            resetLessonQuiz: async (moduleId, lessonId) => {
                const key = `${moduleId}-${lessonId}`
                const quizKey = `${moduleId}-${lessonId}-quiz`
                
                set((state) => {
                    const currentProgress = state.lessonQuizProgress[key]
                    if (!currentProgress) return state
                    
                    const newQuizAnswers = { ...state.quizAnswers }
                    delete newQuizAnswers[quizKey]
                    
                    return {
                        ...state,
                        lessonQuizProgress: {
                            ...state.lessonQuizProgress,
                            [key]: { answered: 0, correct: 0, total: currentProgress.total }
                        },
                        quizAnswers: newQuizAnswers,
                        completedLessons: {
                            ...state.completedLessons,
                            [`${moduleId}-${lessonId}`]: false
                        }
                    }
                })

                // Nota: Sincronização com API será implementada depois
                // Por enquanto funciona apenas localmente
            },

            // Sincronização com API
            syncWithAPI: async () => {
                const token = localStorage.getItem('autoskill_token')
                if (!token) return

                set({ isSyncing: true })
                try {
                    const progress = await progressAPI.getProgress()
                    set({
                        completedLessons: progress.completedLessons,
                        quizAnswers: progress.quizAnswers,
                        lessonQuizProgress: progress.lessonQuizProgress,
                    })
                } catch (error) {
                    console.error('Erro ao sincronizar progresso:', error)
                } finally {
                    set({ isSyncing: false })
                }
            },

            // Gamificação
            gamificationProfile: {
                totalXP: 0,
                currentLevel: 1,
                levelProgress: 0,
                streak: 0,
                longestStreak: 0,
                achievements: [],
                weeklyXP: 0,
                monthlyXP: 0,
                lastStudyDate: undefined,
                studyHistory: [],
                streakFreezeAvailable: false
            },

            updateGamificationProfile: async (profile) => {
                set((state) => ({
                    ...state,
                    gamificationProfile: { ...state.gamificationProfile, ...profile }
                }))

                // Sincronizar com API (converter Date para string)
                try {
                    const apiProfile = {
                        ...profile,
                        lastStudyDate: profile.lastStudyDate?.toISOString(),
                        studyHistory: profile.studyHistory?.map(d => d.toISOString()),
                    }
                    await gamificationAPI.updateProfile(apiProfile)
                } catch (error) {
                    console.error('Erro ao sincronizar gamificação com API:', error)
                }
            },

            getGamificationProfile: () => {
                return get().gamificationProfile
            },

            recordStudySession: () => {
                const now = new Date();
                set((state) => {
                    const newHistory = [...state.gamificationProfile.studyHistory, now];
                    return {
                        ...state,
                        gamificationProfile: {
                            ...state.gamificationProfile,
                            studyHistory: newHistory,
                            lastStudyDate: now
                        }
                    };
                });
            },

            syncGamificationWithAPI: async () => {
                const token = localStorage.getItem('autoskill_token')
                if (!token) return

                try {
                    const profile = await gamificationAPI.getProfile()
                    set({
                        gamificationProfile: {
                            totalXP: profile.totalXP,
                            currentLevel: profile.currentLevel,
                            levelProgress: profile.levelProgress,
                            streak: profile.streak,
                            longestStreak: profile.longestStreak,
                            achievements: profile.achievements,
                            weeklyXP: profile.weeklyXP,
                            monthlyXP: profile.monthlyXP,
                            lastStudyDate: profile.lastStudyDate ? new Date(profile.lastStudyDate) : undefined,
                            studyHistory: profile.studyHistory.map(d => new Date(d)),
                            streakFreezeAvailable: profile.streakFreezeAvailable,
                        }
                    })
                } catch (error) {
                    console.error('Erro ao sincronizar gamificação:', error)
                }
            }
        }),
        {
            name: 'autoskill-progress', // chave no localStorage
        }
    )
)