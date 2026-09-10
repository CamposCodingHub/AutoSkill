import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

interface Challenge {
  id: string
  title: string
  clue: string
  options: { id: string; label: string; pts: number }[]
  answer: string
  explain: string
}

const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Click / no crank',
    clue: '12,4 V em repouso; 6,8 V durante tentativa; faróis apagam no start.',
    options: [
      { id: 'battery', label: 'Bateria sem capacidade / CCA', pts: 10 },
      { id: 'starter', label: 'Motor de partida em curto', pts: 0 },
      { id: 'neutral', label: 'Inibidor de neutro', pts: 0 },
    ],
    answer: 'battery',
    explain: 'Queda severa sob partida aponta bateria fraca ou mau contato de cabo — comece por CCA e ΔV nos cabos.',
  },
  {
    id: 'c2',
    title: 'ABS offline no scanner',
    clue: 'Motor ok. Resistência CAN no OBD = 60 Ω. Sem B+ no conector do ABS.',
    options: [
      { id: 'can', label: 'Barramento CAN principal aberto', pts: 0 },
      { id: 'power', label: 'Alimentação/fusível do ABS', pts: 10 },
      { id: 'module', label: 'Módulo ABS defeituoso (só isso)', pts: 3 },
    ],
    answer: 'power',
    explain: '60 Ω sugere backbone ok. Sem B+ = fusível, relé ou chicote de alimentação.',
  },
  {
    id: 'c3',
    title: 'Farol fraco',
    clue: 'Bateria 14,2 V motor ligado. Na lâmpada: 10,9 V. Massa do farol: 1,4 V acima do negativo da bateria.',
    options: [
      { id: 'gnd', label: 'Má massa / retorno', pts: 10 },
      { id: 'alt', label: 'Alternador fraco', pts: 0 },
      { id: 'bulb', label: 'Só lâmpada fraca', pts: 2 },
    ],
    answer: 'gnd',
    explain: 'Tensão na massa da carga sob corrente é o sinal clássico de retorno ruim.',
  },
]

export default function DiagnosticCompetitionSimulator({ config }: { config?: { title?: string } }) {
  const [name, setName] = useState('Técnico')
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [board, setBoard] = useState<{ name: string; score: number }[]>([
    { name: 'Ana', score: 24 },
    { name: 'Bruno', score: 18 },
    { name: 'Cia', score: 15 },
  ])
  const [finished, setFinished] = useState(false)

  const c = CHALLENGES[idx]

  const leaderboard = useMemo(() => {
    const me = { name: name || 'Você', score }
    return [...board.filter((b) => b.name !== me.name), me].sort((a, b) => b.score - a.score).slice(0, 6)
  }, [board, name, score])

  const choose = (optId: string) => {
    if (picked) return
    setPicked(optId)
    const opt = c.options.find((o) => o.id === optId)
    const add = opt?.pts ?? 0
    setScore((s) => s + add)
  }

  const next = () => {
    if (idx >= CHALLENGES.length - 1) {
      setFinished(true)
      setBoard((b) => {
        const others = b.filter((x) => x.name !== (name || 'Você'))
        return [...others, { name: name || 'Você', score }].sort((a, b) => b.score - a.score)
      })
      return
    }
    setIdx((i) => i + 1)
    setPicked(null)
  }

  const reset = () => {
    setIdx(0)
    setScore(0)
    setPicked(null)
    setFinished(false)
  }

  return (
    <SimulatorShell
      title={config?.title ?? 'Competição de diagnóstico'}
      subtitle="Acerte a causa raiz com pistas mínimas. Pontuação local (demo de leaderboard)."
      footer={<p>Use como aquecimento em turma — o placar é local neste navegador.</p>}
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-semibold">Seu nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-500 dark:bg-slate-700"
          />
        </div>
        <p className="rounded-lg bg-slate-900 px-4 py-2 font-mono text-lg text-emerald-400">Pts: {score}</p>
      </div>

      {!finished ? (
        <>
          <p className="mb-1 text-sm font-bold text-slate-900 dark:text-slate-100">
            Desafio {idx + 1}/{CHALLENGES.length}: {c.title}
          </p>
          <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-600 dark:bg-slate-900/40">
            {c.clue}
          </p>
          <ul className="mb-4 space-y-2">
            {c.options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => choose(o.id)}
                  className={`w-full rounded-lg border px-3 py-3 text-left text-sm ${
                    picked === o.id
                      ? o.id === c.answer
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {o.label} {picked && <span className="text-xs text-slate-500">(+{o.pts})</span>}
                </button>
              </li>
            ))}
          </ul>
          {picked && (
            <div className="mb-4">
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">{c.explain}</p>
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {idx >= CHALLENGES.length - 1 ? 'Ver placar' : 'Próximo'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mb-4">
          <p className="mb-3 text-sm font-semibold">Rodada encerrada — {score} pontos.</p>
          <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-500">
            Jogar de novo
          </button>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 dark:border-slate-600">
        <p className="border-b border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-600">Leaderboard</p>
        <ol className="divide-y divide-slate-100 dark:divide-slate-700">
          {leaderboard.map((row, i) => (
            <li key={`${row.name}-${i}`} className="flex justify-between px-3 py-2 text-sm">
              <span>
                {i + 1}. {row.name}
              </span>
              <span className="font-mono font-semibold">{row.score}</span>
            </li>
          ))}
        </ol>
      </div>
    </SimulatorShell>
  )
}
