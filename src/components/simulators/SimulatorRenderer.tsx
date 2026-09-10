import OhmLawCalculator from './OhmLawCalculator'
import VoltageDropSimulator from './VoltageDropSimulator'
import PowerSimulator from './PowerSimulator'
import PowerCalculator from './PowerCalculator'
import CircuitFaultSimulator from './CircuitFaultSimulator'
import MultimeterPracticeSimulator from './MultimeterPracticeSimulator'
import BatteryChargeSimulator from './BatteryChargeSimulator'
import CANBusSimulator from './CANBusSimulator'
import ParasiticDrawSimulator from './ParasiticDrawSimulator'
import WiringTraceSimulator from './WiringTraceSimulator'
import ScopeWaveformSimulator from './ScopeWaveformSimulator'
import RelayCircuitSimulator from './RelayCircuitSimulator'
import DiagnosticCasePlayer from './DiagnosticCasePlayer'
import HVSafetyChecklistSimulator from './HVSafetyChecklistSimulator'
import StarterCurrentSimulator from './StarterCurrentSimulator'
import CurrentPathSimulator from './CurrentPathSimulator'
import PowerUpSequenceSimulator from './PowerUpSequenceSimulator'
import UDSLiteSimulator from './UDSLiteSimulator'
import DailyMicroCaseSimulator from './DailyMicroCaseSimulator'
import HVIsolationMeterSimulator from './HVIsolationMeterSimulator'
import FlashCodingSandboxSimulator from './FlashCodingSandboxSimulator'
import CANTrafficViewerSimulator from './CANTrafficViewerSimulator'
import OficinaBRSimulator from './OficinaBRSimulator'
import TutorRAGLiteSimulator from './TutorRAGLiteSimulator'
import DiagnosticCompetitionSimulator from './DiagnosticCompetitionSimulator'
import ProfessorModeSimulator from './ProfessorModeSimulator'
import ASEA6ExamSimulator from './ASEA6ExamSimulator'

interface SimulatorRendererProps {
  name: string
  config?: { title?: string; [key: string]: unknown }
}

export default function SimulatorRenderer({ name, config }: SimulatorRendererProps) {
  switch (name) {
    case 'OhmLawCalculator':
      return <OhmLawCalculator />
    case 'VoltageDropSimulator':
      return <VoltageDropSimulator />
    case 'PowerSimulator':
      return <PowerSimulator config={config} />
    case 'PowerCalculator':
      return <PowerCalculator />
    case 'CircuitFaultSimulator':
      return <CircuitFaultSimulator config={config} />
    case 'MultimeterPracticeSimulator':
      return <MultimeterPracticeSimulator config={config} />
    case 'BatteryChargeSimulator':
      return <BatteryChargeSimulator config={config} />
    case 'CANBusSimulator':
      return <CANBusSimulator config={config} />
    case 'ParasiticDrawSimulator':
      return <ParasiticDrawSimulator config={config} />
    case 'WiringTraceSimulator':
      return <WiringTraceSimulator config={config} />
    case 'ScopeWaveformSimulator':
      return <ScopeWaveformSimulator config={config} />
    case 'RelayCircuitSimulator':
      return <RelayCircuitSimulator config={config} />
    case 'DiagnosticCasePlayer':
      return <DiagnosticCasePlayer config={config} />
    case 'HVSafetyChecklistSimulator':
      return <HVSafetyChecklistSimulator config={config} />
    case 'StarterCurrentSimulator':
      return <StarterCurrentSimulator config={config} />
    case 'CurrentPathSimulator':
      return <CurrentPathSimulator config={config} />
    case 'PowerUpSequenceSimulator':
      return <PowerUpSequenceSimulator config={config} />
    case 'UDSLiteSimulator':
      return <UDSLiteSimulator config={config} />
    case 'DailyMicroCaseSimulator':
      return <DailyMicroCaseSimulator config={config} />
    case 'HVIsolationMeterSimulator':
      return <HVIsolationMeterSimulator config={config} />
    case 'FlashCodingSandboxSimulator':
      return <FlashCodingSandboxSimulator config={config} />
    case 'CANTrafficViewerSimulator':
      return <CANTrafficViewerSimulator config={config} />
    case 'OficinaBRSimulator':
      return <OficinaBRSimulator config={config} />
    case 'TutorRAGLiteSimulator':
      return <TutorRAGLiteSimulator config={config} />
    case 'DiagnosticCompetitionSimulator':
      return <DiagnosticCompetitionSimulator config={config} />
    case 'ProfessorModeSimulator':
      return <ProfessorModeSimulator config={config} />
    case 'ASEA6ExamSimulator':
      return <ASEA6ExamSimulator config={config} />
    default:
      return (
        <div className="my-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
          Simulador não registrado: <code>{name}</code>. Avise o time de conteúdo.
        </div>
      )
  }
}
