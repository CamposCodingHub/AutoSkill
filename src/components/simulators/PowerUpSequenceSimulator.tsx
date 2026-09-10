import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type KeyPos = 'off' | 'acc' | 'on' | 'start'
type Fault = 'ok' | 'no_bplus' | 'ign_fuse' | 'ecu_gnd' | 'relay_stick'

const STEPS = [
  { id: 'bplus', label: 'B+ permanente (bateria → fusível principal)', need: ['off', 'acc', 'on', 'start'] as KeyPos[] },
  { id: 'acc', label: 'ACC / acessórios', need: ['acc', 'on', 'start'] as KeyPos[] },
  { id: 'ign', label: 'IG-ON (alimentação chaveada)', need: ['on', 'start'] as KeyPos[] },
  { id: 'ecu', label: 'ECU / módulos acordam', need: ['on', 'start'] as KeyPos[] },
  { id: 'start', label: 'Partida (sinal START / relé)', need: ['start'] as KeyPos[] },
]

const FAULTS: { id: Fault; label: string }[] = [
  { id: 'ok', label: 'Sistema normal' },
  { id: 'no_bplus', label: 'Sem B+ permanente' },
  { id: 'ign_fuse', label: 'Fusível IG aberto' },
  { id: 'ecu_gnd', label: 'Massa da ECU ruim' },
  { id: 'relay_stick', label: 'Relé de partida colado' },
]

export default function PowerUpSequenceSimulator({ config }: { config?: { title?: string } }) {
  const [key, setKey] = useState<KeyPos>('off')
  const [fault, setFault] = useState<Fault>('ok')

  const live = useMemo(() => {
    const active: Record<string, boolean> = {}
    for (const s of STEPS) {
      let on = s.need.includes(key)
      if (fault === 'no_bplus' && (s.id === 'bplus' || s.id === 'acc' || s.id === 'ign' || s.id === 'ecu' || s.id === 'start')) {
        on = false
      }
      if (fault === 'ign_fuse' && (s.id === 'ign' || s.id === 'ecu' || s.id === 'start')) on = false
      if (fault === 'ecu_gnd' && (s.id === 'ecu' || s.id === 'start')) on = false
      if (fault === 'relay_stick' && s.id === 'start') on = true
      active[s.id] = on
    }
    return active
  }, [key, fault])

  const tip = useMemo(() => {
    if (fault === 'no_bplus') return 'Sem permanente: rádio/ECU perdem memória; verifique cabo B+ e fusível principal.'
    if (fault === 'ign_fuse') return 'ACC pode existir, mas IG/ECU mortos → fusível ou fio chaveado.'
    if (fault === 'ecu_gnd') return 'Tensão no conector ok, mas módulo “morto”: confirme massa limpa sob carga.'
    if (fault === 'relay_stick') return 'Partida engata sem chave em START — risco e descarga. Troque o relé.'
    return 'Sequência típica: B+ sempre → ACC → IG → módulos → START.'
  }, [fault])

  return (
    <SimulatorShell
      title={config?.title ?? 'Sequência de power-up'}
      subtitle="Bateria → permanente → chave → ECU. Entenda o que liga em cada posição da chave."
      footer={<p>{tip}</p>}
    >
      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold">Posição da chave</label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['off', 'OFF'],
              ['acc', 'ACC'],
              ['on', 'IG-ON'],
              ['start', 'START'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setKey(id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                key === id ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold">Falha injetada</label>
        <select
          value={fault}
          onChange={(e) => setFault(e.target.value as Fault)}
          className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
        >
          {FAULTS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-2">
        {STEPS.map((s) => (
          <li
            key={s.id}
            className={`flex items-center justify-between rounded-lg border px-3 py-3 text-sm ${
              live[s.id]
                ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-slate-600'
            }`}
          >
            <span className="font-medium text-slate-900 dark:text-slate-100">{s.label}</span>
            <span className={`font-mono text-xs font-bold ${live[s.id] ? 'text-emerald-600' : 'text-slate-400'}`}>
              {live[s.id] ? 'ENERGIZADO' : 'OFF'}
            </span>
          </li>
        ))}
      </ul>
    </SimulatorShell>
  )
}
