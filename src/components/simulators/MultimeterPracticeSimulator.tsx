import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Mode = 'VDC' | 'ADC' | 'OHM' | 'CONT'

interface Challenge {
  id: string
  prompt: string
  correctMode: Mode
  correctConnection: 'parallel' | 'series' | 'open_circuit'
  explanation: string
}

const CHALLENGES: Challenge[] = [
  {
    id: 'battery_rest',
    prompt: 'Medir tensao da bateria em repouso.',
    correctMode: 'VDC',
    correctConnection: 'parallel',
    explanation: 'Tensao sempre em paralelo com a fonte. Escala DC V. Esperado ~12,6 V.',
  },
  {
    id: 'lamp_current',
    prompt: 'Medir corrente consumida por uma lampada de freio.',
    correctMode: 'ADC',
    correctConnection: 'series',
    explanation: 'Corrente em serie (ou alicate). Comece na escala 10A.',
  },
  {
    id: 'wire_continuity',
    prompt: 'Verificar se um fio do chicote esta partido.',
    correctMode: 'CONT',
    correctConnection: 'open_circuit',
    explanation: 'Continuidade/ohms so com circuito desenergizado.',
  },
  {
    id: 'sensor_resistance',
    prompt: 'Medir resistencia de um sensor NTC (ECT) desconectado.',
    correctMode: 'OHM',
    correctConnection: 'open_circuit',
    explanation: 'Ohms com conector desconectado e sem tensao no circuito.',
  },
  {
    id: 'voltage_drop_gnd',
    prompt: 'Medir queda de tensao na massa de um farol aceso.',
    correctMode: 'VDC',
    correctConnection: 'parallel',
    explanation: 'Uma ponta no negativo da carga, outra no negativo da bateria. Ideal < 0,1 V.',
  },
]

const MODE_LABEL: Record<Mode, string> = {
  VDC: 'Tensao DC (V)',
  ADC: 'Corrente DC (A)',
  OHM: 'Resistencia (Ohm)',
  CONT: 'Continuidade',
}

export default function MultimeterPracticeSimulator({ config }: { config?: { title?: string } }) {
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<Mode | null>(null)
  const [connection, setConnection] = useState<'parallel' | 'series' | 'open_circuit' | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ ok: 0, total: 0 })

  const challenge = CHALLENGES[index]
  const isCorrect = mode === challenge.correctMode && connection === challenge.correctConnection
  const progress = useMemo(() => `${index + 1} / ${CHALLENGES.length}`, [index])

  return (
    <SimulatorShell
      title={config?.title ?? 'Pratica de multimetro'}
      subtitle={`Desafio ${progress} · Acertos ${score.ok}/${score.total}`}
    >
      <div className="mb-4 rounded-lg border border-slate-200 p-4 dark:border-slate-600">
        <p className="text-xs font-semibold uppercase text-slate-500">Ordem de servico</p>
        <p className="font-medium text-slate-900 dark:text-slate-100">{challenge.prompt}</p>
      </div>

      <p className="mb-2 text-sm font-semibold">1. Funcao do multimetro</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            disabled={checked}
            onClick={() => setMode(m)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              mode === m ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300 dark:border-slate-500'
            }`}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      <p className="mb-2 text-sm font-semibold">2. Como conectar?</p>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {(
          [
            ['parallel', 'Em paralelo com o circuito'],
            ['series', 'Em serie (interrompendo o fio)'],
            ['open_circuit', 'Circuito desligado / componente isolado'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            disabled={checked}
            onClick={() => setConnection(key)}
            className={`rounded-lg border px-3 py-3 text-left text-sm font-medium ${
              connection === key ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300 dark:border-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!mode || !connection || checked}
          onClick={() => {
            if (!mode || !connection || checked) return
            setChecked(true)
            setScore((s) => ({ ok: s.ok + (isCorrect ? 1 : 0), total: s.total + 1 }))
          }}
          className="btn-primary disabled:opacity-40"
        >
          Verificar
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setMode(null)
            setConnection(null)
            setChecked(false)
            setIndex((i) => (i + 1) % CHALLENGES.length)
          }}
        >
          Proximo desafio
        </button>
      </div>

      {checked && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            isCorrect
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30'
              : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30'
          }`}
        >
          <p className="font-semibold">{isCorrect ? 'Procedimento correto.' : 'Procedimento incorreto.'}</p>
          <p className="mt-2">{challenge.explanation}</p>
        </div>
      )}
    </SimulatorShell>
  )
}
