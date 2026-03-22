export const SCOPE_RULES: Record<string, { contains: string[] }> = {
  preschool: { contains: ['day care', 'baby class', 'middle class', 'top class', 'nursery'] },
  lower_primary: { contains: ['primary 1', 'primary 2', 'primary 3'] },
  upper_primary: { contains: ['primary 4', 'primary 5', 'primary 6', 'primary 7'] },
}

export function getScopeForLevel(levelName: string): string | null {
  const lower = levelName.toLowerCase()
  for (const [scope, rules] of Object.entries(SCOPE_RULES)) {
    if (rules.contains.some(term => lower.includes(term))) {
      return scope
    }
  }
  return null
}

export const SCOPE_DISPLAY: Record<string, string> = {
  all: 'All Classes',
  preschool: 'Pre-School',
  lower_primary: 'Lower Primary',
  upper_primary: 'Upper Primary',
}

export const SCOPE_OPTIONS = [
  { value: 'all', label: 'All Classes' },
  { value: 'preschool', label: 'Pre-School (Day Care - Top Class)' },
  { value: 'lower_primary', label: 'Lower Primary (Primary 1-3)' },
  { value: 'upper_primary', label: 'Upper Primary (Primary 4-7)' },
]

export function getScopeDisplay(scope: string | null): string {
  if (!scope || scope === 'class') return 'All Classes'
  return SCOPE_DISPLAY[scope] || 'All Classes'
}
