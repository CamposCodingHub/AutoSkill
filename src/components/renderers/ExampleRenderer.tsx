interface ExampleRendererProps {
    title: string
    value: string
}

export default function ExampleRenderer({ title, value }: ExampleRendererProps) {
    return (
        <div className="p-4 my-4 rounded border-l-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-500">
            <strong className="block text-yellow-700 dark:text-yellow-300 mb-1">📘 {title}</strong>
            <p className="text-gray-700 dark:text-gray-300">{value}</p>
        </div>
    )
}