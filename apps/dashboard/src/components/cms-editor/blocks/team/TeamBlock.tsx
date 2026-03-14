import { Users } from 'lucide-react'

export function TeamBlock({ content }: { content: any }) {
  return (
    <div className="py-20 px-12 bg-white">
      <div className="text-center mb-16">
        <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{content.tagline}</div>
        <h2 className="text-4xl font-black text-slate-900">{content.title}</h2>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {content.members?.map((member: any, i: number) => (
          <div key={i} className="text-center group/member">
            <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden mb-4 border-4 border-transparent group-hover/member:border-primary/20 transition-all">
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Users className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="font-bold text-sm text-slate-900">{member.name}</div>
            <div className="text-[10px] font-bold text-primary uppercase">{member.role}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
