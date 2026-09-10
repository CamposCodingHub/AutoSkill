import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Step = 'idle' | 'identify' | 'session' | 'security' | 'erase' | 'flash' | 'verify' | 'done'
type Fault = 'ok' | 'wrong_part' | 'security_fail' | 'voltage_drop' | 'abort'

const FLOW: { id: Step; label: string }[] = [
  { id: 'identify', label: '1. Identificar ECU (HW/SW)' },
  { id: 'session', label: '2. Sessão de programação' },
  { id: 'security', label: '3. Security access' },
  { id: 'erase', label: '4. Erase memória' },
  { id: 'flash', label: '5. Transfer Data (flash)' },
  { id: 'verify', label: '6. Verificar / checksum' },
  { id: 'done', label: '7. Pós-flash (coding/adaptação)' },
]

export default function FlashCodingSandboxSimulator({ config }: { config?: { title?: string } }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [fault, setFault] = useState<Fault>('ok')
  const [batteryV, setBatteryV] = useState(13.8)
  const [log, setLog] = useState<string[]>(['Sandbox educacional — não é ferramenta OEM real.'])

  const step = FLOW[stepIdx] ?? FLOW[0]

  const blockReason = useMemo(() => {
    if (fault === 'wrong_part' && stepIdx >= 0) return 'HW incompatível com o arquivo selecionado'
    if (fault === 'security_fail' && stepIdx >= 2) return 'Security access negado (chave/seed errados)'
    if ((fault === 'voltage_drop' || batteryV < 12.5) && stepIdx >= 3) {
      return 'Tensão instável — risco de brick (use fonte/carregador)'
    }
    if (fault === 'abort' && stepIdx >= 4) return 'Transferência abortada — reinicie fluxo OEM'
    return null
  }, [fault, stepIdx, batteryV])

  const advance = () => {
    if (blockReason) {
      setLog((l) => [`FALHA: ${blockReason}`, ...l].slice(0, 10))
      return
    }
    setLog((l) => [`OK: ${step.label}`, ...l].slice(0, 10))
    setStepIdx((i) => Math.min(i + 1, FLOW.length - 1))
  }

  const reset = () => {
    setStepIdx(0)
    setLog(['Fluxo reiniciado.'])
  }

  return (
    <SimulatorShell
      title={config?.title ?? 'Sandbox de flash / coding'}
      subtitle="Fluxo educativo de reprogramação. Em produção: ferramenta OEM, fonte estável e procedimento oficial."
      footer={
        <p>
          Coding ≠ flash: coding ajusta parâmetros; flash troca firmware. Ambos exigem identificação correta e energia
          estável.
        </p>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Cenário</label>
          <select
            value={fault}
            onChange={(e) => {
              setFault(e.target.value as Fault)
              reset()
            }}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            <option value="ok">Flash bem-sucedido</option>
            <option value="wrong_part">Arquivo / HW errado</option>
            <option value="security_fail">Falha de security</option>
            <option value="voltage_drop">Queda de tensão no flash</option>
            <option value="abort">Abort no Transfer Data</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Tensão suporte (V)</label>
          <input
            type="number"
            step={0.1}
            value={batteryV}
            onChange={(e) => setBatteryV(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          />
        </div>
      </div>

      <ol className="mb-4 space-y-2">
        {FLOW.map((f, i) => (
          <li
            key={f.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              i === stepIdx
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : i < stepIdx
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : 'border-slate-200 dark:border-slate-600'
            }`}
          >
            {f.label}
          </li>
        ))}
      </ol>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={advance}
          disabled={stepIdx >= FLOW.length - 1 && !blockReason}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Executar passo
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-500"
        >
          Reiniciar
        </button>
      </div>

      {blockReason && (
        <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
          {blockReason}
        </p>
      )}

      <div className="rounded-lg bg-slate-900 p-4 font-mono text-xs text-emerald-300">
        {log.map((line, i) => (
          <p key={`${line}-${i}`}>{line}</p>
        ))}
      </div>
    </SimulatorShell>
  )
}
