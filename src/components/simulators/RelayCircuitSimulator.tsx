import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Fault = 'ok' | 'coil_open' | 'contact_bad' | 'no_control' | 'no_power30'

interface Case {
  id: Fault
  label: string
  pin85_86: string
  pin30: string
  pin87: string
  tip: string
}

const CASES: Case[] = [
  {
    id: 'ok',
    label: 'Relé operando',
    pin85_86: '≈ 70–90 Ω (bobina)',
    pin30: '12,6 V (alimentação)',
    pin87: '12,4 V com bobina excitada',
    tip: '85/86 = bobina de comando; 30 = entrada de potência; 87 = saída para carga; 87a = NF em relés de comutação.',
  },
  {
    id: 'coil_open',
    label: 'Bobina aberta',
    pin85_86: 'OL (aberto)',
    pin30: '12,6 V',
    pin87: '0 V mesmo com comando',
    tip: 'Bobina queimada: relé não “clica”. Troque o relé e investigue se houve sobrecarga/umidade no soquete.',
  },
  {
    id: 'contact_bad',
    label: 'Contato 30–87 com alta resistência',
    pin85_86: '≈ 80 Ω',
    pin30: '12,6 V',
    pin87: '9,1 V sob carga (queda)',
    tip: 'Bobina ok, mas contato carbonizado. Carga fraca (ventoinha lenta, farol fraco). Voltage drop entre 30 e 87 sob carga revela o problema.',
  },
  {
    id: 'no_control',
    label: 'Sem comando da ECU/chave',
    pin85_86: '≈ 80 Ω; sem tensão de excitação',
    pin30: '12,6 V',
    pin87: '0 V',
    tip: 'Relé bom, mas 85 ou 86 sem circuito de comando (massa ou positivo de controle). Verifique chave, módulo e fiação de controle.',
  },
  {
    id: 'no_power30',
    label: 'Sem alimentação no pino 30',
    pin85_86: '≈ 80 Ω; clique presente',
    pin30: '0 V',
    pin87: '0 V',
    tip: 'Fusível de potência aberto ou fio 30 cortado. O clique engana: bobina funciona, mas não há B+ para a carga.',
  },
]

export default function RelayCircuitSimulator({ config }: { config?: { title?: string } }) {
  const [fault, setFault] = useState<Fault>('ok')
  const [mode, setMode] = useState<'study' | 'blind'>('study')
  const [guess, setGuess] = useState<Fault | null>(null)
  const [energized, setEnergized] = useState(true)

  const current = CASES.find((c) => c.id === fault) ?? CASES[0]

  const pin87Live = useMemo(() => {
    if (!energized) return '0 V (bobina sem excitação)'
    return current.pin87
  }, [current, energized])

  const startBlind = () => {
    const pool = CASES.filter((c) => c.id !== 'ok')
    setFault(pool[Math.floor(Math.random() * pool.length)].id)
    setGuess(null)
    setMode('blind')
    setEnergized(true)
  }

  return (
    <SimulatorShell
      title={config?.title ?? 'Relé automotivo — diagnóstico de pinos'}
      subtitle="Separe falha de bobina, de contato e de alimentação/comando. Clique sozinho não prova que a carga recebe tensão."
      footer={
        <p>
          No carro: muitas cargas (ventoinha, bomba, farol de milha, buzina) passam por relé. Sempre meça no soquete sob
          a condição do sintoma.
        </p>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode('study')
            setGuess(null)
            setFault('ok')
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            mode === 'study' ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'
          }`}
        >
          Modo estudo
        </button>
        <button
          type="button"
          onClick={startBlind}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            mode === 'blind' ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'
          }`}
        >
          Caso cego
        </button>
      </div>

      {mode === 'study' && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold">Condição</label>
          <select
            value={fault}
            onChange={(e) => setFault(e.target.value as Fault)}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            {CASES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={energized} onChange={(e) => setEnergized(e.target.checked)} />
        Bobina excitada (comando presente)
      </label>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          ['85 ↔ 86 (bobina)', current.pin85_86],
          ['Pino 30', current.pin30],
          ['Pino 87 (saída)', pin87Live],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 p-3 dark:border-slate-600">
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      {mode === 'blind' && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold">Diagnóstico</p>
          <div className="flex flex-wrap gap-2">
            {CASES.filter((c) => c.id !== 'ok').map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setGuess(c.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  guess === c.id
                    ? guess === fault
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-red-600 bg-red-600 text-white'
                    : 'border-slate-300 dark:border-slate-500'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(mode === 'study' || guess) && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-600 dark:bg-slate-900/50">
          {mode === 'blind' && guess && (
            <p className="mb-1 font-semibold">
              {guess === fault ? 'Diagnóstico correto.' : `Incorreto. Era: ${current.label}.`}
            </p>
          )}
          {mode === 'study' && <p className="mb-1 font-semibold">{current.label}</p>}
          <p>{current.tip}</p>
        </div>
      )}
    </SimulatorShell>
  )
}
