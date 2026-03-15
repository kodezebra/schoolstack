import { renderDynamicIcon } from '../utils'
import { ChevronDown } from 'lucide-react'
import type { NavbarContent } from '../../types'

export function NavbarBlock({ content }: { content: NavbarContent }) {
  return (
    <div className="border-b px-8 py-4 flex items-center justify-between bg-white/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 font-bold text-xl">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
          {renderDynamicIcon(content.logoIcon || 'layout', 'h-5 w-5')}
        </div>
        {content.logoText}
      </div>
      <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
        {content.links?.map((link: any) => (
          <div key={link.label} className="flex items-center gap-1">
            <span>{link.label}</span>
            {link.children && link.children.length > 0 && (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        ))}
        <div className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold">
          {content.cta?.label}
        </div>
      </div>
    </div>
  )
}
