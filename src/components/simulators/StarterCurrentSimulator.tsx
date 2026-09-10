import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Fault = 'ok' | 'weak_battery' | 'bad_cable' | 'bad_solenoid' | 'seized'

const PROFILES = [
  { id: 'ok' as const, label: 'Partida saudavel', batteryV: 12.6, crankV: 10.5, starterAmps: 180, tip: 'Corrente tipica gasolina ~150-250 A.' },
  { id: 'weak_battery' as const, label: 'Bateria sem CCA', batteryV: 12.2, crankV: 7.8, starterAmps: 95, tip: 'Tensao e corrente baixas: teste CCA.' },
  { id: 'bad_cable' as const, label: 'Cabo com alta resistencia', batteryV: 12.6, crankV: 8.0, starterAmps: 70, tip: 'Meça voltage drop nos cabos.' },
  { id: 'bad_solenoid' as const, label: 'Solenoide/contato falho', batteryV: 12.6, crankV: 11.8, starterAmps: 25, tip: 'Click sem giro e corrente baixa.' },
  { id: 'seized' as const, label: 'Arranque/motor pesado', batteryV: 12.5, crankV: 8.5, starterAmps: 420, tip: 'Corrente muito alta: mecanica/curto.' },
]

export default function StarterCurrentSimulator({ config }: { config?: { title?: string } }) {
  const [fault, setFault] = useState<Fault>('ok')
  const [cranking, setCranking] = useState(false)
  const current = PROFILES.find((p) => p.id === fault) ?? PROFILES[0]
  const reading = useMemo(
    () => (!cranking ? { v: current.batteryV, a: 0 } : { v: current.crankV, a: current.starterAmps }),
    [cranking, current],
  )

  return (
    <SimulatorShell title={config?.title ?? 'Corrente de partida'} subtitle="Combine tensao e corrente sob partida.">
      <select
        value={fault}
        onChange={(e) => setFault(e.target.value as Fault)}
        className="mb-4 w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
      >
        {PROFILES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCranking(false)} className={`rounded-lg px-3 py-2 text-sm font-medium ${!cranking ? 'bg-slate-800 text-white' : 'border border-slate-300 dark:border-slate-500'}`}>
          Repouso
        </button>
        <button type="button" onClick={() => setCranking(true)} className={`rounded-lg px-3 py-2 text-sm font-medium ${cranking ? 'bg-slate-800 text-white' : 'border border-slate-300 dark:border-slate-500'}`}>
          Durante a partida
        </button>
      </div>
      <div className="mb-4 rounded-lg bg-slate-900 p-5 text-center">
        <p className="font-mono text-3xl font-bold text-emerald-400">{reading.v.toFixed(1)} V</p>
        <p className="mt-1 font-mono text-2xl text-sky-300">{reading.a} A</p>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{current.tip}</p>
    </SimulatorShell>
  )
}
