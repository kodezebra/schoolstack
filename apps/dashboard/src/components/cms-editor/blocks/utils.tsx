import { Icon } from '@iconify/react'
import { getIconByName } from '@kz/icons'

export function renderDynamicIcon(name: string, className?: string) {
  if (!name) return null
  const iconDef = getIconByName(name)
  if (!iconDef) return null
  return <Icon icon={iconDef.iconifyId} className={className} />
}
