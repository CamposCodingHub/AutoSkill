import { useState } from 'react'

type Mode = 'V' | 'I' | 'R'

export default function OhmLawCalculator() {
    const [mode, setMode] = useState<Mode>('V')
    const [voltage, setVoltage] = useState<number | ''>(12)
    const [current, setCurrent] = useState<number | ''>(4.58)
    const [resistance, setResistance] = useState<number | ''>(2.62)

    const calculate = () => {
        if (mode === 'V') {
            if (current !== '' && resistance !== '') {
                const v = current * resistance
                setVoltage(Number(v.toFixed(3)))
            }
        } else if (mode === 'I') {
            if (voltage !== '' && resistance !== '') {
                const i = voltage / resistance
                setCurrent(Number(i.toFixed(3)))
            }
        } else if (mode === 'R') {
            if (voltage !== '' && current !== '') {
                const r = voltage / current
                setResistance(Number(r.toFixed(3)))
            }
        }
    }

    return (
        <div className="border-2 border-orange-200 rounded-xl p-6 my-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 shadow-lg animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4 text-orange-800 dark:text-orange-300 flex items-center gap-2">
                ⚡ Calculadora da Lei de Ohm
            </h3>
            <div className="flex gap-2 mb-6">
                {(['V', 'I', 'R'] as Mode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                            mode === m 
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-600 border border-orange-200'
                        }`}
                    >
                        Calcular {m}
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Tensão (V)
                    </label>
                    <input
                        type="number"
                        value={voltage}
                        onChange={(e) => setVoltage(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={mode === 'V'}
                        className="w-full p-3 border-2 border-orange-200 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-orange-400 focus:outline-none transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60"
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
                        className="w-full p-3 border-2 border-orange-200 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-orange-400 focus:outline-none transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Resistência (Ω)
                    </label>
                    <input
                        type="number"
                        value={resistance}
                        onChange={(e) => setResistance(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={mode === 'R'}
                        className="w-full p-3 border-2 border-orange-200 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-orange-400 focus:outline-none transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-60"
                    />
                </div>
            </div>
            <button
                onClick={calculate}
                className="mt-6 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 shadow-md"
            >
                🧮 Calcular
            </button>
            <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg border border-orange-200">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    Fórmula: {mode === 'V' ? 'V = I × R' : mode === 'I' ? 'I = V ÷ R' : 'R = V ÷ I'}
                </p>
            </div>
        </div>
    )
}