import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

interface MicroCase {
  id: string
  title: string
  symptom: string
  options: { id: string; label: string; correct: boolean; why: string }[]
}

const CASES: MicroCase[] = [
  {
    id: 'vd',
    title: 'Farol fraco só no baixo',
    symptom: 'Bateria 12,6 V. Farol alto ok; baixo amarelado. Conector do farol quente.',
    options: [
      { id: 'a', label: 'Trocar a lâmpada imediatamente', correct: false, why: 'Pode ser queda no chicote — meça antes.' },
      { id: 'b', label: 'Medir tensão na lâmpada sob carga e ΔV no positivo/massa', correct: true, why: 'Confirma se a energia chega; conector quente = resistência.' },
      { id: 'c', label: 'Trocar o alternador', correct: false, why: 'Sintoma é localizado; alternador é improvável.' },
    ],
  },
  {
    id: 'parasite',
    title: 'Bateria descarrega em 3 dias',
    symptom: 'Carro ok ao dirigir. Após 3 dias parado, não parte. CCA ainda aceitável.',
    options: [
      { id: 'a', label: 'Medir consumo parasita após sleep e isolar por fusível', correct: true, why: 'Procedimento padrão para drain.' },
      { id: 'b', label: 'Só carregar e devolver', correct: false, why: 'Volta o problema; não achou a causa.' },
      { id: 'c', label: 'Trocar motor de partida', correct: false, why: 'Não explica descarga em estacionamento.' },
    ],
  },
  {
    id: 'can',
    title: 'Scanner não fala com ABS',
    symptom: 'Motor e câmbio ok no scanner. ABS/airbag offline. Resistência CAN 60 Ω no OBD.',
    options: [
      { id: 'a', label: 'Trocar módulo ABS sem medir', correct: false, why: 'Pode ser alimentação, massa ou stub CAN.' },
      { id: 'b', label: 'Verificar B+/IG/massa do ABS e continuidade do stub CAN', correct: true, why: '60 Ω no OBD não prova o ramo do ABS.' },
      { id: 'c', label: 'Apagar DTCs de motor', correct: false, why: 'Não restaura comunicação com ABS.' },
    ],
  },
  {
    id: 'relay',
    title: 'Ventoinha não liga',
    symptom: 'ECT alta, comando do módulo presente no diagrama. Clique no relé às vezes.',
    options: [
      { id: 'a', label: 'Medir bobina e contatos do relé sob carga; depois alimentação da ventoinha', correct: true, why: 'Separa relé, fusível e motor da ventoinha.' },
      { id: 'b', label: 'Trocar sensor ECT primeiro', correct: false, why: 'Comando já existe — foque no atuador.' },
      { id: 'c', label: 'Ignorar e completar líquido', correct: false, why: 'Risco de superaquecimento.' },
    ],
  },
]

function todayIndex() {
  const day = Math.floor(Date.now() / 86_400_000)
  return day % CASES.length
}

export default function DailyMicroCaseSimulator({ config }: { config?: { title?: string } }) {
  const [idx, setIdx] = useState(todayIndex)
  const [picked, setPicked] = useState<string | null>(null)
  const c = CASES[idx]

  const feedback = useMemo(() => {
    if (!picked) return null
    return c.options.find((o) => o.id === picked) ?? null
  }, [picked, c])

  return (
    <SimulatorShell
      title={config?.title ?? 'Microcaso do dia'}
      subtitle="Treino rápido de raciocínio diagnóstico — um sintoma, uma melhor próxima ação."
      footer={<p>Gire os casos para variar. Na vida real, confirme com medição — nunca só por “achismo”.</p>}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Caso {idx + 1}/{CASES.length}: {c.title}
        </p>
        <button
          type="button"
          onClick={() => {
            setIdx((i) => (i + 1) % CASES.length)
            setPicked(null)
          }}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-500"
        >
          Próximo caso
        </button>
      </div>

      <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200">
        {c.symptom}
      </p>

      <p className="mb-2 text-sm font-semibold">Melhor próxima ação:</p>
      <ul className="space-y-2">
        {c.options.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              onClick={() => setPicked(o.id)}
              className={`w-full rounded-lg border px-3 py-3 text-left text-sm ${
                picked === o.id
                  ? o.correct
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-slate-200 dark:border-slate-600'
              }`}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>

      {feedback && (
        <p
          className={`mt-4 rounded-lg p-3 text-sm ${
            feedback.correct
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
              : 'bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100'
          }`}
        >
          {feedback.correct ? 'Correto. ' : 'Não é o melhor passo. '}
          {feedback.why}
        </p>
      )}
    </SimulatorShell>
  )
}
