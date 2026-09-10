import { useState } from 'react'
import SimulatorShell from './SimulatorShell'

interface Step {
  id: string
  prompt: string
  options: { id: string; label: string; correct: boolean; feedback: string }[]
}

const CASE = {
  title: 'Não parte — apenas clique no relé de partida',
  complaint:
    'Cliente: ao girar a chave, ouve-se um clique, mas o motor não gira. Faróis ok com IG on. Aconteceu após ficar 4 dias parado.',
  steps: [
    {
      id: 's1',
      prompt: 'Qual a primeira medição mais eficiente?',
      options: [
        {
          id: 'a',
          label: 'Trocar o motor de partida imediatamente',
          correct: false,
          feedback: 'Troca prematura. Sem medições você pode substituir peça boa.',
        },
        {
          id: 'b',
          label: 'Tensão da bateria em repouso e durante a tentativa de partida',
          correct: true,
          feedback: 'Correto. Separar bateria fraca de problema de cabo/arranque começa pela tensão sob carga.',
        },
        {
          id: 'c',
          label: 'Apagar DTCs do abs sem ler',
          correct: false,
          feedback: 'Irrelevante para “click / no crank” neste momento.',
        },
      ],
    },
    {
      id: 's2',
      prompt: 'Repouso 12,1 V; na partida cai para 7,8 V no borne da bateria. Próximo passo?',
      options: [
        {
          id: 'a',
          label: 'Condenar só o alternador',
          correct: false,
          feedback: 'Alternador não explica queda severa na partida com motor off.',
        },
        {
          id: 'b',
          label: 'Teste de carga/CCA da bateria e inspeção de terminais',
          correct: true,
          feedback: 'Correto. 12,1 V já indica baixa SOC; 7,8 V sob tentativa confirma incapacidade de entregar corrente.',
        },
        {
          id: 'c',
          label: 'Substituir a ECU do motor',
          correct: false,
          feedback: 'Sem evidência. ECU raramente causa só “click” com queda tão grande nos bornes.',
        },
      ],
    },
    {
      id: 's3',
      prompt:
        'Bateria nova instalada: repouso 12,7 V. Ainda há click. No borne do solenóide há só 8,5 V durante o comando, e VD no cabo positivo é 3,2 V. Conclusão?',
      options: [
        {
          id: 'a',
          label: 'Cabo/terminal de alimentação com alta resistência — reparar caminho de potência',
          correct: true,
          feedback:
            'Correto. Queda de 3,2 V no positivo sob corrente de partida é inaceitável. O clique pode ser solenóide sem corrente suficiente no motor.',
        },
        {
          id: 'b',
          label: 'Sensor CKP com certeza',
          correct: false,
          feedback: 'CKP costuma gerar “crank but no start”, não “no crank” com VD alto no cabo.',
        },
        {
          id: 'c',
          label: 'Rede CAN sem terminação',
          correct: false,
          feedback: 'Pode causar outros sintomas; não explica VD de 3,2 V no cabo de partida.',
        },
      ],
    },
  ] as Step[],
}

export default function DiagnosticCasePlayer({ config }: { config?: { title?: string } }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const step = CASE.steps[stepIdx]

  const choose = (opt: Step['options'][number]) => {
    setFeedback(opt.feedback)
    if (opt.correct) {
      setCorrectCount((c) => c + 1)
      if (stepIdx >= CASE.steps.length - 1) {
        setDone(true)
      } else {
        setTimeout(() => {
          setStepIdx((i) => i + 1)
          setFeedback(null)
        }, 700)
      }
    }
  }

  const reset = () => {
    setStepIdx(0)
    setFeedback(null)
    setCorrectCount(0)
    setDone(false)
  }

  return (
    <SimulatorShell
      title={config?.title ?? CASE.title}
      subtitle={CASE.complaint}
      footer={
        <p>
          Objetivo: pensar como mestre de oficina — evidência antes de peça. Documente tensões e quedas no orçamento;
          isso educa o cliente e reduz retrabalho.
        </p>
      }
    >
      {!done ? (
        <>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Etapa {stepIdx + 1} de {CASE.steps.length}
          </p>
          <p className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">{step.prompt}</p>
          <div className="flex flex-col gap-2">
            {step.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(opt)}
                className="rounded-lg border border-slate-300 px-3 py-3 text-left text-sm font-medium hover:border-orange-500 dark:border-slate-500"
              >
                {opt.label}
              </button>
            ))}
          </div>
          {feedback && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-600 dark:bg-slate-900/50">
              {feedback}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900/30">
          <p className="font-semibold">Caso concluído</p>
          <p className="mt-2 text-sm">
            Você aplicou a sequência correta: tensão sob carga → saúde da bateria → voltage drop no cabo de potência.
            Acertos nesta passagem: {correctCount} (inclui tentativas corretas por etapa).
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Refazer caso
          </button>
        </div>
      )}
    </SimulatorShell>
  )
}
