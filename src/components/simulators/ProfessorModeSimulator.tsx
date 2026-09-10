import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Demo = 'vd' | 'parasite' | 'can' | 'hv'

const DEMOS: {
  id: Demo
  title: string
  talkTrack: string[]
  checkpoints: string[]
  pitfall: string
}[] = [
  {
    id: 'vd',
    title: 'Queda de tensão sob carga',
    talkTrack: [
      'Mostre bateria boa em repouso.',
      'Acione a carga e meça na lâmpada/componente.',
      'Separe ΔV no positivo vs ΔV na massa.',
    ],
    checkpoints: ['Alunos medem com carga ligada', 'Registram ΔV < 0,5 V como meta típica (cabos)'],
    pitfall: 'Medir só em repouso — esconde resistência de conexão.',
  },
  {
    id: 'parasite',
    title: 'Consumo parasita',
    talkTrack: [
      'Explique sleep e tempo de espera.',
      'Demonstre leitura em mA após sleep.',
      'Isole por fusível sem “acordar” o veículo à toa.',
    ],
    checkpoints: ['Aluno espera sleep', 'Anota mA e fusível que derruba'],
    pitfall: 'Medir com módulos acordados e concluir “está alto”.',
  },
  {
    id: 'can',
    title: 'Rede CAN',
    talkTrack: [
      'Resistência 60 Ω com procedimento correto.',
      'Tensões idle ~2,5 V.',
      'Contraste com módulo offline por falta de alimentação.',
    ],
    checkpoints: ['Diferenciar backbone vs stub', 'Não trocar módulo sem B+/massa'],
    pitfall: 'Assumir que 60 Ω no OBD valida todos os ramos.',
  },
  {
    id: 'hv',
    title: 'Segurança HV (demo sem energizar)',
    talkTrack: [
      'Checklist LOTO antes de qualquer “simulação prática”.',
      'Identificar cabos laranja e service plug.',
      'Reforçar: medição de isolamento só após 0 V.',
    ],
    checkpoints: ['EPI citado', 'Ninguém “pula” etapa de verificação 0 V'],
    pitfall: 'Tratar HV como 12 V comum.',
  },
]

export default function ProfessorModeSimulator({ config }: { config?: { title?: string } }) {
  const [demo, setDemo] = useState<Demo>('vd')
  const [step, setStep] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const d = DEMOS.find((x) => x.id === demo) ?? DEMOS[0]
  const talk = d.talkTrack[step] ?? d.talkTrack[0]

  const progress = useMemo(() => d.checkpoints.filter((c) => checked[c]).length, [d, checked])

  return (
    <SimulatorShell
      title={config?.title ?? 'Modo professor (demo)'}
      subtitle="Roteiro de aula rápida: fala → checkpoint → armadilha comum."
      footer={<p>Use em projeção: avance o talk-track e marque o que a turma já demonstrou.</p>}
    >
      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold">Demo</label>
        <select
          value={demo}
          onChange={(e) => {
            setDemo(e.target.value as Demo)
            setStep(0)
            setChecked({})
          }}
          className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
        >
          {DEMOS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
          Talk-track {step + 1}/{d.talkTrack.length}
        </p>
        <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{talk}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={step <= 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-500"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={step >= d.talkTrack.length - 1}
            onClick={() => setStep((s) => Math.min(d.talkTrack.length - 1, s + 1))}
            className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Próximo
          </button>
        </div>
      </div>

      <p className="mb-2 text-sm font-semibold">
        Checkpoints da turma ({progress}/{d.checkpoints.length})
      </p>
      <ul className="mb-4 space-y-2">
        {d.checkpoints.map((c) => (
          <li key={c}>
            <label className="flex cursor-pointer gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-600">
              <input
                type="checkbox"
                checked={!!checked[c]}
                onChange={(e) => setChecked((prev) => ({ ...prev, [c]: e.target.checked }))}
              />
              {c}
            </label>
          </li>
        ))}
      </ul>

      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
        <span className="font-semibold">Armadilha comum: </span>
        {d.pitfall}
      </p>
    </SimulatorShell>
  )
}
