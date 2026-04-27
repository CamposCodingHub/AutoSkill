interface TextRendererProps {
    content: string
}

export default function TextRenderer({ content }: TextRendererProps) {
    return (
        <p className="mb-3 sm:mb-4 text-gray-800 dark:text-gray-300 leading-relaxed animate-fade-in-up text-sm sm:text-base">
            {content}
        </p>
    )
}