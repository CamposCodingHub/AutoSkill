interface CalloutRendererProps {
    title: string
    text: string
    style?: 'tip' | 'warning' | 'danger' | 'info' | 'analogy'
}

export default function CalloutRenderer({ title, text, style = 'info' }: CalloutRendererProps) {
    const styles = {
        tip: { 
            bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900', 
            border: 'border-green-500', 
            titleColor: 'text-green-700 dark:text-green-200',
            icon: '💡'
        },
        warning: { 
            bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900', 
            border: 'border-yellow-500', 
            titleColor: 'text-yellow-700 dark:text-yellow-200',
            icon: '⚠️'
        },
        danger: { 
            bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900', 
            border: 'border-red-500', 
            titleColor: 'text-red-700 dark:text-red-200',
            icon: '🚨'
        },
        info: { 
            bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900', 
            border: 'border-blue-500', 
            titleColor: 'text-blue-700 dark:text-blue-200',
            icon: 'ℹ️'
        },
        analogy: { 
            bg: 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900 dark:to-violet-900', 
            border: 'border-purple-500', 
            titleColor: 'text-purple-700 dark:text-purple-200',
            icon: '🔄'
        }
    }
    const s = styles[style] || styles.info

    return (
        <div className={`p-3 sm:p-4 my-3 sm:my-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up ${s.bg} ${s.border}`}>
            <strong className={`block mb-1 sm:mb-2 text-base sm:text-lg ${s.titleColor}`}>{s.icon} {title}</strong>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm sm:text-base">{text}</p>
        </div>
    )
}