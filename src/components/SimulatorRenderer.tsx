import OhmLawCalculator from './OhmLawCalculator'
import VoltageDropSimulator from './VoltageDropSimulator'

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
        default:
            return <div className="text-red-500">Simulador desconhecido: {name}</div>
    }
}