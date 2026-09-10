import { useEffect, useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Fault = 'ok' | 'error_frames' | 'bus_off' | 'missing_id' | 'flood'

interface Frame {
  t: number
  id: string
  dlc: number
  data: string
  note: string
}

const BASE_IDS = [
  { id: '0x0A0', label: 'ABS status' },
  { id: '0x120', label: 'ECM torque' },
  { id: '0x1F0', label: 'Cluster' },
  { id: '0x2A5', label: 'BCM doors' },
]

function randomData(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' ')
}

export default function CANTrafficViewerSimulator({ config }: { config?: { title?: string } }) {
  const [fault, setFault] = useState<Fault>('ok')
  const [running, setRunning] = useState(true)
  const [frames, setFrames] = useState<Frame[]>([])
  const [filter, setFilter] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!running) return undefined
    const id = window.setInterval(() => setTick((t) => t + 1), 600)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!running) return
    setFrames((prev) => {
      const next: Frame[] = []
      const t = Date.now() % 100000

      if (fault === 'bus_off') {
        next.push({ t, id: '—', dlc: 0, data: '', note: 'BUS-OFF — sem tráfego' })
      } else if (fault === 'flood') {
        for (let i = 0; i < 4; i++) {
          next.push({
            t: t + i,
            id: '0x7FF',
            dlc: 8,
            data: randomData(8),
            note: 'Flood / erro de prioridade',
          })
        }
      } else {
        for (const b of BASE_IDS) {
          if (fault === 'missing_id' && b.id === '0x0A0') continue
          const err = fault === 'error_frames' && Math.random() > 0.6
          next.push({
            t,
            id: b.id,
            dlc: err ? 0 : 8,
            data: err ? '' : randomData(8),
            note: err ? 'Error frame' : b.label,
          })
        }
      }

      return [...next, ...prev].slice(0, 40)
    })
  }, [tick, running, fault])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return frames
    return frames.filter((f) => f.id.toLowerCase().includes(q) || f.note.toLowerCase().includes(q))
  }, [frames, filter])

  const stats = useMemo(() => {
    const errors = frames.filter((f) => f.note.toLowerCase().includes('error') || f.note.includes('BUS-OFF')).length
    const ids = new Set(frames.map((f) => f.id).filter((id) => id !== '—'))
    return { errors, ids: ids.size, total: frames.length }
  }, [frames])

  return (
    <SimulatorShell
      title={config?.title ?? 'CAN traffic viewer'}
      subtitle="Visualize IDs, DLC e anomalias (error frames, bus-off, ID ausente)."
      footer={
        <p>
          Tráfego real exige interface CAN. Aqui o foco é reconhecer padrões: ID sumindo, bus-off e flood de erros.
        </p>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={fault}
          onChange={(e) => {
            setFault(e.target.value as Fault)
            setFrames([])
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-700"
        >
          <option value="ok">Rede normal</option>
          <option value="error_frames">Error frames intermitentes</option>
          <option value="bus_off">Bus-off</option>
          <option value="missing_id">ID ABS ausente</option>
          <option value="flood">Flood / saturação</option>
        </select>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white"
        >
          {running ? 'Pausar' : 'Retomar'}
        </button>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar ID / nota"
          className="min-w-[10rem] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-700"
        />
      </div>

      <p className="mb-2 text-xs text-slate-500">
        Frames: {stats.total} · IDs únicos: {stats.ids} · Anomalias: {stats.errors}
      </p>

      <div className="max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-600">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900">
            <tr>
              <th className="px-2 py-2">t</th>
              <th className="px-2 py-2">ID</th>
              <th className="px-2 py-2">DLC</th>
              <th className="px-2 py-2">Data</th>
              <th className="px-2 py-2">Nota</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {filtered.map((f, i) => (
              <tr key={`${f.t}-${f.id}-${i}`} className="border-t border-slate-100 dark:border-slate-700">
                <td className="px-2 py-1 text-slate-500">{f.t}</td>
                <td className="px-2 py-1 font-semibold">{f.id}</td>
                <td className="px-2 py-1">{f.dlc}</td>
                <td className="px-2 py-1">{f.data || '—'}</td>
                <td className="px-2 py-1 text-slate-600 dark:text-slate-300">{f.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SimulatorShell>
  )
}
