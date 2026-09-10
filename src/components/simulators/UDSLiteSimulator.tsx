import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'

type Service = '22' | '19' | '14' | '3E'

interface Pid {
  id: string
  name: string
  value: string
  unit: string
}

const PIDS: Pid[] = [
  { id: 'F190', name: 'VIN', value: '9BWZZZ377VT004251', unit: '' },
  { id: 'F187', name: 'Nº peça ECU', value: '03L906018CQ', unit: '' },
  { id: 'F1A0', name: 'SW version', value: '1037', unit: '' },
  { id: '0112', name: 'RPM (sim)', value: '820', unit: 'rpm' },
  { id: '0105', name: 'Temp. motor', value: '92', unit: '°C' },
]

const DTCS = [
  { code: 'P0301', desc: 'Falha de combustão cil. 1', freeze: 'RPM 2100 · carga 38% · ECT 88°C' },
  { code: 'U0100', desc: 'Perda comunicação com ECM', freeze: 'IG ON · bus load alto' },
  { code: 'B10A2', desc: 'Circuito sensor (BCM)', freeze: 'porta FL aberta' },
]

export default function UDSLiteSimulator({ config }: { config?: { title?: string } }) {
  const [service, setService] = useState<Service>('19')
  const [session, setSession] = useState<'default' | 'extended'>('default')
  const [dtcs, setDtcs] = useState(DTCS)
  const [log, setLog] = useState<string[]>(['ECU online · endereço 0x7E0 / resp 0x7E8'])
  const [selectedPid, setSelectedPid] = useState(PIDS[0].id)

  const pid = PIDS.find((p) => p.id === selectedPid) ?? PIDS[0]

  const response = useMemo(() => {
    if (service === '22') {
      return `Positiva: 62 ${pid.id} → ${pid.name} = ${pid.value}${pid.unit ? ' ' + pid.unit : ''}`
    }
    if (service === '19') {
      if (dtcs.length === 0) return 'Positiva: 59 02 → nenhum DTC armazenado'
      return `Positiva: 59 02 → ${dtcs.length} DTC(s): ${dtcs.map((d) => d.code).join(', ')}`
    }
    if (service === '14') {
      return session === 'extended'
        ? 'Positiva: 54 → DTCs apagados (sessão estendida)'
        : 'Negativa: 7F 14 22 → condições não corretas (use sessão estendida / IG ON)'
    }
    return 'Positiva: 7E 00 → TesterPresent OK (mantém sessão)'
  }, [service, pid, dtcs, session])

  const run = () => {
    const req =
      service === '22'
        ? `22 ${pid.id}`
        : service === '19'
          ? '19 02 FF'
          : service === '14'
            ? '14 FF FF FF'
            : '3E 00'
    setLog((l) => [`→ ${req}`, `← ${response}`, ...l].slice(0, 12))
    if (service === '14' && session === 'extended') setDtcs([])
  }

  return (
    <SimulatorShell
      title={config?.title ?? 'UDS / OBD lite'}
      subtitle="Serviços essenciais: leitura de DID (0x22), DTCs (0x19), clear (0x14) e TesterPresent (0x3E)."
      footer={
        <p>
          Freeze frame captura condições no momento da falha — use antes de apagar códigos. Clear exige condições
          corretas (muitas ECUs pedem sessão estendida).
        </p>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Sessão</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value as 'default' | 'extended')}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            <option value="default">Default (0x01)</option>
            <option value="extended">Extended (0x03)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Serviço</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value as Service)}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            <option value="19">0x19 — ReadDTCInformation</option>
            <option value="22">0x22 — ReadDataByIdentifier</option>
            <option value="14">0x14 — ClearDiagnosticInformation</option>
            <option value="3E">0x3E — TesterPresent</option>
          </select>
        </div>
      </div>

      {service === '22' && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold">DID</label>
          <select
            value={selectedPid}
            onChange={(e) => setSelectedPid(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-500 dark:bg-slate-700"
          >
            {PIDS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {service === '19' && dtcs.length > 0 && (
        <ul className="mb-4 space-y-2">
          {dtcs.map((d) => (
            <li key={d.code} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-600">
              <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{d.code}</span>
              <span className="ml-2 text-slate-800 dark:text-slate-100">{d.desc}</span>
              <p className="mt-1 text-xs text-slate-500">Freeze: {d.freeze}</p>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={run}
        className="mb-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
      >
        Enviar requisição
      </button>

      <div className="rounded-lg bg-slate-900 p-4 font-mono text-xs text-emerald-300">
        {log.map((line, i) => (
          <p key={`${line}-${i}`} className="whitespace-pre-wrap">
            {line}
          </p>
        ))}
      </div>
    </SimulatorShell>
  )
}
