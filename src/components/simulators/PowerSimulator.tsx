import { useState } from 'react'

interface PowerSimulatorProps {
    config?: {
        defaultPower?: number
        defaultVoltage?: number
        title?: string
    }
}

export default function PowerSimulator({ config }: PowerSimulatorProps) {
    const [power, setPower] = useState(config?.defaultPower || 110)
    const [voltage, setVoltage] = useState(config?.defaultVoltage || 12)

    const current = power / voltage
    const fuseValues = [5, 7.5, 10, 15, 20, 25, 30, 35, 40, 50, 60]
    const recommendedFuse = fuseValues.find(f => f >= current * 1.25) || 60
    let gauge = '1,5 mm²'
    if (current > 15) gauge = '2,5 mm²'
    if (current > 25) gauge = '4,0 mm²'
    if (current > 40) gauge = '6,0 mm²'

    return (
        <div className="border-2 border-green-200 rounded-xl p-6 my-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 shadow-lg animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4 text-green-800 dark:text-green-300 flex items-center gap-2">
                ⚡ {config?.title || 'Simulador de Potência – Corrente e Fusível'}
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Potência (W)
                    </label>
                    <input
                        type="range"
                        min={5}
                        max={500}
                        step={5}
                        value={power}
                        onChange={(e) => setPower(Number(e.target.value))}
                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer dark:bg-green-700"
                    />
                    <div className="text-center mt-1 text-lg font-semibold text-green-700 dark:text-green-300">
                        {power} W
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Tensão (V)
                    </label>
                    <select
                        value={voltage}
                        onChange={(e) => setVoltage(Number(e.target.value))}
                        className="w-full p-3 border-2 border-green-200 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-green-400 focus:outline-none transition-colors"
                    >
                        <option value={12}>12V (carros de passeio)</option>
                        <option value={24}>24V (caminhões)</option>
                    </select>
                </div>
            </div>
            <div className="mt-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Resultados:</h4>
                <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-400">Corrente calculada:</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {current.toFixed(2)} A
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-400">Fusível recomendado:</span>
                        <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                            {recommendedFuse} A
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-400">Bitola mínima (até 5m):</span>
                        <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                            {gauge}
                        </span>
                    </div>
                </div>
                <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        💡 Dica: Use sempre fusível com margem de segurança de 25%
                    </p>
                </div>
            </div>
        </div>
    )
}