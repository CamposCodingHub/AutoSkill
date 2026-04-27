interface TopbarProps {
    onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center lg:hidden">
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="text-gray-600 dark:text-gray-300 text-2xl focus:outline-none mr-4"
                >
                    ☰
                </button>
                <div className="font-semibold text-gray-800 dark:text-white">
                    AutoSkill
                </div>
            </div>
        </header>
    )
}
