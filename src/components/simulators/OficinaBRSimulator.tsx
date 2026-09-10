import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Box = 'cabin' | 'engine' | 'battery'
type Fault = 'ok' | 'blown' | 'wrong_amp' | 'corroded' | 'bridged'

interface Fuse {
  id: string
  label: string
  amps: number
  box: Box
  circuit: string
}

const FUSES: Fuse[] = [
  { id: 'f01', label: 'F01', amps: 10, box: 'cabin', circuit: 'Rádio / multimídia' },
  { id: 'f07', label: 'F07', amps: 15, box: 'cabin', circuit: 'Tomada 12 V' },
  { id: 'f12', label: 'F12', amps: 7.5, box: 'cabin', circuit: 'BCM / iluminação int.' },
  { id: 'f30', label: 'F30', amps: 30, box: 'engine', circuit: 'Ventoinha' },
  { id: 'f40', label: 'F40', amps: 40, box: 'engine', circuit: 'ABS pump' },
  { id: 'f50', label: 'F50', amps: 60, box: 'battery', circuit: 'Glow / aquecedor (ex.)' },
]

export default function OficinaBRSimulator({ config }: { config?: { title?: string } }) {
  const [box, setBox] = useState<Box>('cabin')
  const [selected, setSelected] = useState('f01')
  const [fault, setFault] = useState<Fault>('blown')
  const [guess, setGuess] = useState<Fault | null>(null)

  const fuse = FUSES.find((f) => f.id === selected) ?? FUSES[0]
  const inBox = FUSES.filter((f) => f.box === box)

  const reading = useMemo(() => {
    if (fault === 'ok') return { continuity: true, dropV: 0.02, note: 'Fusível íntegro' }
    if (fault === 'blown') return { continuity: false, dropV: null as number | null, note: 'Aberto — sem continuidade' }
    if (fault === 'wrong_amp') return { continuity: true, dropV: 0.03, note: `Amperagem errada no soquete (deveria ${fuse.amps} A)` }
    if (fault === 'corroded') return { continuity: true, dropV: 0.85, note: 'Continuidade “ok”, mas queda alta sob carga' }
    return { continuity: true, dropV: 0.01, note: 'Ponte / bypass improvisado — risco de incêndio' }
  }, [fault, fuse.amps])

  return (
    <SimulatorShell
      title={config?.title ?? 'Modo oficina BR — fusíveis'}
      subtitle="Caixas típicas (habitáculo, motor, bateria). Meça, não só “olhe se o fio está partido”."
      footer={
        <p>
          Dica BR: corrosão e fusível de amperagem trocada são comuns. Nunca “pule” fusível com fio. Use o diagrama do
          veículo.
        </p>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['cabin', 'Caixa habitáculo'],
            ['engine', 'Caixa motor'],
            ['battery', 'Junto à bateria'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setBox(id)
              const first = FUSES.find((f) => f.box === id)
              if (first) setSelected(first.id)
              setGuess(null)
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              box === id ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Fusível</label>
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value)
              setGuess(null)
            }}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            {inBox.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label} · {f.amps} A — {f.circuit}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Falha oculta (estudo)</label>
          <select
            value={fault}
            onChange={(e) => {
              setFault(e.target.value as Fault)
              setGuess(null)
            }}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            <option value="ok">Íntegro</option>
            <option value="blown">Queimado</option>
            <option value="wrong_amp">Amperagem errada</option>
            <option value="corroded">Terminais oxidados</option>
            <option value="bridged">Ponte improvisada</option>
          </select>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
        <p>
          Continuidade:{' '}
          <span className="font-mono font-bold">{reading.continuity ? 'SIM' : 'NÃO (OL)'}</span>
        </p>
        <p className="mt-1">
          Queda sob carga:{' '}
          <span className="font-mono font-bold">
            {reading.dropV === null ? '—' : `${reading.dropV.toFixed(2)} V`}
          </span>
        </p>
        <p className="mt-2 text-sky-300">{reading.note}</p>
      </div>

      <p className="mb-2 text-sm font-semibold">Diagnóstico rápido — o que é?</p>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['blown', 'Queimado'],
            ['corroded', 'Oxidado'],
            ['wrong_amp', 'Amperagem errada'],
            ['bridged', 'Ponte'],
            ['ok', 'OK'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setGuess(id)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-500"
          >
            {label}
          </button>
        ))}
      </div>
      {guess && (
        <p
          className={`mt-3 text-sm ${
            guess === fault ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-300'
          }`}
        >
          {guess === fault ? 'Acertou.' : 'Não é isso — releia continuidade + queda.'} Cenário: {fault}.
        </p>
      )}
    </SimulatorShell>
  )
}
