interface TableRendererProps {
    headers: string[]
    rows: string[][]
}

export default function TableRenderer({ headers, rows }: TableRendererProps) {
    return (
        <div className="overflow-x-auto my-4 animate-fade-in-up">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 text-xs shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900">
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className="border border-gray-100 dark:border-gray-700 px-3 py-2 text-gray-700 dark:text-gray-300 text-xs">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}