// Stats grid rendering for the editor canvas
export function StatsBlock({ content }: { content: any }) {
  return (
    <div className="py-16 px-12 bg-primary text-white mx-8 rounded-3xl grid grid-cols-4 gap-8 text-center shadow-xl shadow-primary/20">
      {content.items?.map((item: any, i: number) => (
        <div key={i}>
          <div className="text-3xl font-black mb-1">{item.value}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{item.label}</div>
        </div>
      ))}
    </div>
  )
}
