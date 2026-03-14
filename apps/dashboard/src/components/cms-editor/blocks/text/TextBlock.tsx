export function TextBlock({ content }: { content: any }) {
  return (
    <div className="px-12 py-8">
      <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap italic opacity-50">
        {content.text || 'Standard text block...'}
      </p>
    </div>
  )
}
