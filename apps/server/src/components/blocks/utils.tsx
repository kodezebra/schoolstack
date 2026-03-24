import { SOCIAL_ICONS, UI_ICONS, BADGE_ICONS, getIconByName, type IconDefinition } from '@kz/icons'

export { SOCIAL_ICONS, UI_ICONS, BADGE_ICONS, getIconByName, type IconDefinition }

export const getPadding = (styles: any) => {
  if (styles?.paddingY !== undefined) return { paddingTop: `${styles.paddingY}px`, paddingBottom: `${styles.paddingY}px` }
  return {}
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const iconDef = getIconByName(name)
  const path = iconDef?.path
  if (!path) return null
  return (
    <svg class={className} width="1em" height="1em" viewBox="0 0 256 256" fill="currentColor">
      <path d={path} />
    </svg>
  )
}

export function IconSvg({ icon, className }: { icon: string; className?: string }) {
  const iconDef = getIconByName(icon.replace('ph:', ''))
  const path = iconDef?.path
  if (!path) return null
  return (
    <svg class={className} width="1em" height="1em" viewBox="0 0 256 256" fill="currentColor">
      <path d={path} />
    </svg>
  )
}

export function renderIcon(iconName: string, className: string = ''): string {
  const iconDef = getIconByName(iconName)
  const path = iconDef?.path
  if (!path) return ''
  return `<svg class="${className}" width="1em" height="1em" viewBox="0 0 256 256" fill="currentColor"><path d="${path}"/></svg>`
}
