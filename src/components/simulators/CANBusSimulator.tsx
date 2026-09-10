import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Fault = 'ok' | 'one_term' | 'no_term' | 'short_hl' | 'open_wire' | 'module_fault'

interface Case {
  id: Fault
  label: string
  resistanceOhm: number | null
  canH: number
  canL: number
  symptom: string
  tip: string
}

const CASES: Case[] = [
  {
    id: 'ok',
    label: 'Rede saudavel',
    resistanceOhm: 60,
    canH: 2.5,
    canL: 2.5,
    symptom: 'Comunicacao ok. Scanner le todos os modulos.',
    tip: 'Duas terminacoes de 120 Ohm em paralelo = 60 Ohm. Idle ~2,5 V / 2,5 V.',
  },
  {
    id: 'one_term',
    label: 'So 1 resistor de 120 Ohm',
    resistanceOhm: 120,
    canH: 2.5,
    canL: 2.5,
    symptom: 'Comunicacao intermitente / erros de frame.',
    tip: '120 Ohm = falta uma terminacao. Localize as extremidades do barramento.',
  },
  {
    id: 'no_term',
    label: 'Sem terminacao',
    resistanceOhm: null,
    canH: 2.5,
    canL: 2.5,
    symptom: 'Rede instavel, varios modulos offline.',
    tip: 'OL entre CAN-H e CAN-L indica ausencia de terminacao ou aberto.',
  },
  {
    id: 'short_hl',
    label: 'Curto CAN-H <-> CAN-L',
    resistanceOhm: 0.5,
    canH: 2.5,
    canL: 2.5,
    symptom: 'Bus mudo. Nenhum modulo responde.',
    tip: 'Quase 0 Ohm: chicote esmagado ou pinos em curto.',
  },
  {
    id: 'open_wire',
    label: 'Fio CAN aberto (trecho)',
    resistanceOhm: 60,
    canH: 0,
    canL: 0,
    symptom: 'Alguns modulos ok, outros sem comunicacao.',
    tip: 'Resistencia pode parecer ok no ponto errado. Verifique tensao nos conectores.',
  },
  {
    id: 'module_fault',
    label: 'Modulo puxando o barramento',
    resistanceOhm: 60,
    canH: 4.2,
    canL: 0.8,
    symptom: 'Erros constantes; um modulo suspeito.',
    tip: 'Niveis assimetricos. Desconecte modulos um a um ou use scope.',
  },
]

export default function CANBusSimulator({ config }: { config?: { title?: string } }) {
  const [fault, setFault] = useState<Fault>('ok')
  const [mode, setMode] = useState<'study' | 'blind'>('study')
  const [guess, setGuess] = useState<Fault | null>(null)
  const [test, setTest] = useState<'ohm' | 'volt'>('ohm')

  const current = CASES.find((c) => c.id === fault) ?? CASES[0]
  const display = useMemo(() => {
    if (test === 'ohm') return current.resistanceOhm === null ? 'OL' : `${current.resistanceOhm.toFixed(1)} Ohm`
    return `H ${current.canH.toFixed(1)} V · L ${current.canL.toFixed(1)} V`
  }, [current, test])

  return (
    <SimulatorShell
      title={config?.title ?? 'Simulador CAN Bus'}
      subtitle="Pratique terminacao (ohms) e niveis de tensao — testes centrais de rede."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode('study')
            setGuess(null)
            setFault('ok')
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === 'study' ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'}`}
        >
          Modo estudo
        </button>
        <button
          type="button"
          onClick={() => {
            const pool = CASES.filter((c) => c.id !== 'ok')
            setFault(pool[Math.floor(Math.random() * pool.length)].id)
            setGuess(null)
            setMode('blind')
            setTest('ohm')
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === 'blind' ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'}`}
        >
          Caso cego
        </button>
      </div>

      {mode === 'study' && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold">Condicao da rede</label>
          <select
            value={fault}
            onChange={(e) => setFault(e.target.value as Fault)}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            {CASES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setTest('ohm')}
            className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${test === 'ohm' ? 'bg-slate-800 text-white' : 'border border-slate-300 dark:border-slate-500'}`}
          >
            Ohms entre CAN-H e CAN-L (IG off)
          </button>
          <button
            type="button"
            onClick={() => setTest('volt')}
            className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${test === 'volt' ? 'bg-slate-800 text-white' : 'border border-slate-300 dark:border-slate-500'}`}
          >
            Tensao idle CAN-H / CAN-L (IG on)
          </button>
          {mode === 'blind' && <p className="mt-2 text-sm italic">{current.symptom}</p>}
        </div>
        <div className="rounded-lg bg-slate-900 p-5 text-center">
          <span className="text-xs text-slate-400">{test === 'ohm' ? 'RESISTENCIA H↔L' : 'TENSAO IDLE'}</span>
          <div className="mt-2 font-mono text-3xl font-bold text-emerald-400">{display}</div>
          <p className="mt-2 text-xs text-slate-500">Ref. saudavel: 60 Ohm · ~2,5 V / 2,5 V</p>
        </div>
      </div>

      {mode === 'blind' && (
        <div className="mb-4 flex flex-wrap gap-2">
          {CASES.filter((c) => c.id !== 'ok').map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setGuess(c.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                guess === c.id
                  ? guess === fault
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-red-600 bg-red-600 text-white'
                  : 'border-slate-300 dark:border-slate-500'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {(mode === 'study' || guess) && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-600 dark:bg-slate-900/50">
          {mode === 'blind' && guess && (
            <p className="mb-1 font-semibold">
              {guess === fault ? 'Diagnostico correto.' : `Incorreto. Era: ${current.label}.`}
            </p>
          )}
          {mode === 'study' && <p className="mb-1 font-semibold">{current.label}</p>}
          <p className="mb-1">{current.symptom}</p>
          <p>{current.tip}</p>
        </div>
      )}
    </SimulatorShell>
  )
}
