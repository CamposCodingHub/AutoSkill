import { useState } from 'react'

export default function VoltageDropSimulator() {
    const [current, setCurrent] = useState(5)
    const [resistance, setResistance] = useState(0.1)

    const voltageDrop = current * resistance
    const batteryVoltage = 12.6
    const loadVoltage = batteryVoltage - voltageDrop
    const percentDrop = (voltageDrop / batteryVoltage) * 100

    let statusColor = 'text-green-700 dark:text-green-400'
    let statusText = '✅ Queda de tensão aceitável (<0,2V)'

    if (voltageDrop > 0.5) {
        statusColor = 'text-red-700 dark:text-red-400'
        statusText = '❌ Queda excessiva! Verifique conexões e cabos.'
    } else if (voltageDrop > 0.2) {
        statusColor = 'text-yellow-700 dark:text-yellow-400'
        statusText = '⚠️ Queda moderada. Pode indicar mau contato.'
    }

    return (
        <div className="border-2 border-blue-200 rounded-xl p-6 my-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 shadow-lg animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                🔌 Simulador de Queda de Tensão
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Corrente do circuito (A)
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={20}
                        step={0.5}
                        value={current}
                        onChange={(e) => setCurrent(Number(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
                    />
                    <div className="text-center mt-1 text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {current} A
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Resistência extra (Ω)
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={resistance}
                        onChange={(e) => setResistance(Number(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
                    />
                    <div className="text-center mt-1 text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {resistance.toFixed(3)} Ω
                    </div>
                </div>
            </div>
            <div className="mt-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Resultados:</h4>
                <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-400">Tensão na bateria:</span>
                        <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                            {batteryVoltage.toFixed(1)} V
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-400">Queda de tensão:</span>
                        <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                            {voltageDrop.toFixed(3)} V ({percentDrop.toFixed(1)}%)
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-400">Tensão na carga:</span>
                        <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                            {loadVoltage.toFixed(2)} V
                        </span>
                    </div>
                </div>
                <div className={`mt-3 p-3 rounded-lg text-center font-bold ${statusColor} ${
                    voltageDrop <= 0.2 ? 'bg-green-100 dark:bg-green-900' :
                    voltageDrop <= 0.5 ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-red-100 dark:bg-red-900'
                }`}>
                    {statusText}
                </div>
            </div>
        </div>
    )
}