import { useState } from 'react'
import SimulatorShell from './SimulatorShell'

interface Node {
  id: string
  label: string
  kind: 'source' | 'fuse' | 'switch' | 'load' | 'ground'
  next?: string[]
  faultHere?: 'open' | 'ok'
}

const NODES: Record<string, Node> = {
  battery: { id: 'battery', label: 'Bateria B+', kind: 'source', next: ['fuse'], faultHere: 'ok' },
  fuse: { id: 'fuse', label: 'Fusível 15A (caixa interna)', kind: 'fuse', next: ['switch'], faultHere: 'ok' },
  switch: { id: 'switch', label: 'Interruptor / relé (87)', kind: 'switch', next: ['splice'], faultHere: 'ok' },
  splice: { id: 'splice', label: 'Emenda do chicote (porta)', kind: 'switch', next: ['load'], faultHere: 'open' },
  load: { id: 'load', label: 'Lâmpada do farol', kind: 'load', next: ['ground'], faultHere: 'ok' },
  ground: { id: 'ground', label: 'Massa G101 (paralama)', kind: 'ground', faultHere: 'ok' },
}

const ORDER = ['battery', 'fuse', 'switch', 'splice', 'load', 'ground']

export default function WiringTraceSimulator({ config }: { config?: { title?: string } }) {
  const [probe, setProbe] = useState('battery')
  const [checked, setChecked] = useState(false)
  const [guess, setGuess] = useState<string | null>(null)

  const voltageAt = (id: string) => {
    const idx = ORDER.indexOf(id)
    const openIdx = ORDER.indexOf('splice')
    // Com farol "ligado": tensão até o ponto aberto; depois 0 V no lado da carga
    if (idx <= openIdx) return 12.4
    return 0
  }

  const correct = 'splice'

  return (
    <SimulatorShell
      title={config?.title ?? 'Rastreio de diagrama / chicote'}
      subtitle="Sintoma: farol não acende. Fusível íntegro. Lâmpada nova. Siga o caminho de corrente medindo tensão em cada nó."
      footer={
        <p>
          Método: comece na fonte e avance em direção à carga (ou use o método da queda de tensão). O primeiro ponto
          sem tensão após um ponto com tensão localiza o aberto.
        </p>
      }
    >
      <div className="mb-4 overflow-x-auto">
        <div className="flex min-w-[640px] items-center gap-1">
          {ORDER.map((id, i) => {
            const n = NODES[id]
            const active = probe === id
            return (
              <div key={id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setProbe(id)
                    setChecked(false)
                  }}
                  className={`rounded-lg border px-2 py-3 text-left text-xs font-semibold sm:text-sm ${
                    active
                      ? 'border-orange-600 bg-orange-600 text-white'
                      : 'border-slate-300 bg-white dark:border-slate-500 dark:bg-slate-700'
                  }`}
                  style={{ width: 100 }}
                >
                  <span className="block text-[10px] uppercase opacity-70">{n.kind}</span>
                  {n.label}
                </button>
                {i < ORDER.length - 1 && <span className="text-slate-400">→</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-900 p-5 text-center">
          <p className="text-xs text-slate-400">TENSÃO NO NÓ (farol acionado)</p>
          <p className="mt-2 font-mono text-4xl font-bold text-emerald-400">{voltageAt(probe).toFixed(1)} V</p>
          <p className="mt-2 text-sm text-slate-300">Ponta preta na massa da bateria · ponta vermelha no nó</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Onde está o circuito aberto?</p>
          <div className="flex flex-col gap-2">
            {ORDER.filter((id) => id !== 'battery' && id !== 'ground').map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setGuess(id)
                  setChecked(true)
                }}
                className={`rounded-lg border px-3 py-2 text-left text-sm font-medium ${
                  checked && guess === id
                    ? guess === correct
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-red-600 bg-red-600 text-white'
                    : 'border-slate-300 dark:border-slate-500'
                }`}
              >
                {NODES[id].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {checked && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            guess === correct
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30'
              : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30'
          }`}
        >
          <p className="font-semibold">
            {guess === correct
              ? 'Correto: aberto na emenda do chicote da porta.'
              : 'Ainda não. Observe: há ~12,4 V até a emenda e 0 V na lâmpada.'}
          </p>
          <p className="mt-2">
            Interpretação: alimentação chega ao interruptor/relé, mas não passa da emenda flexível da porta (quebra
            clássica por fadiga). Repare a emenda com solda + tubo termorretrátil adesivado ou conector adequado — nunca
            só fita isolante.
          </p>
        </div>
      )}
    </SimulatorShell>
  )
}
