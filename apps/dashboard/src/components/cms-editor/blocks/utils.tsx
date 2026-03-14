import * as LucideIcons from 'lucide-react'

// Centralize icon rendering logic to reuse between canvas components
export function renderDynamicIcon(name: string, className?: string) {
  if (!name) return null
  const pascalName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') as keyof typeof LucideIcons
  
  const IconComponent = (LucideIcons[pascalName] as any)
  if (!IconComponent) return null
  return <IconComponent className={className} />
}
