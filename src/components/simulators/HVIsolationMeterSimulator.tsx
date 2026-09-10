import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Fault = 'ok' | 'coolant' | 'cable_chafed' | 'connector_wet' | 'inverter'

const SCENARIOS = [
  {
    id: 'ok' as const,
    label: 'Isolamento saudável',
    mohm: 85,
    tip: 'Valores altos (dezenas de MΩ) são típicos em sistema seco e íntegro — confirme spec OEM.',
  },
  {
    id: 'coolant' as const,
    label: 'Vazamento de coolant no pack',
    mohm: 0.35,
    tip: 'Queda severa: líquido condutivo. Pare o serviço HV e siga procedimento OEM.',
  },
  {
    id: 'cable_chafed' as const,
    label: 'Cabo laranja com isolamento danificado',
    mohm: 1.2,
    tip: 'Atrito em chassi/duto. Inspecione visualmente após LOTO completo.',
  },
  {
    id: 'connector_wet' as const,
    label: 'Conector HV úmido',
    mohm: 2.8,
    tip: 'Umidade em selos/conectores. Seque, inspecione O-rings, nunca ligue molhado.',
  },
  {
    id: 'inverter' as const,
    label: 'Degradação no inversor',
    mohm: 4.5,
    tip: 'Isolamento limítrofe: compare com limiar do fabricante e histórico de DTC isolation.',
  },
]

export default function HVIsolationMeterSimulator({ config }: { config?: { title?: string } }) {
  const [fault, setFault] = useState<Fault>('ok')
  const [tested, setTested] = useState(false)
  const [loto, setLoto] = useState(false)

  const scenario = SCENARIOS.find((s) => s.id === fault) ?? SCENARIOS[0]

  const verdict = useMemo(() => {
    if (!loto) return { ok: false, text: 'Bloqueado: complete LOTO / 0 V antes de medir' }
    if (!tested) return { ok: false, text: 'Aguardando medição' }
    if (scenario.mohm >= 20) return { ok: true, text: 'Dentro do típico educacional (≥ 20 MΩ)' }
    if (scenario.mohm >= 5) return { ok: false, text: 'Limítrofe — consulte especificação OEM' }
    return { ok: false, text: 'Isolamento baixo — risco / DTC esperado' }
  }, [loto, tested, scenario])

  return (
    <SimulatorShell
      title={config?.title ?? 'Medidor de isolamento HV'}
      subtitle="Simulação educacional de resistência de isolamento. No veículo real: EPI, LOTO e procedimento do fabricante."
      footer={
        <p>
          Nunca meça isolamento sem confirmar desenergização. Cabos laranja, service plug removido e tempo de descarga
          cumprido.
        </p>
      }
    >
      <label className="mb-4 flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-600">
        <input
          type="checkbox"
          className="mt-1"
          checked={loto}
          onChange={(e) => {
            setLoto(e.target.checked)
            setTested(false)
          }}
        />
        <span>Confirmo LOTO educacional (service plug, espera, verificação 0 V).</span>
      </label>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold">Condição</label>
        <select
          value={fault}
          onChange={(e) => {
            setFault(e.target.value as Fault)
            setTested(false)
          }}
          className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
        >
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        disabled={!loto}
        onClick={() => setTested(true)}
        className="mb-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Medir isolamento (sim)
      </button>

      <div className="mb-3 rounded-lg bg-slate-900 p-5 text-center">
        <p className="font-mono text-3xl font-bold text-sky-300">
          {tested && loto ? `${scenario.mohm.toFixed(2)} MΩ` : '— — —'}
        </p>
        <p className={`mt-2 text-sm ${verdict.ok ? 'text-emerald-300' : 'text-amber-300'}`}>{verdict.text}</p>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{scenario.tip}</p>
    </SimulatorShell>
  )
}
