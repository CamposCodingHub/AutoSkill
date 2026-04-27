import OhmLawCalculator from './OhmLawCalculator'
import VoltageDropSimulator from './VoltageDropSimulator'
import PowerSimulator from './PowerSimulator'
import PowerCalculator from './PowerCalculator'

interface SimulatorRendererProps {
    name: string
    config?: any
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
        default:
            return <div className="text-red-500">Simulador desconhecido: {name}</div>
    }
}