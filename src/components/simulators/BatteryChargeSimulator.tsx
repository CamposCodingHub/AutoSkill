import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Condition = 'healthy' | 'weak_battery' | 'bad_alternator' | 'bad_ground' | 'parasitic'

interface Profile {
  id: Condition
  label: string
  restV: number
  crankV: number
  runV: number
  tip: string
}

const PROFILES: Profile[] = [
  {
    id: 'healthy',
    label: 'Sistema saudavel',
    restV: 12.65,
    crankV: 10.4,
    runV: 14.2,
    tip: 'Repouso >=12,6 V; partida >=9,6 V; motor ligado 13,8-14,5 V.',
  },
  {
    id: 'weak_battery',
    label: 'Bateria fraca / sulfatada',
    restV: 12.15,
    crankV: 8.2,
    runV: 14.1,
    tip: 'Repouso baixo e queda forte na partida. Teste CCA/carga.',
  },
  {
    id: 'bad_alternator',
    label: 'Alternador / regulador falho',
    restV: 12.55,
    crankV: 10.2,
    runV: 12.3,
    tip: 'Motor ligado sem subir para ~14 V. Verifique correia, excitacao, diodos e regulador.',
  },
  {
    id: 'bad_ground',
    label: 'Mau contato de massa (cabo)',
    restV: 12.6,
    crankV: 7.5,
    runV: 13.9,
    tip: 'Queda excessiva so sob alta corrente. Meça voltage drop no cabo negativo.',
  },
  {
    id: 'parasitic',
    label: 'Consumo parasita excessivo',
    restV: 11.9,
    crankV: 9.8,
    runV: 14.0,
    tip: 'Veiculo morre parado. Apos sleep, corrente tipicamente <50 mA (varia por veiculo).',
  },
]

type Phase = 'rest' | 'crank' | 'run'

export default function BatteryChargeSimulator({ config }: { config?: { title?: string } }) {
  const [condition, setCondition] = useState<Condition>('healthy')
  const [phase, setPhase] = useState<Phase>('rest')
  const [guess, setGuess] = useState<Condition | null>(null)
  const [blind, setBlind] = useState(true)

  const profile = PROFILES.find((p) => p.id === condition) ?? PROFILES[0]
  const voltage = useMemo(() => {
    if (phase === 'rest') return profile.restV
    if (phase === 'crank') return profile.crankV
    return profile.runV
  }, [phase, profile])

  const status = useMemo(() => {
    if (phase === 'rest') {
      if (voltage >= 12.6) return { text: 'Carga boa', ok: true }
      if (voltage >= 12.4) return { text: 'Carga regular', ok: false }
      return { text: 'Bateria baixa', ok: false }
    }
    if (phase === 'crank') {
      if (voltage >= 9.6) return { text: 'Partida aceitavel', ok: true }
      return { text: 'Queda excessiva na partida', ok: false }
    }
    if (voltage >= 13.8 && voltage <= 14.8) return { text: 'Carga OK', ok: true }
    if (voltage < 13.5) return { text: 'Subcarga - alternador?', ok: false }
    return { text: 'Sobrecarga - regulador?', ok: false }
  }, [phase, voltage])

  return (
    <SimulatorShell
      title={config?.title ?? 'Simulador partida e carga'}
      subtitle="Meça nas tres fases (repouso, partida, motor ligado) e diagnostique o sistema."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setBlind(false)
            setGuess(null)
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${!blind ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'}`}
        >
          Modo estudo
        </button>
        <button
          type="button"
          onClick={() => {
            const pool = PROFILES.filter((p) => p.id !== 'healthy')
            setCondition(pool[Math.floor(Math.random() * pool.length)].id)
            setGuess(null)
            setPhase('rest')
            setBlind(true)
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${blind ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'}`}
        >
          Caso cego
        </button>
      </div>

      {!blind && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold">Condicao</label>
          <select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value as Condition)
              setGuess(null)
            }}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            {PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          {(
            [
              ['rest', '1. Repouso (motor off)'],
              ['crank', '2. Durante a partida'],
              ['run', '3. Motor ligado (~2000 rpm)'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPhase(key)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                phase === key ? 'bg-slate-800 text-white dark:bg-slate-600' : 'border border-slate-300 dark:border-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="rounded-lg bg-slate-900 p-5 text-center">
          <span className="text-xs text-slate-400">TENSAO MEDIDA</span>
          <div className="my-2 font-mono text-5xl font-bold text-emerald-400">{voltage.toFixed(2)}</div>
          <span className={`text-sm font-semibold ${status.ok ? 'text-emerald-400' : 'text-amber-400'}`}>{status.text}</span>
        </div>
      </div>

      {blind && (
        <div className="mb-4 flex flex-wrap gap-2">
          {PROFILES.filter((p) => p.id !== 'healthy').map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setGuess(p.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                guess === p.id
                  ? guess === condition
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-red-600 bg-red-600 text-white'
                  : 'border-slate-300 dark:border-slate-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {(!blind || guess) && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-600 dark:bg-slate-900/50">
          {blind && guess && (
            <p className="mb-1 font-semibold">
              {guess === condition ? 'Diagnostico correto.' : `Incorreto. Era: ${profile.label}.`}
            </p>
          )}
          {!blind && <p className="mb-1 font-semibold">{profile.label}</p>}
          <p>{profile.tip}</p>
        </div>
      )}
    </SimulatorShell>
  )
}
