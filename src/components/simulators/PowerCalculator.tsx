import { useState } from 'react'

type Mode = 'P' | 'I' | 'V'

export default function PowerCalculator() {
    const [mode, setMode] = useState<Mode>('P')
    const [power, setPower] = useState<number | ''>(110)
    const [voltage, setVoltage] = useState<number | ''>(12)
    const [current, setCurrent] = useState<number | ''>(9.17)

    const calculate = () => {
        if (mode === 'P') {
            if (voltage !== '' && current !== '') {
                const p = voltage * current
                setPower(Number(p.toFixed(2)))
            }
        } else if (mode === 'I') {
            if (power !== '' && voltage !== '') {
                const i = power / voltage
                setCurrent(Number(i.toFixed(2)))
            }
        } else if (mode === 'V') {
            if (power !== '' && current !== '') {
                const v = power / current
                setVoltage(Number(v.toFixed(2)))
            }
        }
    }

    return (
        <div className="border-2 border-purple-200 rounded-xl p-6 my-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 shadow-lg animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4 text-purple-800 dark:text-purple-300 flex items-center gap-2">
                🔢 Calculadora de Potência
            </h3>
            <div className="flex gap-2 mb-6">
                {(['P', 'I', 'V'] as Mode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                            mode === m 
                                ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-600 border border-purple-200'
                        }`}
                    >
                        Calcular {m === 'P' ? 'Potência (W)' : m === 'I' ? 'Corrente (A)' : 'Tensão (V)'}
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Potência (W)
                    </label>
                    <input
                        type="number"
                        value={power}
                        onChange={(e) => setPower(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={mode === 'P'}
                        className="w-full p-3 border-2 border-purple-200 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-purple-400 focus:outline-none transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Tensão (V)
                    </label>
                    <input
                        type="number"
                        value={voltage}
                        onChange={(e) => setVoltage(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={mode === 'V'}
                        className="w-full p-3 border-2 border-purple-200 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-purple-400 focus:outline-none transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Corrente (A)
                    </label>
                    <input
                        type="number"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={mode === 'I'}
                        className="w-full p-3 border-2 border-purple-200 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-purple-400 focus:outline-none transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60"
                    />
                </div>
            </div>
            <button
                onClick={calculate}
                className="mt-6 w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-violet-600 transition-all transform hover:scale-105 shadow-md"
            >
                🧮 Calcular
            </button>
            <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Fórmula: {mode === 'P' ? 'P = V × I' : mode === 'I' ? 'I = P ÷ V' : 'V = P ÷ I'}
                </p>
            </div>
        </div>
    )
}