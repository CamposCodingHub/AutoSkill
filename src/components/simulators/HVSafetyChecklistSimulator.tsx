import { useState } from 'react'
import SimulatorShell from './SimulatorShell'

interface CheckItem {
  id: string
  label: string
  detail: string
  critical: boolean
}

const CHECKS: CheckItem[] = [
  {
    id: 'ppe',
    label: 'EPI classe 0 / luvas isolantes testadas + face shield',
    detail: 'Alta tensão DC (tipicamente 200–800 V+) pode ser letal. Inspeção visual das luvas antes do uso.',
    critical: true,
  },
  {
    id: 'ready',
    label: 'Verificar indicadores READY / HV e desligar o veículo',
    detail: 'Não abra capas laranja com sistema ready. Siga o manual do fabricante.',
    critical: true,
  },
  {
    id: 'service_plug',
    label: 'Remover service plug / disconnect HV e guardar sob controle',
    detail: 'Interrompe o pack. Alguns veículos exigem ferramenta e procedimento específico de espera.',
    critical: true,
  },
  {
    id: 'wait',
    label: 'Aguardar tempo de descarga dos capacitores (conforme OEM)',
    detail: 'Inversores armazenam carga. Tempo típico 5–15+ min — nunca “achismo”.',
    critical: true,
  },
  {
    id: 'verify_zero',
    label: 'Verificar 0 V (ou abaixo do limite OEM) nos pontos indicados',
    detail: 'Use CAT III/IV e pontas adequadas. Sem verificação, não há LOTO completo.',
    critical: true,
  },
  {
    id: 'lockout',
    label: 'Lockout/tagout — impedir reenergização por terceiros',
    detail: 'Placa, cadeado no plug, comunicação na oficina.',
    critical: true,
  },
  {
    id: 'isolation',
    label: 'Teste de isolamento / PIDs de isolation resistance quando aplicável',
    detail: 'Queda de isolamento gera DTC e risco. Compare com especificação (ex.: MΩ).',
    critical: false,
  },
  {
    id: 'orange',
    label: 'Respeitar cabos e conectores laranja — nunca furar / grampear',
    detail: 'Chicote HV é identificado. Reparo improvisado é inaceitável.',
    critical: true,
  },
]

export default function HVSafetyChecklistSimulator({ config }: { config?: { title?: string } }) {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  const criticalOk = CHECKS.filter((c) => c.critical).every((c) => done[c.id])
  const allOk = CHECKS.every((c) => done[c.id])
  const progress = CHECKS.filter((c) => done[c.id]).length

  return (
    <SimulatorShell
      title={config?.title ?? 'Segurança HV — checklist LOTO'}
      subtitle="Antes de qualquer intervenção em híbrido/elétrico: procedimento de desenergização. Esta lista treina a disciplina — o manual do veículo prevalece."
      footer={
        <p>
          AutoSkill reforça segurança: técnico vivo e protegido aprende mais. Em dúvida, não prossiga e consulte o OEM /
          supervisor.
        </p>
      }
    >
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
        Progresso: {progress}/{CHECKS.length}
      </p>
      <ul className="space-y-2">
        {CHECKS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-600">
              <input
                type="checkbox"
                className="mt-1"
                checked={!!done[item.id]}
                onChange={(e) => {
                  setSubmitted(false)
                  setDone((d) => ({ ...d, [item.id]: e.target.checked }))
                }}
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.label}
                  {item.critical && (
                    <span className="ml-2 text-[10px] font-bold uppercase text-red-600">crítico</span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">{item.detail}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setSubmitted(true)}
        className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Validar procedimento
      </button>

      {submitted && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            criticalOk
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30'
              : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30'
          }`}
        >
          {!criticalOk && (
            <p className="font-semibold">Não liberado. Itens críticos pendentes — risco inaceitável.</p>
          )}
          {criticalOk && !allOk && (
            <p className="font-semibold">
              Mínimo crítico ok, mas complete isolamento/verificações recomendadas antes de serviço profundo.
            </p>
          )}
          {allOk && (
            <p className="font-semibold">
              Checklist completo. Ainda assim: siga o manual do veículo e revalide 0 V antes do toque em condutores HV.
            </p>
          )}
        </div>
      )}
    </SimulatorShell>
  )
}
