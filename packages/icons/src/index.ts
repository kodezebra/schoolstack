export { SOCIAL_ICONS, UI_ICONS, BADGE_ICONS, type IconDefinition } from './icons'

import { SOCIAL_ICONS, UI_ICONS, BADGE_ICONS, type IconDefinition } from './icons'

export const ALL_ICONS: IconDefinition[] = [...SOCIAL_ICONS, ...UI_ICONS, ...BADGE_ICONS]

export function getIconByName(name: string): IconDefinition | undefined {
  return ALL_ICONS.find(icon => icon.name.toLowerCase() === name.toLowerCase())
}

export function getIconByIconifyId(iconifyId: string): IconDefinition | undefined {
  return ALL_ICONS.find(icon => icon.iconifyId === iconifyId)
}

export const ICON_COLLECTIONS = {
  social: SOCIAL_ICONS,
  ui: UI_ICONS,
  badge: BADGE_ICONS,
} as const
