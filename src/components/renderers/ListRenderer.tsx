interface ListRendererProps {
    items: string[]
    ordered?: boolean
}

export default function ListRenderer({ items, ordered = false }: ListRendererProps) {
    const Tag = ordered ? 'ol' : 'ul'
    return (
        <Tag className={`my-3 sm:my-4 pl-4 sm:pl-6 space-y-1 ${ordered ? 'list-decimal' : 'list-disc'}`}>
            {items.map((item, idx) => (
                <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{item}</li>
            ))}
        </Tag>
    )
}