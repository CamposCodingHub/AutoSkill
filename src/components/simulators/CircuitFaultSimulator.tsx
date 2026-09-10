import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type FaultType = 'ok' | 'open' | 'high_r' | 'short'

interface Scenario {
  id: string
  title: string
  symptom: string
  fault: FaultType
  loadAmps: number
  tip: string
}

const SCENARIOS: Scenario[] = [
  {
    id: 'headlight',
    title: 'Farol esquerdo fraco',
    symptom: 'Cliente: farol esquerdo bem mais fraco que o direito. Lâmpada nova.',
    fault: 'high_r',
    loadAmps: 4.5,
    tip: 'Alta resistência (mau contato/massa) rouba tensão sob carga. Meça queda de tensão no positivo e na massa.',
  },
  {
    id: 'brake',
    title: 'Lâmpada de freio apagada',
    symptom: 'Lâmpada de freio direita não acende. Fusível ok. Lâmpada ok.',
    fault: 'open',
    loadAmps: 2.1,
    tip: 'Circuito aberto: fio partido, conector solto ou trilho quebrado. Continuidade com circuito desligado.',
  },
  {
    id: 'horn',
    title: 'Buzina queima fusível',
    symptom: 'Ao acionar a buzina, o fusível queima imediatamente.',
    fault: 'short',
    loadAmps: 8,
    tip: 'Curto à massa: corrente dispara e o fusível se sacrifica. Isole trechos do chicote.',
  },
  {
    id: 'ok_circuit',
    title: 'Circuito de referência OK',
    symptom: 'Circuito saudável — compare medições.',
    fault: 'ok',
    loadAmps: 5,
    tip: 'Tensão na carga ≈ fonte. Queda < 0,2 V no positivo e < 0,1 V na massa.',
  },
]

const FAULT_LABEL: Record<FaultType, string> = {
  ok: 'Normal',
  open: 'Aberto',
  high_r: 'Alta resistência',
  short: 'Curto à massa',
}

export default function CircuitFaultSimulator({ config }: { config?: { title?: string } }) {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)
  const [probe, setProbe] = useState<'source' | 'load+' | 'load-' | 'ground'>('load+')
  const [guess, setGuess] = useState<FaultType | null>(null)
  const [revealed, setRevealed] = useState(false)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]
  const batteryV = 12.6

  const readings = useMemo(() => {
    const I = scenario.loadAmps
    switch (scenario.fault) {
      case 'ok':
        return { source: batteryV, loadPlus: 12.45, loadMinus: 0.08, ground: 0, current: I, fuse: 'Integro' }
      case 'open':
        return { source: batteryV, loadPlus: 0, loadMinus: 0, ground: 0, current: 0, fuse: 'Integro' }
      case 'high_r':
        return { source: batteryV, loadPlus: 9.2, loadMinus: 1.8, ground: 0, current: I * 0.55, fuse: 'Integro' }
      case 'short':
        return { source: batteryV, loadPlus: 0.4, loadMinus: 0.1, ground: 0, current: 45, fuse: 'Queimado' }
    }
  }, [scenario])

  const displayedV =
    probe === 'source' ? readings.source : probe === 'load+' ? readings.loadPlus : probe === 'load-' ? readings.loadMinus : readings.ground

  const correct = guess === scenario.fault

  return (
    <SimulatorShell
      title={config?.title ?? 'Diagnóstico de falha no circuito'}
      subtitle="Meça pontos do circuito, interprete as leituras e diagnostique a falha."
    >
      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold">Cenario</label>
        <select
          value={scenarioId}
          onChange={(e) => {
            setScenarioId(e.target.value)
            setGuess(null)
            setRevealed(false)
            setProbe('load+')
          }}
          className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
        >
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm italic text-slate-600 dark:text-slate-300">{scenario.symptom}</p>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Ponto de medicao</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['source', 'Fonte (B+)'],
                ['load+', 'Carga (+)'],
                ['load-', 'Carga (-)'],
                ['ground', 'Massa chassis'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setProbe(key)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  probe === key ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-slate-900 p-4 font-mono text-emerald-400">
          <span className="text-xs text-slate-400">MULTIMETRO · DC V</span>
          <span className="text-4xl font-bold tabular-nums">{displayedV.toFixed(2)}</span>
          <span className="mt-2 text-sm text-slate-400">
            I ≈ {readings.current.toFixed(1)} A · Fusivel: {readings.fuse}
          </span>
        </div>
      </div>

      <p className="mb-2 text-sm font-semibold">Qual e a falha?</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(FAULT_LABEL) as FaultType[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setGuess(f)
              setRevealed(true)
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              guess === f
                ? revealed && correct
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-red-600 bg-red-600 text-white'
                : 'border-slate-300 dark:border-slate-500'
            }`}
          >
            {FAULT_LABEL[f]}
          </button>
        ))}
      </div>

      {revealed && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            correct
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30'
              : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30'
          }`}
        >
          <p className="mb-1 font-semibold">
            {correct ? 'Diagnostico correto.' : `Ainda nao. Falha real: ${FAULT_LABEL[scenario.fault]}.`}
          </p>
          <p>{scenario.tip}</p>
        </div>
      )}
    </SimulatorShell>
  )
}
