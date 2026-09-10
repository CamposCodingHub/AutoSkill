import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Topology = 'series' | 'parallel'
type Fault = 'ok' | 'high_r' | 'open' | 'short'

interface Segment {
  id: string
  label: string
  baseOhm: number
}

const SEGMENTS: Segment[] = [
  { id: 'bat', label: 'Cabo B+ / borne', baseOhm: 0.02 },
  { id: 'fuse', label: 'Fusível / porta-fusível', baseOhm: 0.01 },
  { id: 'sw', label: 'Interruptor / relé', baseOhm: 0.05 },
  { id: 'load', label: 'Carga (lâmpada / motor)', baseOhm: 2.4 },
  { id: 'gnd', label: 'Retorno / massa', baseOhm: 0.03 },
]

const FAULT_LABELS: Record<Fault, string> = {
  ok: 'Sem falha',
  high_r: 'Alta resistência (conexão ruim)',
  open: 'Aberto (circuito interrompido)',
  short: 'Curto para massa antes da carga',
}

export default function CurrentPathSimulator({ config }: { config?: { title?: string } }) {
  const [topology, setTopology] = useState<Topology>('series')
  const [faultSeg, setFaultSeg] = useState('sw')
  const [fault, setFault] = useState<Fault>('ok')
  const [supplyV] = useState(12.6)

  const result = useMemo(() => {
    const segs = SEGMENTS.map((s) => {
      let r = s.baseOhm
      if (s.id === faultSeg) {
        if (fault === 'high_r') r = s.id === 'load' ? 8 : 1.8
        if (fault === 'open') r = Infinity
        if (fault === 'short' && s.id !== 'load' && s.id !== 'gnd') r = 0.002
      }
      return { ...s, r }
    })

    if (fault === 'short' && faultSeg !== 'load' && faultSeg !== 'gnd') {
      const beforeLoad = segs.filter((s) => s.id !== 'load' && s.id !== 'gnd')
      const rPath = beforeLoad.reduce((a, s) => a + (Number.isFinite(s.r) ? s.r : 0), 0) + 0.002
      const i = supplyV / Math.max(rPath, 0.001)
      return {
        segs,
        currentA: Math.min(i, 80),
        loadV: 0,
        status: 'Curto: corrente alta, carga sem tensão útil',
        ok: false,
      }
    }

    if (segs.some((s) => !Number.isFinite(s.r))) {
      return { segs, currentA: 0, loadV: 0, status: 'Circuito aberto — corrente zero', ok: false }
    }

    if (topology === 'series') {
      const rTotal = segs.reduce((a, s) => a + s.r, 0)
      const i = supplyV / rTotal
      const load = segs.find((s) => s.id === 'load')!
      const loadV = i * load.r
      const highDrop = segs.some((s) => s.id !== 'load' && i * s.r > 0.5)
      return {
        segs,
        currentA: i,
        loadV,
        status: highDrop
          ? 'Queda excessiva no caminho — carga subalimentada'
          : 'Caminho série saudável',
        ok: !highDrop && loadV > 11,
      }
    }

    // paralelo simplificado: carga vs ramo de retorno compartilhado
    const loadR = segs.find((s) => s.id === 'load')!.r
    const pathR = segs.filter((s) => s.id !== 'load').reduce((a, s) => a + s.r, 0)
    const rEq = 1 / (1 / loadR + 1 / Math.max(pathR * 40, 0.1))
    const i = supplyV / (pathR + rEq)
    const loadV = supplyV - i * pathR
    return {
      segs,
      currentA: i,
      loadV,
      status: loadV > 11 ? 'Paralelo: carga recebe tensão adequada' : 'Queda no caminho comum afeta o ramo',
      ok: loadV > 11,
    }
  }, [topology, faultSeg, fault, supplyV])

  return (
    <SimulatorShell
      title={config?.title ?? 'Caminho de corrente — falhas compostas'}
      subtitle="Siga a corrente do positivo à massa. Falhas em série somam queda; curto/desvio tiram energia da carga."
      footer={
        <p>
          Na oficina: meça tensão sob carga em cada segmento. Queda &gt; 0,1–0,5 V em cabo/conexão costuma indicar
          problema — a carga “parece fraca” mas a bateria está boa.
        </p>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Topologia</label>
          <select
            value={topology}
            onChange={(e) => setTopology(e.target.value as Topology)}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            <option value="series">Série (caminho único)</option>
            <option value="parallel">Paralelo (ramos)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Segmento com falha</label>
          <select
            value={faultSeg}
            onChange={(e) => setFaultSeg(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            {SEGMENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold">Tipo de falha</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FAULT_LABELS) as Fault[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFault(f)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                fault === f ? 'bg-orange-600 text-white' : 'border border-slate-300 dark:border-slate-500'
              }`}
            >
              {FAULT_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <ol className="mb-4 space-y-2">
        {result.segs.map((s, idx) => {
          const drop = Number.isFinite(s.r) && result.currentA > 0 ? result.currentA * s.r : 0
          return (
            <li
              key={s.id}
              className={`rounded-lg border p-3 text-sm ${
                s.id === faultSeg && fault !== 'ok'
                  ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/20'
                  : 'border-slate-200 dark:border-slate-600'
              }`}
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {idx + 1}. {s.label}
              </span>
              <span className="mt-1 block font-mono text-xs text-slate-600 dark:text-slate-300">
                R ≈ {Number.isFinite(s.r) ? `${s.r.toFixed(3)} Ω` : 'OL'} · ΔV ≈{' '}
                {Number.isFinite(s.r) ? `${drop.toFixed(2)} V` : '—'}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="rounded-lg bg-slate-900 p-5 text-center">
        <p className="font-mono text-3xl font-bold text-emerald-400">{result.currentA.toFixed(2)} A</p>
        <p className="mt-1 font-mono text-xl text-sky-300">Carga: {result.loadV.toFixed(2)} V</p>
        <p className={`mt-2 text-sm ${result.ok ? 'text-emerald-300' : 'text-amber-300'}`}>{result.status}</p>
      </div>
    </SimulatorShell>
  )
}
