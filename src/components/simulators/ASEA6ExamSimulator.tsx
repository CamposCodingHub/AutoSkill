import { useCallback, useEffect, useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'
import bank from '../../data/ase-a6-bank.json'

type Area = 'A' | 'B' | 'C' | 'D' | 'E'
type Mode = 'idle' | 'practice' | 'exam' | 'results'

interface QuizItem {
  id: string
  area: Area
  areaName: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface AnswerRecord {
  questionId: string
  selected: number
  correct: number
  area: Area
  areaName: string
  question: string
  explanation: string
  options: string[]
}

const QUESTIONS = bank as QuizItem[]
const EXAM_SECONDS = 45 * 60
const AREA_ORDER: Area[] = ['A', 'B', 'C', 'D', 'E']

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60)
  const s = Math.max(0, totalSeconds) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ASEA6ExamSimulator({ config }: { config?: { title?: string } }) {
  const [mode, setMode] = useState<Mode>('idle')
  const [queue, setQueue] = useState<QuizItem[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS)

  const current = queue[index]
  const total = queue.length
  const progressPct = total === 0 ? 0 : Math.round(((mode === 'results' ? total : index) / total) * 100)

  const finish = useCallback(() => {
    setMode('results')
    setRevealed(false)
    setSelected(null)
  }, [])

  useEffect(() => {
    if (mode !== 'exam') return undefined
    if (secondsLeft <= 0) {
      finish()
      return undefined
    }
    const id = window.setInterval(() => {
      setSecondsLeft((s) => s - 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [mode, secondsLeft, finish])

  const start = (nextMode: 'practice' | 'exam') => {
    setQueue(shuffle(QUESTIONS))
    setIndex(0)
    setSelected(null)
    setRevealed(false)
    setAnswers([])
    setSecondsLeft(EXAM_SECONDS)
    setMode(nextMode)
  }

  const recordAnswer = (choice: number) => {
    if (!current) return
    setAnswers((prev) => {
      const without = prev.filter((a) => a.questionId !== current.id)
      return [
        ...without,
        {
          questionId: current.id,
          selected: choice,
          correct: current.correct,
          area: current.area,
          areaName: current.areaName,
          question: current.question,
          explanation: current.explanation,
          options: current.options,
        },
      ]
    })
  }

  const onSelect = (choice: number) => {
    if (mode === 'results' || !current) return
    if (mode === 'practice' && revealed) return
    setSelected(choice)
    if (mode === 'practice') {
      setRevealed(true)
      recordAnswer(choice)
    }
  }

  const goNext = () => {
    if (!current || selected === null) return
    if (mode === 'exam') {
      recordAnswer(selected)
    }
    if (index >= total - 1) {
      finish()
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  const score = useMemo(() => {
    const correctCount = answers.filter((a) => a.selected === a.correct).length
    const pct = answers.length === 0 ? 0 : Math.round((correctCount / QUESTIONS.length) * 100)
    const byArea = AREA_ORDER.map((area) => {
      const items = answers.filter((a) => a.area === area)
      const ok = items.filter((a) => a.selected === a.correct).length
      const areaName = items[0]?.areaName ?? QUESTIONS.find((q) => q.area === area)?.areaName ?? area
      const denom = QUESTIONS.filter((q) => q.area === area).length
      return { area, areaName, ok, total: denom, pct: denom === 0 ? 0 : Math.round((ok / denom) * 100) }
    })
    const missed = answers.filter((a) => a.selected !== a.correct)
    return { correctCount, pct, byArea, missed }
  }, [answers])

  return (
    <SimulatorShell
      title={config?.title ?? 'ASE A6 — Elétrica / Eletrônica'}
      subtitle="Banco de prática e simulado cronometrado (30 questões). Estilo diagnóstico, alinhado às áreas A–E."
      footer={
        <p>
          Ferramenta educacional AutoSkill. Não substitui o exame oficial ASE nem manuais do fabricante. Foque em
          raciocínio de queda de tensão, potência/massa e redes.
        </p>
      }
    >
      {mode === 'idle' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {QUESTIONS.length} questões cobrindo elétrica geral, bateria/partida, carga, iluminação e redes da
            carroceria. Na prática, a explicação aparece após cada resposta. No simulado, você tem 45 minutos e o
            resultado consolidado ao final.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => start('practice')}
              className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
            >
              Iniciar prática
            </button>
            <button
              type="button"
              onClick={() => start('exam')}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              Iniciar simulado (45 min)
            </button>
          </div>
        </div>
      )}

      {(mode === 'practice' || mode === 'exam') && current && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Questão {index + 1} de {total}
              <span className="ml-2 text-xs font-normal text-slate-500">
                Área {current.area} — {current.areaName}
              </span>
            </span>
            {mode === 'exam' && (
              <span
                className={`rounded-md px-2.5 py-1 font-mono text-sm font-semibold ${
                  secondsLeft <= 300
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                }`}
              >
                {formatTime(secondsLeft)}
              </span>
            )}
            {mode === 'practice' && (
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                Modo prática
              </span>
            )}
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-300"
              style={{ width: `${Math.max(progressPct, total ? Math.round((index / total) * 100) : 0)}%` }}
            />
          </div>

          <p className="text-base font-medium leading-relaxed text-slate-900 dark:text-slate-100">{current.question}</p>

          <div className="space-y-2">
            {current.options.map((opt, i) => {
              let style =
                'border-slate-300 bg-white hover:border-orange-400 dark:border-slate-500 dark:bg-slate-700 dark:hover:border-orange-500'
              if (selected === i) {
                style = 'border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950/40'
              }
              if (mode === 'practice' && revealed) {
                if (i === current.correct) {
                  style = 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30'
                } else if (selected === i) {
                  style = 'border-red-400 bg-red-50 dark:border-red-400 dark:bg-red-950/30'
                }
              }
              return (
                <button
                  key={`${current.id}-${i}`}
                  type="button"
                  onClick={() => onSelect(i)}
                  className={`block w-full rounded-lg border px-3 py-3 text-left text-sm text-slate-800 dark:text-slate-100 ${style}`}
                >
                  <span className="mr-2 font-semibold text-slate-500">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              )
            })}
          </div>

          {mode === 'practice' && revealed && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200">
              <p className="mb-1 font-semibold">
                {selected === current.correct ? 'Resposta correta' : 'Resposta incorreta'}
              </p>
              <p>{current.explanation}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={selected === null || (mode === 'practice' && !revealed)}
              onClick={goNext}
              className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {index >= total - 1 ? 'Ver resultado' : 'Próxima'}
            </button>
            <button
              type="button"
              onClick={finish}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Encerrar
            </button>
          </div>
        </div>
      )}

      {mode === 'results' && (
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900/40">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pontuação geral</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {score.pct}%
              <span className="ml-2 text-base font-medium text-slate-500">
                ({score.correctCount}/{QUESTIONS.length})
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Respostas registradas nesta sessão: {answers.length}. Questões sem resposta contam como incorretas no
              denominador oficial (30).
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Desempenho por área</h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {score.byArea.map((row) => (
                <div
                  key={row.area}
                  className="rounded-lg border border-slate-200 p-3 dark:border-slate-600"
                >
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                    {row.area} — {row.areaName}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{row.pct}%</p>
                  <p className="text-xs text-slate-500">
                    {row.ok}/{row.total}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {score.missed.length > 0 ? (
            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Questões perdidas ({score.missed.length})
              </h4>
              <ul className="space-y-3">
                {score.missed.map((m) => (
                  <li
                    key={m.questionId}
                    className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-600"
                  >
                    <p className="mb-1 text-xs font-semibold text-slate-500">
                      Área {m.area} — {m.areaName}
                    </p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{m.question}</p>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                      Sua resposta: {m.options[m.selected] ?? '—'}
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-300">
                      Correta: {m.options[m.correct]}
                    </p>
                    <p className="mt-2 text-slate-700 dark:text-slate-200">{m.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Nenhuma questão perdida entre as respondidas — ótimo desempenho nesta sessão.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => start('practice')}
              className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
            >
              Iniciar prática
            </button>
            <button
              type="button"
              onClick={() => start('exam')}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-slate-500"
            >
              Iniciar simulado (45 min)
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-slate-500"
            >
              Encerrar
            </button>
          </div>
        </div>
      )}
    </SimulatorShell>
  )
}
