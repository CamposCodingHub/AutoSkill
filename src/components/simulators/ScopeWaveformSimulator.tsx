import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type WaveId = 'ckp_ok' | 'ckp_missing' | 'injector_ok' | 'injector_open' | 'o2_lazy' | ' Ign_coil_ok'

interface Wave {
  id: string
  label: string
  system: string
  points: number[]
  diagnosis: string
  expect: string
}

const WAVES: Wave[] = [
  {
    id: 'ckp_ok',
    label: 'CKP (indutivo) — saudável',
    system: 'Sensor de rotação',
    points: [0, 1.2, -1.1, 1.3, -1.2, 1.1, -0.4, 0.2, 1.2, -1.1, 1.3, -1.2, 0],
    diagnosis: 'Amplitude simétrica e gap de dente visível. Compare com especificação do fabricante.',
    expect: 'AC, centenas de mV a alguns V; frequência sobe com RPM.',
  },
  {
    id: 'ckp_missing',
    label: 'CKP — dente / sinal perdido',
    system: 'Sensor de rotação',
    points: [0, 1.2, -1.1, 0.05, 0.02, 0.01, 0, 0.02, 1.2, -1.1, 1.3, -1.2, 0],
    diagnosis: 'Trecho “morto” no padrão. Pode ser entreferro, roda fônica danificada, conector intermitente ou blindagem.',
    expect: 'Sem padrão contínuo → sem sincronismo → falha de partida ou corte de injeção.',
  },
  {
    id: 'injector_ok',
    label: 'Injetor — comando OK',
    system: 'Atuador',
    points: [12, 12, 12, 1.2, 1.0, 1.1, 12, 12, 12, 1.2, 1.0, 12, 12],
    diagnosis: 'Queda para ~0–2 V durante o tempo de abertura (ground side switch). Meça no fio de comando, não só no B+.',
    expect: 'Pulso limpo; tempo de injeção varia com carga.',
  },
  {
    id: 'injector_open',
    label: 'Injetor — circuito aberto',
    system: 'Atuador',
    points: [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    diagnosis: 'Sinal preso em B+. Bobina aberta, conector solto ou driver da ECU sem comutar. Confirme resistência da bobina (tipicamente ~12–16 Ω em muitos MPI).',
    expect: 'Sem pulso → cilindro sem combustível → falha de cilindro.',
  },
  {
    id: 'o2_lazy',
    label: 'Sonda lambda — preguiçosa',
    system: 'Sensor O2 zirconia',
    points: [0.45, 0.48, 0.5, 0.52, 0.49, 0.47, 0.5, 0.51, 0.48, 0.5, 0.49, 0.5, 0.48],
    diagnosis: 'Sinal quase plano ~0,45–0,5 V. Sensor lento/envenenado ou aquecedor falho. Compare com comutação 0,1↔0,9 V em malha fechada.',
    expect: 'Comutação rápida em motor quente; se lazy → mistura/diagnóstico de emissões.',
  },
]

function WaveformSvg({ points }: { points: number[] }) {
  const w = 320
  const h = 120
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const d = points
    .map((y, i) => {
      const x = (i / (points.length - 1)) * (w - 20) + 10
      const yy = h - 10 - ((y - min) / span) * (h - 20)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full rounded-lg bg-slate-950" aria-hidden>
      <line x1="10" y1={h / 2} x2={w - 10} y2={h / 2} stroke="#334155" strokeWidth="1" />
      <path d={d} fill="none" stroke="#34d399" strokeWidth="2" />
    </svg>
  )
}

export default function ScopeWaveformSimulator({ config }: { config?: { title?: string } }) {
  const [waveId, setWaveId] = useState(WAVES[0].id)
  const [mode, setMode] = useState<'study' | 'quiz'>('study')
  const [guess, setGuess] = useState<string | null>(null)

  const wave = WAVES.find((w) => w.id === waveId) ?? WAVES[0]
  const quizWave = useMemo(() => WAVES[2], [])

  const active = mode === 'quiz' ? quizWave : wave

  return (
    <SimulatorShell
      title={config?.title ?? 'Osciloscópio — padrões de sinal'}
      subtitle="Reconhecer o formato da onda é tão importante quanto ler o código DTC. Compare amplitude, frequência e anomalias."
      footer={
        <p>
          Dicas: use acoplamento DC para injetores/alimentação; AC ou DC conforme o sensor; sempre massa boa;
          capture com motor nas condições do sintoma (frio/quente/carga).
        </p>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode('study')
            setGuess(null)
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            mode === 'study' ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'
          }`}
        >
          Biblioteca de padrões
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('quiz')
            setGuess(null)
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            mode === 'quiz' ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'
          }`}
        >
          Identificar onda
        </button>
      </div>

      {mode === 'study' && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold">Padrão</label>
          <select
            value={waveId}
            onChange={(e) => setWaveId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            {WAVES.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <WaveformSvg points={active.points} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-600">
          <p className="text-xs font-semibold uppercase text-slate-500">Sistema</p>
          <p className="font-medium">{active.system}</p>
          <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Expectativa</p>
          <p>{active.expect}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-600">
          {mode === 'study' ? (
            <>
              <p className="text-xs font-semibold uppercase text-slate-500">Interpretação</p>
              <p>{active.diagnosis}</p>
            </>
          ) : (
            <>
              <p className="mb-2 text-sm font-semibold">O que este traço indica?</p>
              <div className="flex flex-col gap-2">
                {WAVES.filter((w) => w.system === 'Atuador').map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setGuess(w.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm ${
                      guess === w.id
                        ? guess === quizWave.id
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-red-600 bg-red-600 text-white'
                        : 'border-slate-300 dark:border-slate-500'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
              {guess && (
                <p className="mt-2 text-sm">
                  {guess === quizWave.id
                    ? 'Correto: comando de injetor saudável (pulso a massa).'
                    : `Revise: a onda correta é “${quizWave.label}”. ${quizWave.diagnosis}`}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </SimulatorShell>
  )
}
