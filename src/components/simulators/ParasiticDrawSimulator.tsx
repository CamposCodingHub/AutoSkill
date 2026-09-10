import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Fault = 'ok' | 'glove_box' | 'radio_amp' | 'module_awake' | 'short_trunk'

interface Scenario {
  id: Fault
  label: string
  drawMa: number
  tip: string
}

const SCENARIOS: Scenario[] = [
  {
    id: 'ok',
    label: 'Veículo em sleep normal',
    drawMa: 28,
    tip: 'Após o sleep (geralmente 5–45 min), muitos veículos ficam abaixo de ~50 mA. Consulte o fabricante — alguns com telemática aceitam até ~70–100 mA.',
  },
  {
    id: 'glove_box',
    label: 'Luz do porta-luvas / porta entreaberta',
    drawMa: 320,
    tip: 'Corrente tipicamente na casa de centenas de mA. Verifique interruptores de porta, porta-malas e porta-luvas antes de culpar módulos.',
  },
  {
    id: 'radio_amp',
    label: 'Amplificador aftermarket sem relé',
    drawMa: 850,
    tip: 'Som high-end ligado direto em B+ sem ignição consome a bateria em dias. Alimentação do amp deve passar por ACC/relé de ignição.',
  },
  {
    id: 'module_awake',
    label: 'Módulo que não entra em sleep (BCM/áudio)',
    drawMa: 180,
    tip: 'Puxe fusíveis um a um (ou use alicate em B+) observando a queda de mA. O fusível que derruba a corrente aponta o circuito. Cuidado: alguns veículos “acordam” ao puxar fusível.',
  },
  {
    id: 'short_trunk',
    label: 'Curto intermitente no chicote do porta-malas',
    drawMa: 2400,
    tip: 'Amperagem alta (ampères) com IG off = curto ou carga ligada. Isolar por ramificações do chicote; inspecionar dobradiças e atrito.',
  },
]

export default function ParasiticDrawSimulator({ config }: { config?: { title?: string } }) {
  const [fault, setFault] = useState<Fault>('ok')
  const [mode, setMode] = useState<'study' | 'blind'>('study')
  const [guess, setGuess] = useState<Fault | null>(null)
  const [slept, setSlept] = useState(false)

  const current = SCENARIOS.find((s) => s.id === fault) ?? SCENARIOS[0]
  const reading = slept ? current.drawMa : current.drawMa + 2200

  const verdict = useMemo(() => {
    if (!slept) return { text: 'Aguarde o sleep — leitura ainda alta (módulos acordados)', ok: false }
    if (reading < 50) return { text: 'Dentro do típico para muitos veículos', ok: true }
    if (reading < 100) return { text: 'Limítrofe — confirme especificação do veículo', ok: false }
    return { text: 'Consumo excessivo — isole o circuito', ok: false }
  }, [reading, slept])

  const startBlind = () => {
    const pool = SCENARIOS.filter((s) => s.id !== 'ok')
    setFault(pool[Math.floor(Math.random() * pool.length)].id)
    setGuess(null)
    setMode('blind')
    setSlept(false)
  }

  return (
    <SimulatorShell
      title={config?.title ?? 'Consumo parasita (parasitic draw)'}
      subtitle="Meça a corrente com ignição off após o veículo entrar em sleep. Valores altos drenam a bateria em dias."
      footer={
        <p>
          Procedimento profissional: multímetro em série no cabo negativo (fusível 10 A no DMM) ou alicate de precisão;
          fechar portas; esperar sleep; anotar mA; isolar por fusível/circuito.
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
            setSlept(false)
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
          <label className="mb-2 block text-sm font-semibold">Condição do veículo</label>
          <select
            value={fault}
            onChange={(e) => {
              setFault(e.target.value as Fault)
              setSlept(false)
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
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSlept(false)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
              !slept ? 'bg-slate-800 text-white dark:bg-slate-600' : 'border border-slate-300 dark:border-slate-500'
            }`}
          >
            1. IGN off — logo após fechar portas
          </button>
          <button
            type="button"
            onClick={() => setSlept(true)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
              slept ? 'bg-slate-800 text-white dark:bg-slate-600' : 'border border-slate-300 dark:border-slate-500'
            }`}
          >
            2. Após tempo de sleep
          </button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-slate-900 p-5 text-center">
          <span className="text-xs text-slate-400">CORRENTE DE DESCARGA</span>
          <span className="my-2 font-mono text-4xl font-bold text-emerald-400">
            {reading >= 1000 ? `${(reading / 1000).toFixed(2)} A` : `${reading} mA`}
          </span>
          <span className={`text-sm font-semibold ${verdict.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
            {verdict.text}
          </span>
        </div>
      </div>

      {mode === 'blind' && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold">Qual a causa mais provável?</p>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.filter((s) => s.id !== 'ok').map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setGuess(s.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  guess === s.id
                    ? guess === fault
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-red-600 bg-red-600 text-white'
                    : 'border-slate-300 dark:border-slate-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(mode === 'study' || guess) && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-600 dark:bg-slate-900/50">
          {mode === 'blind' && guess && (
            <p className="mb-1 font-semibold">
              {guess === fault ? 'Diagnóstico correto.' : `Incorreto. Causa real: ${current.label}.`}
            </p>
          )}
          {mode === 'study' && <p className="mb-1 font-semibold">{current.label}</p>}
          <p>{current.tip}</p>
        </div>
      )}
    </SimulatorShell>
  )
}
